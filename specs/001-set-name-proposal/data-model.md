# Data Model: Set Name Auto-Proposal

**Feature**: 001-set-name-proposal
**Date**: 2026-01-03

## Entities

### Set (Modified)

Existing entity with added uniqueness constraint.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| SetId | Guid | PK | Existing |
| Name | string | Required, MaxLength(200), **Unique (case-insensitive)** | Modified: add case-insensitive unique index |
| CreatedAt | DateTimeOffset | Required | Existing |
| Entries | Collection | FK to Entry | Existing |

### SetNameSequence (New - Database Object)

PostgreSQL sequence for generating proposed set names.

| Property | Value |
|----------|-------|
| Sequence Name | `set_name_sequence` |
| Start Value | 1 |
| Increment | 1 |
| Min Value | 1 |
| Max Value | No limit |

## Database Changes

### New Sequence

```sql
CREATE SEQUENCE set_name_sequence START WITH 1;
```

### New Case-Insensitive Unique Index

```sql
CREATE UNIQUE INDEX ix_set_name_lower ON set (LOWER(name));
```

### Migration Considerations

1. Check for existing duplicate names (case-insensitive) before adding index
2. If duplicates exist, migration should fail with descriptive error
3. Sequence initialization: Start at 1 or at max existing `set_XXXX` number + 1

## Validation Rules

### Set Name

| Rule | Description | Error Code |
|------|-------------|------------|
| Required | Name cannot be empty | RequiredValidator |
| MaxLength | Name cannot exceed 200 characters | MaxLengthValidator |
| Unique | Name must be unique (case-insensitive) | UniquenessValidator |

## State Transitions

### Sequence Value

```text
[Initial: 1]
    |
    v
[Form Open] --> Read current value (no change)
    |
    v
[Save with set_XXXX pattern] --> Update to max(current, XXXX) + 1
    |
    v
[Save with custom name] --> No change
```

## Relationships

```text
Set (1) ----> (*) Entry
  |
  +-- Name: unique, case-insensitive

SetNameSequence (standalone database object)
  |
  +-- Provides next proposed number
  +-- Updated when set_XXXX pattern is saved
```
