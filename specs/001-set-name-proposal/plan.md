# Implementation Plan: Set Name Auto-Proposal

**Branch**: `001-set-name-proposal` | **Date**: 2026-01-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-set-name-proposal/spec.md`

## Summary

Implement automatic set name proposal (`set_XXXX` pattern) when opening the new set form, backed by a PostgreSQL sequence. Add case-insensitive name uniqueness validation on create and update operations.

## Technical Context

**Language/Version**: C# / .NET 10.0 (Backend), TypeScript / React 19 (Frontend)
**Primary Dependencies**: Entity Framework Core, FluentValidation, Mantine UI, TanStack Query, openapi-fetch
**Storage**: PostgreSQL with EF Core migrations
**Testing**: N/A (no test framework configured in project)
**Target Platform**: Web application (Linux Docker container for backend, browser for frontend)
**Project Type**: Web application (separate frontend and backend)
**Performance Goals**: Response time < 2 seconds for validation feedback (per SC-004)
**Constraints**: Case-insensitive uniqueness, sequence not consumed on form open
**Scale/Scope**: Single-tenant vocabulary learning application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Explicit Over Implicit | PASS | Dependencies injected via interfaces; no magic strings |
| II. Single Responsibility | PASS | New endpoint for proposed name; validation in dedicated validator |
| III. Fail Fast with Context | PASS | Validation at API boundary with clear error messages |
| IV. Incremental Change | PASS | Feature is self-contained; backward-compatible migration |
| V. Simplicity First | PASS | Uses existing CQRS patterns; no new abstractions |

**Quality Gates:**
- Build with zero warnings: Will verify after implementation
- Lint rules: ESLint/Prettier for frontend, C# conventions for backend
- Public API contracts: OpenAPI spec will be updated automatically

## Project Structure

### Documentation (this feature)

```text
specs/001-set-name-proposal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
LexicaNext.Core/
├── Queries/
│   └── GetProposedSetName/           # NEW: Endpoint for proposed name
│       ├── GetProposedSetNameEndpoint.cs
│       ├── Interfaces/
│       │   └── IGetProposedSetNameRepository.cs
│       └── Models/
│           └── GetProposedSetNameResponse.cs
├── Commands/
│   ├── CreateSet/
│   │   └── Services/
│   │       └── CreateSetRequestValidator.cs  # MODIFY: Uniqueness already exists
│   └── UpdateSet/
│       └── Services/
│           └── UpdateSetRequestValidator.cs  # MODIFY: Uniqueness already exists

LexicaNext.Infrastructure/
├── Db/
│   ├── Migrations/
│   │   └── [NEW_MIGRATION]/          # NEW: Add sequence + unique index
│   └── Repositories/
│       └── SetsRepository.cs         # MODIFY: Add GetProposedSetName method

LexicaNext.WebApp/
└── Program.cs                        # MODIFY: Map new endpoint

Frontend/lexica-next-front/
├── src/
│   ├── hooks/
│   │   └── api.ts                    # MODIFY: Add useProposedSetName hook
│   └── components/
│       └── sets/
│           └── [SetForm component]   # MODIFY: Use proposed name on load
└── api-types/
    └── api-types.d.ts                # REGENERATE: After backend changes
```

**Structure Decision**: Web application structure following existing CQRS patterns. New query endpoint for proposed name, existing validators already handle uniqueness.
