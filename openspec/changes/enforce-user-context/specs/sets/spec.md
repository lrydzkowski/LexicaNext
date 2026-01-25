## ADDED Requirements

### Requirement: User Scoped Sets
All operations on Sets MUST be scoped to the authenticated user.

#### Scenario: List sets for current user
- **WHEN** user requests their list of sets
- **THEN** only sets created by that user are returned

#### Scenario: Create set with ownership
- **WHEN** user creates a new set
- **THEN** the set is persisted with the user's unique identifier

#### Scenario: Prevent access to others' sets
- **WHEN** user attempts to access a set ID belonging to another user
- **THEN** the system returns a Not Found or Forbidden error
