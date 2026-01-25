## 1. Core & Infrastructure
- [ ] 1.1 Update `Set` and `Word` domain models to include `UserId`.
- [ ] 1.2 Create EF Core migration to add `user_id` column to `set` and `word` tables (nullable initially for migration safety, then required).
- [ ] 1.3 Update EF Core configurations to index `user_id`.

## 2. Sets Capability
- [ ] 2.1 Update `GetSets` query to filter by `UserId`.
- [ ] 2.2 Update `GetSet` query to verify ownership.
- [ ] 2.3 Update `CreateSet` command to persist `UserId`.
- [ ] 2.4 Update `UpdateSet` and `DeleteSet` commands to enforce ownership.

## 3. Words Capability
- [ ] 3.1 Update `GetWords` (and related) queries to filter/scope by `UserId`.
- [ ] 3.2 Update `CreateWord` command to persist `UserId`.
- [ ] 3.3 Update `UpdateWord` and `DeleteWords` commands to enforce ownership.

## 4. Validation
- [ ] 4.1 Verify a user cannot see another user's sets.
- [ ] 4.2 Verify a user cannot modify another user's sets/words.
- [ ] 4.3 Run all tests to ensure no regressions in basic functionality.
