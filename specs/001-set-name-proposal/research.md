# Research: Set Name Auto-Proposal

**Feature**: 001-set-name-proposal
**Date**: 2026-01-03

## PostgreSQL Sequence for Name Proposal

### Decision

Use a PostgreSQL sequence (`set_name_sequence`) to generate proposed set names. The sequence value is read without incrementing when the form opens; it is only updated when a set is saved with a name matching the `set_XXXX` pattern.

### Rationale

- PostgreSQL sequences are atomic and handle concurrent access
- EF Core supports raw SQL for sequence operations
- Existing migration pattern in project uses `migrationBuilder.Sql()` for custom SQL
- Sequence approach is simpler than tracking max existing name numbers

### Alternatives Considered

1. **Query max existing `set_XXXX` name**: Rejected because parsing all set names on each form open is inefficient
2. **Store counter in separate table**: Rejected because adds complexity; sequence is built-in PostgreSQL feature
3. **Client-side timestamp-based names**: Rejected because doesn't meet `set_XXXX` format requirement

### Implementation Notes

- Create sequence: `CREATE SEQUENCE set_name_sequence START WITH 1;`
- Read current value: `SELECT last_value FROM set_name_sequence;`
- Increment sequence: `SELECT nextval('set_name_sequence');`
- The sequence starts at 1 but `last_value` returns the last used value (or 1 if never called)
- For first-time use, need to handle case where sequence hasn't been called yet

## Case-Insensitive Uniqueness Validation

### Decision

Use PostgreSQL `LOWER()` function in uniqueness check queries. The existing `SetExistsAsync` method will be modified to use case-insensitive comparison.

### Rationale

- PostgreSQL string comparison is case-sensitive by default
- Using `LOWER()` on both sides ensures consistent case-insensitive matching
- Existing validation infrastructure (FluentValidation async rules) supports this pattern

### Alternatives Considered

1. **CITEXT column type**: Rejected because requires altering existing column; migration complexity
2. **Case-insensitive collation**: Rejected because database-wide change; affects other queries
3. **Normalize to lowercase on save**: Rejected because changes user's input; spec allows any name format

### Implementation Notes

- Modify `SetExistsAsync`: `WHERE LOWER(name) = LOWER(@setName)`
- Update `CreateSetRequestValidator` and `UpdateSetRequestValidator` to use this
- Existing unique index on `name` column may need to be replaced with case-insensitive index

## Unique Index for Database-Level Constraint

### Decision

Add a unique index on `LOWER(name)` to enforce uniqueness at the database level, providing a safety net beyond application-level validation.

### Rationale

- Defense in depth: catches edge cases missed by application validation
- Prevents race conditions in concurrent save scenarios
- Aligns with Constitution principle "Fail Fast with Context"

### Implementation Notes

- Migration: `CREATE UNIQUE INDEX ix_set_name_lower ON set (LOWER(name));`
- May need to drop existing unique index on `name` if present
- EF Core configuration: Use `HasIndex` with raw SQL for case-insensitive index

## Sequence Update Logic on Save

### Decision

When saving a set with a name matching pattern `set_XXXX` (where XXXX is digits), update the sequence to `max(current_sequence, XXXX) + 1` if XXXX >= current sequence value.

### Rationale

- Ensures proposals always use numbers higher than existing sets
- Handles case where user manually creates `set_0050` - next proposal should be `set_0051`
- Uses regex pattern matching: `^set_(\d+)$`

### Alternatives Considered

1. **Only increment if exact proposed name used**: Rejected because doesn't handle manual high-number names
2. **Parse all existing names on each save**: Rejected because inefficient
3. **Ignore pattern matching, always increment**: Rejected because sequence could fall behind manually created names

### Implementation Notes

- Pattern regex: `^set_(\d+)$` (case-insensitive)
- Extract number from matched name
- Compare with current sequence value
- If extracted >= current, set sequence to extracted + 1 using `SELECT setval('set_name_sequence', @newValue);`

## Frontend Integration Pattern

### Decision

Add a new TanStack Query hook `useProposedSetName` that fetches the proposed name when the create set form mounts.

### Rationale

- Follows existing hook patterns in `api.ts`
- TanStack Query handles caching and loading states
- Decoupled from form component logic

### Implementation Notes

- Endpoint: `GET /api/sets/proposed-name`
- Response: `{ proposedName: "set_0042" }`
- Hook usage: Call on form mount, use as default value for name field
- Consider: Disable caching or use short stale time to ensure fresh value
