# Backend feature folders

Status: complete

## Scope

Reorganize Core commands and queries by feature. Preserve runtime behavior,
HTTP contracts, and OpenAPI contracts. Update namespaces to match folders
and update their consumers across the solution.

Move each operation subtree to
`LexicaNext.Core/Features/<feature>/<operation>/`.
Retain each operation's internal folder structure.

## Folder mapping

Source paths are relative to `LexicaNext.Core`.

| Source operations | Feature |
| --- | --- |
| `Commands/{CreateSet,UpdateSet,DeleteSets}` | `Sets` |
| `Queries/{GetSet,GetSets,GetProposedSetName}` | `Sets` |
| `Commands/{CreateWord,UpdateWord,DeleteWords}` | `Words` |
| `Queries/{GetWord,GetWords,GetWordSets}` | `Words` |
| `Commands/RegisterAnswer` | `Answers` |
| `Queries/GetWordsStatistics` | `Answers` |
| `Queries/GetRandomOpenQuestionsPracticeEntries` | `Practice` |
| `Queries/GetWeakestOpenQuestionsPracticeEntries` | `Practice` |
| `Commands/GenerateTranslations` | `Translations` |
| `Commands/GenerateExampleSentences` | `Sentences` |
| `Queries/GetRecording` | `Recordings` |
| `Queries/GetAppStatus` | `App` |

The mapping follows the existing integration-test feature groups.
Keep existing API tags, including `Statistics` and `Generators`.

## Confirmed decisions

- Namespaces follow the new folder paths. Public CLR names change.
- Replace `IAiGenerationService` with individual feature interfaces.
- Preserve runtime behavior and API contracts during the reorganization.

## AI interfaces

Paths are relative to `LexicaNext.Core/Features`.
Each interface keeps the signature of its existing method:

- `Translations/GenerateTranslations/Interfaces` contains
  `ITranslationGenerationService` with `GenerateTranslationsAsync`.
- `Sentences/GenerateExampleSentences/Interfaces` contains
  `IExampleSentenceGenerationService` with `GenerateExampleSentencesAsync`.
- `Words/GenerateWords/Interfaces` contains
  `IWordGenerationService` with `GenerateWordsAsync`.

Place `GeneratedWord` in `Words/GenerateWords/Models`.
Word generation currently serves CLI seeding and has no HTTP endpoint.
Its placement under Words was confirmed during design.

Keep `AzureFoundryAiService` as the implementation of all three interfaces.
Preserve method signatures, prompts, serialization, and cancellation behavior.
Update endpoint and CLI consumers to use the relevant interfaces.
Register all three interfaces explicitly in Foundry registration because
the CLI does not call Core's assembly-scanning registration.
Map the interfaces to the same scoped Azure implementation instance.
Keep Core's existing assembly scanning.

## Other ownership boundaries

Keep Common models and Infrastructure implementations in their current folders.
Keep integration-test paths and verified snapshots unchanged.
The proposed move retains these existing cross-feature dependencies:

- Practice uses `EntryDto` and `ISetMapper` from `GetSet`.
- CreateSet and UpdateSet validators use `IGetWordRepository`.

The interface split does not require splitting the Azure implementation
or changing Practice mapping responsibilities.

## Verification plan

Establish a baseline before source changes. Use the repository CI commands:

```text
dotnet restore
dotnet build --configuration Release --no-restore
dotnet test --no-restore --verbosity normal
```

Repeat the build and tests after implementation. Compare OpenAPI output
before and after namespace changes. Verify CLI resolution of all three
interfaces and preserve the existing AI-client test substitution.
Review the final diff for unintended changes.

## Verification results

- Baseline restore and Release build passed with no warnings or errors.
- All 246 baseline tests passed.
- The implementation Release build passed with no warnings or errors.
- Both new DI test cases passed, with and without Core service registration.
- Generated OpenAPI output is byte-for-byte identical to the baseline.
- All 248 tests passed after implementation, including the two new DI cases.
- Whitespace verification passed for all edited source files.
- Markdown lint passed with default rules.
- Source review confirmed the planned moves, namespace changes, and AI wiring.
- Edited source files preserve encoding and use CRLF line endings.

The DI tests substitute the Azure client. They verify scoped instance sharing,
feature method results, and cancellation-token forwarding without live AI calls.
They do not execute CLI seeding against a database or Azure.
