# Research: Extend Back-End E2E Tests

## Decision 1: External Service Mocking Strategy

**Decision**: Use WireMock for HTTP-based external APIs (English Dictionary) and NSubstitute for SDK-based services (Azure Foundry AI).

**Rationale**:

- English Dictionary API communicates via HTTP (`IHttpClientFactory` with named client `EnglishDictionaryHttpClient`). WireMock intercepts HTTP calls by redirecting the base URL to the WireMock server. This tests the full HTTP pipeline including serialization.
- Azure Foundry AI Service uses the Azure.AI.Projects SDK (`ProjectResponsesClient`), not HTTP. WireMock cannot intercept SDK calls. NSubstitute mocks `IAiGenerationService` at the interface level, which is sufficient since the SDK integration is not our code to test.

**Alternatives considered**:

- Mock both with NSubstitute: Would miss HTTP serialization/deserialization bugs in the dictionary API path.
- Mock both with WireMock: Not possible for Azure Foundry SDK.
- Use a real AI service in tests: Non-deterministic, slow, costly, and requires credentials.

## Decision 2: Database Initialization Strategy

**Decision**: Share one PostgreSQL container per xUnit collection. Seed data per test case via `TestContextScope`, clean up via `DELETE FROM` in `ContextScope.Dispose()`.

**Rationale**:

- Starting a PostgreSQL container takes 3-5 seconds. Sharing one container across all feature tests minimizes overhead.
- EF Core migrations run once during `WebApiFactory.InitializeAsync()`, which seeds the `word_type` reference data (5 records: None, Noun, Verb, Adjective, Adverb).
- Each test case seeds its own data (words, translations, sets, etc.) and cleans up after itself, ensuring test isolation.
- Cleanup uses raw SQL `DELETE FROM` statements (PostgreSQL syntax: `TRUNCATE ... RESTART IDENTITY CASCADE` or `DELETE FROM`) rather than EF Core tracking to avoid stale context issues.

**Alternatives considered**:

- Container per test class: Too slow (~3-5s overhead per class, 17 classes = ~60s wasted).
- Transaction rollback: Doesn't work well with WebApplicationFactory because the HTTP client and server use different scopes.
- Database per test (schema isolation): Overcomplicated for this scale.

## Decision 3: Test Data Organization Pattern

**Decision**: Follow AsyncJobsTemplate pattern with independent static test case classes.

**Rationale**:

- Each test case is a separate static class (`TestCase01`, `TestCase02`, etc.) with a single `Get()` method returning a `TestCaseData` instance.
- Generator classes (`CorrectTestCasesGenerator`, `IncorrectTestCasesGenerator`) yield all test cases for a category.
- This pattern makes each test case self-contained, easy to add/remove, and independently reviewable.
- Feature-specific `TestCaseData` extends `ITestCaseData` with endpoint-specific properties (e.g., `WordId`, request body content).

**Alternatives considered**:

- Inline test data in test methods: Clutters test classes, harder to maintain.
- `[Theory]` with `[MemberData]`: Would require exposing generator in the test class itself, mixing concerns.
- Shared test data fixtures: Couples tests together, making failures harder to diagnose.

## Decision 4: User Context Handling

**Decision**: Add `WithMockedUserContext(string userId)` builder extension that replaces `IUserContextResolver` with an NSubstitute mock.

**Rationale**:

- `IUserContextResolver.GetUserId()` reads from `HttpContext.User.Claims`. When authentication is disabled via `DisableAuth()`, no claims are present, so `GetUserId()` returns `null`.
- All data-bearing endpoints require a user ID for data isolation. Without mocking `IUserContextResolver`, queries would fail or return no data.
- Using NSubstitute to return a fixed test user ID is consistent with the AsyncJobsTemplate pattern (`WithCustomUserEmail`).
- The test user ID should be a constant (e.g., `"test-user-id"`) used across all test case data.

**Alternatives considered**:

- Inject fake claims into HttpContext: More complex, requires middleware configuration, and the existing `DisableAuth()` already strips auth.
- Use a real Auth0 token: Non-deterministic, requires Auth0 tenant access, defeats the purpose of isolated tests.

## Decision 5: Recording Storage in Tests

**Decision**: Mock `IRecordingStorage` with NSubstitute for GetRecording tests. Configure via `AiServiceBuilder` pattern.

**Rationale**:

- `IRecordingStorage` uses file system operations (`File.Exists`, `File.ReadAllBytesAsync`, `File.WriteAllBytesAsync`). Using real file I/O in tests introduces file system dependencies and cleanup concerns.
- Mocking `IRecordingStorage` lets us control cache hit/miss scenarios precisely: return `byte[]` for cached recordings, return `null` for uncached.
- The English Dictionary API (HTTP-based) is mocked via WireMock for the "fetch from external API" path.

**Alternatives considered**:

- Use a temp directory: Works but adds file system cleanup logic and platform-specific path issues.
- Use in-memory file system abstraction: Overengineered for this use case.

## Decision 6: Test Collection Strategy

**Decision**: Create a new `MainTestsCollection` for feature tests, separate from the existing `ApiTestCollection`.

**Rationale**:

- The existing `ApiTestCollection` ("Integration.Api") is used by `ApiAuth0Tests` and `ApiKeyTests`. These tests verify authentication enforcement across all endpoints.
- Feature tests have different setup needs (disabled auth, mocked user context, mocked external services). Mixing them in the same collection would complicate the shared factory state.
- A separate collection ensures feature tests get their own `WebApiFactory` instance with appropriate defaults.

**Alternatives considered**:

- Share `ApiTestCollection`: Would require conditional factory configuration, increasing complexity.
- No collection (factory per class): Too slow, each class would spin up its own PostgreSQL container.

## Decision 7: Verify.Xunit Scrubber Configuration

**Decision**: Extend existing `VerifySettings` with additional scrubbers for GUIDs, PostgreSQL connection strings, and datetime values.

**Rationale**:

- GUIDs are generated dynamically (word IDs, set IDs, etc.) and must be scrubbed for deterministic snapshots. Use `ScrubInlineGuids()`.
- PostgreSQL container connection strings contain dynamic ports. Add a scrubber to normalize `Host=...:port` patterns.
- DateTimeOffset values (CreatedAt, UpdatedAt, AnsweredAt) are dynamic. Use `ScrubInlineDateTimes()` with relevant formats.
- The existing `VerifySettingsBuilder` already handles some scrubbing; extend it with these additional patterns.

**Alternatives considered**:

- Fixed GUIDs in test data: Would work for input data but not for system-generated IDs (e.g., the returned `wordId` from POST /api/words).
- Manual string replacement in assertions: Fragile and verbose.

## Decision 8: Handling Internal Entity Visibility

**Decision**: Use existing `InternalsVisibleTo` attribute. `LexicaNext.Infrastructure` already exposes internals to `LexicaNext.WebApp.Tests.Integration`.

**Rationale**:

- Database entity classes (`WordEntity`, `SetEntity`, etc.) are `internal` in `LexicaNext.Infrastructure`.
- The `LexicaNext.Infrastructure.csproj` already contains `<InternalsVisibleTo Include="LexicaNext.WebApp.Tests.Integration" />`.
- This allows test data classes (`DbTestCaseData`) to directly reference entity types for database seeding.

**Alternatives considered**:

- Use repository interfaces for seeding: Would require creating test-specific seeding repositories, adding unnecessary abstraction.
- Make entities public: Violates existing architectural conventions.
