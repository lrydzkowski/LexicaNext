# Research: AI-Generated Translations and Example Sentences

**Feature**: 001-ai-translations
**Date**: 2025-12-25

## 1. Azure AI Foundry Integration

### Decision: Use Azure.AI.Projects SDK with gpt-5-mini

**Rationale**: User specified Microsoft Foundry with gpt-5-mini model. Azure AI Foundry provides managed infrastructure, authentication via Azure Identity, and simple chat completion API.

**Required NuGet Packages**:

```xml
<PackageReference Include="Azure.AI.Projects" Version="1.0.0-beta.*" />
<PackageReference Include="Azure.Identity" Version="1.*" />
```

**Client Initialization Pattern** (using existing FoundryOptions):

```csharp
using Azure.AI.Projects;
using Azure.Identity;
using Microsoft.Extensions.Options;

public class AzureFoundryAiService : IAiGenerationService, IScopedService
{
    private readonly AIProjectClient _projectClient;
    private readonly string _modelDeploymentName;

    public AzureFoundryAiService(IOptions<FoundryOptions> options)
    {
        var foundryOptions = options.Value;

        var credential = new AzureKeyCredential(foundryOptions.ApiKey);

        _projectClient = new AIProjectClient(
            new Uri(foundryOptions.ProjectEndpoint),
            credential);

        _modelDeploymentName = foundryOptions.ModelDeploymentName;
    }
}
```

**Existing Configuration** (`LexicaNext.Infrastructure/Foundry/FoundryOptions.cs`) - needs extension:

```csharp
internal class FoundryOptions
{
    public const string Position = "Foundry";
    public string ProjectEndpoint { get; init; } = "";
    public string ModelDeploymentName { get; init; } = "";
    public string ApiKey { get; init; } = "";  // NEW - Project API key from Azure AI Foundry
}
```

**Chat Completion Pattern**:

```csharp
var responseClient = _projectClient.OpenAI
    .GetProjectResponsesClientForModel(_modelDeploymentName);

var response = await responseClient.CreateResponseAsync(prompt);
var result = response.GetOutputText();
```

**Alternatives Considered**:
- Direct OpenAI API: Rejected - user specified Azure Foundry
- Azure OpenAI Service (classic): Rejected - Foundry is newer, user preference
- Local LLM: Rejected - requires infrastructure, user wants cloud service

## 2. Prompt Engineering for Translations

### Decision: Structured JSON response with word type context

**Rationale**: JSON ensures parseable output. Including word type improves translation accuracy for polysemous words.

**Translation Prompt Template**:

```text
You are a professional English-Polish translator. Translate the English word "{word}"
used as a {wordType} into Polish.

Return exactly {count} translations ordered from most commonly used to least commonly used.

Respond ONLY with a JSON array of strings, no explanation:
["translation1", "translation2", "translation3"]
```

**Example**:
- Input: word="run", wordType="verb", count=3
- Output: `["biegać", "działać", "prowadzić"]`

**Error Handling**:
- Parse failure: Return empty array, show "No translations found" message
- Timeout (>5s): Abort, show retry button

## 3. Prompt Engineering for Example Sentences

### Decision: B1-B2 complexity with structured output

**Rationale**: Spec requires intermediate complexity. Single word focus ensures relevance.

**Example Sentence Prompt Template**:

```text
Generate {count} example sentences in English using the word "{word}" as a {wordType}.

Requirements:
- Sentences must be at B1-B2 English level (intermediate complexity)
- Use common vocabulary and standard grammar structures
- Each sentence should be 10-20 words long
- Sentences should demonstrate different contexts/meanings

Respond ONLY with a JSON array of strings, no explanation:
["Sentence one.", "Sentence two.", "Sentence three."]
```

**Example**:
- Input: word="perseverance", wordType="noun", count=3
- Output: `["Perseverance is the key to achieving long-term goals.", "Her perseverance through difficult times inspired everyone around her.", "Success requires both talent and perseverance."]`

## 4. Database Schema Extension

### Decision: New example_sentence table linked to word

**Rationale**: Follows existing pattern (translation table linked to word). Maintains referential integrity.

**Schema**:

```sql
CREATE TABLE example_sentence (
    example_sentence_id UUID PRIMARY KEY,
    sentence VARCHAR(500) NOT NULL,
    "order" INT NOT NULL,
    word_id UUID NOT NULL REFERENCES word(word_id) ON DELETE CASCADE
);

CREATE INDEX ix_example_sentence_word_id ON example_sentence(word_id);
```

**EF Core Entity**:

```csharp
public class ExampleSentenceEntity
{
    public Guid ExampleSentenceId { get; set; }
    public string Sentence { get; set; } = string.Empty;
    public int Order { get; set; }
    public Guid WordId { get; set; }
    public WordEntity Word { get; set; } = null!;
}
```

## 5. API Endpoint Design

### Decision: Separate endpoints for translation and sentence generation

**Rationale**: Single responsibility. Independent operations per spec. Matches existing endpoint patterns.

**Endpoints**:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/ai/translations` | Generate translations for a word |
| POST | `/api/ai/sentences` | Generate example sentences for a word |

**Request/Response**:

```csharp
// Generate Translations
public record GenerateTranslationsRequest(string Word, string WordType, int Count = 3);
public record GenerateTranslationsResponse(List<string> Translations);

// Generate Example Sentences
public record GenerateExampleSentencesRequest(string Word, string WordType, int Count = 3);
public record GenerateExampleSentencesResponse(List<string> Sentences);
```

**Alternatives Considered**:
- Single endpoint with operation parameter: Rejected - violates single responsibility
- GraphQL mutations: Rejected - project uses REST pattern

## 6. Frontend Integration Pattern

### Decision: Mutation hooks with loading/error states

**Rationale**: Follows existing TanStack Query patterns. Provides consistent UX.

**Hook Pattern**:

```typescript
export function useGenerateTranslations() {
  const client = useApiClient();
  return useMutation({
    mutationFn: async (request: GenerateTranslationsRequest) => {
      const { data, error } = await client.POST('/api/ai/translations', {
        body: request,
      });
      if (error) throw error;
      return data;
    },
  });
}
```

**UI Integration**:
- Button triggers mutation
- Loading spinner during generation
- Error toast with "Try Again" on failure
- Success populates form fields

## 7. Configuration Management

### Decision: Use existing FoundryOptions configuration

**Rationale**: Infrastructure already has `FoundryOptions` class registered via `AddFoundryServices()`. Reuse existing pattern.

**Extended Configuration Structure** (`appsettings.json`):

```json
{
  "Foundry": {
    "ProjectEndpoint": "https://<resource>.services.ai.azure.com/api/projects/<project>",
    "ModelDeploymentName": "gpt-5-mini",
    "ApiKey": "<project-api-key>"
  }
}
```

**Environment Variables** (Docker/Production):

```bash
Foundry__ProjectEndpoint=https://...
Foundry__ModelDeploymentName=gpt-5-mini
Foundry__ApiKey=<project-api-key>
```

**Service Registration** (already exists in `ServiceCollectionExtensions.cs`):

```csharp
services.AddOptionsType<FoundryOptions>(configuration, FoundryOptions.Position);
```

**Authentication**: AzureKeyCredential with Project API key:

```csharp
new AzureKeyCredential(foundryOptions.ApiKey)
```

## 8. Error Handling Strategy

### Decision: Fail fast with user-friendly messages

**Rationale**: Per spec FR-013 and clarification - manual retry only.

**Error Categories**:

| Error Type | User Message | Action |
|------------|--------------|--------|
| Network timeout | "Generation timed out. Please try again." | Show retry button |
| AI service error | "AI service unavailable. Please try again." | Show retry button |
| Parse failure | "No translations found for this word." | No retry (valid response) |
| Invalid word type | "Please select a word type first." | Highlight word type field |

## Summary

All technical decisions align with:
- User requirements (Azure Foundry, gpt-5-mini)
- Existing codebase patterns (Clean Architecture, CQRS, TanStack Query)
- Constitution principles (explicit dependencies, single responsibility, fail fast)
