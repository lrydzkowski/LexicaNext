# Implementation Plan: Extend Back-End E2E Tests

**Branch**: `002-extend-e2e-tests` | **Date**: 2026-02-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-extend-e2e-tests/spec.md`

## Summary

Extend the existing integration test suite in `LexicaNext.WebApp.Tests.Integration` to cover all 17 endpoints with comprehensive happy-path and error/validation test cases. Follow the AsyncJobsTemplate test architecture: each endpoint gets its own test class with exactly 2 test methods (`ShouldBeSuccessful` / `ShouldBeUnsuccessful`), test case data defined in independent static classes, and Verify.Xunit for snapshot-based assertions. Reuse existing test infrastructure (WebApiFactory, Testcontainers PostgreSQL, WireMock, NSubstitute).

## Technical Context

**Language/Version**: C# / .NET 10.0
**Primary Dependencies**: xUnit 2.9.3, Microsoft.AspNetCore.Mvc.Testing, Testcontainers.PostgreSql, WireMock.Net, NSubstitute, Verify.Xunit
**Storage**: PostgreSQL (via Testcontainers, already configured)
**Testing**: xUnit with collection fixtures sharing WebApiFactory instance
**Target Platform**: Windows/Linux (CI)
**Project Type**: Integration test project extending existing web application
**Performance Goals**: Test suite completes within reasonable CI feedback loop
**Constraints**: Tests share a single PostgreSQL container per collection to minimize startup overhead
**Scale/Scope**: 17 endpoints, 124 individual test cases across 17 test classes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution file is not configured for this project (placeholder template). No gates to enforce. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/002-extend-e2e-tests/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── test-cases.md
└── tasks.md
```

### Source Code (repository root)

```text
LexicaNext.WebApp.Tests.Integration/
├── Api/                                    # Existing auth tests (unchanged)
│   ├── ApiAuth0Tests.cs
│   ├── ApiKeyTests.cs
│   ├── EndpointHelpers.cs
│   └── EndpointInfo.cs
├── Features/                               # NEW: Feature-level endpoint tests
│   ├── App/
│   │   └── GetAppStatus/
│   │       └── GetAppStatusTests.cs
│   ├── Words/
│   │   ├── GetWords/
│   │   │   ├── GetWordsTests.cs
│   │   │   └── Data/
│   │   │       ├── TestCaseData.cs
│   │   │       ├── CorrectTestCases/
│   │   │       │   ├── CorrectTestCasesGenerator.cs
│   │   │       │   └── TestCase01.cs, TestCase02.cs, ...
│   │   │       └── IncorrectTestCases/
│   │   │           ├── IncorrectTestCasesGenerator.cs
│   │   │           └── TestCase01.cs, TestCase02.cs, ...
│   │   ├── GetWord/
│   │   │   ├── GetWordTests.cs
│   │   │   └── Data/ (same structure)
│   │   ├── GetWordSets/
│   │   │   ├── GetWordSetsTests.cs
│   │   │   └── Data/
│   │   ├── CreateWord/
│   │   │   ├── CreateWordTests.cs
│   │   │   └── Data/
│   │   ├── UpdateWord/
│   │   │   ├── UpdateWordTests.cs
│   │   │   └── Data/
│   │   └── DeleteWords/
│   │       ├── DeleteWordsTests.cs
│   │       └── Data/
│   ├── Sets/
│   │   ├── GetSets/
│   │   │   ├── GetSetsTests.cs
│   │   │   └── Data/
│   │   ├── GetSet/
│   │   │   ├── GetSetTests.cs
│   │   │   └── Data/
│   │   ├── GetProposedSetName/
│   │   │   ├── GetProposedSetNameTests.cs
│   │   │   └── Data/
│   │   ├── CreateSet/
│   │   │   ├── CreateSetTests.cs
│   │   │   └── Data/
│   │   ├── UpdateSet/
│   │   │   ├── UpdateSetTests.cs
│   │   │   └── Data/
│   │   └── DeleteSets/
│   │       ├── DeleteSetsTests.cs
│   │       └── Data/
│   ├── Answers/
│   │   └── RegisterAnswer/
│   │       ├── RegisterAnswerTests.cs
│   │       └── Data/
│   ├── Translations/
│   │   └── GenerateTranslations/
│   │       ├── GenerateTranslationsTests.cs
│   │       └── Data/
│   ├── Sentences/
│   │   └── GenerateExampleSentences/
│   │       ├── GenerateExampleSentencesTests.cs
│   │       └── Data/
│   └── Recordings/
│       └── GetRecording/
│           ├── GetRecordingTests.cs
│           └── Data/
├── Common/                                 # Existing + extended infrastructure
│   ├── Authentication/
│   │   └── AllowAnonymous.cs               # Existing
│   ├── Data/
│   │   ├── TestContextScope.cs             # Existing (extend with new helpers)
│   │   └── Db/
│   │       ├── ContextScope.cs             # NEW: DB cleanup per test
│   │       ├── WordsData.cs                # NEW: Word seeding/reading helpers
│   │       ├── SetsData.cs                 # NEW: Set seeding/reading helpers
│   │       └── AnswersData.cs              # NEW: Answer seeding/reading helpers
│   ├── Extensions/
│   │   ├── VerifyScrubberExtensions.cs     # Existing
│   │   ├── StringExtensions.cs             # NEW: JSON prettify, indentation
│   │   └── NSubstituteExtensions.cs        # NEW: GetReceivedMethodCalls
│   ├── Logging/                            # Existing (unchanged)
│   ├── Models/
│   │   ├── ITestResult.cs                  # NEW: Base result interfaces
│   │   └── ReceivedMethodCall.cs           # NEW: NSubstitute call capture
│   ├── Services/
│   │   ├── EmbeddedFile.cs                 # Existing
│   │   └── VerifySettingsBuilder.cs        # Existing
│   ├── TestCases/
│   │   ├── ITestCaseData.cs                # NEW: Base test case interface
│   │   ├── BaseTestCaseData.cs             # NEW: Container for all test data
│   │   ├── DbTestCaseData.cs              # NEW: Database entities
│   │   ├── EnglishDictionaryApiTestCaseData.cs  # NEW: External API mock data
│   │   └── AiServiceTestCaseData.cs        # NEW: AI service mock data
│   ├── TestCollections/
│   │   ├── ApiTestCollection.cs            # Existing
│   │   └── MainTestsCollection.cs          # NEW: Collection for feature tests
│   ├── WebApplication/
│   │   ├── WebApiFactory.cs                # Existing (minor extensions)
│   │   ├── WebApiFactoryBuilder.cs         # Existing (add new builder methods)
│   │   └── Infrastructure/
│   │       ├── LoggingBuilder.cs           # Existing
│   │       ├── DependenciesBuilder.cs      # NEW: Orchestrate test dependencies
│   │       ├── EnglishDictionaryApiBuilder.cs  # NEW: WireMock setup
│   │       └── AiServiceBuilder.cs         # NEW: NSubstitute mock setup
│   └── TestConstants.cs                    # Existing
```

**Structure Decision**: Follows the AsyncJobsTemplate pattern with `Features/` directory organized by domain area (Words, Sets, Answers, Translations, Sentences, Recordings, App). Each endpoint gets its own subdirectory containing the test class and a `Data/` folder with test case definitions. Common infrastructure is extended in `Common/` alongside existing code.

## Complexity Tracking

No constitution violations to justify.
