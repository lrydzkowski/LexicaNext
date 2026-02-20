# Data Model: Extend Back-End E2E Tests

## Test Infrastructure Data Classes

### ITestCaseData (base interface)

All test case data classes implement this interface.

| Field | Type | Description |
|-------|------|-------------|
| TestCaseId | int | Unique identifier within a test method |
| UserId | string | User context for the test (default: "test-user-id") |
| Data | BaseTestCaseData | Container for all seed/mock data |

### BaseTestCaseData (data container)

| Field | Type | Description |
|-------|------|-------------|
| Db | DbTestCaseData | Database entities to seed |
| EnglishDictionaryApi | EnglishDictionaryApiTestCaseData | WireMock response data |
| AiService | AiServiceTestCaseData | NSubstitute mock behavior |

### DbTestCaseData (database seeding)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Words | List\<WordEntity\> | [] | Words to insert |
| Translations | List\<TranslationEntity\> | [] | Translations to insert |
| ExampleSentences | List\<ExampleSentenceEntity\> | [] | Example sentences to insert |
| Sets | List\<SetEntity\> | [] | Sets to insert |
| SetWords | List\<SetWordEntity\> | [] | Set-word associations to insert |
| Recordings | List\<RecordingEntity\> | [] | Recording metadata to insert |
| Answers | List\<AnswerEntity\> | [] | Answers to insert |
| UserSetSequences | List\<UserSetSequenceEntity\> | [] | Set naming sequences to insert |

### EnglishDictionaryApiTestCaseData (WireMock)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| WordPages | Dictionary\<string, string?\> | {} | Word -> HTML page content mapping |
| AudioFiles | Dictionary\<string, byte[]?\> | {} | Relative path -> audio file bytes mapping |
| ShouldFail | bool | false | If true, WireMock returns 500 |

### AiServiceTestCaseData (NSubstitute)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| Translations | List\<string\>? | null | Translations to return (null = not configured) |
| Sentences | List\<string\>? | null | Sentences to return (null = not configured) |
| ShouldThrowException | bool | false | If true, mock throws exception |

## Database Entities (existing, referenced by tests)

### WordTypeEntity (reference data, seeded by migration)

| Column | Type | Constraint | Notes |
|--------|------|-----------|-------|
| word_type_id | Guid | PK | |
| name | string(200) | Unique | None, Noun, Verb, Adjective, Adverb |

Seeded IDs:

| Name | ID |
|------|-----|
| None | 0196294e-9a78-735e-9186-2607dbb3e33a |
| Noun | 0196294e-9a78-73b5-947e-fb739d73808c |
| Verb | 0196294e-9a78-74d8-8430-4ebdfd46cf68 |
| Adjective | 0196294e-9a78-7573-9db1-47b3d0ee9eae |
| Adverb | 0196294e-9a78-7e0a-b3b2-9c653699e41e |

### WordEntity

| Column | Type | Constraint |
|--------|------|-----------|
| word_id | Guid | PK |
| user_id | string(200) | Required, Indexed |
| word | string(200) | Required |
| word_type_id | Guid | FK -> word_type |
| created_at | DateTimeOffset | Required |
| updated_at | DateTimeOffset? | Nullable |

Unique index: (user_id, word, word_type_id)

### TranslationEntity

| Column | Type | Constraint |
|--------|------|-----------|
| translation_id | Guid | PK |
| translation | string(200) | Required |
| order | int | Required |
| word_id | Guid | FK -> word (cascade) |

### ExampleSentenceEntity

| Column | Type | Constraint |
|--------|------|-----------|
| example_sentence_id | Guid | PK |
| sentence | string(500) | Required |
| order | int | Required |
| word_id | Guid | FK -> word (cascade) |

### SetEntity

| Column | Type | Constraint |
|--------|------|-----------|
| set_id | Guid | PK |
| user_id | string(200) | Required, Indexed |
| name | string(200) | Required |
| created_at | DateTimeOffset | Required |
| updated_at | DateTimeOffset? | Nullable |

### SetWordEntity

| Column | Type | Constraint |
|--------|------|-----------|
| set_id | Guid | Composite PK, FK -> set (cascade) |
| word_id | Guid | Composite PK, FK -> word (cascade) |
| order | int | Required |

### RecordingEntity

| Column | Type | Constraint |
|--------|------|-----------|
| recording_id | Guid | PK |
| word | string(200) | Required |
| word_type_id | Guid | FK -> word_type |
| file_name | string(200) | Required |

### AnswerEntity

| Column | Type | Constraint |
|--------|------|-----------|
| answer_id | Guid | PK |
| question | string(500) | Required |
| given_answer | string(500) | Nullable |
| expected_answer | string(500) | Required |
| answered_at | DateTimeOffset | Required |

### UserSetSequenceEntity

| Column | Type | Constraint |
|--------|------|-----------|
| user_set_sequence_id | Guid | PK |
| user_id | string(200) | Required, Unique index |
| next_value | int | Required, Default: 1 |
| last_updated | DateTimeOffset | Required |

## Test Result Models

### ITestResult (base)

| Field | Type | Description |
|-------|------|-------------|
| TestCaseId | int | Links result to test case |
| LogMessages | string? | Captured application logs |

### IHttpTestResult (extends ITestResult)

| Field | Type | Description |
|-------|------|-------------|
| StatusCode | HttpStatusCode | HTTP response status |
| Response | string? | Response body (prettified JSON) |

## Relationships

```text
WordType (seeded) <── Word ──> Translation
                        │ ──> ExampleSentence
                        │ ──> SetWord ──> Set

WordType (seeded) <── Recording

Answer (standalone)
UserSetSequence (standalone, per user)
```

## Data Cleanup Order (respects foreign keys)

1. SetWord (depends on Set, Word)
2. Translation (depends on Word)
3. ExampleSentence (depends on Word)
4. Set (depends on nothing after SetWord removed)
5. Word (depends on WordType, which is never deleted)
6. Recording (depends on WordType, which is never deleted)
7. Answer (standalone)
8. UserSetSequence (standalone)
