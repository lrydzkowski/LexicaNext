---

description: "Tasks for feature 003-words-statistics (Words Statistics Page)"
---

# Tasks: Words Statistics Page

**Input**: Design documents from `specs/003-words-statistics/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/get-words-statistics.md, quickstart.md

**Tests**: Integration tests (BE) and Playwright E2E tests (FE) ARE requested by this feature (plan.md Summary & Decisions 6–7). Test tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing. User stories map 1:1 to spec.md US1–US5.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Exact file paths included in every implementation task

## Path Conventions

Web application layout:

- Backend: `LexicaNext.Core/`, `LexicaNext.Infrastructure/`, `LexicaNext.WebApp/`, `LexicaNext.WebApp.Tests.Integration/`
- Frontend app: `Frontend/lexica-next-front/`
- Frontend E2E tests: `Frontend/lexica-next-front-e2e-tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffolding and tooling needed before any production code is written. This feature slots into the existing solution, so setup is minimal.

- [x] T001 Create the feature folder `LexicaNext.Core/Queries/GetWordsStatistics/` with `Interfaces/` and `Services/` subfolders (empty placeholders, to be populated in later phases)
- [x] T002 [P] Create the integration-test feature folder `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/Data/CorrectTestCases/` and `.../IncorrectTestCases/` (empty placeholders)
- [x] T003 [P] Create the frontend page folder `Frontend/lexica-next-front/src/pages/wordsStatistics/` and component folder `Frontend/lexica-next-front/src/components/wordsStatistics/` (empty placeholders)
- [x] T004 [P] Create the E2E spec folder `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/` (empty placeholder)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, domain types, write-path wiring, and endpoint scaffolding that every downstream user story depends on. Until this phase is complete no user story can be meaningfully implemented or tested.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Database & entity changes

- [x] T005 Add `WordId : Guid` property (and `WordEntity? Word` navigation) to `LexicaNext.Infrastructure/Db/Common/Entities/AnswerEntity.cs`
- [x] T006 Update `LexicaNext.Infrastructure/Db/Common/Configurations/AnswerEntityTypeConfiguration.cs`: map `WordId` to column `word_id` (required), configure `HasOne(Word).WithMany().HasForeignKey(WordId).OnDelete(DeleteBehavior.Cascade).IsRequired()`, and add `HasIndex(WordId)` in `ConfigureIndexes` (per data-model.md §Fluent configuration)
- [x] T007 Generate EF Core migration via `dotnet ef migrations add AddWordIdToAnswer --project LexicaNext.Infrastructure --startup-project LexicaNext.WebApp`, producing `LexicaNext.Infrastructure/Db/Migrations/<timestamp>_AddWordIdToAnswer.cs` and its `.Designer.cs` (depends on T005, T006)
- [x] T008 Replace the scaffolded migration body in `LexicaNext.Infrastructure/Db/Migrations/<timestamp>_AddWordIdToAnswer.cs` with the six-step raw-SQL `Up()` from research.md Decision 3 (add nullable `word_id`, UPDATE-JOIN backfill with single-match filter, DELETE unmatched, `SET NOT NULL`, `CREATE INDEX IX_answer_word_id`, add FK `FK_answer_word_word_id` with `ON DELETE CASCADE`) and a matching reverse-order `Down()` (depends on T007)

### Write-path extension (RegisterAnswer)

- [x] T009 Add `public Guid WordId { get; init; }` to `LexicaNext.Core/Commands/RegisterAnswer/Models/RegisterAnswerCommand.cs`
- [x] T010 Add `WordId` (nullable `Guid?` on the HTTP payload, non-nullable on the mapped command) to the request payload in `LexicaNext.Core/Commands/RegisterAnswer/RegisterAnswerEndpoint.cs` and forward it in `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerCommandMapper.cs` (depends on T009)
- [x] T011 Update `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerRequestValidator.cs`: require `WordId != Guid.Empty` and verify it references a `WordEntity` owned by the current user via the existing `WordsRepository.WordExistsAsync(userId, wordId)` (per data-model.md §Command extension) (depends on T009)
- [x] T012 Update `LexicaNext.Infrastructure/Db/Repositories/AnswerRepository.cs` `RegisterAnswerAsync` to copy `command.WordId` onto the new `AnswerEntity.WordId` column (depends on T005, T009)

### GetWordsStatistics endpoint scaffolding (no query logic yet)

- [x] T013 [P] Create the domain record `LexicaNext.Core/Common/Models/WordStatisticsRecord.cs` with `Guid WordId`, `string Word`, `int CorrectCount`, `int IncorrectCount` (init-only, per data-model.md §Domain model)
- [x] T014 [P] Create `LexicaNext.Core/Queries/GetWordsStatistics/Interfaces/IGetWordsStatisticsRepository.cs` defining `Task<(IReadOnlyList<WordStatisticsRecord> records, int totalCount)> GetWordsStatisticsAsync(string userId, ListParameters listParameters, CancellationToken cancellationToken)` — mirror the signature used by `IGetWordsRepository`
- [x] T015 [P] Create `LexicaNext.Core/Queries/GetWordsStatistics/Services/WordStatisticsRecordMapper.cs` translating `WordStatisticsRecord` → `WordStatisticsRecordDto` 1:1 (mirror `WordRecordMapper`) (depends on T013)
- [x] T016 [P] Create `LexicaNext.Core/Queries/GetWordsStatistics/Services/ListParametersMapper.cs` producing `ListParameters` from `GetWordsStatisticsRequest` with defaults `sortingFieldName="incorrectCount"`, `sortingOrder="desc"`, whitespace-only `searchQuery` normalised to null (per research.md Decision 4 and contracts/get-words-statistics.md §Query parameters)
- [x] T017 [P] Create `LexicaNext.Core/Queries/GetWordsStatistics/Services/GetWordsStatisticsRequestValidator.cs` validating `sortingFieldName ∈ {"correctCount","incorrectCount","word"}`, `sortingOrder ∈ SortingOrderConstants`, and `page`/`pageSize` bounds identical to `GetWordsRequestValidator`
- [x] T018 Create `LexicaNext.Core/Queries/GetWordsStatistics/Services/GetWordsStatisticsRequestProcessor.cs` orchestrating validator → `IUserContextResolver` → repository → mapper (mirror `GetWordsRequestProcessor`) (depends on T014, T015, T016, T017)
- [x] T019 Create `LexicaNext.Core/Queries/GetWordsStatistics/GetWordsStatisticsEndpoint.cs` defining `GetWordsStatisticsRequest` (`[AsParameters]`), `WordStatisticsRecordDto`, `GetWordsStatisticsResponse { int Count; IReadOnlyList<WordStatisticsRecordDto> Data }`, and `MapGetWordsStatisticsEndpoint` routing `GET /api/words-statistics` with policy `AuthorizationPolicies.Auth0OrApiKey`, returning `401` when `IUserContextResolver.GetUserId()` is null, and calling `Produces<GetWordsStatisticsResponse>()` (depends on T018)
- [x] T020 Create `LexicaNext.Infrastructure/Db/Repositories/WordsStatisticsRepository.cs` implementing `IGetWordsStatisticsRepository` — empty / `throw new NotImplementedException()` body is fine here; real query logic is added in US1 (T029). Register the type for DI following the existing convention used by `WordsRepository` (depends on T014)
- [x] T021 Wire the endpoint into the host: call `MapGetWordsStatisticsEndpoint(...)` from the endpoints wiring in `LexicaNext.WebApp/Program.cs` (or the equivalent `MapEndpoints` extension used by the other queries) (depends on T019)

### Frontend foundational plumbing

- [x] T022 [P] Add a `wordsStatistics` link builder to `Frontend/lexica-next-front/src/config/links.ts` (path `/words-statistics`, supports `page`, `searchQuery`, `sortingFieldName`, `sortingOrder` query params)
- [x] T023 [P] Add navigation entry "Words Statistics" alongside Sets/Words/About in `Frontend/lexica-next-front/src/components/layout/Layout.tsx` (depends on T022)
- [x] T024 Add the `/words-statistics` route and breadcrumbs registration to `Frontend/lexica-next-front/src/AppRouter.tsx`, wiring it to `WordsStatisticsPage` (the component is created in US1; for now register a stub import so the route compiles) (depends on T022)
- [x] T025 After BE builds successfully, regenerate `Frontend/lexica-next-front/api-types/api-types.ts` via the existing generation step (run `dotnet build` of the WebApp project or the project-specific `npm run generate-api-types`) so `"/api/words-statistics"` and `WordStatisticsRecordDto` appear in the OpenAPI-derived types (depends on T019, T021)

### Regenerate existing snapshots affected by the new column

- [x] T026 Regenerate Verify snapshots under `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/**/*.verified.txt` after the `WordId` column/payload is added, by running `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~RegisterAnswer"` and accepting the resulting `.received.txt` files (depends on T008, T010, T011, T012)

**Checkpoint**: Foundation ready — endpoint scaffolded (returns not-implemented in repo), schema migrated, write-path carries `WordId`. User story implementation can now begin.

---

## Phase 3: User Story 1 - Review per-word accuracy (Priority: P1) 🎯 MVP

**Goal**: A signed-in user can open `/words-statistics` and see one row per word they have answered in `open-questions` mode, showing correct and incorrect counts, scoped strictly to their own data. Delivers FR-002, FR-003 (columns only, ignoring sort/filter UI), FR-004, FR-005 (already wired in Phase 2), FR-013, FR-014, and the primary empty state from FR-011.

**Independent Test**: Sign in as a user with recorded `open-questions` answers for at least two words → open `/words-statistics` → confirm each word appears on its own row with counts matching the seeded history; sign in as a second user and confirm their rows are independent. A user with zero answers sees the primary empty-state message.

### Tests for User Story 1 ⚠️

- [x] T027 [P] [US1] Create `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/Data/CorrectTestCases/CorrectTestCasesGenerator.cs` producing seeded-history cases that exercise: single-word baseline, multi-word baseline, user-scoping (two users with overlapping words), and mode-scoping (non-open-questions answers excluded) — seed via the real `RegisterAnswer` command per research.md Decision 6
- [x] T028 [US1] Create `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/GetWordsStatisticsTests.cs` as an xUnit v3 class in `MainTestsCollection` that drives `GET /api/words-statistics` using the cases from T027 and verifies response shape via Verify, plus an unauthenticated-request case returning `401`, and an empty-state case returning `{"count":0,"data":[]}` (depends on T027)

### Implementation for User Story 1

- [x] T029 [US1] Implement `GetWordsStatisticsAsync` in `LexicaNext.Infrastructure/Db/Repositories/WordsStatisticsRepository.cs` — hand-rolled LINQ per research.md Decision 2: group `Answers` by `WordId` filtered to `UserId == userId && ModeType == "open-questions"`, join to `Words` scoped by `UserId == userId`, project to `WordStatisticsRecord`, apply pre-pagination `totalCount` after any filter, paginate via the existing `Paginate` extension, and return `(records, totalCount)`. Do NOT reuse the generic `Sort`/`Filter` extensions here — sorting and filtering logic are added in US2/US3 (see Dependencies below)
- [x] T030 [US1] Verify `GetWordsStatisticsEndpoint` (from T019) correctly propagates `count`/`data` shape and the `401` path; extend it if the scaffold stub returned a wrong shape (depends on T029)

**Checkpoint**: MVP reachable. User can browse `/words-statistics` with the default endpoint response. Frontend page (T033–T036) is what makes it visible to users — implement now as part of US1 since the page is the delivery mechanism for this story.

### Frontend for User Story 1

- [x] T031 [P] [US1] Add a `useWordsStatistics` hook to `Frontend/lexica-next-front/src/hooks/api.ts` that calls `GET /api/words-statistics` via the openapi-typed fetch client and returns `{ data, count, isLoading, error }` (mirror `useWords`). Accept `{ page, searchQuery, sortingFieldName, sortingOrder }` params and pass them straight through (depends on T025)
- [x] T032 [US1] Create `Frontend/lexica-next-front/src/pages/wordsStatistics/WordsStatisticsPage.tsx` — page shell that renders the list component and owns the breadcrumb title. Replace the stub registered in T024 (depends on T024, T033)
- [x] T033 [US1] Create `Frontend/lexica-next-front/src/components/wordsStatistics/WordsStatisticsList.tsx` that:
  - Reads `page`, `searchQuery`, `sortingFieldName`, `sortingOrder` from `useSearchParams`
  - Calls `useWordsStatistics(...)`
  - Renders columns: Word, Correct, Incorrect, Go-to-word action (go-to-word is wired in US4)
  - Renders the FR-011a primary empty-state when `count === 0` and `searchQuery` is empty/unset
  - (Sort header clicks, filter input, and pagination are wired in US2/US3/US5 respectively — leave extension seams but keep US1 scope limited to rendering rows + primary empty state)
  (depends on T031)

---

## Phase 4: User Story 2 - Sort statistics by correct or incorrect counts (Priority: P2)

**Goal**: Clicking the "Correct" or "Incorrect" column header toggles sort asc/desc, with `incorrectCount desc` as default. Sort state is persisted in URL query params and re-applied on reload (FR-007, FR-008, FR-009, FR-015 for sort).

**Independent Test**: From a populated statistics page, click the Correct header → rows reorder by correct count desc, URL gains `sortingFieldName=correctCount&sortingOrder=desc`. Click again → asc. Same for Incorrect. Ties break alphabetically by word.

### Tests for User Story 2 ⚠️

- [x] T034 [P] [US2] Extend `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/Data/CorrectTestCases/CorrectTestCasesGenerator.cs` with cases that assert sort behaviour: `sortingFieldName=correctCount` asc/desc, `sortingFieldName=incorrectCount` asc/desc, `sortingFieldName=word` asc/desc, and a tie-breaker case where the primary column ties and the secondary key `word asc` decides the order
- [x] T035 [P] [US2] Extend `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/Data/IncorrectTestCases/IncorrectTestCasesGenerator.cs` with unknown-`sortingFieldName` and out-of-range-`sortingOrder` cases asserting `400 Bad Request` with RFC 7807 body
- [x] T036 [P] [US2] Create `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/03-sort.spec.ts` covering: Correct asc/desc toggle, Incorrect asc/desc toggle, default load order (`incorrectCount desc`), URL persistence across reloads. Uses the seeding helper from T045

### Implementation for User Story 2

- [x] T037 [US2] Extend `GetWordsStatisticsAsync` in `LexicaNext.Infrastructure/Db/Repositories/WordsStatisticsRepository.cs` to apply sorting on the projected `IQueryable<WordStatisticsRecord>`: switch on `listParameters.Sorting.FieldName` (`correctCount`, `incorrectCount`, `word`), direction from `SortingOrderConstants`, always append `ThenBy(x => x.Word)` when the primary key is not `word` (per research.md Decision 2 & 4) (depends on T029)
- [x] T038 [US2] Extend `WordsStatisticsList.tsx` to render Correct/Incorrect column headers as sort toggles: clicking cycles `desc → asc → desc`, mutates `sortingFieldName`/`sortingOrder` via `setSearchParams({ ..., page: undefined }, { replace: true })` to reset page to 1 per FR-016 (depends on T033)

**Checkpoint**: User Stories 1 AND 2 both work independently.

---

## Phase 5: User Story 3 - Filter statistics by word text (Priority: P2)

**Goal**: A filter input above the list narrows visible rows to those whose word contains the typed substring (case-insensitive). Filter state is URL-persisted and debounced. Page resets to 1 on filter change (FR-006, FR-010, FR-011b, FR-015, FR-016).

**Independent Test**: With a populated statistics page, type `app` → after ≤300 ms only matching rows remain, URL gains `searchQuery=app`, page resets to `1`. Clearing the input restores the full list. Typing a value with no matches shows the filtered empty state distinct from the primary empty state.

### Tests for User Story 3 ⚠️

- [x] T039 [P] [US3] Extend `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/Data/CorrectTestCases/CorrectTestCasesGenerator.cs` with filter cases: substring match, case-insensitive match, whitespace-only filter treated as empty, filter combined with sort, and zero-match filter producing `{"count":0,"data":[]}`
- [x] T040 [P] [US3] Create `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/02-filter.spec.ts` covering: typing narrows rows, debounce ≤300 ms, URL gains `searchQuery=...`, page resets to `1` after filter change, clearing restores full list, filtered-empty-state message visible when no rows match

### Implementation for User Story 3

- [x] T041 [US3] Extend `GetWordsStatisticsAsync` in `LexicaNext.Infrastructure/Db/Repositories/WordsStatisticsRepository.cs` to apply `EF.Functions.ILike(x.Word, $"%{searchQuery}%")` post-projection when `listParameters.Filtering?.SearchQuery` is non-null and non-whitespace (per research.md Decision 2 & contracts/get-words-statistics.md §Scope) (depends on T029)
- [x] T042 [US3] Extend `WordsStatisticsList.tsx` to render a `<TextInput>` filter bound through `useDebouncedValue(value, 300)` that writes `searchQuery` to the URL (drops the param when value is empty/whitespace), resets `page` to `1` on change, and renders the FR-011b filtered-empty-state message when `count === 0 && searchQuery !== ""` (depends on T033)

**Checkpoint**: User Stories 1, 2, 3 all work independently.

---

## Phase 6: User Story 5 - Pagination (Priority: P2)

**Goal**: The list is paginated with the same control and page size as Sets/Words. Current page is in the URL (`page=`). Changing filter or sort resets to page 1. Browser back/forward restores list state. (FR-015, FR-016, acceptance scenarios US5.1–US5.4.)

**NOTE**: Ordered before US4 because US4 (go-to-word + return) depends on a URL-driven, deep-linkable list view — which is only fully realised once pagination is also URL-driven. Priority order P1/P2/P2/P2/P3 is preserved; within same-priority stories this sequence minimises rework.

**Independent Test**: With more rows than page size, opening the page shows page 1 + pagination control matching Sets/Words. Clicking page 2 updates `?page=2`. Changing filter or sort while on page 2 resets to page 1. Browser back restores the previous list state.

### Tests for User Story 5 ⚠️

- [x] T043 [P] [US5] Extend `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/Data/CorrectTestCases/CorrectTestCasesGenerator.cs` with a case that seeds more rows than the default `pageSize`, asserting `count` reflects pre-pagination total and `data.Length <= pageSize` on page 1, and a `page=2` case returning the expected second-page rows
- [x] T044 [P] [US5] Create `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/04-pagination.spec.ts` covering: pagination control visible with seeded overflow, URL `?page=2` on next-page click, browser back restores filter+sort+page, filter/sort change resets to page 1
- [x] T045 [P] [US5] Create `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/helpers.ts` exporting `seedOpenQuestionAnswersViaApi({ word, correctCount, incorrectCount })` that hits `POST /api/words` and then `POST /api/answers` via the captured auth token and a `generateTestPrefix`ed word — reusable by tests T036, T040, T044, T048, T050

### Implementation for User Story 5

- [x] T046 [US5] Extend `WordsStatisticsList.tsx` to render the shared pagination control used by `WordsList`/`SetsList`, reading/writing `page` via `useSearchParams`, ensuring the default page size matches Sets/Words (depends on T033)
- [x] T047 [US5] Create `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/01-words-statistics-page.spec.ts` — baseline spec covering rows + counts correctness, primary empty state, filtered empty state (small surface test that verifies US1 + US3 + US5 basics work together end-to-end) (depends on T045)

**Checkpoint**: User Stories 1, 2, 3, 5 all work independently.

---

## Phase 7: User Story 4 - Jump to word edit form and return (Priority: P3)

**Goal**: The "go to word" action on each row navigates to the existing word edit form, carrying the full statistics URL as a `returnTo` query param. The edit form's "back" control returns the user to that URL when `returnTo` is present; existing Words-page return behaviour is preserved when `returnTo` is absent. (FR-012, FR-017, FR-018.)

**Independent Test**: Apply filter `app`, sort by Correct desc, page 2 on `/words-statistics`. Click a row's "go to word" → URL is `/words/{id}?returnTo=%2Fwords-statistics%3F...`. Click "back" on the edit form → browser lands on `/words-statistics?searchQuery=app&sortingFieldName=correctCount&sortingOrder=desc&page=2`. Navigating to `/words/{id}` from the Words page still returns to the Words page.

### Tests for User Story 4 ⚠️

- [x] T048 [P] [US4] Create `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/05-go-to-word-and-back.spec.ts` covering: round-trip preserves filter+sort+page, back on the edit form lands on the right URL, existing Words-page return path still works (regression case) (depends on T045)

### Implementation for User Story 4

- [x] T049 [US4] Extend the `editWord` link builder in `Frontend/lexica-next-front/src/config/links.ts` to accept an optional `returnTo: string` second argument that gets appended as a URL-encoded query param (only when the value is a same-origin path starting with `/`; silently dropped otherwise to prevent open-redirect) (depends on T022)
- [x] T050 [US4] In `WordsStatisticsList.tsx` render each row's go-to-word control as a link built with `links.words.editWord.getUrl({ wordId }, { returnTo: "/words-statistics" + location.search })` (depends on T049)
- [x] T051 [US4] Update the word edit form's back handler (the component under `Frontend/lexica-next-front/src/pages/words/` that owns the edit route) to prefer a `returnTo` query param starting with `/` when present, falling back to the existing `returnPage`-based reconstruction otherwise — keep the existing branch untouched (depends on T049)

**Checkpoint**: All user stories (US1–US5) are independently functional and testable.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T052 [P] Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~GetWordsStatistics"` and accept any remaining `.received.txt` snapshots
- [x] T053 [P] Run the full Playwright suite `cd Frontend/lexica-next-front-e2e-tests && npx playwright test tests/words-statistics` and confirm all five specs pass
- [x] T054 Run `cd Frontend/lexica-next-front && npm run build` to confirm there are no TypeScript or Vite regressions introduced by the new page/hook/link/types
- [ ] T055 Run the regression sweep from `specs/003-words-statistics/quickstart.md` §9 (`dotnet test`, `npm run build`, `npx playwright test`) and file any failures (depends on T052, T053, T054)
- [x] T056 Manually walk through `specs/003-words-statistics/quickstart.md` §7 User Stories 1–5 in a local browser against a seeded DB to verify SC-001, SC-004, SC-006, SC-007 are demonstrable

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational (Phase 2)
  - US1 (P1) should be completed first to establish MVP
  - US2, US3, US5 (P2) can then proceed in any order (each is independent of the others once US1 is delivered)
  - US4 (P3) is the only story with a cross-story UX contract (it builds `returnTo` URLs that include US2/US3/US5 state), so it is ordered last
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational. No inter-story dependencies.
- **US2 (P2)**: Depends on Foundational + the repository query shape established in US1 (T029). Sorting is added as an extension of that query.
- **US3 (P2)**: Depends on Foundational + T029. Filtering is an orthogonal extension of the same query method.
- **US5 (P2)**: Depends on Foundational + T029. Pagination uses the existing `Paginate` extension already invoked by T029.
- **US4 (P3)**: Depends on Foundational + the URL schema stabilised by US2/US3/US5 (because `returnTo` captures all of `searchQuery`, `sortingFieldName`, `sortingOrder`, `page`). Can be started earlier if the team accepts `returnTo` round-tripping only the params that currently exist in the URL, but strongly preferred to follow US2/US3/US5.

### Within Each User Story

- Integration/E2E tests MUST be written first and FAIL before the corresponding implementation lands (per project convention and research.md Decisions 6–7)
- Backend query logic (repository) before frontend UI that consumes it
- Backend endpoint before frontend hook
- Store/URL plumbing before individual UI affordances (e.g., URL schema before sort/filter/pagination controls)

### Parallel Opportunities

- All four Phase 1 Setup tasks (T001–T004) are [P] and run in parallel
- T013, T014, T015, T016, T017 in Phase 2 are [P] (separate files) and run in parallel once T005–T012 are done
- T022 and T023 in Phase 2 frontend plumbing are [P] with each other
- T027 (test data) runs in parallel with T029 (repo implementation) but T028 (test class) depends on T027
- Tests across user stories (T034, T035, T036, T039, T040, T043, T044, T045, T048) are [P] with each other and can be authored in parallel by different developers
- Polish tasks T052, T053, T054 are [P]

---

## Parallel Example: Phase 2 Foundational

```bash
# After T005–T012 are done, launch scaffolding files together:
Task: "Create LexicaNext.Core/Common/Models/WordStatisticsRecord.cs"
Task: "Create LexicaNext.Core/Queries/GetWordsStatistics/Interfaces/IGetWordsStatisticsRepository.cs"
Task: "Create LexicaNext.Core/Queries/GetWordsStatistics/Services/WordStatisticsRecordMapper.cs"
Task: "Create LexicaNext.Core/Queries/GetWordsStatistics/Services/ListParametersMapper.cs"
Task: "Create LexicaNext.Core/Queries/GetWordsStatistics/Services/GetWordsStatisticsRequestValidator.cs"
```

## Parallel Example: Authoring tests across user stories

```bash
# Once Foundational is done, tests can be written in parallel before any story-level implementation starts:
Task: "Create GetWordsStatisticsTests.cs and CorrectTestCasesGenerator.cs (US1)"
Task: "Extend CorrectTestCasesGenerator with sort cases (US2)"
Task: "Extend CorrectTestCasesGenerator with filter cases (US3)"
Task: "Create tests/words-statistics/03-sort.spec.ts (US2)"
Task: "Create tests/words-statistics/02-filter.spec.ts (US3)"
Task: "Create tests/words-statistics/04-pagination.spec.ts (US5)"
Task: "Create tests/words-statistics/helpers.ts (US5 — shared)"
Task: "Create tests/words-statistics/05-go-to-word-and-back.spec.ts (US4)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — migration applied, write-path carries `WordId`, endpoint scaffolded
3. Complete Phase 3 (US1) — full query implementation + rendering + integration tests pass
4. **STOP and VALIDATE**: a user with seeded open-questions answers can load `/words-statistics` and see correct counts per word
5. Deploy/demo as MVP

### Incremental Delivery

1. MVP → US2 (sort) → US3 (filter) → US5 (pagination) → US4 (go-to-word + return)
2. Each story ships behind the same URL; each layer adds a query param to the schema without invalidating prior state
3. US4 can piggyback on a release together with US2/US3/US5 since its value is the sum of the other three

### Parallel Team Strategy

Once Phase 2 is complete:

- Developer A — US1 (MVP) → then US2
- Developer B — US3 and US5 tests + implementation (disjoint files from US2)
- Developer C — US4 after US2/US3/US5 (depends on URL schema stabilising)

---

## Notes

- `[P]` means the task touches a file distinct from any other `[P]` task in the same batch and has no ordering dependency within that batch
- Integration tests use Verify snapshots; first run produces `.received.txt` which must be promoted to `.verified.txt`
- `WordsStatisticsRepository` is the single read-side implementation; all of US1/US2/US3/US5 extend the same method — be careful when running those phases in parallel (rebase early, or serialise the repository edits)
- `WordsStatisticsList.tsx` is similarly a common touchpoint for US1/US2/US3/US5 — same caution applies on the frontend
- Verify each story independently before starting the next one — the feature is designed so US1 alone is already shippable, and each subsequent story is an additive increment
