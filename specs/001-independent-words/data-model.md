# Data Model: Independent Word Management

**Date**: 2025-12-27
**Feature**: 001-independent-words

## Entity Relationship Diagram

```text
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│     Set         │       │    SetWord      │       │     Word        │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ SetId (PK)      │───┐   │ SetId (PK,FK)   │   ┌───│ WordId (PK)     │
│ Name            │   └──>│ WordId (PK,FK)  │<──┘   │ Word            │
│ CreatedAt       │       │ Order           │       │ WordTypeId (FK) │
└─────────────────┘       └─────────────────┘       │ CreatedAt       │
                                                    │ EditedAt        │
                                                    └────────┬────────┘
                                                             │
                    ┌────────────────────────────────────────┼────────────────────────────────────────┐
                    │                                        │                                        │
                    ▼                                        ▼                                        ▼
        ┌─────────────────┐                      ┌─────────────────┐                      ┌─────────────────┐
        │   Translation   │                      │ ExampleSentence │                      │    WordType     │
        ├─────────────────┤                      ├─────────────────┤                      ├─────────────────┤
        │ TranslationId   │                      │ ExampleSentence │                      │ WordTypeId (PK) │
        │ Translation     │                      │   Id (PK)       │                      │ Name            │
        │ Order           │                      │ Sentence        │                      └─────────────────┘
        │ WordId (FK)     │                      │ Order           │
        └─────────────────┘                      │ WordId (FK)     │
                                                 └─────────────────┘
```

## Entities

### Word (Modified)

Independent vocabulary item. Primary aggregate root.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| WordId | UUID v7 | PK | Auto-generated |
| Word | string | Required, 1-200 chars | The English word |
| WordTypeId | UUID | FK to WordType | Required |
| CreatedAt | DateTimeOffset | Required | Auto-set on creation |
| EditedAt | DateTimeOffset | Nullable | Auto-set on update |

**Unique Constraint**: (Word, WordTypeId) - same word can exist with different types

**Relationships**:

- Has many Translations (1:N, cascade delete)
- Has many ExampleSentences (1:N, cascade delete)
- Belongs to many Sets via SetWord (N:M)
- References one WordType (N:1)

### SetWord (New)

Join table for Set-Word many-to-many relationship.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| SetId | UUID | PK, FK to Set | Composite key part 1 |
| WordId | UUID | PK, FK to Word | Composite key part 2 |
| Order | int | Required | Display order in set |

**Cascade Behavior**:

- ON DELETE CASCADE from Set
- ON DELETE CASCADE from Word

### Set (Modified)

Collection of vocabulary items for study.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| SetId | UUID v7 | PK | Auto-generated |
| Name | string | Required, 1-200 chars, unique | Set name |
| CreatedAt | DateTimeOffset | Required | Auto-set on creation |

**Relationships**:

- Has many Words via SetWord (N:M)

**Changes from current**:

- Remove direct Words navigation property
- Add SetWords navigation property

### Translation (Unchanged)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| TranslationId | UUID v7 | PK | Auto-generated |
| Translation | string | Required, 1-200 chars | Polish translation |
| Order | int | Required | Display order |
| WordId | UUID | FK to Word | Required |

### ExampleSentence (Unchanged)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| ExampleSentenceId | UUID v7 | PK | Auto-generated |
| Sentence | string | Required, 1-500 chars | Example usage |
| Order | int | Required | Display order |
| WordId | UUID | FK to Word | Required |

### WordType (Unchanged)

Seeded enum table.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| WordTypeId | UUID | PK | Seeded |
| Name | string | Required, unique | None, Noun, Verb, Adjective, Adverb |

## Validation Rules

### Word Validation

```text
Word:
  - Required
  - Length: 1-200 characters
  - Unique per WordType (case-insensitive)

WordType:
  - Required
  - Must be valid enum value

Translations:
  - At least 1 required
  - Each: 1-200 characters

ExampleSentences:
  - Optional
  - Each: 1-500 characters
```

### Set Validation

```text
Name:
  - Required
  - Length: 1-200 characters
  - Unique (case-insensitive)

Words:
  - At least 1 required for learning modes
  - No duplicate WordIds in same set
```

## State Transitions

### Word Lifecycle

```text
[Created] ──> [Active] ──> [Deleted]
                 │
                 └──> [Edited] ──> [Active]
```

- Created: Word created with CreatedAt timestamp
- Active: Word exists, can be referenced by sets
- Edited: Word modified, EditedAt updated
- Deleted: Word removed, cascade removes from all sets

### Set-Word Association

```text
Word Created ──> Available for Selection
                        │
                        ▼
            Set Created/Edited + Word Selected
                        │
                        ▼
               SetWord Entry Created
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
    Word Removed from Set    Word Deleted
              │                   │
              ▼                   ▼
    SetWord Entry Deleted   SetWord Cascade Delete
```

## Migration Strategy

Since all existing data will be removed:

1. Drop existing word, translation, example_sentence, set tables
2. Create new schema with SetWord join table
3. Re-seed word_type table
4. No data migration needed

## Indexes

| Table | Columns | Type | Purpose |
|-------|---------|------|---------|
| word | (word, word_type_id) | Unique | Enforce word uniqueness per type |
| word | word | B-tree | Search performance |
| word | created_at | B-tree | Sorting |
| word | edited_at | B-tree | Sorting |
| set_word | (set_id, order) | B-tree | Ordered word retrieval |
| translation | word_id | B-tree | FK lookup |
| example_sentence | word_id | B-tree | FK lookup |
