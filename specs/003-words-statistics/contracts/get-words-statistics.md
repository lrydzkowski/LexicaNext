# HTTP Contract: `GET /api/words-statistics`

**Feature**: `003-words-statistics` | **Date**: 2026-04-20 | **Plan**: [../plan.md](../plan.md)

Returns a paginated, filterable, sortable list of per-word answer aggregates for the currently signed-in user, restricted to the `open-questions` learning mode. Mirrors the shape and conventions of `GET /api/words`.

## Authentication

- Policy: `AuthorizationPolicies.Auth0OrApiKey` (same as `GET /api/words`).
- Returns `401 Unauthorized` without a body if `IUserContextResolver.GetUserId()` returns `null`.

## Request

### Method & path

```text
GET /api/words-statistics
```

### Query parameters

| Name               | Type     | Required | Default                           | Description                                                                                                              |
| ------------------ | -------- | -------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `page`             | `int?`   | No       | `1`                               | 1-based page number.                                                                                                     |
| `pageSize`         | `int?`   | No       | Existing default (matches Words)  | Rows per page. Validated with the same bounds as `GET /api/words`.                                                       |
| `sortingFieldName` | `string` | No       | `"incorrectCount"`                | One of `"correctCount"`, `"incorrectCount"`, `"word"`. Any other value → `400`.                                          |
| `sortingOrder`     | `string` | No       | `"desc"`                          | `"asc"` or `"desc"` (from `SortingOrderConstants`).                                                                      |
| `searchQuery`      | `string` | No       | (none)                            | Case-insensitive substring filter applied to the word text. Whitespace-only values are treated as empty (FR edge case).  |
| `timeZoneId`       | `string` | No       | (none)                            | Accepted for parity with other list endpoints. Not used by this endpoint; safely ignored.                                |

### Binding

Parameters bind as `[AsParameters] GetWordsStatisticsRequest`, identical to `GetWordsRequest` on `GET /api/words`.

## Response

### 200 OK

```json
{
  "count": 42,
  "data": [
    {
      "wordId": "018f1e6a-7e00-7b00-8000-000000000001",
      "word": "apple",
      "correctCount": 7,
      "incorrectCount": 3
    }
  ]
}
```

#### Fields

| Field                  | Type       | Notes                                                                                        |
| ---------------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `count`                | `integer`  | Total number of aggregated rows matching `searchQuery` BEFORE pagination (used for pager).   |
| `data`                 | `object[]` | At most `pageSize` rows for the requested `page`.                                            |
| `data[].wordId`        | `string`   | GUID of the referenced `WordEntity`. Always resolves (cascade delete — FR-005).              |
| `data[].word`          | `string`   | Display text of the word.                                                                    |
| `data[].correctCount`  | `integer`  | Count of the user's correct `open-questions` answers for this word.                          |
| `data[].incorrectCount`| `integer`  | Count of the user's incorrect `open-questions` answers for this word.                        |

### Ordering semantics

- If `sortingFieldName` is `"correctCount"` or `"incorrectCount"`, rows are ordered by that column in `sortingOrder`, then by `word` ascending as tie-breaker.
- If `sortingFieldName` is `"word"`, rows are ordered alphabetically in `sortingOrder` with no additional tie-breaker (word is unique per user).
- Default (no params): `incorrectCount DESC, word ASC`.

### 400 Bad Request

Returned as RFC 7807 `application/problem+json` with the shape produced by `ValidationResult.ToProblemDetails()`. Triggered by:

- Unknown `sortingFieldName` value.
- `sortingOrder` not in {`"asc"`, `"desc"`}.
- `page` or `pageSize` outside allowed range (matches `GET /api/words` validator).

### 401 Unauthorized

Empty body. Returned when the request is unauthenticated.

### 500 Internal Server Error

Bubbled through the standard exception handler.

## Scope & data filtering rules

- `WHERE answer.user_id = {current user id} AND answer.mode_type = 'open-questions'`.
- `JOIN word ON word.word_id = answer.word_id AND word.user_id = {current user id}` — double-scoping (see data-model.md §Scoping and security invariants).
- `GROUP BY answer.word_id, word.word`, `COUNT(*) FILTER (IsCorrect)` / `COUNT(*) FILTER (NOT IsCorrect)`.
- `searchQuery` (if non-empty and non-whitespace) is applied against the joined `word.word` column via `EF.Functions.ILike(word.word, '%' + q + '%')`.

## Performance targets

- First-page response time ≤ 2s for a user with up to 10,000 recorded `open-questions` answers (SC-002).
- Filter-applied query time ≤ 300ms for underlying collections up to 5,000 aggregated rows (SC-003).

## Idempotency

- `GET` — safe and idempotent. No side effects.

## Versioning

- Additive. No existing endpoints change their shape or contract.
- The OpenAPI document exposes the new endpoint via the standard `Produces<GetWordsStatisticsResponse>()` declaration; the frontend regenerates `api-types/api-types.ts` to pick it up.

## Example: list page 2, sorted by correct count ascending, filtered by "app"

```text
GET /api/words-statistics?page=2&pageSize=10&sortingFieldName=correctCount&sortingOrder=asc&searchQuery=app
```

```json
{
  "count": 14,
  "data": [
    {
      "wordId": "018f1e6a-7e00-7b00-8000-00000000000a",
      "word": "appendix",
      "correctCount": 1,
      "incorrectCount": 6
    }
  ]
}
```

## Example: empty state (user has no open-questions answers)

```text
GET /api/words-statistics
```

```json
{
  "count": 0,
  "data": []
}
```

The frontend uses `count === 0` with an empty/unset `searchQuery` to distinguish the primary empty state (FR-011a) from the filtered empty state (FR-011b — `count === 0` while `searchQuery` is non-empty).
