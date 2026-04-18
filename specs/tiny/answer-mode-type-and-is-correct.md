| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-04-18 |
| **Status** | done |
| **Complexity** | small |

# TinySpec: Add `mode_type` and `is_correct` to `answer` table

## What

The `answer` table currently stores the raw question / given / expected text but not the *learning mode* the answer came from nor whether it was correct. Add two columns — `mode_type` (which of `full` / `open-questions` / `spelling`) and `is_correct` (bool) — and propagate them through the `RegisterAnswer` command, endpoint, validator, FE hook + mode components, and integration tests/snapshots.

## Context

| File | Role |
|------|------|
| `LexicaNext.Infrastructure/Db/Common/Entities/AnswerEntity.cs` | Modify — add `ModeType` (string) and `IsCorrect` (bool) properties |
| `LexicaNext.Infrastructure/Db/Common/Configurations/AnswerEntityTypeConfiguration.cs` | Modify — add `mode_type` column (varchar(50), required) and `is_correct` column (bool, required) |
| `LexicaNext.Infrastructure/Db/Repositories/AnswerRepository.cs` | Modify — map `ModeType` and `IsCorrect` from command to entity |
| `LexicaNext.Infrastructure/Db/Migrations/` | Add — new EF Core migration `AddModeTypeAndIsCorrectToAnswer` (plus auto `Designer.cs` and `AppDbContextModelSnapshot.cs` update) |
| `LexicaNext.Core/Commands/RegisterAnswer/Models/RegisterAnswerCommand.cs` | Modify — add `ModeType` (string) and `IsCorrect` (bool) |
| `LexicaNext.Core/Commands/RegisterAnswer/RegisterAnswerEndpoint.cs` | Modify — add `ModeType` and `IsCorrect` to `RegisterAnswerRequestPayload` |
| `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerCommandMapper.cs` | Modify — copy `ModeType` / `IsCorrect` from request into command |
| `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerRequestValidator.cs` | Modify — add rules: `ModeType` non-empty, ≤50 chars, one of `full` / `open-questions` / `spelling`; `IsCorrect` required (non-null) |
| `Frontend/lexica-next-front/api-types/api-types.d.ts` | Regenerate — picks up new request fields from OpenAPI |
| `Frontend/lexica-next-front/src/components/sets/modes/SetFullMode.tsx` | Modify — pass `modeType: 'full'` and `isCorrect` to `registerAnswer.mutate(...)` |
| `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx` | Modify — pass `modeType: 'open-questions'` and `isCorrect` |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSpellingMode.tsx` | Modify — pass `modeType: 'spelling'` and `isCorrect: correct` |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/CorrectTestCases/TestCase01.cs` | Modify — add `ModeType` + `IsCorrect` to payload |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/CorrectTestCases/TestCase02.cs` | Modify — same |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/IncorrectTestCases/*.cs` | Modify — fill required new fields in valid cases; add cases that exercise missing/invalid `ModeType` (empty, >50 chars, unknown value) and missing `IsCorrect` |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/RegisterAnswerTests.*.verified.txt` | Regenerate — DB/request snapshots now contain `ModeType` and `IsCorrect` |

## Requirements

1. The `answer` table has two new required columns: `mode_type` (`character varying(50)`) and `is_correct` (`boolean`), added via EF Core migration `AddModeTypeAndIsCorrectToAnswer`.
2. `RegisterAnswerRequestPayload` exposes `ModeType` (string) and `IsCorrect` (bool); the validator rejects requests where `ModeType` is empty, >50 chars, or not one of `full` / `open-questions` / `spelling`, and where `IsCorrect` is null.
3. `RegisterAnswerCommand` carries both fields; `RegisterAnswerCommandMapper` copies them from payload to command; `AnswerRepository` persists them on the new `AnswerEntity`.
4. All three FE learning-mode components send `modeType` (the mode's literal string) and `isCorrect` (the value they already compute) in the `POST /api/answer` body via `useRegisterAnswer`.
5. FE `api-types.d.ts` is regenerated so `useRegisterAnswer` is type-safe against the new request shape.
6. Integration tests pass: existing correct cases updated to include the new fields, incorrect-case suite expanded to cover the new validation rules, and `verified.txt` snapshots regenerated with the new fields.

## Plan

1. Add `ModeType` (string, default `""`) and `IsCorrect` (bool) to `AnswerEntity`; in `AnswerEntityTypeConfiguration.ConfigureColumns`, map `mode_type` (required, max 50) and `is_correct` (required).
2. Add `ModeType` and `IsCorrect` to `RegisterAnswerCommand`, `RegisterAnswerRequestPayload`, and `RegisterAnswerCommandMapper.Map` — mirror the existing pattern used for `Question` / `ExpectedAnswer`.
3. Extend `RegisterAnswerRequestPayloadValidator` with `ModeType` rule (`NotEmpty`, `MaximumLength(50)`, `Must(v => v is "full" or "open-questions" or "spelling")`) and `IsCorrect` rule (`NotNull`).
4. Update `AnswerRepository.RegisterAnswerAsync` to assign `ModeType` and `IsCorrect` onto the new `AnswerEntity`.
5. Generate EF migration `AddModeTypeAndIsCorrectToAnswer` (column additions with server defaults `''` / `false` so the migration applies cleanly on existing rows; `Down` drops both columns).
6. Regenerate FE `api-types.d.ts`, then update the three mode components to include `modeType` (literal per mode) and `isCorrect` in the `registerAnswer.mutate(...)` payload. In spelling mode use the already-computed `correct` local.
7. Update correct-case fixtures to include `ModeType` + `IsCorrect`; extend incorrect-case generator with new cases for invalid/missing `ModeType` and missing `IsCorrect`; regenerate all `verified.txt` snapshots.
8. Run `dotnet build`, integration tests, `npm run build`, `npm run lint`; verify migration applies on a fresh Postgres container.

## Tasks

- [x] Extend `AnswerEntity` + EF configuration with `mode_type` and `is_correct`
- [x] Extend `RegisterAnswerCommand`, `RegisterAnswerRequestPayload`, and mapper
- [x] Extend `RegisterAnswerRequestPayloadValidator` with the new rules
- [x] Persist `ModeType` / `IsCorrect` in `AnswerRepository`
- [x] Generate EF Core migration `AddModeTypeAndIsCorrectToAnswer`
- [x] Regenerate FE `api-types.d.ts` (auto-generated during `dotnet build` from OpenAPI) and pass `modeType` + `isCorrect` from each of the three mode components
- [x] Update correct/incorrect integration test fixtures; add validation cases (TestCase07–10) for the new fields; regenerate `verified.txt` snapshots
- [x] Run `dotnet build` + integration tests + `npm run build` + `npm run lint` — all green

## Done When

- [x] All tasks checked off
- [x] `dotnet build` succeeds with no new warnings
- [x] All integration tests pass (except the pre-existing unrelated `ApiAuth0Tests.SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken` failure — 35/36 pass)
- [x] Migration applies cleanly on a fresh database (verified via integration tests that spin up a fresh Postgres container and run all migrations)
- [x] FE `tsc` + `vite build` + `eslint` are green
- [x] No lint/formatting errors
