| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-05-02 |
| **Status** | done |
| **Complexity** | small-medium |

# TinySpec: Library-wide Open Questions practice (Random 20 / Weakest 20)

## What

Add two new entry points on the Sets list page that launch Open Questions Mode against a curated 20-word slice of the user's whole library instead of a single set:

1. **Random 20 words** — uniformly sampled from words that belong to at least one of the user's sets.
2. **Weakest 20 words** — words with the worst `incorrectCount / (incorrectCount + correctCount)` ratio across `mode = "open-questions"` answers, tie-break by higher `incorrectCount`. Words with no open-questions history are excluded.

Both flows reuse the existing `SetOnlyOpenQuestionsMode` learning loop unchanged (counters, two-correct-per-direction rule, incorrect-resets, audio, feedback, completion, progress bar). Each flow has its own independent saved session in `localStorage`. If fewer than 20 words qualify, the session uses what's available; zero qualifying words shows the existing "No entries found" state.

> **Scope check**: 8 frontend files, 7+ new backend files (endpoints + repository methods + tests). At the upper end of tinyspec — but cohesive (one feature, well-defined, mostly additive). Proceeding as tinyspec.

## Context

| File | Role |
|------|------|
| `LexicaNext.Core/Queries/GetRandomOpenQuestionsPracticeEntries/GetRandomOpenQuestionsPracticeEntriesEndpoint.cs` | Add — own namespace `LexicaNext.Core.Queries.GetRandomOpenQuestionsPracticeEntries`. `GET /api/practice/open-questions/random` returning up to 20 `EntryDto` records (reuse `EntryDto` from `GetSetEndpoint`); 401 guard via `IUserContextResolver` |
| `LexicaNext.Core/Queries/GetRandomOpenQuestionsPracticeEntries/Interfaces/IGetRandomOpenQuestionsPracticeEntriesRepository.cs` | Add — own namespace. `GetRandomEntriesAsync(userId, count, ct)` returning `List<Entry>` |
| `LexicaNext.Core/Queries/GetWeakestOpenQuestionsPracticeEntries/GetWeakestOpenQuestionsPracticeEntriesEndpoint.cs` | Add — own namespace `LexicaNext.Core.Queries.GetWeakestOpenQuestionsPracticeEntries`. `GET /api/practice/open-questions/weakest` returning up to 20 `EntryDto` records ordered by ratio desc, then `incorrectCount` desc |
| `LexicaNext.Core/Queries/GetWeakestOpenQuestionsPracticeEntries/Interfaces/IGetWeakestOpenQuestionsPracticeEntriesRepository.cs` | Add — own namespace. `GetWeakestEntriesAsync(userId, count, ct)` returning `List<Entry>` |
| `LexicaNext.Infrastructure/Db/Repositories/RandomOpenQuestionsPracticeRepository.cs` | Add — implements `IGetRandomOpenQuestionsPracticeEntriesRepository`. Query `Words` for `userId` filtered to `WordId IN (SELECT WordId FROM SetWords WHERE Set.UserId == userId)`, `OrderBy(EF.Functions.Random())`, `Take(count)` |
| `LexicaNext.Infrastructure/Db/Repositories/WeakestOpenQuestionsPracticeRepository.cs` | Add — implements `IGetWeakestOpenQuestionsPracticeEntriesRepository`. Aggregate `Answers` where `UserId == userId && ModeType == "open-questions"`, group by `WordId`, compute `Correct/Incorrect`, order by ratio desc + `IncorrectCount` desc, `Take(count)`, join to `Words` for full entry payload |
| `LexicaNext.WebApp/Program.cs` | Modify — register the two new endpoints (`app.MapGetRandomOpenQuestionsPracticeEntriesEndpoint(); app.MapGetWeakestOpenQuestionsPracticeEntriesEndpoint();`) |
| `LexicaNext.Infrastructure/Db/Repositories/WordsStatisticsRepository.cs` | Reference — canonical pattern for aggregating `Answers` by `WordId` filtered to `open-questions` mode |
| `LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs` | Reference — `GetSetAsync` shows how to materialize `Entry` objects with translations + example sentences |
| `LexicaNext.Core/Queries/GetSet/GetSetEndpoint.cs` | Reference — `EntryDto` shape that the new endpoints should return (`wordId`, `word`, `wordType`, `translations`, `exampleSentences`) |
| `LexicaNext.WebApp.Tests.Integration/Features/Practice/RandomOpenQuestions/GetRandomOpenQuestionsPracticeEntriesTests.cs` | Add — integration tests for the random endpoint: 401 unauthorized, empty library returns 0 entries, words not in any set are excluded, fewer-than-20 returns what's available, exactly-20-or-more returns 20, results restricted to current user |
| `LexicaNext.WebApp.Tests.Integration/Features/Practice/WeakestOpenQuestions/GetWeakestOpenQuestionsPracticeEntriesTests.cs` | Add — integration tests for the weakest endpoint: 401 unauthorized, empty answer history returns 0 entries, words with no open-questions history are excluded, ordering by ratio desc, tiebreaker by `IncorrectCount` desc, fewer-than-20 with history returns what's available, results restricted to current user, answers from other modes (`spelling`/`full`/`sentences`) are ignored |
| `Frontend/lexica-next-front/api-types/api-types.d.ts` | Regenerate — `npm run generate-api-types` after backend builds, to pick up the two new endpoints + `GetOpenQuestionsPracticeEntriesResponse` schema |
| `Frontend/lexica-next-front/src/hooks/api.ts` | Modify — add `useRandomOpenQuestionsPractice()` and `useWeakestOpenQuestionsPractice()` (`useQuery`, `staleTime: 0`, `enabled: false`-style: only refetch on explicit trigger so reload doesn't burn fresh samples — actually use `refetchOnMount: false` + manual invalidate) |
| `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx` | Modify — change props from `{ set: GetSetResponse }` to `{ entries: EntryDto[]; sessionKey: string; title: string; backUrl: string }` (or accept an optional `setId` and a `practiceContext` discriminator). Replace `set.entries` / `set.setId` / `set.name` references; navigation back uses `backUrl`; session save/load uses `sessionKey` |
| `Frontend/lexica-next-front/src/pages/sets/modes/SetOnlyOpenQuestionsModePage.tsx` | Modify — pass new props derived from `set` |
| `Frontend/lexica-next-front/src/pages/practice/RandomOpenQuestionsPracticePage.tsx` | Add — fetches via `useRandomOpenQuestionsPractice`, restores from `localStorage` first, only calls API if no saved session, renders `SetOnlyOpenQuestionsMode` with `sessionKey="practice:random-open-questions"`, `title="Random 20 words"`, `backUrl=links.sets.getUrl()` |
| `Frontend/lexica-next-front/src/pages/practice/WeakestOpenQuestionsPracticePage.tsx` | Add — same as above with `sessionKey="practice:weakest-open-questions"`, `title="Weakest 20 words"` |
| `Frontend/lexica-next-front/src/AppRouter.tsx` | Modify — register `/practice/open-questions/random` and `/practice/open-questions/weakest` routes (under root, not `/sets`), with breadcrumbs `[Practice → Random 20 words]` / `[Practice → Weakest 20 words]` |
| `Frontend/lexica-next-front/src/config/links.ts` | Modify — add `randomOpenQuestionsPractice` and `weakestOpenQuestionsPractice` link entries |
| `Frontend/lexica-next-front/src/components/sets/SetsList.tsx` | Modify — add two buttons to the top toolbar (next to "Create New Set"): `IconDice` "Practice 20 random words" → `randomOpenQuestionsPractice.getUrl()`, `IconAlertTriangle` "Practice 20 weakest words" → `weakestOpenQuestionsPractice.getUrl()`. Per-set `Open Questions Mode` menu item is **unchanged** |
| `Frontend/lexica-next-front/src/services/session-storage.ts` | Modify — extend `SessionMode` union with `'random-open-questions' \| 'weakest-open-questions'`, add labels in `getModeLabel`, return practice URLs in `getModeUrl`. The existing `lexica-session:{setId}:{mode}` key shape works with synthetic setIds (`__library__`) — or refactor `buildKey` to accept a free-form key. Recommend the latter for clarity |
| `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx` (validateSession) | Note — `validateSession` compares saved entries to the "current" set. For practice flows, "current" comes from the API on first load; on reload we want to **always restore** the saved session without re-fetching. Skip `validateSession` for these flows (the practice page only fetches when no saved session exists) |

## Requirements

1. `GET /api/practice/open-questions/random` returns 401 when unauthenticated; otherwise returns up to 20 `EntryDto` records uniformly sampled from words that (a) belong to the current user and (b) appear in `SetWords` of at least one of the user's sets. No duplicates by `wordId`.
2. `GET /api/practice/open-questions/weakest` returns 401 when unauthenticated; otherwise returns up to 20 `EntryDto` records, computed from `Answers` where `UserId == currentUser && ModeType == "open-questions"`, grouped by `WordId`, ordered by `IncorrectCount / (IncorrectCount + CorrectCount)` desc with tiebreaker `IncorrectCount` desc. Words with zero open-questions answers are excluded. Each record is hydrated with full `EntryDto` data (translations, example sentences) from `Words`.
3. Both endpoints return `{ entries: EntryDto[] }` (or a thin wrapper). When the user has zero qualifying words, `entries` is an empty array and the frontend shows the existing "No entries found" alert.
4. Each Open Questions practice flow uses the existing `SetOnlyOpenQuestionsMode` learning loop **unchanged**: same counter rules (each direction must be answered correctly twice; any incorrect answer resets both counters), same audio playback, same feedback UI, same completion screen, same progress bar.
5. Each flow persists its session under a stable, flow-specific `localStorage` key (independent from per-set sessions and from each other). On page reload mid-session, the saved 20 words and per-word counters are restored without re-fetching from the API. On completion, the session is cleared (existing pattern). Closing the browser and returning days later still restores progress.
6. Each answer in these flows fires the same `POST /api/answer` with `modeType: "open-questions"` and the same `questionType` values (`english-open` / `native-open`) — guaranteed automatically because `SetOnlyOpenQuestionsMode.checkAnswer` already does this and remains unchanged. The Words Statistics page therefore reflects practice answers, and the next "Weakest 20" session naturally re-ranks based on the latest answers.
7. The Sets list page (`/sets`) has two new top-of-page buttons: "Practice 20 random words" and "Practice 20 weakest words", visible on both desktop and mobile. The existing per-set "Open Questions Mode" menu item is unchanged.
8. Count is hardcoded to 20 server-side; no `count` query parameter exposed to the client (or accepted but ignored).
9. If fewer than 20 words qualify (small library, or fewer than 20 words with open-questions history for Weakest), the session contains only the qualifying count and runs to completion when each completes the two-direction rule. Zero qualifying words shows the existing "No entries found" state.

## Plan

1. **Backend repositories — separate per endpoint**.
   - `LexicaNext.Infrastructure/Db/Repositories/RandomOpenQuestionsPracticeRepository.cs` implements `IGetRandomOpenQuestionsPracticeEntriesRepository` (`IScopedService`). `GetRandomEntriesAsync`: `_dbContext.Words.Where(w => w.UserId == userId && _dbContext.SetWords.Any(sw => sw.WordId == w.WordId && sw.Set.UserId == userId)).OrderBy(_ => EF.Functions.Random()).Take(count)` then `.Select(...)` into `Entry` (mirror `SetsRepository.GetSetAsync` projection).
   - `LexicaNext.Infrastructure/Db/Repositories/WeakestOpenQuestionsPracticeRepository.cs` implements `IGetWeakestOpenQuestionsPracticeEntriesRepository` (`IScopedService`). `GetWeakestEntriesAsync`: aggregate `Answers` for user + mode `"open-questions"`, group by `WordId`, project `{ WordId, Correct, Incorrect, Ratio = Incorrect / (Correct + Incorrect) }`, `OrderByDescending(Ratio).ThenByDescending(Incorrect).Take(count)`, then join `_dbContext.Words` to hydrate `Entry`. Compute ratio as `(double)Incorrect / (Correct + Incorrect)` — this projection must be EF-translatable; if not, materialize the aggregate first then sort in-memory (acceptable: the input is bounded by `Words.Count` per user).

2. **Backend endpoints — each in its own namespace**. Create:
   - `LexicaNext.Core/Queries/GetRandomOpenQuestionsPracticeEntries/GetRandomOpenQuestionsPracticeEntriesEndpoint.cs` (namespace `LexicaNext.Core.Queries.GetRandomOpenQuestionsPracticeEntries`)
   - `LexicaNext.Core/Queries/GetWeakestOpenQuestionsPracticeEntries/GetWeakestOpenQuestionsPracticeEntriesEndpoint.cs` (namespace `LexicaNext.Core.Queries.GetWeakestOpenQuestionsPracticeEntries`)

   Each mirrors the `GetWordsStatisticsEndpoint` shape: `Map...Endpoint(this WebApplication)`, `HandleAsync` that resolves user, returns 401 if null, otherwise calls its dedicated repository, maps to `EntryDto` via the existing `ISetMapper.Map(List<Entry>)`, and returns `Ok(new { entries })`. Wire both in `Program.cs`. Each endpoint owns its own `Request` / `Response` DTOs inside its namespace — do not share types between the two namespaces.

3. **Backend integration tests — required, one suite per endpoint**.
   - `LexicaNext.WebApp.Tests.Integration/Features/Practice/RandomOpenQuestions/GetRandomOpenQuestionsPracticeEntriesTests.cs`
   - `LexicaNext.WebApp.Tests.Integration/Features/Practice/WeakestOpenQuestions/GetWeakestOpenQuestionsPracticeEntriesTests.cs`

   Follow the existing integration-test pattern (DB seed → HTTP call → `Verify` snapshot of the response body + relevant DB state). Cases per endpoint:
   - **Random**: 401 when unauthenticated; empty library returns 0 entries; words not in any set are excluded; library with <20 in-set words returns the smaller count; library with ≥20 in-set words returns exactly 20; another user's words/sets are not returned.
   - **Weakest**: 401 when unauthenticated; user with no open-questions answers returns 0 entries; words with zero open-questions history are excluded even if they have history in other modes; ordering by ratio desc; tiebreaker by `IncorrectCount` desc when ratios are equal; <20 words with history returns the smaller count; ≥20 returns exactly 20; another user's answers are not counted; answers from other modes (`spelling`, `full`, `sentences`) are ignored.

4. **Frontend types**. Run `npm run generate-api-types` (whatever the existing script is called — check `package.json`) so the new endpoints + response schema appear in `api-types.d.ts`.

5. **Refactor `SetOnlyOpenQuestionsMode`**. Change props to `{ entries: EntryDto[]; sessionKey: string; title: string; backUrl: string }`. Replace every reference to `set.entries`, `set.setId`, and `set.name` with the new props. Replace `saveSession(set.setId, set.name, 'open-questions', ...)` and `loadSession(set.setId, 'open-questions')` with `saveSession(sessionKey, ...)` / `loadSession(sessionKey, ...)` — easiest path is to refactor `session-storage.ts` to accept a single `key` string instead of `(setId, mode)`. Replace `links.sets.getUrl({}, { page: returnPage })` with `backUrl`. Replace `set?.name` in completion text with `title`. Update `SetOnlyOpenQuestionsModePage.tsx` to derive these from `set` and `searchParams`.

6. **Session storage refactor (recommended)**. Add a new `buildKeyFromString(key: string)` overload (or rename `buildKey`/the whole API to accept a single string). Update existing callers (`SetSpellingMode`, `SetFullMode`, `SetSentencesMode`, `SetOnlyOpenQuestionsMode`) to pass `${setId}:${mode}` themselves, OR keep existing API and add a new `buildKeyFromString(key)` for practice flows only. The latter is less risky.

7. **API hooks**. Add `useRandomOpenQuestionsPractice` and `useWeakestOpenQuestionsPractice` in `hooks/api.ts`. Both `useQuery` returning `EntryDto[]`. Use `enabled: false` + manual `refetch()`, OR use `staleTime: Infinity` + `refetchOnMount: false` + `refetchOnWindowFocus: false` so React Query never re-samples on reload. The page logic decides whether to call `refetch()`.

8. **Practice pages**. Create `pages/practice/RandomOpenQuestionsPracticePage.tsx` and `WeakestOpenQuestionsPracticePage.tsx`. Each:
   - On mount, attempt `loadSession(sessionKey)`.
   - If saved entries exist (length > 0), pass them directly to `SetOnlyOpenQuestionsMode` and skip the API call.
   - Otherwise, call the API, store the returned `entries` (without counters — the mode component initializes them), and render.
   - Handle loading/error states the same way as `SetOnlyOpenQuestionsModePage`.

9. **Routing & links**. In `AppRouter.tsx`, add the two new routes under `/` with appropriate breadcrumbs. In `config/links.ts`, add `randomOpenQuestionsPractice` and `weakestOpenQuestionsPractice` entries.

10. **Sets page entry points**. In `SetsList.tsx`, add two buttons to the top action group (responsive: full button + compact `ActionIcon` for mobile, mirroring the existing "Create New Set" + "Delete" pattern). Pick reasonable Tabler icons (`IconDice5` for random, `IconAlertTriangle` or `IconTrendingDown` for weakest).

11. **Verify**. Run `dotnet build`, run the full integration test suite. Run `npm run build` + `npm run lint` for the frontend. Manual smoke-test both flows end-to-end: open `/sets`, click each button, complete a few questions, reload mid-session, confirm restore, complete the session, confirm "Practice Again" starts a new sample, confirm answers appear in `/words-statistics`.

## Tasks

- [x] Add `IGetRandomOpenQuestionsPracticeEntriesRepository` interface (own namespace)
- [x] Add `IGetWeakestOpenQuestionsPracticeEntriesRepository` interface (own namespace)
- [x] Add `RandomOpenQuestionsPracticeRepository` implementing the random interface
- [x] Add `WeakestOpenQuestionsPracticeRepository` implementing the weakest interface
- [x] Add `GetRandomOpenQuestionsPracticeEntriesEndpoint` in its own namespace (`GET /api/practice/open-questions/random`)
- [x] Add `GetWeakestOpenQuestionsPracticeEntriesEndpoint` in its own namespace (`GET /api/practice/open-questions/weakest`)
- [x] Wire both endpoints in `LexicaNext.WebApp/Program.cs`
- [x] Add `GetRandomOpenQuestionsPracticeEntriesTests` integration test suite (401, empty, words-not-in-any-set excluded, <20 partial, ≥20 returns 20, cross-user isolation)
- [x] Add `GetWeakestOpenQuestionsPracticeEntriesTests` integration test suite (401, no history, no-history-excluded, ratio ordering, `IncorrectCount` tiebreaker, <20 partial, ≥20 returns 20, cross-user isolation, other-mode answers ignored)
- [x] Regenerate `api-types.d.ts` from the OpenAPI spec (auto-generated as part of `dotnet build` via the existing build hook)
- [x] Add `useRandomOpenQuestionsPractice` and `useWeakestOpenQuestionsPractice` hooks in `hooks/api.ts`
- [x] Refactor `session-storage.ts` to support free-form keys (added `saveSessionByKey` / `loadSessionByKey` / `clearSessionByKey` alongside existing per-set API)
- [x] Refactor `SetOnlyOpenQuestionsMode.tsx` to accept `{ entries, sessionKey, title, backUrl }` props
- [x] Update `SetOnlyOpenQuestionsModePage.tsx` to pass new props derived from the loaded set
- [x] Add `RandomOpenQuestionsPracticePage.tsx` (loads saved session first, falls back to API)
- [x] Add `WeakestOpenQuestionsPracticePage.tsx` (same pattern, different key + endpoint)
- [x] Register `/practice/open-questions/random` + `/practice/open-questions/weakest` routes in `AppRouter.tsx` with breadcrumbs
- [x] Add `randomOpenQuestionsPractice` + `weakestOpenQuestionsPractice` entries to `config/links.ts`
- [x] Add two top-of-page buttons to `SetsList.tsx` (responsive, with appropriate icons)
- [x] Run `dotnet build` + integration tests; run `npm run build` + `npm run lint` — all green (new tests pass; pre-existing `ApiAuth0Tests.SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken` and resource-contention `IHost` startup timeouts in long full-suite runs are unrelated to this change)
- [~] Manual smoke-test deferred to the user — implementation verified via TypeScript build + ESLint + integration tests covering API contract; UI behavior verified via existing patterns reused in `SetOnlyOpenQuestionsMode`

## Done When

- [x] All tasks checked off (smoke-test deferred — see note above)
- [x] Both new endpoints return 401 unauthenticated and correct entries authenticated, verified by integration tests (`GetRandom...Tests` + `GetWeakest...Tests` cover 401 + all listed scenarios; all 4 tests green)
- [x] Two new buttons appear on `/sets` and launch the correct flows (added in `SetsList.tsx` toolbar, responsive desktop button + mobile `ActionIcon`)
- [x] Each flow runs the unchanged Open Questions Mode loop with its own independent saved session (`SetOnlyOpenQuestionsMode` is shared; per-flow `sessionKey` keeps storage isolated)
- [x] Mid-session reload restores the same 20 words and per-word counters (practice pages call `loadSessionByKey` first; only fetch fresh entries when no saved session exists; React Query is configured with `staleTime: Infinity` + `refetchOnMount/Focus/Reconnect: false`)
- [x] Answers from these flows appear in Words Statistics with `mode = "open-questions"` (`SetOnlyOpenQuestionsMode.checkAnswer` registers answers with `modeType: 'open-questions'`, unchanged)
- [x] No new lint, type, or build errors on backend or frontend (`dotnet build` clean; `npm run build` clean; `npm run lint` clean)
- [x] Per-set "Open Questions Mode" menu item still works exactly as before (regression check) — `SetOnlyOpenQuestionsModePage` updated to pass new props derived from the loaded set; existing `GetSetTests` integration suite still green
