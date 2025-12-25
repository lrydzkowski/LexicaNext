# Tasks: AI-Generated Translations and Example Sentences

**Input**: Design documents from `/specs/001-ai-translations/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested - test tasks excluded.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `LexicaNext.Core/`, `LexicaNext.Infrastructure/`, `LexicaNext.WebApp/`
- **Frontend**: `Frontend/lexica-next-front/src/`

---

## Phase 1: Setup

**Purpose**: Project initialization and configuration

- [x] T001 Add ApiKey property to FoundryOptions in LexicaNext.Infrastructure/Foundry/FoundryOptions.cs
- [x] T002 [P] Add Azure.AI.Projects NuGet package to LexicaNext.Infrastructure.csproj

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create IAiGenerationService interface in LexicaNext.Infrastructure/Foundry/IAiGenerationService.cs
- [ ] T004 Implement AzureFoundryAiService in LexicaNext.Infrastructure/Foundry/AzureFoundryAiService.cs
- [ ] T005 Register AzureFoundryAiService in LexicaNext.Infrastructure/Foundry/ServiceCollectionExtensions.cs
- [ ] T006 [P] Create ExampleSentence domain model in LexicaNext.Core/Common/Models/ExampleSentence.cs
- [ ] T007 [P] Create ExampleSentenceEntity in LexicaNext.Infrastructure/Db/Common/Entities/ExampleSentenceEntity.cs
- [ ] T008 Create ExampleSentenceEntityTypeConfiguration in LexicaNext.Infrastructure/Db/Common/Configurations/ExampleSentenceEntityTypeConfiguration.cs
- [ ] T009 Add ExampleSentences navigation property to WordEntity in LexicaNext.Infrastructure/Db/Common/Entities/WordEntity.cs
- [ ] T010 Add ExampleSentences DbSet to AppDbContext in LexicaNext.Infrastructure/Db/AppDbContext.cs
- [ ] T011 Create EF Core migration AddExampleSentences in LexicaNext.Infrastructure/Db/Migrations/
- [ ] T012 Update Entry domain model to include ExampleSentences in LexicaNext.Core/Common/Models/Entry.cs

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Generate Translations for a Word (Priority: P1) 🎯 MVP

**Goal**: Users can generate Polish translations for English words via a button in the set editor

**Independent Test**: Create a set with one English word, click "Generate Translations", verify 3 Polish translations appear ranked by popularity

### Backend Implementation for User Story 1

- [ ] T013 [P] [US1] Create GenerateTranslationsRequest record in LexicaNext.Core/Commands/GenerateTranslations/GenerateTranslationsRequest.cs
- [ ] T014 [P] [US1] Create GenerateTranslationsResponse record in LexicaNext.Core/Commands/GenerateTranslations/GenerateTranslationsResponse.cs
- [ ] T015 [US1] Add GenerateTranslationsAsync method to IAiGenerationService in LexicaNext.Infrastructure/Foundry/IAiGenerationService.cs
- [ ] T016 [US1] Implement GenerateTranslationsAsync in AzureFoundryAiService in LexicaNext.Infrastructure/Foundry/AzureFoundryAiService.cs
- [ ] T017 [US1] Create GenerateTranslationsEndpoint in LexicaNext.Core/Commands/GenerateTranslations/GenerateTranslationsEndpoint.cs
- [ ] T018 [US1] Register GenerateTranslationsEndpoint in LexicaNext.WebApp/Program.cs

### Frontend Implementation for User Story 1

- [ ] T019 [US1] Add useGenerateTranslations mutation hook in Frontend/lexica-next-front/src/hooks/api.ts
- [ ] T020 [US1] Create GenerateTranslationsButton component in Frontend/lexica-next-front/src/components/sets/GenerateTranslationsButton.tsx
- [ ] T021 [US1] Integrate GenerateTranslationsButton into word entry form in Frontend/lexica-next-front/src/components/sets/SetForm.tsx
- [ ] T022 [US1] Regenerate API types from OpenAPI spec in Frontend/lexica-next-front/api-types/api-types.d.ts

**Checkpoint**: User Story 1 complete - translations can be generated and applied to words

---

## Phase 4: User Story 2 - Generate Example Sentences (Priority: P2)

**Goal**: Users can generate example sentences for English words and persist them with the vocabulary set

**Independent Test**: Create a word entry, generate example sentences, save the set, reload and verify sentences persist

### Backend Implementation for User Story 2

- [ ] T023 [P] [US2] Create GenerateExampleSentencesRequest record in LexicaNext.Core/Commands/GenerateExampleSentences/GenerateExampleSentencesRequest.cs
- [ ] T024 [P] [US2] Create GenerateExampleSentencesResponse record in LexicaNext.Core/Commands/GenerateExampleSentences/GenerateExampleSentencesResponse.cs
- [ ] T025 [US2] Add GenerateExampleSentencesAsync method to IAiGenerationService in LexicaNext.Infrastructure/Foundry/IAiGenerationService.cs
- [ ] T026 [US2] Implement GenerateExampleSentencesAsync in AzureFoundryAiService in LexicaNext.Infrastructure/Foundry/AzureFoundryAiService.cs
- [ ] T027 [US2] Create GenerateExampleSentencesEndpoint in LexicaNext.Core/Commands/GenerateExampleSentences/GenerateExampleSentencesEndpoint.cs
- [ ] T028 [US2] Register GenerateExampleSentencesEndpoint in LexicaNext.WebApp/Program.cs
- [ ] T029 [US2] Update CreateSetCommandMapper to handle ExampleSentences in LexicaNext.Core/Commands/CreateSet/Services/CreateSetCommandMapper.cs
- [ ] T030 [US2] Update SetsRepository.CreateSetAsync to persist ExampleSentences in LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs
- [ ] T031 [US2] Update SetsRepository.UpdateSetAsync to persist ExampleSentences in LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs
- [ ] T032 [US2] Update EntryDto to include exampleSentences property in LexicaNext.Core/Commands/CreateSet/CreateSetEndpoint.cs

### Frontend Implementation for User Story 2

- [ ] T033 [US2] Add useGenerateExampleSentences mutation hook in Frontend/lexica-next-front/src/hooks/api.ts
- [ ] T034 [US2] Create GenerateSentencesButton component in Frontend/lexica-next-front/src/components/sets/GenerateSentencesButton.tsx
- [ ] T035 [US2] Integrate GenerateSentencesButton into word entry form in Frontend/lexica-next-front/src/components/sets/SetForm.tsx
- [ ] T036 [US2] Update set form state to track example sentences per word in Frontend/lexica-next-front/src/components/sets/SetForm.tsx
- [ ] T037 [US2] Regenerate API types from OpenAPI spec in Frontend/lexica-next-front/api-types/api-types.d.ts

**Checkpoint**: User Story 2 complete - example sentences can be generated and persisted

---

## Phase 5: User Story 3 - View Example Sentences in Content Page (Priority: P3)

**Goal**: Users can see example sentences alongside words on the Content page

**Independent Test**: Navigate to Content page for a set with example sentences, verify sentences display below each word

**Dependency**: Requires US2 (sentences must exist to display)

### Backend Implementation for User Story 3

- [ ] T038 [US3] Update GetSetResponse to include exampleSentences in LexicaNext.Core/Queries/GetSet/GetSetEndpoint.cs
- [ ] T039 [US3] Update SetMapper to map ExampleSentences in LexicaNext.Core/Queries/GetSet/Services/SetMapper.cs
- [ ] T040 [US3] Update SetsRepository.GetSetAsync to include ExampleSentences in LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs

### Frontend Implementation for User Story 3

- [ ] T041 [P] [US3] Create ExampleSentences display component in Frontend/lexica-next-front/src/components/sets/ExampleSentences.tsx
- [ ] T042 [US3] Integrate ExampleSentences into SetContent in Frontend/lexica-next-front/src/components/sets/SetContent.tsx
- [ ] T043 [US3] Update WordCard to display example sentences in Frontend/lexica-next-front/src/components/sets/WordCard.tsx

**Checkpoint**: User Story 3 complete - sentences visible on Content page

---

## Phase 6: User Story 4 - Display Example Sentences in Study Modes (Priority: P4)

**Goal**: Users see example sentences in results for Spelling Mode, Full Mode, and Open Questions Mode

**Independent Test**: Enter any study mode with a set containing example sentences, answer a question, verify sentences appear in results

**Dependency**: Requires US2 and US3 (sentences must exist and be retrievable)

### Frontend Implementation for User Story 4

- [ ] T044 [US4] Update SpellingMode results to display example sentences in Frontend/lexica-next-front/src/components/sets/modes/SpellingMode.tsx
- [ ] T045 [US4] Update FullMode results to display example sentences in Frontend/lexica-next-front/src/components/sets/modes/FullMode.tsx
- [ ] T046 [US4] Update OpenQuestionsMode results to display example sentences in Frontend/lexica-next-front/src/components/sets/modes/OpenQuestionsMode.tsx

**Checkpoint**: User Story 4 complete - sentences visible in all study mode results

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation

- [ ] T047 [P] Add loading spinner/state for generation buttons in Frontend/lexica-next-front/src/components/sets/GenerateTranslationsButton.tsx
- [ ] T048 [P] Add loading spinner/state for generation buttons in Frontend/lexica-next-front/src/components/sets/GenerateSentencesButton.tsx
- [ ] T049 [P] Add error handling with "Try Again" button for AI failures in GenerateTranslationsButton
- [ ] T050 [P] Add error handling with "Try Again" button for AI failures in GenerateSentencesButton
- [ ] T051 Validate word type is selected before allowing translation generation
- [ ] T052 Run quickstart.md validation scenarios
- [ ] T053 Build solution and verify zero warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - can start after Phase 2
- **User Story 2 (Phase 4)**: Depends on Foundational - can start after Phase 2 (parallel with US1)
- **User Story 3 (Phase 5)**: Depends on US2 (needs sentence persistence)
- **User Story 4 (Phase 6)**: Depends on US3 (needs sentence retrieval)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```text
Phase 1: Setup
    ↓
Phase 2: Foundational
    ↓
    ├─→ Phase 3: US1 (Translations) ─────────────────────────→ ┐
    │                                                          │
    └─→ Phase 4: US2 (Generate Sentences) ─→ Phase 5: US3 ─→ Phase 6: US4
                                              (Content)      (Study Modes)
                                                              ↓
                                                         Phase 7: Polish
```

### Parallel Opportunities

**Within Phase 2 (Foundational)**:

```text
Parallel Group A: T006, T007 (Domain model + Entity)
```

**Within Phase 3 (US1)**:

```text
Parallel Group B: T013, T014 (Request + Response records)
```

**Within Phase 4 (US2)**:

```text
Parallel Group C: T023, T024 (Request + Response records)
```

**Cross-Story Parallelism**:

```text
US1 and US2 can be developed in parallel after Phase 2 completes
```

---

## Parallel Example: User Story 1

```bash
# After Phase 2 completes, launch US1 parallel tasks:
Task: "T013 - Create GenerateTranslationsRequest record"
Task: "T014 - Create GenerateTranslationsResponse record"

# Then sequential backend tasks:
Task: "T015 - Add GenerateTranslationsAsync method to interface"
Task: "T016 - Implement GenerateTranslationsAsync"
Task: "T017 - Create GenerateTranslationsEndpoint"
Task: "T018 - Register endpoint"

# Then frontend tasks:
Task: "T019 - Add mutation hook"
Task: "T020 - Create button component"
Task: "T021 - Integrate into form"
Task: "T022 - Regenerate API types"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test translation generation independently
5. Deploy/demo if ready - users can generate translations!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Deploy (MVP - Translation generation!)
3. Add User Story 2 → Deploy (Sentence generation + persistence!)
4. Add User Story 3 → Deploy (Content page display!)
5. Add User Story 4 → Deploy (Study mode display!)
6. Polish → Final release

### Parallel Team Strategy

With two developers after Foundational:

- Developer A: User Story 1 (Translations)
- Developer B: User Story 2 (Sentences) → then US3 → then US4

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- US1 is fully independent - can ship as MVP
- US2-US4 have sequential dependencies for sentence display
