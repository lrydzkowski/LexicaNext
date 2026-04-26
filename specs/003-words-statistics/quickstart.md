# Quickstart: Verifying the Words Statistics Feature

**Feature**: `003-words-statistics` | **Date**: 2026-04-20 | **Plan**: [plan.md](./plan.md)

End-to-end walk-through for a developer who has implemented the feature and needs to confirm it works. Each step is a concrete command or user action with an explicit pass signal.

## Prerequisites

- Local PostgreSQL instance reachable via the existing `compose.yaml` setup.
- `.NET` SDK + Node/NPM versions matching the repo (see root `README.md`).
- Signed-in Auth0 test user with at least one existing `WordEntity` row in the DB.

## 1. Apply the database migration

From the repo root:

```bash
dotnet ef database update --project LexicaNext.Infrastructure --startup-project LexicaNext.WebApp
```

**Pass signal**: migration `<timestamp>_AddWordIdToAnswer` applies cleanly, `answer.word_id` exists as `uuid NOT NULL` with index `IX_answer_word_id` and FK `FK_answer_word_word_id` (`ON DELETE CASCADE`). Verify with:

```sql
\d answer
```

**Failure mode to watch for**: if some existing rows cannot be matched (ambiguous or no corresponding `Word`), they are deleted — this is expected per FR-019. If the migration aborts instead, the whole transaction rolls back, leaving the pre-migration schema intact.

## 2. Start the backend

```bash
dotnet run --project LexicaNext.WebApp
```

**Pass signal**: `LexicaNext.WebApp` listens on its usual port and the OpenAPI UI at `/scalar` lists the new endpoint `GET /api/words-statistics`.

## 3. Regenerate the frontend API types

The types file is auto-generated as part of `dotnet build` (see existing `/specs/tiny/answer-*.md` notes), so after step 2 ran at least once:

**Pass signal**: `Frontend/lexica-next-front/api-types/api-types.d.ts` now contains `"/api/words-statistics"` and the `WordStatisticsRecordDto` schema shape.

## 4. Exercise the backend directly

With a valid bearer token for the test user:

```bash
curl -H "Authorization: Bearer $TOKEN" \
     "http://localhost:5000/api/words-statistics?sortingFieldName=incorrectCount&sortingOrder=desc"
```

**Pass signal**: 200 OK, response body is `{"count": N, "data": [...]}` where each item carries `wordId`, `word`, `correctCount`, `incorrectCount`. For a brand-new user `count === 0` and `data === []`.

Check scoping:

```bash
curl -H "Authorization: Bearer $OTHER_USER_TOKEN" \
     "http://localhost:5000/api/words-statistics"
```

**Pass signal**: the other user sees only their own aggregates — no rows from the first user (SC-005).

## 5. Run the backend integration tests

```bash
dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~GetWordsStatistics"
```

**Pass signal**: every `GetWordsStatisticsTests` case passes and Verify snapshots are accepted. If running for the first time, approve the new `.received.txt` files with your usual Verify tooling.

Also re-run the existing `RegisterAnswer` tests to confirm their updated (regenerated) snapshots still pass after the `WordId` addition:

```bash
dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~RegisterAnswer"
```

## 6. Start the frontend

```bash
cd Frontend/lexica-next-front
npm run dev
```

**Pass signal**: the Vite dev server starts and the application reachable at the usual port renders the existing pages unchanged.

## 7. Walk through the user stories in the browser

Sign in as the test user, then:

### User Story 1 — Review per-word accuracy

Navigate to **Words Statistics** from the primary nav. **Pass signal**: one row per unique word the user has answered in `open-questions` mode; each row shows correct + incorrect counts.

### User Story 2 — Sort

Click the "Correct" column header. **Pass signal**: rows re-order, URL gains `?sortingFieldName=correctCount&sortingOrder=desc`. Click again → `asc`. Repeat for "Incorrect". Default on first load is `incorrectCount desc`.

### User Story 3 — Filter

Type `app` (or another known substring) in the filter input. **Pass signal**: after ≤300ms, only matching rows remain, URL gains `&searchQuery=app`, and page resets to `1`.

### User Story 4 — Navigate and return

From any row click the "go to word" action. **Pass signal**: the browser navigates to the word edit form and carries the statistics URL as a `returnTo` query param. Click **Back** on the edit form. **Pass signal**: the browser lands back on `/words-statistics` with the original filter, sort, and page still applied.

### User Story 5 — Pagination

Seed (or verify you already have) more rows than fit on a page. **Pass signal**: pagination control matches the one on `/sets` and `/words`; clicking page 2 updates `?page=2`; changing filter or sort resets `page` to `1`.

## 8. Run the Playwright E2E suite

```bash
cd Frontend/lexica-next-front-e2e-tests
npx playwright test tests/words-statistics
```

**Pass signal**: all specs under `tests/words-statistics/` pass:

- `01-words-statistics-page.spec.ts` — rows, counts, empty states.
- `02-filter.spec.ts` — URL persistence, debounce, page reset.
- `03-sort.spec.ts` — both count columns toggle asc/desc, URL persistence.
- `04-pagination.spec.ts` — URL-driven page control, resets on filter/sort change.
- `05-go-to-word-and-back.spec.ts` — round-trip preserves filter/sort/page.

## 9. Regression sweep

```bash
dotnet test
cd Frontend/lexica-next-front && npm run build
cd ../lexica-next-front-e2e-tests && npx playwright test
```

**Pass signal**: all tests green, `npm run build` produces no type errors.

## Rollback

If something goes wrong and the feature must be reverted pre-release:

1. `dotnet ef database update <previous-migration-id> --project LexicaNext.Infrastructure --startup-project LexicaNext.WebApp` — rolls the schema back (drops FK, index, column).
2. Revert the feature branch; redeploy.

Note: rows deleted during the backfill step cannot be resurrected by `Down()` — this is accepted per FR-019 since those rows had no resolvable `WordId` anyway.
