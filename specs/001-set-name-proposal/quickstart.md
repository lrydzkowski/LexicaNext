# Quickstart: Set Name Auto-Proposal

**Feature**: 001-set-name-proposal

## Prerequisites

- .NET 10.0 SDK
- Node.js 18+
- PostgreSQL database (running via Docker or locally)
- Database connection configured in `appsettings.Development.json`

## Implementation Steps Overview

### Backend

1. **Create Migration**

   ```bash
   cd LexicaNext.Infrastructure
   dotnet ef migrations add AddSetNameSequenceAndUniqueIndex -o Db\Migrations
   ```

2. **Add New Query Endpoint**

   Create files in `LexicaNext.Core/Queries/GetProposedSetName/`:
   - `GetProposedSetNameEndpoint.cs`
   - `Interfaces/IGetProposedSetNameRepository.cs`
   - `Models/GetProposedSetNameResponse.cs`

3. **Implement Repository Method**

   Add to `SetsRepository.cs`:
   - Implement `IGetProposedSetNameRepository`
   - Add method to read sequence value
   - Add method to update sequence on save

4. **Update Validators**

   Modify `CreateSetRequestValidator.cs` and `UpdateSetRequestValidator.cs`:
   - Ensure case-insensitive comparison in `SetExistsAsync`

5. **Register Endpoint**

   In `Program.cs`:

   ```csharp
   app.MapGetProposedSetNameEndpoint();
   ```

6. **Build and Verify**

   ```bash
   dotnet build LexicaNext.sln
   ```

### Frontend

1. **Add API Hook**

   In `src/hooks/api.ts`:

   ```typescript
   export const useProposedSetName = () => {
     const client = useApiClient();
     return useQuery({
       queryKey: ['proposedSetName'],
       queryFn: async () => {
         const { data } = await client.GET('/api/sets/proposed-name');
         return data!;
       },
       staleTime: 0,
     });
   };
   ```

2. **Update Set Form Component**

   Use the hook to pre-fill the name field when creating a new set.

3. **Regenerate API Types**

   ```bash
   npm run generate-types
   ```

4. **Build and Verify**

   ```bash
   cd Frontend/lexica-next-front
   npm run build
   ```

## Testing the Feature

1. Start the backend: `dotnet run --project LexicaNext.WebApp`
2. Start the frontend: `cd Frontend/lexica-next-front && npm run dev`
3. Open the new set form
4. Verify the name field shows `set_0001` (or next available)
5. Save the set, open form again, verify name increments
6. Try saving with duplicate name - verify error appears

## Key Files

| File | Purpose |
|------|---------|
| `LexicaNext.Core/Queries/GetProposedSetName/` | New endpoint |
| `LexicaNext.Infrastructure/Db/Repositories/SetsRepository.cs` | Repository implementation |
| `LexicaNext.Infrastructure/Db/Migrations/[New]/` | Database changes |
| `Frontend/lexica-next-front/src/hooks/api.ts` | Frontend hook |
