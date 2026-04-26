# Phase 1 Data Model: Words Statistics Page

**Feature**: `003-words-statistics` | **Date**: 2026-04-20 | **Plan**: [plan.md](./plan.md)

This document describes the data-layer changes introduced by the feature and the derived domain model surfaced by the new query endpoint. It is informed by spec §Key Entities and by Phase 0 Decisions 1–3 in [research.md](./research.md).

## Entity: `AnswerEntity` (modified)

Existing table `answer`. This feature adds one new non-nullable column with a supporting FK and index. No existing columns change.

### Fields (after migration)

| Field             | Type             | Nullable | Notes                                                                                          |
| ----------------- | ---------------- | -------- | ---------------------------------------------------------------------------------------------- |
| `AnswerId`        | `Guid`           | No       | Existing. PK.                                                                                  |
| `UserId`          | `string` (200)   | No       | Existing.                                                                                      |
| `ModeType`        | `string` (50)    | No       | Existing. Mode discriminator. Statistics scope = `"open-questions"`.                           |
| `QuestionType`    | `string` (50)    | No       | Existing.                                                                                      |
| `Question`        | `string` (500)   | No       | Existing. Prompt shown to user.                                                                |
| `GivenAnswer`     | `string?` (500)  | Yes      | Existing.                                                                                      |
| `ExpectedAnswer`  | `string` (500)   | No       | Existing. For `open-questions` mode this is the English word text.                             |
| `IsCorrect`       | `bool`           | No       | Existing. Used to split counts.                                                                |
| `AnsweredAt`      | `DateTimeOffset` | No       | Existing.                                                                                      |
| **`WordId`**      | **`Guid`**       | **No**   | **NEW.** FK to `word.word_id`. Populated at write time; backfilled for historical rows.        |

### Navigation properties (after migration)

- `Word : WordEntity?` — nullable CLR reference, non-nullable column. Marked nullable on the C# side because EF does not materialise it unless included; `Required` is enforced via the fluent configuration below.

### Fluent configuration additions in `AnswerEntityTypeConfiguration`

```csharp
builder.Property(entity => entity.WordId)
    .HasColumnName("word_id")
    .IsRequired();

builder.HasOne(entity => entity.Word)
    .WithMany()
    .HasForeignKey(entity => entity.WordId)
    .OnDelete(DeleteBehavior.Cascade)
    .IsRequired();

builder.HasIndex(entity => entity.WordId);
```

### Invariants

- `WordId` MUST reference a `WordEntity` row whose `UserId` matches the `AnswerEntity.UserId`. Enforcement happens at write time in `RegisterAnswerRequestValidator` (per-user ownership check); no DB-level cross-column constraint is added because the existing pattern relies on validator-level enforcement.
- Deleting a `WordEntity` cascades to every `AnswerEntity` that references it (`OnDelete(Cascade)`). This is the mechanism that guarantees the spec's "no orphaned rows" property (FR-005).

### Migration `AddWordIdToAnswer`

Single-transaction migration, executed in this order:

1. Add `word_id uuid NULL`.
2. Backfill via UPDATE JOIN:  `SET word_id = matching w.word_id WHERE lower(trim(answer.expected_answer)) = lower(trim(w.word)) AND answer.user_id = w.user_id` AND the match is unique for that user.
3. `DELETE FROM answer WHERE word_id IS NULL` (per FR-019).
4. `ALTER COLUMN word_id SET NOT NULL`.
5. Create index `IX_answer_word_id`.
6. Create FK `FK_answer_word_word_id` with `ON DELETE CASCADE`.

`Down()` performs steps 6 → 4 → 1 in reverse (no row resurrection).

## Entity: `WordEntity` (unchanged)

Referenced by the new FK. No changes to columns, indexes, or configuration. Relationship is declared on the dependent side (`AnswerEntityTypeConfiguration`) so `WordEntity` needs no navigation back — this matches the existing project convention (e.g., `TranslationEntity → WordEntity` is configured from the translation side).

## Domain model: `WordStatisticsRecord` (new)

New record in `LexicaNext.Core/Common/Models/WordStatisticsRecord.cs`. It is the result of the aggregation query and has no persistence; it is constructed per-request from the grouped projection described in research Decision 2.

```csharp
namespace LexicaNext.Core.Common.Models;

public class WordStatisticsRecord
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public int CorrectCount { get; init; }

    public int IncorrectCount { get; init; }
}
```

### Field semantics

| Field            | Source                                                                             |
| ---------------- | ---------------------------------------------------------------------------------- |
| `WordId`         | Group key — the `WordId` shared by all answers in the group.                       |
| `Word`           | Joined from `WordEntity.Word` for the same `WordId`. Used for display and sort.    |
| `CorrectCount`   | `g.Count(x => x.IsCorrect)` over the user's `open-questions` answers for `WordId`. |
| `IncorrectCount` | `g.Count(x => !x.IsCorrect)` over the same group.                                  |

### Invariants

- `CorrectCount + IncorrectCount >= 1` for every row returned by the endpoint. Words with zero recorded answers are excluded by the `WHERE ModeType == "open-questions"` filter combined with the `JOIN` semantics (no answers → no group → no row).
- `Word` always resolves because the join is against a live `WordEntity`; cascade delete guarantees that `AnswerEntity.WordId` cannot reference a deleted word (invariant on the DB side).

## DTO: `WordStatisticsRecordDto` (new)

Shape exposed over HTTP. Lives in `GetWordsStatisticsEndpoint.cs` alongside the request/response types (matching the `GetWordsEndpoint`/`WordRecordDto` placement).

```csharp
public class WordStatisticsRecordDto
{
    public Guid WordId { get; init; }

    public string Word { get; init; } = "";

    public int CorrectCount { get; init; }

    public int IncorrectCount { get; init; }
}
```

Mapping `WordStatisticsRecord → WordStatisticsRecordDto` is a 1-to-1 projection performed by `WordStatisticsRecordMapper` (mirrors `WordRecordMapper`).

## Command extension: `RegisterAnswerCommand` (modified)

`LexicaNext.Core/Commands/RegisterAnswer/Models/RegisterAnswerCommand.cs` gains `public Guid WordId { get; init; }`. The command is produced by `RegisterAnswerCommandMapper.Map(string userId, RegisterAnswerRequest request)` from the payload's new `WordId` field. `AnswerRepository.RegisterAnswerAsync` copies the field onto the new `AnswerEntity.WordId` column.

Validation (`RegisterAnswerRequestValidator`):

- `WordId` MUST NOT be `Guid.Empty`.
- `WordId` MUST reference a `WordEntity` owned by `UserId` — verified with a `WordExistsAsync(userId, wordId)` call (existing method on `WordsRepository`). Failure returns HTTP 400 with a validation problem-details payload (consistent with the existing validator pattern).

## Relationships summary

```text
WordEntity ──1──< AnswerEntity          (NEW: WordId FK, ON DELETE CASCADE)
WordEntity ──1──< TranslationEntity     (existing)
WordEntity ──1──< ExampleSentenceEntity (existing)
WordEntity ──1──< SetWordEntity         (existing)
```

The only new edge is `WordEntity ──1──< AnswerEntity`. All other relationships are untouched.

## Scoping and security invariants

- Every read path (`WordsStatisticsRepository.GetWordsStatisticsAsync`) MUST filter both `AnswerEntity.UserId == userId` AND the joined `WordEntity.UserId == userId` (defence in depth — even if an answer row referenced a word owned by another user through malformed historical data, it would not leak).
- The endpoint layer (`GetWordsStatisticsEndpoint`) MUST call `IUserContextResolver.GetUserId()` and return `Unauthorized` on `null` before hitting the repository — identical pattern to `GetWordsEndpoint`.

## Lifecycle / state transitions

There are no stateful transitions on the new column; `WordId` is immutable for the lifetime of an `AnswerEntity` row, and cascade delete is the only way the row leaves the database.
