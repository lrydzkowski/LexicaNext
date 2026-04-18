| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-04-18 |
| **Status** | done
| **Complexity** | small |

# TinySpec: Register answer statistics from learning modes

## What

All three learning mode components (`SetFullMode`, `SetOnlyOpenQuestionsMode`, `SetSpellingMode`) should call `POST /api/answer` (`RegisterAnswerEndpoint`) after each user response so the backend can persist per-user answer statistics. The request runs in the background — fire-and-forget via TanStack Query `mutate()` — so it never blocks the UI or delays the "Correct/Incorrect" feedback. Failures are swallowed (background telemetry must not disrupt the learning session).

## Context

| File | Role |
|------|------|
| `Frontend/lexica-next-front/src/hooks/api.ts` | Modify — add `useRegisterAnswer` mutation hook (fire-and-forget, no `queryClient` invalidation, no error surfacing) |
| `Frontend/lexica-next-front/src/components/sets/modes/SetFullMode.tsx` | Modify — call `.mutate()` inside `checkAnswer` with `{ question, givenAnswer, expectedAnswer }` |
| `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx` | Modify — same as above |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSpellingMode.tsx` | Modify — same as above; `question` is the spelling prompt (e.g. `"Listen and spell the word"`), `expectedAnswer` is `currentEntry.word` |
| `Frontend/lexica-next-front/api-types/api-types.d.ts` | Reference — already contains `/api/answer` + `RegisterAnswerRequestPayload` (no regeneration needed) |
| `Frontend/lexica-next-front/src/utils/utils.ts` | Reference — `serialize()` joins `string[]` with `", "`, used to flatten `correctAnswers` into a single `expectedAnswer` string |
| `LexicaNext.Core/Commands/RegisterAnswer/RegisterAnswerEndpoint.cs` | Reference — backend contract: `question`, `givenAnswer`, `expectedAnswer` (all strings), returns `204` |

## Requirements

1. After every `checkAnswer` call in all three learning mode components, a `POST /api/answer` request is dispatched with the current question, user's answer, and expected answer.
2. The request is non-blocking: the UI transitions to the feedback state (`setShowFeedback(true)`) and subsequent renders are not awaiting the request.
3. Request failures (network error, 4xx, 5xx) must not show notifications, throw, or interrupt the learning flow — they are silently ignored (a `console.error` is acceptable).
4. `givenAnswer` is the raw user input (`userAnswer` / `userInput`, untrimmed). `expectedAnswer` is a single string — when `correctAnswers` is an array, join via `serialize(...)`.
5. For spelling mode, `question` is the literal string `"Listen and spell the word"` (the prompt shown to the user); `givenAnswer` is `userInput`; `expectedAnswer` is `currentEntry.word ?? ""`.
6. Existing `checkAnswer` behavior (state updates, session persistence, feedback display) is unchanged.

## Plan

1. In `src/hooks/api.ts`:
   - Add `export type RegisterAnswerRequestPayload = components['schemas']['RegisterAnswerRequestPayload'];`
   - Add `export const useRegisterAnswer = () => { ... }` returning a `useMutation` whose `mutationFn` does `await client.POST('/api/answer', { body: payload })` and silently swallows `error` (no `throwApiError`, no `queryClient.invalidateQueries`). No `onError` handler that surfaces UI.
2. In `SetFullMode.tsx`:
   - Call `const registerAnswer = useRegisterAnswer();` at the top of the component.
   - Inside `checkAnswer`, after computing `isCorrect`, call `registerAnswer.mutate({ question: currentQuestion.question, givenAnswer: userAnswer, expectedAnswer: serialize(currentQuestion.correctAnswers) });`.
3. In `SetOnlyOpenQuestionsMode.tsx`:
   - Same as step 2, using its local `currentQuestion`, `userAnswer`, and `serialize(currentQuestion.correctAnswers)`.
4. In `SetSpellingMode.tsx`:
   - Same pattern. `question: "Listen and spell the word"`, `givenAnswer: userInput`, `expectedAnswer: currentEntry.word ?? ""`.
5. Run `npm run build` (from `Frontend/lexica-next-front`) to verify types; run `npm run lint`.
6. Manually smoke-test each mode in the browser — confirm a `POST /api/answer` fires per answer, returns `204`, and the UI continues to respond instantly.

## Tasks

- [x] Add `useRegisterAnswer` hook + `RegisterAnswerRequestPayload` type export in `hooks/api.ts`
- [x] Wire `registerAnswer.mutate(...)` into `SetFullMode.checkAnswer`
- [x] Wire `registerAnswer.mutate(...)` into `SetOnlyOpenQuestionsMode.checkAnswer`
- [x] Wire `registerAnswer.mutate(...)` into `SetSpellingMode.checkAnswer`
- [x] Run `npm run build` + `npm run lint` (frontend) — all green
- [~] Browser smoke-test deferred to the user — implementation verified via `tsc` + `vite build` + `eslint`. Guaranteed non-blocking by using `.mutate()` (fire-and-forget, not `.mutateAsync()`); guaranteed silent on failure by `console.error` fallback + `retry: false` in the hook

## Done When

- [x] All tasks checked off (one deferred — see note above)
- [x] `POST /api/answer` fires once per `checkAnswer` invocation across all three modes (verified by inspection: each `checkAnswer` now calls `registerAnswer.mutate(...)`)
- [x] UI feedback appears without any perceptible delay (`.mutate()` is fire-and-forget — state updates run synchronously after dispatch)
- [x] No new type, build, or lint errors (`tsc -b && vite build` and `eslint .` both green)
- [x] Failed requests do not produce user-visible notifications or break the session (hook silently `console.error`s; no `throwApiError`, no `onError` UI handler, `retry: false`)
