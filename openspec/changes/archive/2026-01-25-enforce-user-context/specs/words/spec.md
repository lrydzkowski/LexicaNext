## ADDED Requirements

### Requirement: User Scoped Words
All operations on Words MUST be scoped to the authenticated user.

#### Scenario: List words for current user
- **WHEN** user searches for words
- **THEN** only words created by that user (or in their sets) are returned

#### Scenario: Create word with ownership
- **WHEN** user creates a new word
- **THEN** the word is persisted with the user's unique identifier

#### Scenario: Prevent modification of others' words
- **WHEN** user attempts to update or delete a word belonging to another user
- **THEN** the system returns a Not Found or Forbidden error
