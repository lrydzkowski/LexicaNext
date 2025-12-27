# Tasks: Independent Word Management

**Input**: Design documents from `/specs/001-independent-words/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `LexicaNext.Core/`, `LexicaNext.Infrastructure/`, `LexicaNext.WebApp/`
- **Frontend**: `Frontend/lexica-next-front/src/`

---

## Phase 1: Setup

**Purpose**: Database schema changes and entity modifications

- [x] T001 Modify WordEntity to add CreatedAt and EditedAt fields, remove SetId in `LexicaNext.Infrastructure/Db/Common/Entities/WordEntity.cs`
- [x] T002 Create SetWordEntity join table in `LexicaNext.Infrastructure/Db/Common/Entities/SetWordEntity.cs`
- [x] T003 [P] Update WordEntityTypeConfiguration for new schema in `LexicaNext.Infrastructure/Db/Common/Configurations/WordEntityTypeConfiguration.cs`
- [x] T004 [P] Create SetWordEntityTypeConfiguration in `LexicaNext.Infrastructure/Db/Common/Configurations/SetWordEntityTypeConfiguration.cs`
- [x] T005 Update SetEntity to use SetWords navigation in `LexicaNext.Infrastructure/Db/Common/Entities/SetEntity.cs`
- [x] T006 [P] Update SetEntityTypeConfiguration for new relationship in `LexicaNext.Infrastructure/Db/Common/Configurations/SetEntityTypeConfiguration.cs`
- [x] T007 Register new entities in AppDbContext in `LexicaNext.Infrastructure/Db/AppDbContext.cs`
- [x] T008 Create database migration for independent words schema in `LexicaNext.Infrastructure/Db/Migrations/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure for words CRUD that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create Word domain model in `LexicaNext.Core/Common/Models/Word.cs`
- [x] T010 Create ICreateWordRepository interface in `LexicaNext.Core/Commands/CreateWord/Interfaces/ICreateWordRepository.cs`
- [x] T011 [P] Create IUpdateWordRepository interface in `LexicaNext.Core/Commands/UpdateWord/Interfaces/IUpdateWordRepository.cs`
- [x] T012 [P] Create IDeleteWordRepository interface in `LexicaNext.Core/Commands/DeleteWord/Interfaces/IDeleteWordRepository.cs`
- [x] T013 [P] Create IGetWordRepository interface in `LexicaNext.Core/Queries/GetWord/Interfaces/IGetWordRepository.cs`
- [x] T014 [P] Create IGetWordsRepository interface in `LexicaNext.Core/Queries/GetWords/Interfaces/IGetWordsRepository.cs`
- [x] T015 [P] Create IGetWordSetsRepository interface in `LexicaNext.Core/Queries/GetWordSets/Interfaces/IGetWordSetsRepository.cs`
- [x] T016 Implement WordsRepository with all interfaces in `LexicaNext.Infrastructure/Db/Repositories/WordsRepository.cs`
- [x] T017 Add word routes configuration in `Frontend/lexica-next-front/src/config/links.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Words List (Priority: P1) 🎯 MVP

**Goal**: Display a paginated list of words at `/words` with table showing Word, Word Type, Created, Edited, Actions columns

**Independent Test**: Navigate to `/words` and verify table displays with correct columns, pagination works, empty state shows when no words exist

### Backend Implementation

- [x] T018 [P] [US1] Create GetWordsRequestValidator in `LexicaNext.Core/Queries/GetWords/Services/GetWordsRequestValidator.cs`
- [x] T019 [P] [US1] Create GetWordsRequestProcessor in `LexicaNext.Core/Queries/GetWords/Services/GetWordsRequestProcessor.cs`
- [x] T020 [P] [US1] Create WordRecordMapper in `LexicaNext.Core/Queries/GetWords/Services/WordRecordMapper.cs`
- [x] T021 [US1] Create GetWordsEndpoint in `LexicaNext.Core/Queries/GetWords/GetWordsEndpoint.cs`
- [x] T022 [US1] Register GetWordsEndpoint in `LexicaNext.WebApp/Program.cs`

### Frontend Implementation

- [x] T023 [US1] Add useWords hook for listing words in `Frontend/lexica-next-front/src/hooks/api.ts`
- [x] T024 [US1] Create WordsList component in `Frontend/lexica-next-front/src/components/words/WordsList.tsx`
- [x] T025 [US1] Create WordsPage in `Frontend/lexica-next-front/src/pages/words/WordsPage.tsx`
- [x] T026 [US1] Add WordsPage route in `Frontend/lexica-next-front/src/AppRouter.tsx`
- [x] T027 [US1] Add Words link to navigation in `Frontend/lexica-next-front/src/components/layout/Header.tsx`

**Checkpoint**: User Story 1 complete - `/words` page displays word list with pagination

---

## Phase 4: User Story 2 - Create New Word (Priority: P1)

**Goal**: Allow users to create new words via a form at `/words/new`

**Independent Test**: Click "Create New Word", fill form with word/translations/sentences, submit, verify word appears in list

### Backend Implementation

- [x] T028 [P] [US2] Create CreateWordCommand model in `LexicaNext.Core/Commands/CreateWord/Models/CreateWordCommand.cs`
- [x] T029 [P] [US2] Create CreateWordRequestValidator in `LexicaNext.Core/Commands/CreateWord/Services/CreateWordRequestValidator.cs`
- [x] T030 [P] [US2] Create CreateWordCommandMapper in `LexicaNext.Core/Commands/CreateWord/Services/CreateWordCommandMapper.cs`
- [x] T031 [US2] Create CreateWordEndpoint in `LexicaNext.Core/Commands/CreateWord/CreateWordEndpoint.cs`
- [x] T032 [US2] Register CreateWordEndpoint in `LexicaNext.WebApp/Program.cs`

### Frontend Implementation

- [x] T033 [US2] Add useCreateWord mutation hook in `Frontend/lexica-next-front/src/hooks/api.ts`
- [x] T034 [US2] Create WordForm component in `Frontend/lexica-next-front/src/components/words/WordForm.tsx`
- [x] T035 [US2] Create WordNewPage in `Frontend/lexica-next-front/src/pages/words/WordNewPage.tsx`
- [x] T036 [US2] Add WordNewPage route in `Frontend/lexica-next-front/src/AppRouter.tsx`

**Checkpoint**: User Story 2 complete - can create new words independently

---

## Phase 5: User Story 3 - Search, Sort, and Paginate Words (Priority: P1)

**Goal**: Enable search field filtering, column header sorting, and pagination controls on words table

**Independent Test**: Type in search field and verify filtering, click column headers for sorting, use pagination controls

### Backend Implementation

- [x] T037 [US3] Add sorting support to GetWordsEndpoint for all columns in `LexicaNext.Core/Queries/GetWords/GetWordsEndpoint.cs`
- [x] T038 [US3] Add search/filter support to WordsRepository in `LexicaNext.Infrastructure/Db/Repositories/WordsRepository.cs`

### Frontend Implementation

- [x] T039 [US3] Add sorting state and column click handlers to WordsList in `Frontend/lexica-next-front/src/components/words/WordsList.tsx`
- [x] T040 [US3] Add search input with debounce to WordsList in `Frontend/lexica-next-front/src/components/words/WordsList.tsx`

**Checkpoint**: User Story 3 complete - search, sort, pagination all functional

---

## Phase 6: User Story 4 - Edit Word (Priority: P2)

**Goal**: Allow users to edit existing words via form at `/words/:wordId/edit`

**Independent Test**: Click "Edit Word" action, modify word details, save, verify changes in list and Edited date updates

### Backend Implementation

- [ ] T041 [P] [US4] Create GetWordEndpoint in `LexicaNext.Core/Queries/GetWord/GetWordEndpoint.cs`
- [ ] T042 [P] [US4] Create WordMapper in `LexicaNext.Core/Queries/GetWord/Services/WordMapper.cs`
- [ ] T043 [P] [US4] Create UpdateWordCommand model in `LexicaNext.Core/Commands/UpdateWord/Models/UpdateWordCommand.cs`
- [ ] T044 [P] [US4] Create UpdateWordRequestValidator in `LexicaNext.Core/Commands/UpdateWord/Services/UpdateWordRequestValidator.cs`
- [ ] T045 [P] [US4] Create UpdateWordCommandMapper in `LexicaNext.Core/Commands/UpdateWord/Services/UpdateWordCommandMapper.cs`
- [ ] T046 [US4] Create UpdateWordEndpoint in `LexicaNext.Core/Commands/UpdateWord/UpdateWordEndpoint.cs`
- [ ] T047 [US4] Register GetWordEndpoint and UpdateWordEndpoint in `LexicaNext.WebApp/Program.cs`

### Frontend Implementation

- [ ] T048 [US4] Add useWord and useUpdateWord hooks in `Frontend/lexica-next-front/src/hooks/api.ts`
- [ ] T049 [US4] Update WordForm to support edit mode in `Frontend/lexica-next-front/src/components/words/WordForm.tsx`
- [ ] T050 [US4] Create WordEditPage in `Frontend/lexica-next-front/src/pages/words/WordEditPage.tsx`
- [ ] T051 [US4] Add WordEditPage route in `Frontend/lexica-next-front/src/AppRouter.tsx`

**Checkpoint**: User Story 4 complete - can edit existing words

---

## Phase 7: User Story 5 - Delete Word (Priority: P2)

**Goal**: Allow users to delete words with confirmation dialog showing affected sets

**Independent Test**: Click "Delete Word", see confirmation with affected sets, confirm, verify word removed from list

### Backend Implementation

- [ ] T052 [P] [US5] Create GetWordSetsEndpoint in `LexicaNext.Core/Queries/GetWordSets/GetWordSetsEndpoint.cs`
- [ ] T053 [P] [US5] Create DeleteWordEndpoint in `LexicaNext.Core/Commands/DeleteWord/DeleteWordEndpoint.cs`
- [ ] T054 [US5] Register GetWordSetsEndpoint and DeleteWordEndpoint in `LexicaNext.WebApp/Program.cs`

### Frontend Implementation

- [ ] T055 [US5] Add useWordSets and useDeleteWord hooks in `Frontend/lexica-next-front/src/hooks/api.ts`
- [ ] T056 [US5] Add delete action with confirmation modal to WordsList showing affected sets in `Frontend/lexica-next-front/src/components/words/WordsList.tsx`

**Checkpoint**: User Story 5 complete - can delete words with warning about affected sets

---

## Phase 8: User Story 6 - Select Words for Set (Priority: P1)

**Goal**: Replace set form entry creation with word selection table, enable inline word creation

**Independent Test**: Create/edit set, see word selection table, select words, save set, verify set contains selected words

### Backend Implementation

- [ ] T057 [US6] Modify SetsRepository to use word references instead of embedded words in `LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs`
- [ ] T058 [US6] Update CreateSetRequestValidator to accept wordIds in `LexicaNext.Core/Commands/CreateSet/Services/CreateSetRequestValidator.cs`
- [ ] T059 [US6] Update CreateSetCommandMapper for word references in `LexicaNext.Core/Commands/CreateSet/Services/CreateSetCommandMapper.cs`
- [ ] T060 [US6] Update UpdateSetRequestValidator to accept wordIds in `LexicaNext.Core/Commands/UpdateSet/Services/UpdateSetRequestValidator.cs`
- [ ] T061 [US6] Update UpdateSetCommandMapper for word references in `LexicaNext.Core/Commands/UpdateSet/Services/UpdateSetCommandMapper.cs`
- [ ] T062 [US6] Update GetSetEndpoint response to include word details in `LexicaNext.Core/Queries/GetSet/GetSetEndpoint.cs`
- [ ] T063 [US6] Update SetMapper for new word structure in `LexicaNext.Core/Queries/GetSet/Services/SetMapper.cs`

### Frontend Implementation

- [ ] T064 [US6] Create WordSelector component with table and inline create in `Frontend/lexica-next-front/src/components/words/WordSelector.tsx`
- [ ] T065 [US6] Replace SetForm entry list with WordSelector in `Frontend/lexica-next-front/src/components/sets/SetForm.tsx`
- [ ] T066 [US6] Update useCreateSet and useUpdateSet hooks for word references in `Frontend/lexica-next-front/src/hooks/api.ts`

**Checkpoint**: User Story 6 complete - sets use word selection instead of embedded entries

---

## Phase 9: User Story 7 - Remove Word from Set (Priority: P2)

**Goal**: Allow removing words from set without deleting the word itself

**Independent Test**: Edit set, remove a word from selection, save, verify word still exists in words list but not in set

### Frontend Implementation

- [ ] T067 [US7] Add remove word functionality to WordSelector in `Frontend/lexica-next-front/src/components/words/WordSelector.tsx`
- [ ] T068 [US7] Update SetForm to track removed words and send updated wordIds in `Frontend/lexica-next-front/src/components/sets/SetForm.tsx`

**Checkpoint**: User Story 7 complete - can remove words from sets without deletion

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Ensure learning modes work with new structure and final cleanup

- [ ] T069 Update SetSpellingMode to work with new word-set structure in `Frontend/lexica-next-front/src/components/sets/modes/SetSpellingMode.tsx`
- [ ] T070 [P] Update SetFullMode to work with new word-set structure in `Frontend/lexica-next-front/src/components/sets/modes/SetFullMode.tsx`
- [ ] T071 [P] Update SetOnlyOpenQuestionsMode to work with new word-set structure in `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx`
- [ ] T072 Verify Generate Translations button works in WordForm in `Frontend/lexica-next-front/src/components/words/WordForm.tsx`
- [ ] T073 [P] Verify Generate Sentences button works in WordForm in `Frontend/lexica-next-front/src/components/words/WordForm.tsx`
- [ ] T074 Run build and fix any type errors with `dotnet build LexicaNext.sln` and `npm run build`
- [ ] T075 Run linting and fix issues with `npm run lint` and `npm run prettier`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - US1, US2, US3 are P1 priority - should be done first
  - US4, US5, US7 are P2 priority - can follow after P1 stories
  - US6 is P1 but depends on US1-US3 being complete for word selection to work
- **Polish (Phase 10)**: Depends on US6 being complete (learning modes need new structure)

### User Story Dependencies

| Story | Priority | Depends On | Can Start After |
|-------|----------|------------|-----------------|
| US1 - View Words List | P1 | Foundational | Phase 2 |
| US2 - Create New Word | P1 | Foundational | Phase 2 |
| US3 - Search/Sort/Paginate | P1 | US1 | Phase 3 |
| US4 - Edit Word | P2 | US1, US2 | Phase 4 |
| US5 - Delete Word | P2 | US1 | Phase 3 |
| US6 - Select Words for Set | P1 | US1, US2, US3 | Phase 5 |
| US7 - Remove Word from Set | P2 | US6 | Phase 8 |

### Parallel Opportunities

Within Phase 2 (Foundational):

- T010, T011, T012, T013, T014, T015 can all run in parallel (different interface files)

Within US1:

- T018, T019, T020 can run in parallel (different service files)

Within US2:

- T028, T029, T030 can run in parallel (different files)

Within US4:

- T041, T042, T043, T044, T045 can run in parallel (different files)

Within US5:

- T052, T053 can run in parallel (different endpoints)

Within Polish:

- T070, T071, T073 can run in parallel (different mode files)

---

## Parallel Example: Foundational Phase

```bash
# Launch all interface definitions together:
Task: "Create ICreateWordRepository in LexicaNext.Core/Commands/CreateWord/Interfaces/ICreateWordRepository.cs"
Task: "Create IUpdateWordRepository in LexicaNext.Core/Commands/UpdateWord/Interfaces/IUpdateWordRepository.cs"
Task: "Create IDeleteWordRepository in LexicaNext.Core/Commands/DeleteWord/Interfaces/IDeleteWordRepository.cs"
Task: "Create IGetWordRepository in LexicaNext.Core/Queries/GetWord/Interfaces/IGetWordRepository.cs"
Task: "Create IGetWordsRepository in LexicaNext.Core/Queries/GetWords/Interfaces/IGetWordsRepository.cs"
Task: "Create IGetWordSetsRepository in LexicaNext.Core/Queries/GetWordSets/Interfaces/IGetWordSetsRepository.cs"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 + 6)

1. Complete Phase 1: Setup (database schema)
2. Complete Phase 2: Foundational (repository interfaces)
3. Complete Phase 3: US1 - View Words List
4. Complete Phase 4: US2 - Create New Word
5. Complete Phase 5: US3 - Search/Sort/Paginate
6. Complete Phase 8: US6 - Select Words for Set
7. **STOP and VALIDATE**: Core word management functional
8. Deploy/demo if ready

### Full Implementation

1. Complete MVP scope above
2. Complete Phase 6: US4 - Edit Word
3. Complete Phase 7: US5 - Delete Word
4. Complete Phase 9: US7 - Remove Word from Set
5. Complete Phase 10: Polish (learning modes)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Learning modes (Phase 10) require US6 complete to test properly
