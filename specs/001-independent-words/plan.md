# Implementation Plan: Independent Word Management

**Branch**: `001-independent-words` | **Date**: 2025-12-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-independent-words/spec.md`

## Summary

Reorganize the vocabulary management system to decouple words from sets. Words become independent entities with their own CRUD operations and a dedicated `/words` page. Sets will reference words by ID through a many-to-many relationship, enabling word reuse across multiple sets. All existing data will be removed during deployment.

## Technical Context

**Language/Version**: .NET 10.0 (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: ASP.NET Core Minimal APIs, Entity Framework Core, React 19, Mantine UI, TanStack Query
**Storage**: PostgreSQL with EF Core
**Testing**: Integration tests (LexicaNext.WebApp.Tests.Integration)
**Target Platform**: Web application (Linux server via Docker, modern browsers)
**Project Type**: Web (frontend + backend)
**Performance Goals**: Table loads within 2 seconds for 1000 words, search results within 1 second
**Constraints**: Auth0 authentication required, existing UI patterns must be followed
**Scale/Scope**: Up to 1000 words per user, ~10 pages frontend, ~5 new API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Explicit Over Implicit | PASS | Dependencies injected explicitly, clear data flow through CQRS pattern |
| II. Single Responsibility | PASS | Separate endpoints/handlers for each operation, words and sets have distinct responsibilities |
| III. Fail Fast with Context | PASS | FluentValidation at API boundaries, clear error messages |
| IV. Incremental Change | PASS | Can be implemented in atomic commits: entities → repository → endpoints → frontend |
| V. Simplicity First | PASS | Reuses existing patterns (SetsList → WordsList), no new abstractions needed |

**Quality Gates**:

- Build: TreatWarningsAsErrors enabled, nullable reference types used
- Lint: ESLint/Prettier for frontend, existing .NET conventions for backend
- Documentation: OpenAPI spec auto-generated

## Project Structure

### Documentation (this feature)

```text
specs/001-independent-words/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
Backend:
LexicaNext.Core/
├── Commands/
│   ├── CreateWord/              # NEW: Create independent word
│   │   ├── CreateWordEndpoint.cs
│   │   ├── Services/CreateWordCommandMapper.cs
│   │   ├── Services/CreateWordRequestValidator.cs
│   │   ├── Models/CreateWordCommand.cs
│   │   └── Interfaces/ICreateWordRepository.cs
│   ├── UpdateWord/              # NEW: Update word
│   │   ├── UpdateWordEndpoint.cs
│   │   ├── Services/UpdateWordCommandMapper.cs
│   │   ├── Services/UpdateWordRequestValidator.cs
│   │   ├── Models/UpdateWordCommand.cs
│   │   └── Interfaces/IUpdateWordRepository.cs
│   └── DeleteWord/              # NEW: Delete word
│       ├── DeleteWordEndpoint.cs
│       └── Interfaces/IDeleteWordRepository.cs
├── Queries/
│   ├── GetWord/                 # NEW: Get single word
│   │   ├── GetWordEndpoint.cs
│   │   ├── Services/WordMapper.cs
│   │   └── Interfaces/IGetWordRepository.cs
│   ├── GetWords/                # NEW: List words with pagination/search/sort
│   │   ├── GetWordsEndpoint.cs
│   │   ├── Services/GetWordsRequestProcessor.cs
│   │   ├── Services/GetWordsRequestValidator.cs
│   │   ├── Services/WordRecordMapper.cs
│   │   └── Interfaces/IGetWordsRepository.cs
│   └── GetWordSets/             # NEW: Get sets containing a word (for delete warning)
│       ├── GetWordSetsEndpoint.cs
│       └── Interfaces/IGetWordSetsRepository.cs
└── Common/Models/
    └── Word.cs                  # NEW: Domain model for independent word

LexicaNext.Infrastructure/
└── Db/
    ├── Common/Entities/
    │   ├── WordEntity.cs        # MODIFY: Add CreatedAt, EditedAt, remove SetId dependency
    │   └── SetWordEntity.cs     # NEW: Join table for set-word relationship
    ├── Common/Configurations/
    │   ├── WordEntityTypeConfiguration.cs   # MODIFY: New schema
    │   └── SetWordEntityTypeConfiguration.cs  # NEW
    ├── Repositories/
    │   ├── WordsRepository.cs   # NEW: Words CRUD (implements all word repository interfaces)
    │   └── SetsRepository.cs    # MODIFY: Reference words by ID
    └── Migrations/
        └── YYYYMMDD_IndependentWords.cs  # NEW: Schema migration

LexicaNext.WebApp/
└── Program.cs                   # MODIFY: Register word endpoints via MapEndpoint calls

Frontend:
Frontend/lexica-next-front/src/
├── pages/words/
│   ├── WordsPage.tsx        # NEW: Words list page
│   ├── WordNewPage.tsx      # NEW: Create word page
│   └── WordEditPage.tsx     # NEW: Edit word page
├── components/words/
│   ├── WordsList.tsx        # NEW: Words table (based on SetsList)
│   ├── WordForm.tsx         # NEW: Word form (based on entry in SetForm)
│   └── WordSelector.tsx     # NEW: Word selection for sets
├── hooks/
│   └── api.ts               # MODIFY: Add word API hooks
└── config/
    └── links.ts             # MODIFY: Add word routes
```

**Structure Decision**: Web application structure following existing patterns. New word management mirrors the existing set management structure to maintain consistency.

## Complexity Tracking

No constitution violations requiring justification. The design follows existing patterns.
