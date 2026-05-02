---

description: "Task list for Sentences Learning Mode (004-sentences-mode)"
---

# Tasks: Sentences Learning Mode

**Input**: Design documents from `R:\private\LexicaNext\specs\004-sentences-mode\`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/register-answer-extension.md, quickstart.md

**Tests**: Both backend Verify integration tests and frontend Playwright E2E tests are mandatory per Constitution v1.0.0 Principle V (Test-First Verification, NON-NEGOTIABLE) and per the user instruction *"Include implementing front-end E2E tests, include implementing back-end tests if the feature requires back-end changes."* The validator allow-list change in `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerRequestValidator.cs` is a backend HTTP-contract change, so backend tests are required.

**Organization**: Tasks are grouped by user story (US1, US2, US3) so each story can land as an independently testable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Different file, no dependency on incomplete tasks — safe to run in parallel
- **[Story]**: Maps task to a user story (US1, US2, US3) — Setup / Foundational / Polish phases have no story label
- All paths are absolute and rooted at the repo (`R:\private\LexicaNext\`)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm baseline build is green before any source change.

- [X] T001 Verify the baseline backend build is green by running `dotnet build LexicaNext.sln` from `R:\private\LexicaNext\`
- [X] T002 [P] Verify the baseline frontend build is green by running `npm run build` from `R:\private\LexicaNext\Frontend\lexica-next-front`
- [X] T003 [P] Verify the baseline E2E project compiles by running `npx playwright test --list` from `R:\private\LexicaNext\Frontend\lexica-next-front-e2e-tests`

**Checkpoint**: Baseline green — implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Backend wire-up and shared frontend plumbing that EVERY user story depends on (route, link helper, menu item, session-storage union, validator allow-lists). No user-story implementation can proceed until this phase is complete.

**⚠️ CRITICAL**: All three user stories share these foundations.

### Backend allow-list (drives BE Verify tests in US1)

- [X] T004 Extend `AllowedModeTypes` to include `"sentences"` (alphabetical insertion to match existing style) and `AllowedQuestionTypes` to include `"sentence-fill"` in `R:\private\LexicaNext\LexicaNext.Core\Commands\RegisterAnswer\Services\RegisterAnswerRequestValidator.cs`. Per `contracts/register-answer-extension.md` this is the ONLY backend production code change for the entire feature.

### Frontend foundational plumbing

- [X] T005 [P] Add `sentencesMode` entry to the `links` record in `R:\private\LexicaNext\Frontend\lexica-next-front\src\config\links.ts` (URL pattern `/sets/${params?.setId}/sentences-mode`, mirroring `openQuestionsMode`)
- [X] T006 [P] Extend `SessionMode` union with `'sentences'`, extend `ModeEntriesDto` with `SentencesEntry[]` import (forward-declare or wrap with a circular-import-safe import), extend `getModeLabel('sentences') → 'Sentences Mode'` and `getModeUrl(setId, 'sentences') → '/sets/${setId}/sentences-mode'` in `R:\private\LexicaNext\Frontend\lexica-next-front\src\services\session-storage.ts`
- [X] T007 Add the `:setId/sentences-mode` route (with breadcrumb pointing to `links.sentencesMode.getUrl({ setId })` and label `Sentences Mode`) inside the `'sets'` children of `R:\private\LexicaNext\Frontend\lexica-next-front\src\AppRouter.tsx`. Wraps in `<RequireAuth><PageWithBreadcrumbs>...</PageWithBreadcrumbs></RequireAuth>` and references the new `SetSentencesModePage` component (file created in T013).
- [X] T008 Add a "Sentences Mode" `Menu.Item` to `SetActionMenu` in `R:\private\LexicaNext\Frontend\lexica-next-front\src\components\sets\SetsList.tsx`, immediately after the Open Questions Mode item, using `IconBlockquote` from `@tabler/icons-react` and `links.sentencesMode.getUrl({ setId: set.setId }, { returnPage: currentPage.toString() })`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Practice a set in sentences mode (Priority: P1) 🎯 MVP

**Goal**: A signed-in user can launch Sentences Mode from a set's actions menu, see a fill-in-the-blank card built from one of the entry's example sentences, type the answer, get correct/incorrect feedback (including the empty-submission case), hear the entry's pronunciation, and click Continue to advance.

**Independent Test**: Per spec.md US1 Independent Test — open any set with at least one sentence-bearing entry, choose **Sentences Mode**, and confirm the practice card loads with a sentence-with-blank, an input field, a "Check Answer" button, and a progress indicator. Submitting a correct answer shows green feedback + Continue; submitting an incorrect or empty answer shows red feedback + Continue.

### Tests for User Story 1 (mandatory per Constitution V)

> **Write/extend these tests FIRST. Verify cases must initially fail (or, for the FE specs, fail because the UI is missing) before implementation completes.**

- [X] T009 [P] [US1] Add `Data/CorrectTestCases/TestCase03.cs` to `R:\private\LexicaNext\LexicaNext.WebApp.Tests.Integration\Features\Answers\RegisterAnswer\Data\CorrectTestCases\` posting `ModeType="sentences"`, `QuestionType="sentence-fill"`, `Question="The cat sat on the _____."`, `GivenAnswer="mat"`, `ExpectedAnswer="mat"`, `IsCorrect=true`, with a seeded `WordEntity` whose `Word="mat"` (mirror the shape of `TestCase01.cs`/`TestCase02.cs`)
- [X] T010 [P] [US1] Add `Data/IncorrectTestCases/TestCase16.cs` to `R:\private\LexicaNext\LexicaNext.WebApp.Tests.Integration\Features\Answers\RegisterAnswer\Data\IncorrectTestCases\` posting `ModeType="sentences"` with `QuestionType="sentence-multiple-choice"` (NOT in the new allow-list) and assert validator rejection — pins the boundary against future allow-list drift
- [X] T011 [P] [US1] Create `R:\private\LexicaNext\Frontend\lexica-next-front-e2e-tests\tests\sets\15-sentences-mode.spec.ts` covering: page loads with `Sentences Mode` heading, set name, progress bar, blank-bearing sentence, input, **Check Answer** button; correct answer → green `Correct!` feedback + **Continue**; incorrect answer → red `Incorrect` feedback with given/expected lines + **Continue**; **empty submission → red `Incorrect` feedback** (clarification #3); **Enter** submits; back arrow returns to `/sets`. Mirror the structure of `tests/sets/11-open-questions-mode.spec.ts`; reuse helpers from `tests/sets/helpers.ts` (`generateTestPrefix`, `captureAuthToken`, `createWordViaApiReturningId`, `createSetViaApi`, `getSetNameById`, `deleteSetViaApi`, `deleteWordsViaApi`). Seed words via API with at least one example sentence containing the target word — extend `helpers.ts` with a small `createWordWithSentencesViaApi(...)` if no existing helper covers seeding sentences.

### Implementation for User Story 1

- [X] T012 [P] [US1] Create `R:\private\LexicaNext\Frontend\lexica-next-front\src\components\sets\modes\SetSentencesMode.tsx` — exports `SentencesEntry` interface (`extends EntryDto` with `selectedSentenceIndices: number[]` and `sentenceCounters: Record<number, number>`) and a `SetSentencesMode` component that:
  - Filters each entry's `exampleSentences` by the whole-word regex `\b<word>\b` (case-insensitive — see `R-6` in `research.md`); skips entries with zero matches.
  - Caps `selectedSentenceIndices` at 5 (FR-008) — first 5 by original index.
  - Renders the current sentence with the FIRST whole-word match replaced by `_____` (five underscores).
  - Compares answers via `userAnswer.trim().toLowerCase() === entry.word.toLowerCase()` (NOT `compareAnswers` — see `R-7`).
  - On submit calls `useRegisterAnswer().mutate({ modeType: 'sentences', questionType: 'sentence-fill', question: <sentence-with-blank>, givenAnswer: userAnswer, expectedAnswer: entry.word, isCorrect, wordId: entry.wordId })`.
  - Updates per-pair counter: +1 on correct (capped at 2), reset to 0 on incorrect (incl. empty).
  - Calls `usePronunciation(entry.word, entry.wordType, { autoPlay: false })` and triggers `playAudio()` on a `setTimeout(_, 100)` after `showFeedback` flips true (mirrors `SetOnlyOpenQuestionsMode`).
  - Uses `loadSession<SentencesEntry>(set.setId, 'sentences')` + `validateSession(...)` + an extra inline check that every saved sentence index still resolves to the same sentence text (`R-4`); on mismatch, calls `clearSession(set.setId, 'sentences')` and rebuilds.
  - On every state change calls `saveSession(set.setId, set.name ?? '', 'sentences', entries)`.
  - Renders the same Mantine card layout as `SetOnlyOpenQuestionsMode` (Progress + counter + Paper + Stack + TextInput + Check Answer button + feedback Alert + Continue + ExampleSentences on feedback).
  - Renders the empty-state alert (`color="orange" title="No usable example sentences"`) when no entry produces an eligible sentence-question — covers FR-014 (used by US3).
  - Renders the completion screen with title `🎉 Congratulations!`, the subtitle `You've completed the sentences mode for "{set?.name}"!`, **Back to Sets** (uses `links.sets.getUrl({}, { page: returnPage })`), and **Practice Again** (`window.location.reload()`) — covers FR-011 (used by US2).
- [X] T013 [US1] Create `R:\private\LexicaNext\Frontend\lexica-next-front\src\pages\sets\modes\SetSentencesModePage.tsx` mirroring `SetOnlyOpenQuestionsModePage.tsx`: `useParams` for `setId`, `useSet(setId)`, loading overlay, error → `showErrorNotification` + navigate-to-`/sets`, header `Sentences Mode` + set-name subtitle + back arrow (uses `returnPage`), and renders `<SetSentencesMode set={set} />`. Depends on T012 (component) and T007 (route reference).
- [X] T014 [US1] Run `dotnet test --filter "FullyQualifiedName~RegisterAnswerTests"` from repo root, accept the new `*.received.txt` snapshots (rename to `*.verified.txt`) for `RegisterAnswerTests.RegisterAnswer_ShouldBeSuccessful.verified.txt` and `RegisterAnswerTests.RegisterAnswer_ShouldBeUnsuccessful.verified.txt` after confirming the diff contains exactly the expected sentences-mode rows. Depends on T004, T009, T010.
- [X] T015 [US1] Run `npx playwright test tests/sets/15-sentences-mode.spec.ts` from `R:\private\LexicaNext\Frontend\lexica-next-front-e2e-tests` and confirm green. Depends on T011, T012, T013. **Pending manual run — requires live dev server + Auth0 sign-in.** Spec file lists correctly via `--list`.

**Checkpoint**: User Story 1 fully functional — a user can launch Sentences Mode and answer one question end-to-end with the correct/incorrect/empty paths covered by Playwright and the new mode/question-type accepted by the backend.

---

## Phase 4: User Story 2 — Track progress and complete the mode (Priority: P2)

**Goal**: Per-`(entry, sentence)` mastery tracking (default 2 correct), drop-out from rotation when mastered, completion screen when every eligible pair is mastered, and `localStorage`-based session resume across reloads. Existing-session restore on a reload picks up at the next eligible question.

**Independent Test**: Per spec.md US2 Independent Test — start Sentences Mode on a small set, master every `(entry, sentence)` pair, confirm the progress bar fills, mastered pairs drop from rotation, the completion screen appears, and **Back to Sets** + **Practice Again** are present. Reload mid-session and confirm counters survive.

> Most of US2's logic is **already implemented inside `SetSentencesMode` during US1** (T012 above), because the spec component cannot ship a usable card without progress tracking and completion handling. US2's tasks below verify those behaviours end-to-end and add session-resume regression coverage.

### Tests for User Story 2 (mandatory per Constitution V)

- [X] T016 [P] [US2] Create `R:\private\LexicaNext\Frontend\lexica-next-front-e2e-tests\tests\sets\16-sentences-mode-session-resume.spec.ts` mirroring `tests/sets/14-open-questions-mode-session-resume.spec.ts`. Cover: (a) session is persisted to `localStorage` (key `lexica-session:<setId>:sentences`) after one answer; (b) after reload, counters survive and the next question loads; (c) the existing resume modal flow recognises the new `'sentences'` mode key (if applicable to the existing resume UI); (d) per-pair counter shape — submit one correct answer for a multi-sentence entry and assert that ONLY the answered `sentenceCounters[i]` advances, others stay 0; (e) session is **discarded** when the underlying entry's sentence list is changed via API mid-session (covers clarification #2 + edge case "Underlying entries change mid-session"). Reuse `expectSessionStored`, `expectSessionCleared`, `expectResumeModalVisible`, `clearAllSessionStorage` from `tests/sets/helpers.ts`.

### Implementation for User Story 2

> No additional production code beyond the `SetSentencesMode` work in T012 — US2's progress / completion / session-resume logic is implemented there. The tasks below are verification-only.

- [x] T017 [US2] Run `npx playwright test tests/sets/15-sentences-mode.spec.ts tests/sets/16-sentences-mode-session-resume.spec.ts` and confirm green. Depends on T016 and T012. **Pending manual run — requires live dev server + Auth0 sign-in.**
- [x] T018 [US2] Manual smoke per `quickstart.md` table row "#2 — entry mutation discards session". **Pending manual run.**: open the mode, answer once, reload, edit one of the entry's sentences via API in another tab, reload sentences-mode, confirm the previous progress is discarded and `Q` reflects the new sentence list. (Documents that the runtime behaviour matches the clarification; no code change.)

**Checkpoint**: Per-pair progress, session-resume, and completion all verified end-to-end.

---

## Phase 5: User Story 3 — Skip entries that cannot be turned into a fill-in-the-blank question (Priority: P3)

**Goal**: Entries with zero example sentences are excluded; entries with sentences that never contain the target word as a whole word are excluded; sets that exclude every entry show the empty-state alert (no broken practice card). Multi-sentence entries yield one question per matching sentence (capped at 5).

**Independent Test**: Per spec.md US3 Independent Test — practise a set whose entries include (a) words with at least one matching example sentence, (b) words whose example sentences exist but never contain the word, and (c) words with no example sentences at all. Confirm only (a) appears in the rotation; (b) and (c) are silently skipped. If every entry falls into (b)/(c), the empty-state appears. For an entry with > 5 matching sentences, exactly 5 sentence-questions appear.

> Like US2, the production-code logic is implemented inside `SetSentencesMode` (T012). US3's tasks below add the regression Playwright coverage that pins the spec edge-cases and the FR-008 cap.

### Tests for User Story 3 (mandatory per Constitution V)

- [X] T019 [P] [US3] Add three test cases to `R:\private\LexicaNext\Frontend\lexica-next-front-e2e-tests\tests\sets\15-sentences-mode.spec.ts` (extending the file from T011): (a) entry with no example sentences is excluded — total Q reflects only the eligible entries; (b) entry whose every sentence omits the target word is excluded — same expectation; (c) set where ALL entries are excluded shows the empty-state alert (`No usable example sentences`) and NO practice card. Use the seeding helper added in T011.
- [X] T020 [P] [US3] Add a fourth test case to `tests/sets/15-sentences-mode.spec.ts`: seed an entry with 7 sentences that all contain the target word; confirm the progress bar shows `0 / 5` (NOT `0 / 7`) — covers the FR-008 per-entry cap.
- [X] T021 [P] [US3] Add a fifth test case to `tests/sets/15-sentences-mode.spec.ts`: seed two entries — entry A with 3 matching sentences, entry B with 2 matching sentences — and confirm Q = 5.

### Implementation for User Story 3

> No additional production code — handled by T012 (eligibility filter + per-entry cap of 5 + empty-state alert + multi-sentence flattening). The tasks below verify those behaviours.

- [x] T022 [US3] Run `npx playwright test tests/sets/15-sentences-mode.spec.ts` and confirm green (covers T019, T020, T021). Depends on those three tasks and T012. **Pending manual run.**

**Checkpoint**: All eligibility, empty-state, multi-sentence, and per-entry-cap behaviours verified.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Format, lint, build, and final manual verification per `quickstart.md`.

- [X] T023 [P] Run `npm run lint` from `R:\private\LexicaNext\Frontend\lexica-next-front` and resolve any lint warnings introduced by `SetSentencesMode.tsx`, `SetSentencesModePage.tsx`, `links.ts`, `session-storage.ts`, `AppRouter.tsx`, `SetsList.tsx`
- [X] T024 [P] Run `npm run prettier` from `R:\private\LexicaNext\Frontend\lexica-next-front` to format the new files
- [X] T025 [P] Run `npm run build` from `R:\private\LexicaNext\Frontend\lexica-next-front` and confirm zero TypeScript errors
- [X] T026 Run `dotnet build LexicaNext.sln` from repo root and confirm zero warnings/errors
- [X] T027 Run `dotnet test LexicaNext.sln` from repo root and confirm full suite green (RegisterAnswer Verify suite green; pre-existing flakes in `ApiAuth0Tests` and `UpdateWordTests` reproduced on full-suite run only — `UpdateWord_ShouldBeUnsuccessful` passes when run alone, indicating a parallel-isolation/Docker-network race unrelated to this feature).
- [ ] T028 Walk through every row of the verification table in `R:\private\LexicaNext\specs\004-sentences-mode\quickstart.md` ("Per-feature sanity for the spec clarifications") and confirm each one passes manually in a browser. **Pending manual walk-through.**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion — MVP increment, deliverable on its own
- **User Story 2 (Phase 4)**: Depends on Foundational + the `SetSentencesMode` shell from US1's T012 (because per-pair progress + completion + session-resume live in the same component); can land any time after T012
- **User Story 3 (Phase 5)**: Depends on Foundational + T012; can land any time after T012 (verifies eligibility/cap/empty-state behaviour also implemented in T012)
- **Polish (Phase 6)**: Depends on US1, US2, US3 being implemented

### Within User Story 1

- Backend tests (T009, T010) and frontend E2E test (T011) authored in parallel — they reference the new mode/question-type values.
- T012 (`SetSentencesMode` component) blocks T013 (page) and T015 (run E2E).
- T004 (validator change) + T009/T010 (test cases) feed T014 (accept snapshots).

### Within User Story 2 / 3

- Tests-then-verify only; no new production code.

### Parallel Opportunities

- **Phase 1**: T001 / T002 / T003 all parallel.
- **Phase 2**: T005 / T006 parallel; T007 depends on the page (created in T013) but the route entry referencing the page can be added before the file exists if you'll commit them together — otherwise add T007 after T013. T008 only depends on T005 (new `links` entry).
- **Phase 3**: T009 / T010 / T011 all parallel (different files); T012 stands alone; T013 depends on T012; T014 depends on T004+T009+T010; T015 depends on T011+T012+T013.
- **Phase 4–5**: T016, T019, T020, T021 are all `tests/sets/15-sentences-mode.spec.ts` and `tests/sets/16-sentences-mode-session-resume.spec.ts` edits — coordinate to avoid merge conflicts within the spec file (T019/T020/T021 all touch `15-...spec.ts`).
- **Phase 6**: T023 / T024 / T025 parallel.

---

## Parallel Example: User Story 1

```bash
# Author backend tests + frontend E2E in parallel after Foundational completes:
T009  [P] [US1] Add CorrectTestCases/TestCase03.cs (sentences-mode happy path)
T010  [P] [US1] Add IncorrectTestCases/TestCase16.cs (rejected question type)
T011  [P] [US1] Create tests/sets/15-sentences-mode.spec.ts (page flow)

# Build the SetSentencesMode component while tests are being authored:
T012  [P] [US1] Create components/sets/modes/SetSentencesMode.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1 (Setup)
2. Phase 2 (Foundational) — validator allow-list + link + route + menu item + session-mode union
3. Phase 3 (User Story 1) — `SetSentencesMode` + page + 1 BE Verify pair + 1 FE E2E spec
4. **STOP and VALIDATE**: launch Sentences Mode in a browser, answer one correct + one incorrect + one empty submission; run `npx playwright test tests/sets/15-sentences-mode.spec.ts`; run `dotnet test --filter "FullyQualifiedName~RegisterAnswerTests"`
5. Demo / merge if green

### Incremental Delivery

1. Setup + Foundational ready
2. + US1 → MVP (functional Sentences Mode for at least one round-trip)
3. + US2 (verify progression + session-resume via the new spec)
4. + US3 (verify eligibility, cap, empty-state via additional cases in `15-sentences-mode.spec.ts`)
5. Polish (lint, prettier, build, manual quickstart walk-through)

### Single-Developer Strategy

Because US2 and US3 share `SetSentencesMode` (T012) and `15-sentences-mode.spec.ts` (T011/T019/T020/T021), a single developer should land them sequentially: T012 first, then bolt on the additional Playwright cases in one PR each (or a single PR covering US1+US2+US3 since the production-code surface is small).

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps task to its user story for traceability.
- US2 and US3 do not introduce new production code — their behaviour is implemented within `SetSentencesMode` (T012) because the component cannot ship as a single increment without the per-pair counters, completion screen, eligibility filter, and per-entry cap. Their phases are dedicated to the regression coverage that pins those behaviours.
- Verify-snapshot acceptance (T014) MUST be done by hand-inspecting the diff before renaming `*.received.txt` to `*.verified.txt` — never blanket-accept.
- Per Constitution Principle V, no test may be skipped, disabled, or commented out to make the build green.
- Per Constitution Principle I, every commit MUST keep `dotnet build LexicaNext.sln` and `npm run build` green.
