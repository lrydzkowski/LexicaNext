# Quickstart: Independent Word Management

**Date**: 2025-12-27
**Feature**: 001-independent-words

## Prerequisites

- .NET 10.0 SDK
- Node.js 20+
- PostgreSQL (or Docker for containerized DB)
- Auth0 account configured

## Local Development Setup

### 1. Backend

```bash
# From repository root
cd LexicaNext.WebApp

# Run the application (includes automatic migration)
dotnet run
```

The API will be available at `https://localhost:7226`.

### 2. Frontend

```bash
# From repository root
cd Frontend/lexica-next-front

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Key Files to Modify

### Backend (in order)

1. **Database Entities**
   - `LexicaNext.Infrastructure/Db/Common/Entities/WordEntity.cs` - Add CreatedAt, EditedAt
   - `LexicaNext.Infrastructure/Db/Common/Entities/SetWordEntity.cs` - NEW join table

2. **Entity Configurations**
   - `LexicaNext.Infrastructure/Db/Common/Configurations/WordEntityTypeConfiguration.cs` - Update schema
   - `LexicaNext.Infrastructure/Db/Common/Configurations/SetWordEntityTypeConfiguration.cs` - NEW

3. **Database Migration**
   ```bash
   cd LexicaNext.Infrastructure
   dotnet ef migrations add IndependentWords -o Db\Migrations
   ```

4. **Domain Models**
   - `LexicaNext.Core/Common/Models/Word.cs` - NEW independent word model

5. **Repository**
   - `LexicaNext.Infrastructure/Db/Repositories/WordsRepository.cs` - NEW

6. **CQRS Commands/Queries**
   - `LexicaNext.Core/Commands/CreateWord/` - NEW
   - `LexicaNext.Core/Commands/UpdateWord/` - NEW
   - `LexicaNext.Core/Commands/DeleteWord/` - NEW
   - `LexicaNext.Core/Queries/GetWord/` - NEW
   - `LexicaNext.Core/Queries/GetWords/` - NEW

7. **Endpoints**
   - Register new endpoints in `LexicaNext.WebApp/Program.cs`

### Frontend (in order)

1. **API Types**
   - Regenerate types after backend OpenAPI spec updates
   ```bash
   npm run generate-types  # or equivalent command
   ```

2. **API Hooks**
   - `src/hooks/api.ts` - Add word CRUD hooks

3. **Routes**
   - `src/config/links.ts` - Add word routes
   - `src/AppRouter.tsx` - Add word page routes

4. **Pages**
   - `src/pages/words/WordsPage.tsx` - NEW
   - `src/pages/words/WordNewPage.tsx` - NEW
   - `src/pages/words/WordEditPage.tsx` - NEW

5. **Components**
   - `src/components/words/WordsList.tsx` - NEW (based on SetsList)
   - `src/components/words/WordForm.tsx` - NEW (based on entry in SetForm)
   - `src/components/words/WordSelector.tsx` - NEW for set form

6. **Set Form Update**
   - `src/components/sets/SetForm.tsx` - Replace entry list with WordSelector

## Testing Endpoints

### Create Word

```bash
curl -X POST https://localhost:7226/api/words \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "word": "example",
    "wordType": "noun",
    "translations": ["przykład"],
    "exampleSentences": ["This is an example."]
  }'
```

### List Words

```bash
curl "https://localhost:7226/api/words?page=1&pageSize=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Create Set with Words

```bash
curl -X POST https://localhost:7226/api/sets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "setName": "My Set",
    "wordIds": ["word-uuid-1", "word-uuid-2"]
  }'
```

## Verification Checklist

- [ ] Words page loads at `/words`
- [ ] Can create a new word with translations
- [ ] Can search/filter words
- [ ] Can edit an existing word
- [ ] Can delete a word (shows affected sets warning)
- [ ] Set form shows word selection table
- [ ] Can create set by selecting existing words
- [ ] Can create word inline from set form
- [ ] Learning modes work with new word-set structure
