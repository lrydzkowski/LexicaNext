# Research: Independent Word Management

**Date**: 2025-12-27
**Feature**: 001-independent-words

## Research Summary

No critical unknowns require external research. All patterns are well-established in the existing codebase.

## Decision Log

### 1. Many-to-Many Relationship Strategy

**Decision**: Use explicit join table (SetWordEntity) with Order field

**Rationale**:

- Allows storing word order within each set independently
- Follows EF Core best practices for many-to-many with payload
- Enables future metadata on the relationship (e.g., added date)

**Alternatives considered**:

- EF Core implicit many-to-many: Rejected because we need the Order field
- Storing word IDs as JSON array in Set: Rejected due to query complexity and no referential integrity

### 2. Word Uniqueness Strategy

**Decision**: Unique constraint on (Word, WordTypeId)

**Rationale**:

- Matches spec requirement: "run" as Noun and "run" as Verb are distinct words
- Simple database-level enforcement
- Consistent with validation in CreateWordRequestValidator

**Alternatives considered**:

- Unique on Word only: Rejected per spec requirement
- Application-level uniqueness: Rejected, database constraints are more reliable

### 3. Cascade Delete Behavior

**Decision**: ON DELETE CASCADE for SetWord join table, ON DELETE CASCADE for Translations/ExampleSentences

**Rationale**:

- When a word is deleted, it should be removed from all sets automatically (FR-020)
- Translations and example sentences belong exclusively to a word
- Matches existing pattern for word→translations cascade

**Alternatives considered**:

- ON DELETE RESTRICT for SetWord: Rejected, spec says words can be deleted even if in sets
- Soft delete: Rejected, adds complexity and spec doesn't require it

### 4. Frontend Word Table Reuse

**Decision**: Create WordsList as a separate component, not a shared abstraction with SetsList

**Rationale**:

- Constitution V: "Three similar lines are better than a premature abstraction"
- Word and Set tables have different columns (Word has Word Type, Edited; Set has only Name, Created)
- Easier to maintain and extend independently

**Alternatives considered**:

- Generic DataTable component: Rejected, premature abstraction per constitution
- Copy-paste with modifications: Selected approach

### 5. Word Selector in Set Form

**Decision**: Embed word selection table directly in SetForm with inline word creation modal

**Rationale**:

- Matches clarification: "Allow inline word creation from the set form without navigating away"
- Consistent UX with existing form patterns
- WordSelector component can reuse WordsList logic

**Alternatives considered**:

- Separate page for word selection: Rejected per clarification
- Autocomplete/typeahead: Rejected, spec requires "table interface identical to words page"

### 6. Database Migration Strategy

**Decision**: Create fresh schema, drop existing data

**Rationale**:

- Per clarification: "Remove all existing data; start fresh with the new model"
- Simplifies migration significantly
- No dual-model complexity

**Alternatives considered**:

- Data migration: Originally considered, explicitly rejected by user

### 7. API Endpoint Structure

**Decision**: Follow existing /api/sets pattern for /api/words

**Rationale**:

- Consistency with existing API
- Familiar patterns for frontend integration
- OpenAPI spec will document both resources identically

**Endpoints**:

- GET /api/words - List with pagination, sorting, search
- GET /api/words/{wordId} - Get single word
- POST /api/words - Create word
- PUT /api/words/{wordId} - Update word
- DELETE /api/words/{wordId} - Delete word
- GET /api/words/{wordId}/sets - Get sets containing this word (for delete warning)

## Technology Patterns Confirmed

| Pattern | Existing Example | Will Reuse |
|---------|------------------|------------|
| CQRS Commands | CreateSet, UpdateSet, DeleteSet | Yes |
| CQRS Queries | GetSets, GetSet | Yes |
| FluentValidation | CreateSetRequestValidator | Yes |
| Repository Pattern | SetsRepository | Yes |
| TanStack Query hooks | useSets, useCreateSet | Yes |
| Mantine Table | SetsList | Yes |
| Mantine Form | SetForm | Yes |

## No External Research Required

All implementation patterns exist in the codebase. No third-party libraries or new technologies needed.
