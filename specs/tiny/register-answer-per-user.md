| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-04-18 |
| **Status** | done |
| **Complexity** | small |

# TinySpec: Scope RegisterAnswer endpoint per user

## What

`RegisterAnswerEndpoint` currently stores answers without associating them with a user. Align it with the project's existing per-user pattern (used by `CreateSetEndpoint`, `CreateWordEndpoint`, etc.): resolve the current user via `IUserContextResolver`, return `401` when absent, propagate `UserId` through the command, and persist it on `AnswerEntity`.

## Context

| File | Role |
|------|------|
| `LexicaNext.Core/Commands/RegisterAnswer/RegisterAnswerEndpoint.cs` | Modify — inject `IUserContextResolver`, add 401 guard, pass `userId` to mapper, add `UnauthorizedHttpResult` to `Results<>` |
| `LexicaNext.Core/Commands/RegisterAnswer/Models/RegisterAnswerCommand.cs` | Modify — add `UserId` property |
| `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerCommandMapper.cs` | Modify — change `Map` signature to `Map(string userId, RegisterAnswerRequest request)` |
| `LexicaNext.Infrastructure/Db/Common/Entities/AnswerEntity.cs` | Modify — add `UserId` property |
| `LexicaNext.Infrastructure/Db/Common/Configurations/AnswerEntityTypeConfiguration.cs` | Modify — add `user_id` column (varchar(200), required) and index, wire up `ConfigureIndexes` |
| `LexicaNext.Infrastructure/Db/Repositories/AnswerRepository.cs` | Modify — assign `UserId` from command when creating entity |
| `LexicaNext.Infrastructure/Db/Migrations/` | Add — new EF Core migration `AddUserIdToAnswer` (plus auto-generated `Designer.cs` and `AppDbContextModelSnapshot.cs` update) |
| `LexicaNext.Core/Commands/CreateSet/CreateSetEndpoint.cs` | Reference — canonical per-user endpoint pattern |
| `LexicaNext.Core/Commands/CreateSet/Services/CreateSetCommandMapper.cs` | Reference — canonical mapper signature |
| `LexicaNext.Infrastructure/Db/Common/Configurations/WordEntityTypeConfiguration.cs` | Reference — canonical `user_id` column + index config |
| `LexicaNext.Infrastructure/Db/Migrations/20260125084148_AddUserIdToSetAndWord.cs` | Reference — canonical migration shape |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/RegisterAnswerTests.cs` | Modify — add an unauthorized-user test case; existing `verified.txt` files will regenerate to include `user_id` in DB snapshots |
| `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/Data/**` | Possibly modify — test cases / generators if they need to assert user scoping |

## Requirements

1. `POST /api/answer` returns `401 Unauthorized` when `IUserContextResolver.GetUserId()` returns `null`, without touching the database.
2. On a successful request, the persisted `AnswerEntity` has `UserId` populated with the resolved user id.
3. `RegisterAnswerCommand` carries `UserId`, and `RegisterAnswerCommandMapper.Map` accepts `userId` as its first parameter — matching `CreateSetCommandMapper`.
4. The `answer` table gains a required `user_id` column (`character varying(200)`) plus an index `IX_answer_user_id`, added via an EF Core migration named `AddUserIdToAnswer`.
5. Validator, existing 400-response behavior, and authorization policy (`Auth0OrApiKey`) are unchanged.
6. Integration tests pass (verified `.txt` snapshots updated to include `user_id`), including a new unauthorized-user scenario.

## Plan

1. Add `public string UserId { get; set; } = "";` to `AnswerEntity`; update `AnswerEntityTypeConfiguration` to map `user_id` (required, max 200) and add `HasIndex(e => e.UserId)` via a new `ConfigureIndexes` step in `Configure`.
2. Add `public string UserId { get; init; } = "";` to `RegisterAnswerCommand`.
3. Change `IRegisterAnswerCommandMapper.Map` to `Map(string userId, RegisterAnswerRequest request)`; set `UserId = userId` on the returned command.
4. Update `RegisterAnswerEndpoint.HandleAsync`: inject `IUserContextResolver`, resolve `userId`, return `TypedResults.Unauthorized()` when null, pass `userId` into the mapper. Change return type to `Results<ProblemHttpResult, NoContent, UnauthorizedHttpResult>` and add `.Produces(StatusCodes.Status401Unauthorized)` (already present — just verify).
5. Update `AnswerRepository.RegisterAnswerAsync` to assign `UserId = registerAnswerCommand.UserId` on the new `AnswerEntity`.
6. Generate EF Core migration `AddUserIdToAnswer` mirroring `20260125084148_AddUserIdToSetAndWord.cs` (column + `IX_answer_user_id` index, reverse in `Down`).
7. Update integration test data/setup so requests run as an authenticated user; add an unauthorized test case; regenerate `RegisterAnswerTests.*.verified.txt` snapshots.
8. Run build and integration tests; verify snapshots and migration apply cleanly.

## Tasks

- [x] Add `UserId` to `AnswerEntity` + EF config (column + index)
- [x] Add `UserId` to `RegisterAnswerCommand`
- [x] Update `RegisterAnswerCommandMapper` signature and mapping
- [x] Wire `IUserContextResolver` into `RegisterAnswerEndpoint` with 401 guard
- [x] Update `AnswerRepository` to persist `UserId`
- [x] Generate EF Core migration `AddUserIdToAnswer`
- [~] Regenerated successful-case verified snapshot to include `UserId`. Skipped adding an explicit unauthorized-user test case: `ITestCaseData.UserId` is non-nullable across 15+ test data classes, and no canonical per-user endpoint (CreateSet, CreateWord, etc.) has such a test — adding one here would require a cross-cutting interface change and deviate from project pattern.
- [x] Run `dotnet build` and integration test suite; confirm green (one pre-existing unrelated failure: `ApiAuth0Tests.SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken` fails on `develop` without my changes — expired JWT asset)

## Done When

- [x] All tasks checked off (one intentionally deferred — see note above)
- [x] `dotnet build` succeeds with no new warnings
- [x] All integration tests pass (except the pre-existing `ApiAuth0Tests.SendRequest_ShouldReturn401_WhenWrongSignatureInAccessToken` failure that is independent of this change)
- [x] Migration applies cleanly on a fresh database (verified via integration tests that spin up a fresh Postgres container and run all migrations)
- [x] No lint/formatting errors
