# Tasks: Extend Back-End E2E Tests

**Input**: Design documents from `/specs/002-extend-e2e-tests/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-cases.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Create directory structure for feature tests

- [X] T001 Create Features/ directory structure per plan.md in LexicaNext.WebApp.Tests.Integration/Features/ with subdirectories: App/GetAppStatus/, Words/{GetWords,GetWord,GetWordSets,CreateWord,UpdateWord,DeleteWords}/, Sets/{GetSets,GetSet,GetProposedSetName,CreateSet,UpdateSet,DeleteSets}/, Answers/RegisterAnswer/, Translations/GenerateTranslations/, Sentences/GenerateExampleSentences/, Recordings/GetRecording/ - each endpoint directory contains a Data/CorrectTestCases/ and Data/IncorrectTestCases/ subdirectory

---

## Phase 2: Foundational (Common Infrastructure)

**Purpose**: Shared test infrastructure that MUST be complete before ANY user story can be implemented

**Warning**: No user story work can begin until this phase is complete

- [X] T002 [P] Create test case base classes in LexicaNext.WebApp.Tests.Integration/Common/TestCases/: ITestCaseData.cs (interface with TestCaseId, UserId, Data properties), BaseTestCaseData.cs (container with Db, EnglishDictionaryApi, AiService properties), DbTestCaseData.cs (lists of entity types per data-model.md), EnglishDictionaryApiTestCaseData.cs (WordPages dictionary, AudioFiles dictionary, ShouldFail flag), AiServiceTestCaseData.cs (Translations list, Sentences list, ShouldThrowException flag)
- [X] T003 [P] Create test result models in LexicaNext.WebApp.Tests.Integration/Common/Models/: ITestResult.cs (interface with TestCaseId and LogMessages), IHttpTestResult.cs (extends ITestResult with StatusCode and Response), ReceivedMethodCall.cs (model for NSubstitute call capture with MethodName and Arguments)
- [X] T004 [P] Create MainTestsCollection in LexicaNext.WebApp.Tests.Integration/Common/TestCollections/MainTestsCollection.cs - new xUnit collection for feature tests, separate from existing ApiTestCollection per research.md Decision 6
- [X] T005 [P] Create ContextScope for database cleanup in LexicaNext.WebApp.Tests.Integration/Common/Data/Db/ContextScope.cs - implements IDisposable, executes DELETE FROM statements in foreign-key-safe order per data-model.md cleanup order: set_word, translation, example_sentence, set, word, recording, answer, user_set_sequence
- [X] T006 [P] Create database data helpers in LexicaNext.WebApp.Tests.Integration/Common/Data/Db/: WordsData.cs (CreateWordsAsync, GetWordsAsync extension methods), SetsData.cs (CreateSetsAsync, GetSetsAsync), AnswersData.cs (CreateAnswersAsync, GetAnswersAsync) - each uses EF Core DbContext to seed and read test entities
- [X] T007 [P] Add WithMockedUserContext(string userId) builder extension to LexicaNext.WebApp.Tests.Integration/Common/WebApplication/WebApiFactoryBuilder.cs - replaces IUserContextResolver with NSubstitute mock that returns the specified userId per research.md Decision 4
- [X] T008 [P] Create EnglishDictionaryApiBuilder in LexicaNext.WebApp.Tests.Integration/Common/WebApplication/Infrastructure/EnglishDictionaryApiBuilder.cs - configures WireMock mappings for English Dictionary API based on EnglishDictionaryApiTestCaseData (word page HTML responses, audio file responses, failure scenarios)
- [X] T009 [P] Create AiServiceBuilder in LexicaNext.WebApp.Tests.Integration/Common/WebApplication/Infrastructure/AiServiceBuilder.cs - configures NSubstitute mock for IAiGenerationService based on AiServiceTestCaseData (translations, sentences, exception throwing)
- [X] T010 [P] Create DependenciesBuilder in LexicaNext.WebApp.Tests.Integration/Common/WebApplication/Infrastructure/DependenciesBuilder.cs - orchestrates WithMockedUserContext, EnglishDictionaryApiBuilder, and AiServiceBuilder based on test case data; exposes WithDependencies(testCase) extension method
- [X] T011 [P] Create utility extensions in LexicaNext.WebApp.Tests.Integration/Common/Extensions/: StringExtensions.cs (PrettifyJson for formatting JSON response bodies, AddIndentation for log alignment), NSubstituteExtensions.cs (GetReceivedMethodCalls for capturing mock interactions)
- [X] T012 [P] Extend TestContextScope in LexicaNext.WebApp.Tests.Integration/Common/Data/TestContextScope.cs - add Db property wrapping ContextScope, add SeedDataAsync(testCase) method that inserts DbTestCaseData entities into the database via data helpers
- [X] T013 Extend VerifySettingsBuilder in LexicaNext.WebApp.Tests.Integration/Common/Services/VerifySettingsBuilder.cs - add scrubbers for inline GUIDs (ScrubInlineGuids), DateTimeOffset values (ScrubInlineDateTimes), and PostgreSQL connection string host:port patterns per research.md Decision 7

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Word CRUD Endpoint Tests (Priority: P1)

**Goal**: Full test coverage for all 6 word management endpoints (55 test cases total)

**Independent Test**: Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~Words"` - all word endpoint tests pass independently

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement GetWordsTests in LexicaNext.WebApp.Tests.Integration/Features/Words/GetWords/: GetWordsTests.cs (test class with GetWords_ShouldBeSuccessful and GetWords_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with query parameters: Page, PageSize, Search, SortBy, SortDirection, TimeZone, CreatedAtFrom, CreatedAtTo, UpdatedAtFrom, UpdatedAtTo), Data/CorrectTestCases/ (15 test cases per test-cases.md section 2: default pagination, search, sort by word asc/desc, custom pagination, empty result, user isolation, filter/sort by created_at and updated_at with CET/PST timezones), Data/IncorrectTestCases/ (5 test cases: page=0, pageSize=0, pageSize=201, invalid sort, invalid timezone)
- [X] T015 [P] [US1] Implement GetWordTests in LexicaNext.WebApp.Tests.Integration/Features/Words/GetWord/: GetWordTests.cs (test class with GetWord_ShouldBeSuccessful and GetWord_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with WordId), Data/CorrectTestCases/ (1 test case: existing word with translations and examples), Data/IncorrectTestCases/ (3 test cases: non-existent GUID, malformed UUID, GUID of word created by another user)
- [X] T016 [P] [US1] Implement GetWordSetsTests in LexicaNext.WebApp.Tests.Integration/Features/Words/GetWordSets/: GetWordSetsTests.cs (test class with GetWordSets_ShouldBeSuccessful and GetWordSets_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with WordId), Data/CorrectTestCases/ (3 test cases: word in 2 sets, word in no sets, only current user's sets), Data/IncorrectTestCases/ (3 test cases: non-existent word, malformed UUID, GUID of word created by another user)
- [X] T017 [P] [US1] Implement CreateWordTests in LexicaNext.WebApp.Tests.Integration/Features/Words/CreateWord/: CreateWordTests.cs (test class with CreateWord_ShouldBeSuccessful and CreateWord_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with request body), Data/CorrectTestCases/ (2 test cases: all fields, without example sentences), Data/IncorrectTestCases/ (8 test cases: null payload, empty word, word exceeds 200 chars, invalid word type, empty translations, translation exceeds 200 chars, example exceeds 500 chars, duplicate word+wordType)
- [X] T018 [P] [US1] Implement UpdateWordTests in LexicaNext.WebApp.Tests.Integration/Features/Words/UpdateWord/: UpdateWordTests.cs (test class with UpdateWord_ShouldBeSuccessful and UpdateWord_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with WordId and request body), Data/CorrectTestCases/ (1 test case: update all fields), Data/IncorrectTestCases/ (10 test cases: non-existent wordId, malformed UUID, null payload, empty word, word exceeds 200 chars, invalid word type, empty translations, translation exceeds 200 chars, example exceeds 500 chars, duplicate word+type conflict)
- [X] T019 [P] [US1] Implement DeleteWordsTests in LexicaNext.WebApp.Tests.Integration/Features/Words/DeleteWords/: DeleteWordsTests.cs (test class with DeleteWords_ShouldBeSuccessful and DeleteWords_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with word IDs list), Data/CorrectTestCases/ (3 test cases: delete existing words, delete non-existent IDs, delete words assigned to another user - verify other user's words unchanged), Data/IncorrectTestCases/ (1 test case: empty IDs list)

**Checkpoint**: All 6 word endpoints tested (55 TCs). Run `dotnet test --filter "FullyQualifiedName~Words"` to validate.

---

## Phase 4: User Story 2 - Set CRUD Endpoint Tests (Priority: P2)

**Goal**: Full test coverage for all 6 set management endpoints (40 test cases total)

**Independent Test**: Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~Sets"` - all set endpoint tests pass independently

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement GetSetsTests in LexicaNext.WebApp.Tests.Integration/Features/Sets/GetSets/: GetSetsTests.cs (test class with GetSets_ShouldBeSuccessful and GetSets_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with query parameters: Page, PageSize, Search, SortBy, SortDirection, TimeZone, CreatedAtFrom, CreatedAtTo), Data/CorrectTestCases/ (9 test cases per test-cases.md section 8: default pagination, search, sort asc/desc, empty result, filter by created_at with CET/PST, sort by created_at asc/desc), Data/IncorrectTestCases/ (5 test cases: page=0, pageSize=0, pageSize=201, invalid sort, invalid timezone)
- [ ] T021 [P] [US2] Implement GetSetTests in LexicaNext.WebApp.Tests.Integration/Features/Sets/GetSet/: GetSetTests.cs (test class with GetSet_ShouldBeSuccessful and GetSet_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with SetId), Data/CorrectTestCases/ (1 test case: existing set with 2 words), Data/IncorrectTestCases/ (3 test cases: non-existent GUID, malformed UUID, GUID of set created by another user)
- [ ] T022 [P] [US2] Implement GetProposedSetNameTests in LexicaNext.WebApp.Tests.Integration/Features/Sets/GetProposedSetName/: GetProposedSetNameTests.cs (test class with GetProposedSetName_ShouldBeSuccessful method only - no incorrect test cases), Data/TestCaseData.cs (extends BaseTestCaseData), Data/CorrectTestCases/ (2 test cases: no existing sets returns "set_0001", with existing UserSetSequence next=5 returns "set_0005")
- [ ] T023 [P] [US2] Implement CreateSetTests in LexicaNext.WebApp.Tests.Integration/Features/Sets/CreateSet/: CreateSetTests.cs (test class with CreateSet_ShouldBeSuccessful and CreateSet_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with request body), Data/CorrectTestCases/ (1 test case: valid word IDs), Data/IncorrectTestCases/ (6 test cases: null payload, empty word IDs, non-existent word ID, duplicate word IDs, malformed UUID in word IDs, word IDs assigned to other users)
- [ ] T024 [P] [US2] Implement UpdateSetTests in LexicaNext.WebApp.Tests.Integration/Features/Sets/UpdateSet/: UpdateSetTests.cs (test class with UpdateSet_ShouldBeSuccessful and UpdateSet_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with SetId and request body), Data/CorrectTestCases/ (1 test case: update with new word IDs), Data/IncorrectTestCases/ (8 test cases: non-existent setId, malformed UUID, null payload, empty word IDs, non-existent word ID, duplicate word IDs, word IDs assigned to other users, set assigned to another user)
- [ ] T025 [P] [US2] Implement DeleteSetsTests in LexicaNext.WebApp.Tests.Integration/Features/Sets/DeleteSets/: DeleteSetsTests.cs (test class with DeleteSets_ShouldBeSuccessful and DeleteSets_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with set IDs list), Data/CorrectTestCases/ (3 test cases: delete existing sets, delete non-existent IDs, delete set IDs assigned to other users - verify other user's sets unchanged), Data/IncorrectTestCases/ (1 test case: empty IDs list)

**Checkpoint**: All 6 set endpoints tested (40 TCs). Run `dotnet test --filter "FullyQualifiedName~Sets"` to validate.

---

## Phase 5: User Story 3 - Answer Registration Endpoint Tests (Priority: P3)

**Goal**: Full test coverage for the answer registration endpoint (8 test cases total)

**Independent Test**: Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~RegisterAnswer"` - answer endpoint tests pass independently

### Implementation for User Story 3

- [ ] T026 [P] [US3] Implement RegisterAnswerTests in LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/: RegisterAnswerTests.cs (test class with RegisterAnswer_ShouldBeSuccessful and RegisterAnswer_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with request body), Data/CorrectTestCases/ (2 test cases: full answer with givenAnswer, without givenAnswer), Data/IncorrectTestCases/ (6 test cases: null payload, empty question, empty expectedAnswer, question exceeds 500 chars, givenAnswer exceeds 500 chars, expectedAnswer exceeds 500 chars)

**Checkpoint**: Answer endpoint tested (8 TCs). Run `dotnet test --filter "FullyQualifiedName~RegisterAnswer"` to validate.

---

## Phase 6: User Story 4 - AI Generation Endpoint Tests (Priority: P4)

**Goal**: Full test coverage for translation and sentence generation endpoints (14 test cases total)

**Independent Test**: Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~Generate"` - AI generation endpoint tests pass independently

### Implementation for User Story 4

- [ ] T027 [P] [US4] Implement GenerateTranslationsTests in LexicaNext.WebApp.Tests.Integration/Features/Translations/GenerateTranslations/: GenerateTranslationsTests.cs (test class with GenerateTranslations_ShouldBeSuccessful and GenerateTranslations_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with request body), Data/CorrectTestCases/ (1 test case: valid request with AI returning 3 translations - requires AiServiceTestCaseData mock), Data/IncorrectTestCases/ (6 test cases: empty word, word exceeds 200 chars, invalid word type, count=0, count=11, AI service failure via ShouldThrowException)
- [ ] T028 [P] [US4] Implement GenerateExampleSentencesTests in LexicaNext.WebApp.Tests.Integration/Features/Sentences/GenerateExampleSentences/: GenerateExampleSentencesTests.cs (test class with GenerateExampleSentences_ShouldBeSuccessful and GenerateExampleSentences_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with request body), Data/CorrectTestCases/ (1 test case: valid request with AI returning 3 sentences - requires AiServiceTestCaseData mock), Data/IncorrectTestCases/ (6 test cases: empty word, word exceeds 200 chars, invalid word type, count=0, count=11, AI service failure)

**Checkpoint**: Both AI generation endpoints tested (14 TCs). Run `dotnet test --filter "FullyQualifiedName~Generate"` to validate.

---

## Phase 7: User Story 5 - Recording Endpoint Tests (Priority: P5)

**Goal**: Full test coverage for the pronunciation recording endpoint (6 test cases total)

**Independent Test**: Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~GetRecording"` - recording endpoint tests pass independently

### Implementation for User Story 5

- [ ] T029 [P] [US5] Implement GetRecordingTests in LexicaNext.WebApp.Tests.Integration/Features/Recordings/GetRecording/: GetRecordingTests.cs (test class with GetRecording_ShouldBeSuccessful and GetRecording_ShouldBeUnsuccessful methods), Data/TestCaseData.cs (extends BaseTestCaseData with Word parameter), Data/CorrectTestCases/ (2 test cases: cached recording via mocked IRecordingStorage returning bytes, uncached recording via WireMock returning HTML+audio), Data/IncorrectTestCases/ (4 test cases: empty word, word exceeds 100 chars, recording not found via WireMock 404, dictionary API failure via WireMock 500) - requires both EnglishDictionaryApiTestCaseData and mocked IRecordingStorage per research.md Decision 5

**Checkpoint**: Recording endpoint tested (6 TCs). Run `dotnet test --filter "FullyQualifiedName~GetRecording"` to validate.

---

## Phase 8: User Story 6 - Status Endpoint Test (Priority: P6)

**Goal**: Test coverage for the health check status endpoint (1 test case)

**Independent Test**: Run `dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~GetAppStatus"` - status endpoint test passes independently

### Implementation for User Story 6

- [ ] T030 [US6] Implement GetAppStatusTests in LexicaNext.WebApp.Tests.Integration/Features/App/GetAppStatus/GetAppStatusTests.cs - trivial test class with GetAppStatus_ShouldBeSuccessful method only (no Data/ folder needed per test-cases.md section 1), sends GET /api/status and verifies 200 OK with `{"status":"OK"}` response

**Checkpoint**: Status endpoint tested (1 TC). Run `dotnet test --filter "FullyQualifiedName~GetAppStatus"` to validate.

---

## Phase 9: Polish and Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [ ] T031 Run full integration test suite via `dotnet test LexicaNext.WebApp.Tests.Integration` and verify all 124 test cases pass - generate initial Verify snapshots with `-- Verify.AutoVerify=true` on first run
- [ ] T032 Verify endpoint coverage completeness - confirm all 17 endpoints discovered by existing EndpointHelpers in LexicaNext.WebApp.Tests.Integration/Api/EndpointHelpers.cs have corresponding test classes in Features/

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phases 3-8)**: All depend on Foundational phase completion
  - US1 (Word CRUD) and US3-US6 can proceed in parallel
  - US2 (Set CRUD) depends on US1 word data helpers being available (sets reference words)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1) Word CRUD**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US2 (P2) Set CRUD**: Depends on US1 for word seeding helpers (sets contain words). Can start after US1 checkpoint.
- **US3 (P3) Answer Registration**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **US4 (P4) AI Generation**: Can start after Foundational (Phase 2) - Requires AiServiceBuilder from Phase 2
- **US5 (P5) Recording**: Can start after Foundational (Phase 2) - Requires EnglishDictionaryApiBuilder from Phase 2
- **US6 (P6) Status**: Can start after Foundational (Phase 2) - Simplest endpoint, good for infrastructure validation

### Within Each User Story

- All endpoint tasks within a story are parallelizable (marked [P])
- Each endpoint task creates its own test class and all test case data files

### Parallel Opportunities

- All Phase 2 foundational tasks marked [P] can run in parallel (T002-T012)
- All 6 word endpoint tasks can run in parallel (T014-T019)
- All 6 set endpoint tasks can run in parallel (T020-T025)
- US3, US4, US5, US6 can all run in parallel with each other
- US3, US4, US5, US6 can run in parallel with US1

---

## Parallel Example: User Story 1

```text
# All word endpoint tasks can run simultaneously:
T014: "GetWordsTests (20 TCs) in Features/Words/GetWords/"
T015: "GetWordTests (4 TCs) in Features/Words/GetWord/"
T016: "GetWordSetsTests (6 TCs) in Features/Words/GetWordSets/"
T017: "CreateWordTests (10 TCs) in Features/Words/CreateWord/"
T018: "UpdateWordTests (11 TCs) in Features/Words/UpdateWord/"
T019: "DeleteWordsTests (4 TCs) in Features/Words/DeleteWords/"
```

## Parallel Example: Foundational Infrastructure

```text
# All infrastructure tasks can run simultaneously:
T002: "Test case base classes in Common/TestCases/"
T003: "Test result models in Common/Models/"
T004: "MainTestsCollection in Common/TestCollections/"
T005: "ContextScope in Common/Data/Db/"
T006: "Database data helpers in Common/Data/Db/"
T007: "WithMockedUserContext in Common/WebApplication/"
T008: "EnglishDictionaryApiBuilder in Common/WebApplication/Infrastructure/"
T009: "AiServiceBuilder in Common/WebApplication/Infrastructure/"
T011: "Utility extensions in Common/Extensions/"
```

---

## Implementation Strategy

### MVP First (User Story 6 + User Story 1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 8: US6 Status (simplest endpoint, validates infrastructure works)
4. Complete Phase 3: US1 Word CRUD
5. **STOP and VALIDATE**: Run word + status tests independently
6. Proceed with remaining stories

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add US6 (Status) -> Validate infrastructure -> 1 TC passing
3. Add US1 (Word CRUD) -> 55 TCs passing -> Core domain tested
4. Add US2 (Set CRUD) -> 40 TCs passing -> Full CRUD coverage
5. Add US3 (Answer) -> 8 TCs passing
6. Add US4 (AI Generation) -> 14 TCs passing -> External service coverage
7. Add US5 (Recording) -> 6 TCs passing -> Full endpoint coverage
8. Polish -> All 124 TCs passing

---

## Summary

| Phase | Story | Task Count | Test Cases |
|-------|-------|-----------|------------|
| Setup | - | 1 | 0 |
| Foundational | - | 12 | 0 |
| US1 Word CRUD | P1 | 6 | 55 |
| US2 Set CRUD | P2 | 6 | 40 |
| US3 Answer | P3 | 1 | 8 |
| US4 AI Generation | P4 | 2 | 14 |
| US5 Recording | P5 | 1 | 6 |
| US6 Status | P6 | 1 | 1 |
| Polish | - | 2 | 0 |
| **Total** | | **32** | **124** |

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All test case definitions reference contracts/test-cases.md for exact descriptions, seed data, and expected results
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
