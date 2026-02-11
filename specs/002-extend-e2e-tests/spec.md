# Feature Specification: Extend Back-End E2E Tests

**Feature Branch**: `002-extend-e2e-tests`
**Created**: 2026-02-10
**Status**: Draft
**Input**: User description: "I want to extend back-end E2E tests present in LexicaNext.WebApp.Tests.Integration project. We should have test cases that cover all endpoints exposed by the BE. Test cases for each endpoint should be divided into two categories: correct ones, that cover happy paths, incorrect ones, that cover things like validation, and edge cases like when our dependencies don't work as expected."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Word CRUD Endpoint Tests (Priority: P1)

A developer runs the integration test suite and gets full confidence that all word management endpoints behave correctly for both valid and invalid inputs. This covers listing words, getting a single word, getting sets for a word, creating a word, updating a word, and deleting words.

**Why this priority**: Words are the core domain entity. Every other feature depends on words existing and being correctly managed. Ensuring word endpoints work correctly provides the foundation for all other tests.

**Independent Test**: Can be fully tested by creating, reading, updating, and deleting words through the API. Delivers confidence in the most fundamental data operations.

**Acceptance Scenarios**:

1. **Given** an authenticated user with no words, **When** they create a word with valid data (word, wordType, translations, exampleSentences), **Then** the system returns 201 Created with the new wordId and Location header.
2. **Given** an authenticated user with existing words, **When** they request the word list, **Then** the system returns 200 OK with paginated results.
3. **Given** an authenticated user with existing words, **When** they request a specific word by ID, **Then** the system returns 200 OK with full word details including translations and example sentences.
4. **Given** an authenticated user with a word that belongs to sets, **When** they request sets for that word, **Then** the system returns 200 OK with the list of sets containing that word.
5. **Given** an authenticated user, **When** they update a word with valid data, **Then** the system returns 204 No Content and the word is updated.
6. **Given** an authenticated user, **When** they delete words by IDs, **Then** the system returns 204 No Content and the words are removed.
7. **Given** an authenticated user, **When** they create a word with missing required fields, **Then** the system returns 400 Bad Request with validation errors.
8. **Given** an authenticated user, **When** they create a duplicate word (same word+wordType combination), **Then** the system returns 400 Bad Request.
9. **Given** an authenticated user, **When** they request a word that does not exist, **Then** the system returns 404 Not Found.
10. **Given** an authenticated user, **When** they create a word with values exceeding maximum length, **Then** the system returns 400 Bad Request with validation errors.
11. **Given** an authenticated user, **When** they list words with invalid pagination parameters (page=0, pageSize=201), **Then** the system returns 400 Bad Request.
12. **Given** an authenticated user, **When** they list words with an invalid timezone identifier, **Then** the system returns 400 Bad Request.

---

### User Story 2 - Set CRUD Endpoint Tests (Priority: P2)

A developer runs the integration test suite and gets full confidence that all vocabulary set management endpoints behave correctly. This covers listing sets, getting a single set, getting a proposed set name, creating a set, updating a set, and deleting sets.

**Why this priority**: Sets group words together and are the primary unit users interact with for studying. Testing sets depends on words existing first.

**Independent Test**: Can be fully tested by creating words first, then creating, reading, updating, and deleting sets. Delivers confidence in set management operations.

**Acceptance Scenarios**:

1. **Given** an authenticated user with existing words, **When** they create a set with valid word IDs, **Then** the system returns 201 Created with the new setId.
2. **Given** an authenticated user with existing sets, **When** they request the set list, **Then** the system returns 200 OK with paginated results.
3. **Given** an authenticated user, **When** they request a specific set by ID, **Then** the system returns 200 OK with full set details including entries.
4. **Given** an authenticated user, **When** they request a proposed set name, **Then** the system returns 200 OK with a name following the naming convention.
5. **Given** an authenticated user, **When** they update a set with valid word IDs, **Then** the system returns 204 No Content.
6. **Given** an authenticated user, **When** they delete sets by IDs, **Then** the system returns 204 No Content.
7. **Given** an authenticated user, **When** they create a set with non-existent word IDs, **Then** the system returns 400 Bad Request.
8. **Given** an authenticated user, **When** they create a set with duplicate word IDs, **Then** the system returns 400 Bad Request.
9. **Given** an authenticated user, **When** they create a set with an empty word list, **Then** the system returns 400 Bad Request.
10. **Given** an authenticated user, **When** they request a set that does not exist, **Then** the system returns 404 Not Found.
11. **Given** an authenticated user, **When** they list sets with invalid pagination parameters, **Then** the system returns 400 Bad Request.

---

### User Story 3 - Answer Registration Endpoint Tests (Priority: P3)

A developer runs the integration test suite and gets full confidence that the answer registration endpoint correctly records learning progress.

**Why this priority**: The answer endpoint is write-only with straightforward validation, making it an independent test target with moderate complexity.

**Independent Test**: Can be fully tested by posting answers with various valid and invalid payloads. Delivers confidence in learning progress tracking.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they submit a valid answer with question, givenAnswer, and expectedAnswer, **Then** the system returns 204 No Content.
2. **Given** an authenticated user, **When** they submit an answer without a givenAnswer (unanswered question), **Then** the system returns 204 No Content.
3. **Given** an authenticated user, **When** they submit an answer without the required question field, **Then** the system returns 400 Bad Request.
4. **Given** an authenticated user, **When** they submit an answer without the required expectedAnswer field, **Then** the system returns 400 Bad Request.
5. **Given** an authenticated user, **When** they submit an answer with fields exceeding maximum length (500 chars), **Then** the system returns 400 Bad Request.

---

### User Story 4 - AI Generation Endpoint Tests (Priority: P4)

A developer runs the integration test suite and gets full confidence that translation and example sentence generation endpoints handle both successful AI responses and AI service failures gracefully.

**Why this priority**: These endpoints depend on an external AI service, requiring mock behavior for both success and failure scenarios. They represent the most complex external integration.

**Independent Test**: Can be fully tested by mocking the AI service dependency and sending valid/invalid generation requests. Delivers confidence in AI integration reliability.

**Acceptance Scenarios**:

1. **Given** an authenticated user and a functioning AI service, **When** they request translation generation for a valid word, **Then** the system returns 200 OK with the requested number of translations.
2. **Given** an authenticated user and a functioning AI service, **When** they request sentence generation for a valid word, **Then** the system returns 200 OK with the requested number of sentences.
3. **Given** an authenticated user, **When** they request generation with missing required fields, **Then** the system returns 400 Bad Request.
4. **Given** an authenticated user, **When** they request generation with an invalid word type, **Then** the system returns 400 Bad Request.
5. **Given** an authenticated user, **When** they request generation with count outside valid range (0 or 11), **Then** the system returns 400 Bad Request.
6. **Given** an authenticated user and a non-responsive AI service, **When** they request translation generation, **Then** the system returns an appropriate error response.
7. **Given** an authenticated user and a non-responsive AI service, **When** they request sentence generation, **Then** the system returns an appropriate error response.

---

### User Story 5 - Recording Endpoint Tests (Priority: P5)

A developer runs the integration test suite and gets full confidence that the pronunciation recording endpoint correctly retrieves and caches audio files.

**Why this priority**: This endpoint has complex behavior involving local cache lookup and external dictionary API fallback, requiring multiple test scenarios for both cache hits and misses.

**Independent Test**: Can be fully tested by mocking the external dictionary service and local storage. Delivers confidence in audio retrieval reliability.

**Acceptance Scenarios**:

1. **Given** an authenticated user and a word with a cached recording, **When** they request the recording, **Then** the system returns 200 OK with the audio file.
2. **Given** an authenticated user and a word without a cached recording but available from the dictionary service, **When** they request the recording, **Then** the system returns 200 OK with the audio file and caches it.
3. **Given** an authenticated user, **When** they request a recording for a word with no pronunciation available, **Then** the system returns 404 Not Found.
4. **Given** an authenticated user, **When** they request a recording with an empty or excessively long word parameter, **Then** the system returns 400 Bad Request.
5. **Given** an authenticated user and a non-responsive dictionary service, **When** they request a recording for an uncached word, **Then** the system returns an appropriate error response.

---

### User Story 6 - Status Endpoint Test (Priority: P6)

A developer runs the integration test suite and confirms the status endpoint is accessible without authentication and returns the expected response.

**Why this priority**: The status endpoint is the simplest endpoint and serves as a health check with no dependencies beyond the running application.

**Independent Test**: Can be fully tested by sending a GET request without authentication. Delivers confidence that the health check works correctly.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** an unauthenticated user requests the status, **Then** the system returns 200 OK with status information.

---

### Edge Cases

- What happens when a user sends a request with a malformed UUID as an ID parameter?
- What happens when a user sends a request with an empty request body where one is required?
- What happens when pagination parameters include boundary values (page=1, pageSize=1 and pageSize=200)?
- What happens when sorting by a field name that does not exist?
- What happens when filtering with an invalid timezone identifier?
- What happens when a word is deleted that still belongs to a set?
- What happens when the search query contains special characters?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Test suite MUST cover all 16 endpoints exposed by the back-end API.
- **FR-002**: Each endpoint MUST have "correct" test cases covering happy path scenarios that verify successful operations and response structure.
- **FR-003**: Each endpoint MUST have "incorrect" test cases covering all validation failures that verify proper error responses and error details.
- **FR-004**: Endpoints with external dependencies (AI service, dictionary API) MUST have test cases covering dependency failure scenarios.
- **FR-005**: Test cases MUST verify response status codes and response body structure.
- **FR-006**: Test cases for list endpoints MUST cover pagination, sorting, and filtering behavior.
- **FR-007**: Test cases MUST run against a real database instance to verify actual data persistence and retrieval.
- **FR-008**: Test cases MUST use mocked external services (AI service, dictionary API) to ensure test determinism.
- **FR-009**: Test cases MUST bypass authentication to focus on endpoint behavior (auth is already tested by existing tests).
- **FR-010**: Test cases MUST be independent of each other, with no shared mutable state between tests.

### Key Entities

- **Word**: Core vocabulary entity with word text, word type, translations, and example sentences. Maximum 200 chars for word, 200 chars for translations, 500 chars for sentences.
- **Set**: Collection of words grouped for study. References words by ID. Requires at least one word, no duplicate word IDs.
- **Answer**: Record of a user's response to a vocabulary question. Requires question and expectedAnswer (max 500 chars each), givenAnswer is optional.
- **Recording**: Audio pronunciation file for a word. Sourced from external dictionary service or local cache. Returns MP3 format.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 16 back-end endpoints have all possible happy paths test cases that pass.
- **SC-002**: All endpoints with input validation have all validation failures test cases that pass.
- **SC-003**: All endpoints with external dependencies have all dependency failures test cases that pass.
- **SC-004**: The full test suite passes consistently when run repeatedly without manual intervention.
- **SC-005**: Adding a new endpoint without a corresponding test case is detectable by the existing endpoint discovery infrastructure.

## Assumptions

- The existing test infrastructure (application factory, test containers, HTTP mocking, snapshot testing) is stable and will be reused.
- Authentication bypass is the correct approach for endpoint behavior tests, since authentication is already covered by existing auth-specific tests.
- External AI service and dictionary API will be mocked for deterministic test behavior.
- Test data will be created per test or per test class to maintain test isolation.
- The database schema is stable and will not change as part of this feature.
