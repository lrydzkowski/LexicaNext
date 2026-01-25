## Context
The application currently stores all vocabulary sets and words in a global namespace. To support multiple users, we need to enforce data isolation at the application level.

## Goals / Non-Goals
- **Goals**: 
    - Isolate User A's data from User B.
    - Ensure new data is automatically tagged with the creator's ID.
- **Non-Goals**: 
    - "Teams" or "Shared Sets" (out of scope for now).
    - Complex RBAC beyond "Owner" access.

## Decisions
- **Decision**: Add `UserId` (string/GUID) to `Set` and `Word` aggregates.
    - **Rationale**: Direct ownership model is simplest for the current requirements. Auth0 provides the User ID (sub).
- **Decision**: Enforce filtering in CQRS Query Handlers and Command Handlers.
    - **Rationale**: Keeps security logic close to the business operation.
- **Decision**: Database column will be `user_id` (indexed).
    - **Rationale**: Essential for performance when filtering sets by user.

## Risks / Trade-offs
- **Risk**: Orphaned data during migration.
    - **Mitigation**: In a real production scenario, we'd run a script to assign existing rows to a specific admin user. For this proposal, we will assume a fresh start or simple migration is acceptable.
