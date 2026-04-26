# Implementation Plan: Words Statistics Page

**Branch**: `003-words-statistics` | **Date**: 2026-04-20 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-words-statistics/spec.md`

## Summary

Introduce a new authenticated page **Words Statistics** that lists, per word, the number of correct and incorrect answers the current user has submitted in the **open-questions** learning mode. The page supports case-insensitive text filtering, click-to-sort on the two count columns, pagination (same control/size as Sets/Words lists), and a "go to word" action that opens the word edit form; a back-control in that form returns to the source list preserving filter/sort/page. All list state (page, filter, sort) lives in URL query parameters, making views deep-linkable and enabling the back-return with zero extra state carriers.

Delivery approach (aligned with user input): follow existing list patterns (backend `ListParameters`/`GetWords*` and frontend `WordsList`/`SetsList`); add BE integration tests with Verify snapshots under `Features/Answers/GetWordsStatistics/`; add FE Playwright E2E tests under `tests/words-statistics/`.

## Technical Context

**Language/Version**: .NET (C# with `<Nullable>enable</Nullable>` style) backend; TypeScript + React 19 via Vite on the frontend  
**Primary Dependencies**: ASP.NET Core minimal APIs, EF Core (Npgsql/PostgreSQL), FluentValidation, xUnit + Verify on BE; Mantine, React Router, @tanstack/react-query, Auth0-react, openapi-typescript on FE  
**Storage**: PostgreSQL (existing `AppDbContext`, `answer` and `word` tables)  
**Testing**: xUnit v3 integration tests with Verify snapshots (`LexicaNext.WebApp.Tests.Integration`); Playwright E2E (`Frontend/lexica-next-front-e2e-tests`)  
**Target Platform**: Web (SPA served by ASP.NET Core host); Linux container via `compose.yaml`  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: First-page render ≤2s for 10k-answer users (SC-002); filter debounce + re-fetch ≤300ms for 5k-row aggregations (SC-003); pagination page size 10 (matches Sets/Words)  
**Constraints**: Aggregation is calculated ad hoc (no persisted aggregate); per-user scoping enforced server-side on every request; new `WordId` FK on `AnswerEntity` must be non-nullable with `OnDelete(Cascade)` after migration  
**Scale/Scope**: Single feature: 1 new GET endpoint, 1 EF migration with data backfill, 1 new React page with list/filter/sort/pagination, 1 new nav link, plus BE integration tests and FE E2E tests

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`.specify/memory/constitution.md`) is still the placeholder template — no ratified principles are in force. Therefore no constitutional gates apply to this plan. If/when the constitution is ratified, this plan should be re-evaluated against it.

**Gate decision (pre-Phase 0)**: PASS (no active gates).

**Gate decision (post-Phase 1, re-check)**: PASS. Phase 0 (`research.md`) and Phase 1 artifacts (`data-model.md`, `contracts/get-words-statistics.md`, `quickstart.md`) were produced without introducing any new cross-cutting concerns that would require constitutional justification. No new projects, no new languages, no new infrastructure tiers.

## Project Structure

### Documentation (this feature)

```text
specs/003-words-statistics/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── get-words-statistics.md   # HTTP contract for GET /api/words-statistics
├── checklists/
│   └── requirements.md  # From /speckit.specify
└── spec.md
```

### Source Code (repository root)

Web-application layout. Backend is .NET solution (`LexicaNext.Core` domain, `LexicaNext.Infrastructure` persistence, `LexicaNext.WebApp` host, `LexicaNext.WebApp.Tests.Integration` tests). Frontend is a Vite SPA with a co-located Playwright E2E project.

```text
LexicaNext.Core/
├── Queries/
│   └── GetWordsStatistics/                    # NEW - mirrors GetWords/GetSets layout
│       ├── GetWordsStatisticsEndpoint.cs      # minimal API map + request/response DTOs
│       ├── Interfaces/
│       │   └── IGetWordsStatisticsRepository.cs
│       └── Services/
│           ├── GetWordsStatisticsRequestProcessor.cs
│           ├── GetWordsStatisticsRequestValidator.cs
│           ├── ListParametersMapper.cs
│           └── WordStatisticsRecordMapper.cs
└── Common/
    └── Models/
        └── WordStatisticsRecord.cs            # NEW domain record

LexicaNext.Infrastructure/
├── Db/
│   ├── Common/
│   │   ├── Entities/
│   │   │   └── AnswerEntity.cs                # MODIFIED - add WordId : Guid, WordEntity? Word
│   │   └── Configurations/
│   │       └── AnswerEntityTypeConfiguration.cs  # MODIFIED - HasOne(Word).WithMany().OnDelete(Cascade) + HasIndex(WordId)
│   ├── Migrations/
│   │   └── <YYYYMMDDhhmmss>_AddWordIdToAnswer.cs # NEW - adds nullable column, backfills, deletes unmatched rows, sets NOT NULL, adds FK + index
│   └── Repositories/
│       ├── AnswerRepository.cs                 # MODIFIED - populate WordId at write time
│       └── WordsStatisticsRepository.cs        # NEW - implements IGetWordsStatisticsRepository

LexicaNext.Core/Commands/RegisterAnswer/
├── Models/RegisterAnswerCommand.cs             # MODIFIED - add Guid WordId
├── RegisterAnswerEndpoint.cs                   # MODIFIED - RegisterAnswerRequestPayload gains WordId? Guid
└── Services/
    ├── RegisterAnswerRequestValidator.cs       # MODIFIED - WordId required, must reference existing Word owned by user
    └── RegisterAnswerCommandMapper.cs          # MODIFIED - forward WordId

LexicaNext.WebApp/
└── Program.cs / Endpoints wiring              # MODIFIED - call MapGetWordsStatisticsEndpoint

LexicaNext.WebApp.Tests.Integration/
└── Features/Answers/
    ├── GetWordsStatistics/                     # NEW
    │   ├── GetWordsStatisticsTests.cs
    │   ├── GetWordsStatisticsTests.*.verified.txt
    │   └── Data/
    │       ├── CorrectTestCases/CorrectTestCasesGenerator.cs
    │       └── IncorrectTestCases/IncorrectTestCasesGenerator.cs
    └── RegisterAnswer/
        └── Data/**                             # REGENERATE verified snapshots (new WordId column)

Frontend/lexica-next-front/
├── src/
│   ├── AppRouter.tsx                          # MODIFIED - add /words-statistics route + breadcrumbs
│   ├── config/links.ts                        # MODIFIED - add wordsStatistics link (+ source-URL-aware editWord)
│   ├── components/
│   │   ├── layout/Layout.tsx                   # MODIFIED - nav menu entry (optional: audit where Sets/Words links live)
│   │   └── wordsStatistics/                    # NEW
│   │       └── WordsStatisticsList.tsx        # filter + sort + pagination; mirrors WordsList
│   ├── hooks/
│   │   ├── api.ts                             # MODIFIED - add useWordsStatistics()
│   │   └── useBreadcrumbLabel.ts              # (no change expected)
│   └── pages/
│       └── wordsStatistics/
│           └── WordsStatisticsPage.tsx        # NEW
└── api-types/api-types.ts                     # REGENERATED via `npm run generate-api-types` (or equivalent)

Frontend/lexica-next-front-e2e-tests/
└── tests/
    └── words-statistics/                      # NEW
        ├── 01-words-statistics-page.spec.ts   # rows, counts, empty state, filter empty state
        ├── 02-filter.spec.ts                  # filter persistence in URL, debounce, page reset
        ├── 03-sort.spec.ts                    # toggle asc/desc on both count columns, URL persistence
        ├── 04-pagination.spec.ts              # page control, URL-driven, filter/sort-reset to page 1
        ├── 05-go-to-word-and-back.spec.ts     # round-trip navigation preserves filter/sort/page
        └── helpers.ts                          # test-prefix fixtures, practice-answer seeding via API
```

**Structure Decision**: Web-application layout (backend + frontend). No new solution projects; the feature fits cleanly into the existing `LexicaNext.Core`/`LexicaNext.Infrastructure`/`LexicaNext.WebApp` tiering. Frontend code lives alongside existing lists (`src/pages/wordsStatistics/` + `src/components/wordsStatistics/`) so the Mantine styling and URL-driven state pattern can be reused wholesale. E2E and integration tests mirror existing per-feature layout.

## Complexity Tracking

> Not applicable — no constitutional violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
