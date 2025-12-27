# Quickstart: AI-Generated Translations and Example Sentences

**Feature**: 001-ai-translations
**Date**: 2025-12-25

## Prerequisites

1. Azure AI Foundry project with gpt-5-mini model deployed
2. Azure CLI installed and authenticated (`az login`)
3. .NET 10.0 SDK
4. Node.js 20+
5. PostgreSQL database (existing LexicaNext setup)

## Configuration

### 1. Set Environment Variables (using existing FoundryOptions)

**Development (appsettings.Development.json)**:

```json
{
  "Foundry": {
    "ProjectEndpoint": "https://your-resource.services.ai.azure.com/api/projects/your-project",
    "ModelDeploymentName": "gpt-5-mini",
    "ApiKey": "<project-api-key>"
  }
}
```

**Production (environment variables)**:

```bash
export Foundry__ProjectEndpoint="https://your-resource.services.ai.azure.com/api/projects/your-project"
export Foundry__ModelDeploymentName="gpt-5-mini"
export Foundry__ApiKey="<project-api-key>"
```

### 2. Install NuGet Packages

```bash
cd LexicaNext.Infrastructure
dotnet add package Azure.AI.Projects --prerelease
dotnet add package Azure.Identity
```

### 3. Run Database Migration

```bash
cd LexicaNext.Infrastructure
dotnet ef migrations add AddExampleSentences -o Db/Migrations
dotnet ef database update
```

## Verification Steps

### Backend Verification

1. Start the backend:

```bash
dotnet run --project LexicaNext.WebApp
```

2. Test translation generation:

```bash
curl -X POST https://localhost:7226/api/ai/translations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"word": "run", "wordType": "verb", "count": 3}'
```

Expected response:

```json
{
  "translations": ["biegać", "działać", "prowadzić"]
}
```

3. Test sentence generation:

```bash
curl -X POST https://localhost:7226/api/ai/sentences \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"word": "perseverance", "wordType": "noun", "count": 3}'
```

Expected response:

```json
{
  "sentences": [
    "Perseverance is the key to achieving long-term goals.",
    "Her perseverance through difficult times inspired everyone.",
    "Success requires both talent and perseverance."
  ]
}
```

### Frontend Verification

1. Start the frontend:

```bash
cd Frontend/lexica-next-front
npm run dev
```

2. Manual UI verification:
   - Navigate to Create Set or Edit Set page
   - Add a word with word type selected
   - Click "Generate Translations" button
   - Verify 3 translations appear and replace any existing
   - Click "Generate Sentences" button
   - Verify 3 sentences appear
   - Save the set
   - Navigate to Content page - verify sentences display
   - Enter Spelling Mode - verify sentences in results
   - Enter Full Mode - verify sentences in results
   - Enter Open Questions Mode - verify sentences in results

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "AI service unavailable" error | Check Azure credentials: `az account show` |
| No translations returned | Verify word type is selected before generating |
| Timeout errors | Check network connectivity to Azure endpoint |
| Sentences not persisting | Ensure set is saved after generating sentences |

## Performance Expectations

- Translation generation: <5 seconds
- Sentence generation: <5 seconds
- Both operations support manual retry on failure
