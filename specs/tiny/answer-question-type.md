| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-04-19 |
| **Status** | done |
| **Complexity** | small |

# TinySpec: Add `question_type` column to `answer` table

## What

The `answer` table already stores `mode_type` (`full` / `open-questions` / `spelling`) but doesn't capture which *sub-question type* within a mode produced the answer. Add a required `question_type` column (`english-close` / `native-close` / `english-open` / `native-open` / `spelling`) and propagate it through the `RegisterAnswer` command, endpoint, validator, mapper, repository, FE mode components, and integration tests/snapshots.

## Context

| File | Role |
|------|------|
| `LexicaNext.Infrastructure/Db/Common/Entities/AnswerEntity.cs` | Modify — add `QuestionType` (string) property |
| `LexicaNext.Infrastructure/Db/Common/Configurations/AnswerEntityTypeConfiguration.cs` | Modify — add `question_type` column (varchar(50), required) |
| `LexicaNext.Infrastructure/Db/Repositories/AnswerRepository.cs` | Modify — map `QuestionType` from command to entity |
| `LexicaNext.Infrastructure/Db/Migrations/` | Add — new EF Core migration `AddQuestionTypeToAnswer` (plus auto `Designer.cs` and `AppDbContextModelSnapshot.cs` update) |
| `LexicaNext.Core/Commands/RegisterAnswer/Models/RegisterAnswerCommand.cs` | Modify — add `QuestionType` (string) |
| `LexicaNext.Core/Commands/RegisterAnswer/RegisterAnswerEndpoint.cs` | Modify — add `QuestionType` to `RegisterAnswerRequestPayload` |
| `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerCommandMapper.cs` | Modify — copy `QuestionType` from request into command |
| `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerRequestValidator.cs` | Modify — add rule: `QuestionType` non-empty, ≤50 chars, one of `english-close` / `native-close` / `english-open` / `native-open` / `spelling` |
| `Frontend/lexica-next-front/api-types/api-types.d.ts` | Regenerate — picks up the new request field from OpenAPI |
| `Frontend/lexica-next-front/src/components/sets/modes/SetFullMode.tsx` | Modify — pass `questionType: currentQuestion.type` to `registerAnswer.mutate(...)` |
| `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx` | Modify — pass `questionType: currentQuestion.type` |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSpellingMode.tsx` | Modify — pass `questionType: 'spelling'` |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/CorrectTestCases/TestCase01.cs` | Modify — add `QuestionType` to payload |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/CorrectTestCases/TestCase02.cs` | Modify — same |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/IncorrectTestCases/*.cs` | Modify — fill `QuestionType` in existing cases; add new cases (e.g. `TestCase11`–`TestCase13`) for missing / >50 chars / unknown `QuestionType` |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/IncorrectTestCases/IncorrectTestCasesGenerator.cs` | Modify — yield the new test cases |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/RegisterAnswerTests.*.verified.txt` | Regenerate — DB/request snapshots now contain `QuestionType` |

## Requirements

1. The `answer` table has a new required column `question_type` (`character varying(50)`), added via EF Core migration `AddQuestionTypeToAnswer`.
2. `RegisterAnswerRequestPayload` exposes `QuestionType` (string); the validator rejects requests where `QuestionType` is empty, >50 chars, or not one of `english-close` / `native-close` / `english-open` / `native-open` / `spelling`.
3. `RegisterAnswerCommand` carries `QuestionType`; `RegisterAnswerCommandMapper` copies it from payload to command; `AnswerRepository` persists it on the new `AnswerEntity`.
4. All three FE learning-mode components send `questionType` in the `POST /api/answer` body: `SetFullMode` and `SetOnlyOpenQuestionsMode` forward the already-computed `currentQuestion.type`; `SetSpellingMode` sends the literal `'spelling'`.
5. FE `api-types.d.ts` is regenerated so `useRegisterAnswer` is type-safe against the new request shape.
6. Integration tests pass: existing correct cases updated to include `QuestionType`, incorrect-case suite expanded to cover the new validation rules, and `verified.txt` snapshots regenerated with the new field.

## Plan

1. Add `QuestionType` (string, default `""`) to `AnswerEntity`; in `AnswerEntityTypeConfiguration.ConfigureColumns`, map `question_type` (required, max 50).
2. Add `QuestionType` to `RegisterAnswerCommand`, `RegisterAnswerRequestPayload`, and `RegisterAnswerCommandMapper.Map` — mirror the existing pattern used for `ModeType`.
3. Extend `RegisterAnswerRequestPayloadValidator` with `QuestionType` rule (`NotEmpty`, `MaximumLength(50)`, `Must(v => v is "english-close" or "native-close" or "english-open" or "native-open" or "spelling")`).
4. Update `AnswerRepository.RegisterAnswerAsync` to assign `QuestionType` onto the new `AnswerEntity`.
5. Generate EF migration `AddQuestionTypeToAnswer` (column addition with server default `''` so the migration applies cleanly on existing rows; `Down` drops the column).
6. Regenerate FE `api-types.d.ts`, then update the three mode components to include `questionType` in the `registerAnswer.mutate(...)` payload.
7. Update correct-case fixtures to include `QuestionType`; extend incorrect-case generator with new cases for invalid/missing `QuestionType`; regenerate all `verified.txt` snapshots.
8. Run `dotnet build`, integration tests, `npm run build`, `npm run lint`; verify migration applies on a fresh Postgres container.

## Tasks

- [x] Extend `AnswerEntity` + EF configuration with `question_type`
- [x] Extend `RegisterAnswerCommand`, `RegisterAnswerRequestPayload`, and mapper
- [x] Extend `RegisterAnswerRequestPayloadValidator` with the new rule
- [x] Persist `QuestionType` in `AnswerRepository`
- [x] Generate EF Core migration `AddQuestionTypeToAnswer`
- [x] Regenerate FE `api-types.d.ts` and pass `questionType` from each of the three mode components
- [x] Update correct/incorrect integration test fixtures; add validation cases for the new field; regenerate `verified.txt` snapshots
- [x] Run `dotnet build` + integration tests + `npm run build` + `npm run lint` — all green

## Done When

- [x] All tasks checked off
- [x] `dotnet build` succeeds with no new warnings
- [x] All integration tests pass (35/36 — the 1 failure, `ApiAuth0Tests.SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken`, is pre-existing and unrelated to this change)
- [x] Migration applies cleanly on a fresh database (verified via Testcontainers-backed integration tests)
- [x] FE `tsc` + `vite build` + `eslint` are green
- [x] No lint/formatting errors
