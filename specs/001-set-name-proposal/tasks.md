# Tasks: Set Name Auto-Proposal

**Input**: Design documents from `/specs/001-set-name-proposal/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

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

**Purpose**: Database migration for sequence and case-insensitive unique index

- [x] T001 Create EF Core migration for set_name_sequence and case-insensitive unique index in LexicaNext.Infrastructure/Db/Migrations/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add IGetProposedSetNameRepository interface in LexicaNext.Core/Queries/GetProposedSetName/Interfaces/IGetProposedSetNameRepository.cs
- [x] T003 Implement GetProposedSetNameAsync method in LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs
- [x] T004 Modify SetExistsAsync to use case-insensitive comparison (LOWER function) in LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Proposed Set Name on New Set Form (Priority: P1) 🎯 MVP

**Goal**: When user opens new set form, name field is pre-filled with `set_XXXX` pattern

**Independent Test**: Open new set form and verify proposed name appears in the name field

### Implementation for User Story 1

- [x] T005 [P] [US1] Create GetProposedSetNameResponse model in LexicaNext.Core/Queries/GetProposedSetName/Models/GetProposedSetNameResponse.cs
- [x] T006 [US1] Create GetProposedSetNameEndpoint in LexicaNext.Core/Queries/GetProposedSetName/GetProposedSetNameEndpoint.cs
- [x] T007 [US1] Register GetProposedSetNameEndpoint in LexicaNext.WebApp/Program.cs
- [x] T008 [US1] Add useProposedSetName hook in Frontend/lexica-next-front/src/hooks/api.ts
- [x] T009 [US1] Integrate proposed name in set creation form component in Frontend/lexica-next-front/src/components/sets/
- [x] T010 [US1] Regenerate TypeScript API types from OpenAPI spec

**Checkpoint**: User Story 1 complete - new set form displays proposed name

---

## Phase 4: User Story 2 - Save Set with Unique Name Validation (Priority: P2)

**Goal**: Prevent saving sets with duplicate names (case-insensitive)

**Independent Test**: Attempt to save a set with an existing name and verify error message appears

### Implementation for User Story 2

- [x] T011 [US2] Add sequence update logic when saving set with set_XXXX pattern in LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs
- [x] T012 [US2] Update CreateSetRequestValidator to display clear duplicate name error in LexicaNext.Core/Commands/CreateSet/Services/CreateSetRequestValidator.cs
- [x] T013 [US2] Handle validation error display in frontend set form component in Frontend/lexica-next-front/src/components/sets/

**Checkpoint**: User Story 2 complete - duplicate name validation works on create

---

## Phase 5: User Story 3 - Update Existing Set with Unique Name Validation (Priority: P3)

**Goal**: Validate name uniqueness when editing a set (excluding self)

**Independent Test**: Edit a set, change its name to an existing name, verify error message appears

### Implementation for User Story 3

- [x] T014 [US3] Update UpdateSetRequestValidator to use case-insensitive comparison in LexicaNext.Core/Commands/UpdateSet/Services/UpdateSetRequestValidator.cs
- [x] T015 [US3] Verify edit form displays validation errors correctly in Frontend/lexica-next-front/src/components/sets/

**Checkpoint**: User Story 3 complete - duplicate name validation works on update

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup

- [x] T016 Build backend solution and verify zero warnings with dotnet build LexicaNext.sln
- [x] T017 Build frontend and verify no errors with npm run build in Frontend/lexica-next-front/
- [x] T018 Run frontend linting with npm run lint in Frontend/lexica-next-front/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2

### Within Each User Story

- Backend tasks before frontend tasks (API must exist before UI can call it)
- Models/interfaces before endpoints
- Endpoints before frontend integration

### Parallel Opportunities

- T002, T003, T004 can run in parallel after T001
- T005 can run in parallel with T006
- US2 and US3 can run in parallel after Foundational phase
- T016, T017, T018 can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# After T001 completes, launch these in parallel:
Task: "Add IGetProposedSetNameRepository interface"
Task: "Implement GetProposedSetNameAsync method"
Task: "Modify SetExistsAsync for case-insensitive comparison"
```

## Parallel Example: User Story 1

```bash
# Launch model and endpoint in parallel:
Task: "Create GetProposedSetNameResponse model"
Task: "Create GetProposedSetNameEndpoint" (can start structure while model completes)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (migration)
2. Complete Phase 2: Foundational (repository methods)
3. Complete Phase 3: User Story 1 (endpoint + frontend)
4. **STOP and VALIDATE**: Open new set form, verify proposed name appears
5. Deploy if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP!)
3. Add User Story 2 → Test create validation → Deploy
4. Add User Story 3 → Test update validation → Deploy
5. Polish phase → Final verification

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No tests generated as project has no test framework configured
