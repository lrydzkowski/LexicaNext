# Implementation Plan: AI-Generated Translations and Example Sentences

**Branch**: `001-ai-translations` | **Date**: 2025-12-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-ai-translations/spec.md`

## Summary

Add AI-powered generation of Polish translations and English example sentences for vocabulary words. Users can generate translations (ordered by popularity) and example sentences (B1-B2 complexity) via buttons in the set editor. Generated content automatically replaces existing data. Example sentences are persisted and displayed in Content page and all study mode results.

**Technical approach**: Use Microsoft Azure AI Foundry with gpt-5-mini model via backend API. Extend existing Word entity with ExampleSentences. Add new API endpoints for generation. Update frontend with generation buttons and display components.

## Technical Context

**Language/Version**: C# .NET 10.0 (backend), TypeScript (frontend with React 19)
**Primary Dependencies**: Azure.AI.Projects, Azure.Identity, Entity Framework Core, Mantine UI, TanStack Query, openapi-fetch
**Storage**: PostgreSQL with EF Core
**Testing**: Integration tests (existing pattern in LexicaNext.WebApp.Tests.Integration)
**Target Platform**: Web application (Docker deployment)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: <5 seconds for translation/sentence generation (per spec SC-001, SC-002)
**Constraints**: Manual retry on AI failures, B1-B2 complexity for sentences
**Scale/Scope**: Single user vocabulary learning app

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Explicit Over Implicit | ✅ PASS | Dependencies injected, config from environment variables |
| II. Single Responsibility | ✅ PASS | Separate service for AI generation, endpoints per operation |
| III. Fail Fast with Context | ✅ PASS | Validate inputs at API boundary, descriptive error messages |
| IV. Incremental Change | ✅ PASS | Feature isolated to new endpoints and entity extension |
| V. Simplicity First | ✅ PASS | Using existing patterns, no new abstractions beyond necessity |

**Quality Gates**:
- Build: Zero warnings (TreatWarningsAsErrors)
- Lint: ESLint/Prettier for frontend
- Documentation: OpenAPI spec auto-generated

## Project Structure

### Documentation (this feature)

```text
specs/001-ai-translations/
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
├── Common/
│   └── Models/
│       └── ExampleSentence.cs          # New domain model
├── Commands/
│   └── GenerateTranslations/           # New command
│       ├── GenerateTranslationsEndpoint.cs
│       ├── GenerateTranslationsRequest.cs
│       └── GenerateTranslationsResponse.cs
│   └── GenerateExampleSentences/       # New command
│       ├── GenerateExampleSentencesEndpoint.cs
│       ├── GenerateExampleSentencesRequest.cs
│       └── GenerateExampleSentencesResponse.cs
└── Queries/
    └── GetSet/                         # Updated to include sentences

LexicaNext.Infrastructure/
├── Db/
│   └── Common/
│       └── Entities/
│           └── ExampleSentenceEntity.cs    # New entity
│       └── Configurations/
│           └── ExampleSentenceEntityTypeConfiguration.cs
│   └── Migrations/
│       └── [timestamp]_AddExampleSentences.cs
│   └── Repositories/
│       └── SetsRepository.cs               # Updated
└── Foundry/                                # Existing folder
    ├── FoundryOptions.cs                   # Existing - reuse
    ├── ServiceCollectionExtensions.cs      # Update to register AI service
    ├── IAiGenerationService.cs             # New interface
    └── AzureFoundryAiService.cs            # New implementation

LexicaNext.WebApp/
└── Program.cs                              # Register new endpoints

Frontend/lexica-next-front/
├── src/
│   ├── components/
│   │   └── sets/
│   │       ├── GenerateTranslationsButton.tsx   # New
│   │       ├── GenerateSentencesButton.tsx      # New
│   │       ├── ExampleSentences.tsx             # New display component
│   │       └── WordCard.tsx                     # Updated
│   │       └── modes/
│   │           ├── SpellingMode.tsx             # Updated results
│   │           ├── FullMode.tsx                 # Updated results
│   │           └── OpenQuestionsMode.tsx        # Updated results
│   └── hooks/
│       └── api.ts                               # New mutation hooks
└── api-types/
    └── api-types.d.ts                           # Regenerated
```

**Structure Decision**: Web application structure following existing Clean Architecture pattern. New AI service in Infrastructure layer. New endpoints following CQRS pattern in Core layer.

## Complexity Tracking

No constitution violations requiring justification.
