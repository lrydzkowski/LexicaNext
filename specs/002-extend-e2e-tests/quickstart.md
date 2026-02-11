# Quickstart: Extend Back-End E2E Tests

## Prerequisites

- Docker running (required for Testcontainers PostgreSQL)
- .NET 10.0 SDK installed
- Project builds successfully: `dotnet build LexicaNext.sln`

## Implementation Order

### Phase 1: Common Infrastructure

Build the shared test infrastructure first. These are dependencies for all feature tests.

1. **Test case base classes** (`Common/TestCases/`)
   - `ITestCaseData.cs` - Base interface
   - `BaseTestCaseData.cs` - Container for Db, API, AI data
   - `DbTestCaseData.cs` - Database entity lists
   - `EnglishDictionaryApiTestCaseData.cs` - WireMock data
   - `AiServiceTestCaseData.cs` - NSubstitute behavior

2. **Test result models** (`Common/Models/`)
   - `ITestResult.cs` - Base result interfaces
   - `ReceivedMethodCall.cs` - NSubstitute call capture model

3. **Test collection** (`Common/TestCollections/`)
   - `MainTestsCollection.cs` - New collection for feature tests

4. **Database context scope** (`Common/Data/`)
   - `Db/ContextScope.cs` - DB cleanup on dispose
   - Extend `TestContextScope.cs` with Db property

5. **Data helpers** (`Common/Data/Db/`)
   - `WordsData.cs` - CreateWordsAsync, GetWordsAsync extension methods
   - `SetsData.cs` - CreateSetsAsync, GetSetsAsync extension methods
   - `AnswersData.cs` - CreateAnswersAsync, GetAnswersAsync extension methods

6. **Factory extensions** (`Common/WebApplication/`)
   - Add `WithMockedUserContext(userId)` to `WebApiFactoryBuilder.cs`
   - `Infrastructure/DependenciesBuilder.cs` - Orchestrator
   - `Infrastructure/EnglishDictionaryApiBuilder.cs` - WireMock setup
   - `Infrastructure/AiServiceBuilder.cs` - NSubstitute mock setup

7. **Utility extensions** (`Common/Extensions/`)
   - `StringExtensions.cs` - PrettifyJson, AddIndentation
   - `NSubstituteExtensions.cs` - GetReceivedMethodCalls

8. **Verify scrubber updates** - Add GUID, datetime, PostgreSQL host scrubbers

### Phase 2: Simple Endpoints (no external dependencies)

Start with the simplest endpoints to validate the infrastructure works.

1. **GetAppStatus** - Trivial endpoint, validates factory works
2. **RegisterAnswer** - Simple write, no DB reads needed for setup
3. **GetProposedSetName** - Simple read, minimal seed data

### Phase 3: Word CRUD Endpoints

These form the foundation for set tests.

4. **CreateWord** - Write endpoint with validation
5. **GetWord** - Read single word
6. **GetWords** - List with pagination/sorting/filtering
7. **GetWordSets** - Read word's sets
8. **UpdateWord** - Update with validation
9. **DeleteWords** - Bulk delete

### Phase 4: Set CRUD Endpoints

Depend on words existing in the database.

10. **CreateSet** - Write endpoint with word ID validation
11. **GetSet** - Read single set with entries
12. **GetSets** - List with pagination/sorting/filtering
13. **UpdateSet** - Update with word ID validation
14. **DeleteSets** - Bulk delete

### Phase 5: External Service Endpoints

Require WireMock or NSubstitute mock setup.

15. **GenerateTranslations** - AI service mock
16. **GenerateExampleSentences** - AI service mock
17. **GetRecording** - WireMock + storage mock

## Key Patterns to Follow

### Test Class Template

```csharp
[Collection(MainTestsCollection.CollectionName)]
[Trait(TestConstants.Category, MainTestsCollection.CollectionName)]
public class <Endpoint>Tests
{
    private readonly WebApplicationFactory<Program> _webApiFactory;
    private readonly LogMessages _logMessages;
    private readonly VerifySettings _verifySettings;

    public <Endpoint>Tests(WebApiFactory webApiFactory)
    {
        _webApiFactory = webApiFactory.DisableAuth();
        _logMessages = webApiFactory.LogMessages;
        _verifySettings = webApiFactory.VerifySettings;
    }

    [Fact]
    public async Task <Action>_ShouldBeSuccessful()
    {
        List<<Result>TestResult> results = [];
        foreach (TestCaseData testCase in CorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }
        await Verify(results, _verifySettings);
    }

    [Fact]
    public async Task <Action>_ShouldBeUnsuccessful()
    {
        List<<Result>TestResult> results = [];
        foreach (TestCaseData testCase in IncorrectTestCasesGenerator.Generate())
        {
            results.Add(await RunAsync(testCase));
        }
        await Verify(results, _verifySettings);
    }

    private async Task<<Result>TestResult> RunAsync(TestCaseData testCase)
    {
        WebApplicationFactory<Program> webApiFactory =
            _webApiFactory.WithDependencies(testCase);
        await using TestContextScope contextScope = new(webApiFactory, _logMessages);
        await contextScope.SeedDataAsync(testCase);

        HttpClient client = webApiFactory.CreateClient();
        // ... make request, collect result ...
    }
}
```

### Test Case Data Template

```csharp
internal static class TestCase01
{
    public static TestCaseData Get()
    {
        return new TestCaseData
        {
            TestCaseId = 1,
            Data = new BaseTestCaseData
            {
                Db = new DbTestCaseData
                {
                    Words = [ /* seed entities */ ]
                }
            }
        };
    }
}
```

### Database Cleanup

```csharp
internal class ContextScope : IDisposable
{
    public void Dispose()
    {
        // Order matters - respect foreign keys
        RemoveData("set_word");
        RemoveData("translation");
        RemoveData("example_sentence");
        RemoveData("set");
        RemoveData("word");
        RemoveData("recording");
        RemoveData("answer");
        RemoveData("user_set_sequence");
    }

    private void RemoveData(string tableName)
    {
        Context.Database.ExecuteSqlRaw($"DELETE FROM \"{tableName}\"");
    }
}
```

## Running Tests

```bash
# Run all integration tests
dotnet test LexicaNext.WebApp.Tests.Integration

# Run only feature tests
dotnet test LexicaNext.WebApp.Tests.Integration --filter "Category=E2E.Main"

# Run specific endpoint tests
dotnet test LexicaNext.WebApp.Tests.Integration --filter "FullyQualifiedName~CreateWordTests"

# Update Verify snapshots (first run or after intentional changes)
dotnet test LexicaNext.WebApp.Tests.Integration -- Verify.AutoVerify=true
```
