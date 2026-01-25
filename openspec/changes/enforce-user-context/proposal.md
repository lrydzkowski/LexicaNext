# Change: Enforce User Context

## Why
Currently, the application operates in a global context where all users see all data. To support a multi-user environment and personal learning journeys, operations must be scoped to the currently signed-in user. This ensures data privacy and relevance.

## What Changes
- Data models (`Set`, `Word`) will associate records with a `UserId`.
- Database schema will be updated to include `user_id` columns and indices.
- API endpoints for Sets and Words will filter and create data based on the authenticated user's ID (from JWT).
- **BREAKING**: Existing data without `UserId` may become inaccessible or need migration (strategy: assign to a default/admin user or current user during migration).

## Impact
- **Affected Specs**: `sets`, `words`
- **Affected Code**: 
    - `LexicaNext.Core`: Domain models and CQRS handlers.
    - `LexicaNext.Infrastructure`: EF Core configurations and repositories.
    - `LexicaNext.WebApp`: Authentication context integration.
