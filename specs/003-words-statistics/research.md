# Phase 0 Research: Words Statistics Page

**Feature**: `003-words-statistics` | **Date**: 2026-04-20 | **Plan**: [plan.md](./plan.md)

This document resolves the open design questions implicit in `plan.md`'s Technical Context. Every decision below was verified against the existing code paths it extends (references inline) so that downstream phases have no remaining `NEEDS CLARIFICATION`.

## Decision 1 — EF Core cascade configuration for `AnswerEntity.WordId`

**Decision**: Declare the relationship on `AnswerEntityTypeConfiguration` using `builder.HasOne(x => x.Word).WithMany().HasForeignKey(x => x.WordId).OnDelete(DeleteBehavior.Cascade).IsRequired()`, and add a supporting `builder.HasIndex(x => x.WordId)` inside `ConfigureIndexes`. `AnswerEntity` gains both `public Guid WordId { get; set; }` and a nullable reference navigation `public WordEntity? Word { get; set; }`.

**Rationale**:

- `AnswerEntityTypeConfiguration.ConfigureColumns` / `ConfigureIndexes` is the canonical place for per-column config in this project — adding a new relationship there keeps the style identical to sibling configurations (`WordEntityTypeConfiguration`, `SetEntityTypeConfiguration`).
- `Cascade` implements the clarified behaviour from spec §Clarifications Q3 ("Remove orphaned answers when remove words") and FR-005.
- `IsRequired()` matches the spec's decision (Q1 answer) that `WordId` is non-nullable after the migration completes.
- An index on `WordId` is mandatory because statistics aggregation groups by it; without the index the grouping scan becomes the dominant cost for heavy users.

**Alternatives considered**:

- `DeleteBehavior.SetNull` — rejected in spec clarification Q3; would reintroduce orphaned-row UX we explicitly chose to avoid.
- Defining the relationship fluently in `AppDbContext.OnModelCreating` — rejected because this project consistently keeps per-entity config in `IEntityTypeConfiguration<T>` classes; mixing styles would break the existing convention.

## Decision 2 — Aggregating correct/incorrect counts in LINQ and sorting by those computed columns

**Decision**: Do NOT reuse the generic `Sort()`/`Filter()`/`Paginate()` extensions that `WordsRepository.GetWordsAsync` uses. Instead, `WordsStatisticsRepository.GetWordsStatisticsAsync` builds a hand-written projection that groups `AnswerEntity` rows by `WordId` and joins to `WordEntity` for display text:

```csharp
var baseQuery =
    from a in _dbContext.Answers.AsNoTracking()
    where a.UserId == userId && a.ModeType == "open-questions"
    group a by new { a.WordId } into g
    join w in _dbContext.Words.AsNoTracking() on g.Key.WordId equals w.WordId
    where w.UserId == userId
    select new WordStatisticsRecord
    {
        WordId = w.WordId,
        Word = w.Word,
        CorrectCount = g.Count(x => x.IsCorrect),
        IncorrectCount = g.Count(x => !x.IsCorrect)
    };
```

Filtering is applied post-projection (`Where(x => EF.Functions.ILike(x.Word, $"%{q}%"))` for PostgreSQL case-insensitive contains). Sorting is applied post-projection using `IOrderedQueryable<WordStatisticsRecord>` and an explicit switch on the incoming `Sorting.FieldName` (only `correctCount`, `incorrectCount`, and the default `incorrectCount` are honoured). Alphabetical `ThenBy(x => x.Word)` is always appended for deterministic tie-breaking (FR-009). Pagination reuses the existing `Paginate(listParameters.Pagination)` extension so page number / page size semantics are identical to Sets/Words.

**Rationale**:

- The generic `Sort()` extension uses reflection to map `FieldName` strings onto `IQueryable<TEntity>` properties — it only works where the sort target is a real column on the underlying entity. Both sort columns here (`correctCount`, `incorrectCount`) are computed aggregates that do not exist on `AnswerEntity`, so the generic path cannot be reused safely.
- A hand-rolled switch is both simpler than generalising `Sort()` and safer (no reflection on projected types).
- Executing the `GROUP BY` in SQL (rather than materialising answers client-side) is essential to meet SC-002 (≤2s for 10k answers) and SC-003 (≤300ms filter for 5k aggregated rows).
- `EF.Functions.ILike` matches PostgreSQL case-insensitive semantics without the `ToLower()` dance used elsewhere in the codebase; it is acceptable here because `WordsStatisticsRepository` is a new-code file, so it can adopt the cleaner idiom without requiring a codebase-wide refactor.

**Alternatives considered**:

- Extending the generic `Sort()` to accept a delegate / expression-tree per field — larger blast radius, would touch code used by Sets/Words, rejected per YAGNI.
- Materialising all answers into memory and aggregating in C# — rejected, violates performance goals.
- Persisting a pre-aggregated `(user_id, word_id, correct_count, incorrect_count)` table refreshed on each answer — rejected because the spec's Key Entities state explicitly that Word Statistics Row is calculated ad hoc (no persisted aggregate).

## Decision 3 — Data migration strategy for the non-nullable `WordId` column

**Decision**: Author a single migration `<timestamp>_AddWordIdToAnswer` whose `Up()` wraps the whole transform in a raw-SQL transaction:

1. `ALTER TABLE answer ADD COLUMN word_id uuid NULL;`
2. Best-effort backfill: `UPDATE answer SET word_id = w.word_id FROM word w WHERE answer.user_id = w.user_id AND TRIM(LOWER(answer.expected_answer)) = TRIM(LOWER(w.word)) AND answer.word_id IS NULL AND (SELECT COUNT(*) FROM word w2 WHERE w2.user_id = answer.user_id AND TRIM(LOWER(w2.word)) = TRIM(LOWER(answer.expected_answer))) = 1;`
3. `DELETE FROM answer WHERE word_id IS NULL;` (rows with zero or multiple matches are discarded per FR-019).
4. `ALTER TABLE answer ALTER COLUMN word_id SET NOT NULL;`
5. `CREATE INDEX IX_answer_word_id ON answer (word_id);`
6. `ALTER TABLE answer ADD CONSTRAINT FK_answer_word_word_id FOREIGN KEY (word_id) REFERENCES word (word_id) ON DELETE CASCADE;`

The `Down()` drops FK, index, and column in reverse order (no attempt is made to resurrect deleted rows).

The migration is generated with `dotnet ef migrations add AddWordIdToAnswer --project LexicaNext.Infrastructure --startup-project LexicaNext.WebApp` and then the scaffolded content is replaced/augmented with the raw-SQL steps above so that the backfill runs between the nullable-create and the non-nullable-promotion. EF's default scaffold cannot produce the data-fix step on its own.

**Rationale**:

- `ExpectedAnswer` is the canonical "word text" for an answer in `open-questions` mode (that is how `RegisterAnswer` currently records the practised word); matching against `Word.Word` by trimmed, case-insensitive equality is the most reliable best-effort signal available in historical data.
- Requiring exactly one match prevents incorrect links when the same user has entered the same word text under two different `WordType` rows (e.g., noun vs. verb "run"). Ambiguous rows are deleted per FR-019.
- PostgreSQL DDL+DML is transactional; wrapping everything in one transaction satisfies FR-019's "single transaction so a partially-backfilled database can never be left behind" requirement.
- Matching the existing AddUserIdToAnswer migration style (same repo, same table) keeps cognitive load low for reviewers.

**Alternatives considered**:

- Adding `WordId` as nullable permanently and wiring the new endpoint to ignore nulls — rejected by spec clarification Q1 (FR-005 requires non-nullable FK).
- Deferring backfill to a separate ad-hoc script — rejected per FR-019 ("migration MUST run in a single transaction").
- Matching on `Question` instead of `ExpectedAnswer` — rejected: for open-questions mode the stored `Question` is typically the translation (the prompt shown to the user), not the English word under study; `ExpectedAnswer` holds the word text we need.

## Decision 4 — Default sort column and direction on the new endpoint

**Decision**: Default `SortingFieldName = "incorrectCount"`, `SortingOrder = "desc"`. The generic `SortingOrderConstants` values are reused verbatim. Additionally, `"word"` is accepted as a sortable field (alphabetical) even though the spec only explicitly requires user-driven sort on the two count columns — this is a low-cost extension that makes the default tie-breaker trivially consistent with an explicit sort on the same column.

**Rationale**:

- Spec FR-008 names "by the number of incorrect answers, descending" as the default — it surfaces weakest words first, aligning with the primary user story ("identify my weakest words").
- Reusing `SortingOrderConstants` keeps validation uniform with Sets/Words endpoints.
- Accepting `word` as a sort field costs one branch in the switch but pays off for deterministic tie-breaks and future-proofing (if the FE later exposes an alphabetical sort button there is nothing to change on the BE).

**Alternatives considered**:

- Default to `word` ascending — rejected, would hide the diagnostic value of the page on first load.
- Omit `word` from the sort whitelist entirely — rejected per above.

## Decision 5 — URL-state pattern extension on the frontend

**Decision**: On `WordsStatisticsList`, extend the existing `useSearchParams`-based page persistence (pattern from `SetsList.tsx` / `WordsList.tsx`) to also hold `search`, `sort`, and `order` query params. The Sets and Words lists are intentionally NOT touched by this feature — they stay on `page`-only URL state.

Concretely: `WordsStatisticsList` reads four params on mount (`page`, `search`, `sort`, `order`), passes them to `useWordsStatistics`, and calls `setSearchParams(next, { replace: true })` when the user changes any of them. Reseting page to 1 on filter/sort change (FR-016) is done by clearing `page` from the next params (defaulting to `1`). Debounce on search remains 300 ms (`useDebouncedValue`) to honour SC-003.

The "go to word" action builds its link with `navigate(links.words.editWord.getUrl({ wordId }, { returnTo: currentUrl }))`, where `currentUrl` is `"/words-statistics" + location.search`. `WordEditPage`'s back handler is taught to prefer `returnTo` (when present and starting with `/`) over its existing `returnPage`-based reconstruction — this keeps the Words page's existing return behaviour untouched (the Words list continues to pass `returnPage`, and the edit page falls back to that if `returnTo` is absent).

**Rationale**:

- Keeping the richer URL schema scoped to the statistics page avoids widening the blast radius. Sets and Words have no product requirement to URL-persist filter/sort yet, and changing their UX would be out of scope.
- Using `returnTo` as an opaque, fully-qualified source URL is simpler than passing each of `search`/`sort`/`order`/`page` separately and lets this feature extend back-navigation without ever growing the `returnPage`-only contract.
- Validating `returnTo` starts with `/` prevents open-redirect issues (only same-origin paths accepted). Any other value falls back to the existing `returnPage` logic.

**Alternatives considered**:

- Extending `SetsList` and `WordsList` at the same time to URL-persist filter/sort — rejected (scope creep; those lists have no such requirement).
- Using browser `sessionStorage` to hold filter/sort — rejected by spec clarification Q2 (URL is the source of truth; the view must be shareable/bookmarkable).
- Adding a new dedicated `source=words-statistics&statsSearch=...&statsSort=...` param set — rejected, needlessly bespoke when the source URL itself already encodes everything.

## Decision 6 — Integration-test fixtures for the new endpoint

**Decision**: Place tests under `LexicaNext.WebApp.Tests.Integration/Features/Answers/GetWordsStatistics/` following the existing `Features/Answers/RegisterAnswer/` layout: one `GetWordsStatisticsTests.cs` xUnit v3 class in the `MainTestsCollection`, `Verify`-style `.verified.txt` snapshots, and one or more `CorrectTestCasesGenerator` / `IncorrectTestCasesGenerator` classes under `Data/` to produce the parameterised test cases. Seeding uses the existing `WebApiFactory` DB fixture + the real `RegisterAnswer` command path (so seed data goes through the same code that will populate `WordId` in production), not hand-built `AnswerEntity` rows.

**Rationale**:

- Mirrors the established pattern already used for `RegisterAnswer` and `GetWords` tests, keeping discovery trivial for future contributors.
- Driving seeding through the real `RegisterAnswer` command exercises both the new write-path (`WordId` population) and the new read-path (aggregation), doubling coverage per test.
- `Verify` snapshots handle the response-shape coverage (correct counts, default order, tie-breaker) declaratively.

**Alternatives considered**:

- Seeding with raw `AnswerEntity` inserts — rejected: would bypass the command's validation and would not catch regressions in `RegisterAnswerCommandMapper`.

## Decision 7 — Playwright E2E test scope

**Decision**: Add 5 E2E specs under `Frontend/lexica-next-front-e2e-tests/tests/words-statistics/` that each cover one top-level user story. Reuse the `generateTestPrefix` + `captureAuthToken` helpers already in place for the Words specs, and add a `helpers.ts` with a `seedOpenQuestionAnswersViaApi({ word, correctCount, incorrectCount })` helper that calls `POST /api/words` and then `POST /api/answers` the correct number of times — this keeps test setup deterministic and decoupled from UI practice flows.

**Rationale**:

- Splitting per-user-story matches the existing Words pagination spec layout (`07-words-pagination.spec.ts`) and keeps individual specs runnable in isolation.
- Seeding via API keeps the test fixtures fast (no real practice-mode flow needed) and independent of UI regressions elsewhere.

**Alternatives considered**:

- A single monolithic spec file — rejected, harder to diagnose per-story failures.
- UI-driven seeding through the practice mode — rejected, slower and couples this feature's tests to unrelated features.

## Summary

No `NEEDS CLARIFICATION` markers remain. All decisions are locally-scoped and compatible with the existing Core/Infrastructure/WebApp tiering captured in `plan.md`.
