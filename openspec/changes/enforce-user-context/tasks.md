## 1. Core & Infrastructure
- [x] 1.1 Update `Set` and `Word` domain models to include `UserId`.
- [x] 1.2 Create EF Core migration to add `user_id` column to `set` and `word` tables (nullable initially for migration safety, then required).
- [x] 1.3 Update EF Core configurations to index `user_id`.

## 2. Sets Capability
- [x] 2.1 Update `GetSets` query to filter by `UserId`.
- [x] 2.2 Update `GetSet` query to verify ownership.
- [x] 2.3 Update `CreateSet` command to persist `UserId`.
- [x] 2.4 Update `UpdateSet` and `DeleteSet` commands to enforce ownership.

## 3. Words Capability
- [x] 3.1 Update `GetWords` (and related) queries to filter/scope by `UserId`.
- [x] 3.2 Update `CreateWord` command to persist `UserId`.
- [x] 3.3 Update `UpdateWord` and `DeleteWords` commands to enforce ownership.

## 4. Validation
- [x] 4.1 Verify a user cannot see another user's sets.
- [x] 4.2 Verify a user cannot modify another user's sets/words.
- [x] 4.3 Run all tests to ensure no regressions in basic functionality.
