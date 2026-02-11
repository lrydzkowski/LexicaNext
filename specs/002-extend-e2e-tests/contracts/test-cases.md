# Test Cases Contract

## Endpoint Test Case Inventory

Each test class has exactly 2 `[Fact]` methods following this naming convention:

- `<Action>_ShouldBeSuccessful()` - happy path test cases
- `<Action>_ShouldBeUnsuccessful()` - validation, errors, and edge cases

### 1. GetAppStatus (GET /api/status)

**Test class**: `GetAppStatusTests` (no Data/ folder needed - trivial endpoint)

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Returns status OK | None | 200, `{"status":"OK"}` |

No incorrect test cases (no auth, no validation, no parameters).

### 2. GetWords (GET /api/words)

**Test class**: `GetWordsTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Default pagination | 3 words with translations | 200, paginated list |
| ShouldBeSuccessful | 02 | Search query matches | 3 words, search="apple" | 200, filtered list |
| ShouldBeSuccessful | 03 | Sort ascending by word | 3 words | 200, sorted A-Z |
| ShouldBeSuccessful | 04 | Sort descending by word | 3 words | 200, sorted Z-A |
| ShouldBeSuccessful | 05 | Custom page and pageSize | 5 words, page=2, pageSize=2 | 200, 2 items |
| ShouldBeSuccessful | 06 | Empty result | No words | 200, empty list |
| ShouldBeUnsuccessful | 01 | Page = 0 | None | 400 |
| ShouldBeUnsuccessful | 02 | PageSize = 0 | None | 400 |
| ShouldBeUnsuccessful | 03 | PageSize = 201 | None | 400 |
| ShouldBeUnsuccessful | 04 | Invalid sorting order | None | 400 |
| ShouldBeUnsuccessful | 05 | Invalid timezone | None | 400 |

### 3. GetWord (GET /api/words/{wordId})

**Test class**: `GetWordTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Existing word | 1 word with translations + examples | 200, full details |
| ShouldBeUnsuccessful | 01 | Non-existent GUID | None | 404 |
| ShouldBeUnsuccessful | 02 | Malformed UUID | None | 404 |

### 4. GetWordSets (GET /api/words/{wordId}/sets)

**Test class**: `GetWordSetsTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Word in 2 sets | 1 word, 2 sets with set_words | 200, 2 sets |
| ShouldBeSuccessful | 02 | Word in no sets | 1 word, no set_words | 200, empty list |
| ShouldBeUnsuccessful | 01 | Non-existent word | None | 404 |
| ShouldBeUnsuccessful | 02 | Malformed UUID | None | 404 |

### 5. CreateWord (POST /api/words)

**Test class**: `CreateWordTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | All fields | WordTypes (seeded) | 201, wordId + Location |
| ShouldBeSuccessful | 02 | Without example sentences | WordTypes (seeded) | 201, wordId + Location |
| ShouldBeUnsuccessful | 01 | Null payload | None | 400 |
| ShouldBeUnsuccessful | 02 | Empty word | None | 400 |
| ShouldBeUnsuccessful | 03 | Word exceeds 200 chars | None | 400 |
| ShouldBeUnsuccessful | 04 | Invalid word type | None | 400 |
| ShouldBeUnsuccessful | 05 | Empty translations list | None | 400 |
| ShouldBeUnsuccessful | 06 | Translation exceeds 200 chars | None | 400 |
| ShouldBeUnsuccessful | 07 | Example sentence exceeds 500 chars | None | 400 |
| ShouldBeUnsuccessful | 08 | Duplicate word+wordType | 1 existing word (same word+type) | 400 |

### 6. UpdateWord (PUT /api/words/{wordId})

**Test class**: `UpdateWordTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Update all fields | 1 existing word | 204 |
| ShouldBeUnsuccessful | 01 | Non-existent wordId | None | 404 |
| ShouldBeUnsuccessful | 02 | Malformed UUID | None | 400 |
| ShouldBeUnsuccessful | 03 | Null payload | 1 existing word | 400 |
| ShouldBeUnsuccessful | 04 | Empty word | 1 existing word | 400 |
| ShouldBeUnsuccessful | 05 | Word exceeds 200 chars | 1 existing word | 400 |
| ShouldBeUnsuccessful | 06 | Invalid word type | 1 existing word | 400 |
| ShouldBeUnsuccessful | 07 | Empty translations | 1 existing word | 400 |
| ShouldBeUnsuccessful | 08 | Translation exceeds 200 chars | 1 existing word | 400 |
| ShouldBeUnsuccessful | 09 | Example sentence exceeds 500 chars | 1 existing word | 400 |
| ShouldBeUnsuccessful | 10 | Duplicate word+type (conflict with other word) | 2 existing words | 400 |

### 7. DeleteWords (DELETE /api/words)

**Test class**: `DeleteWordsTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Delete existing words | 2 words | 204, words removed |
| ShouldBeSuccessful | 02 | Delete non-existent IDs | None | 204 (idempotent) |
| ShouldBeUnsuccessful | 01 | Empty IDs list | None | 204 or 400 (verify actual behavior) |

### 8. GetSets (GET /api/sets)

**Test class**: `GetSetsTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Default pagination | 3 sets with words | 200, paginated list |
| ShouldBeSuccessful | 02 | Search query | 3 sets, search by name | 200, filtered |
| ShouldBeSuccessful | 03 | Sort ascending | 3 sets | 200, sorted |
| ShouldBeSuccessful | 04 | Sort descending | 3 sets | 200, sorted |
| ShouldBeSuccessful | 05 | Empty result | No sets | 200, empty list |
| ShouldBeUnsuccessful | 01 | Page = 0 | None | 400 |
| ShouldBeUnsuccessful | 02 | PageSize = 0 | None | 400 |
| ShouldBeUnsuccessful | 03 | PageSize = 201 | None | 400 |
| ShouldBeUnsuccessful | 04 | Invalid sorting order | None | 400 |
| ShouldBeUnsuccessful | 05 | Invalid timezone | None | 400 |

### 9. GetSet (GET /api/sets/{setId})

**Test class**: `GetSetTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Existing set with entries | 1 set with 2 words | 200, full details |
| ShouldBeUnsuccessful | 01 | Non-existent GUID | None | 404 |
| ShouldBeUnsuccessful | 02 | Malformed UUID | None | 404 |

### 10. GetProposedSetName (GET /api/sets/proposed-name)

**Test class**: `GetProposedSetNameTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | No existing sets | None | 200, "set_0001" |
| ShouldBeSuccessful | 02 | With existing sets | UserSetSequence (next=5) | 200, "set_0005" |

No incorrect test cases (no validation, no parameters).

### 11. CreateSet (POST /api/sets)

**Test class**: `CreateSetTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Valid word IDs | 2 existing words | 201, setId + Location |
| ShouldBeUnsuccessful | 01 | Null payload | None | 400 |
| ShouldBeUnsuccessful | 02 | Empty word IDs | None | 400 |
| ShouldBeUnsuccessful | 03 | Non-existent word ID | None | 400 |
| ShouldBeUnsuccessful | 04 | Duplicate word IDs | 1 existing word | 400 |
| ShouldBeUnsuccessful | 05 | Malformed UUID in word IDs | None | 400 |

### 12. UpdateSet (PUT /api/sets/{setId})

**Test class**: `UpdateSetTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Update with new word IDs | 1 set, 3 words | 204 |
| ShouldBeUnsuccessful | 01 | Non-existent setId | 2 words | 404 |
| ShouldBeUnsuccessful | 02 | Malformed UUID as setId | None | 400 |
| ShouldBeUnsuccessful | 03 | Null payload | 1 set | 400 |
| ShouldBeUnsuccessful | 04 | Empty word IDs | 1 set | 400 |
| ShouldBeUnsuccessful | 05 | Non-existent word ID | 1 set | 400 |
| ShouldBeUnsuccessful | 06 | Duplicate word IDs | 1 set, 1 word | 400 |

### 13. DeleteSets (DELETE /api/sets)

**Test class**: `DeleteSetsTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Delete existing sets | 2 sets with words | 204, sets removed |
| ShouldBeSuccessful | 02 | Delete non-existent IDs | None | 204 (idempotent) |
| ShouldBeUnsuccessful | 01 | Empty IDs list | None | 204 or 400 (verify actual behavior) |

### 14. RegisterAnswer (POST /api/answer)

**Test class**: `RegisterAnswerTests`

| Method | TC | Description | Seed Data | Expected |
|--------|----|-------------|-----------|----------|
| ShouldBeSuccessful | 01 | Full answer | None | 204 |
| ShouldBeSuccessful | 02 | Without givenAnswer | None | 204 |
| ShouldBeUnsuccessful | 01 | Null payload | None | 400 |
| ShouldBeUnsuccessful | 02 | Empty question | None | 400 |
| ShouldBeUnsuccessful | 03 | Empty expectedAnswer | None | 400 |
| ShouldBeUnsuccessful | 04 | Question exceeds 500 chars | None | 400 |
| ShouldBeUnsuccessful | 05 | GivenAnswer exceeds 500 chars | None | 400 |
| ShouldBeUnsuccessful | 06 | ExpectedAnswer exceeds 500 chars | None | 400 |

### 15. GenerateTranslations (POST /api/translations/generate)

**Test class**: `GenerateTranslationsTests`

| Method | TC | Description | Mock | Expected |
|--------|----|-------------|------|----------|
| ShouldBeSuccessful | 01 | Valid request, 3 translations | AI returns 3 translations | 200, translations |
| ShouldBeUnsuccessful | 01 | Empty word | None | 400 |
| ShouldBeUnsuccessful | 02 | Word exceeds 200 chars | None | 400 |
| ShouldBeUnsuccessful | 03 | Invalid word type | None | 400 |
| ShouldBeUnsuccessful | 04 | Count = 0 | None | 400 |
| ShouldBeUnsuccessful | 05 | Count = 11 | None | 400 |
| ShouldBeUnsuccessful | 06 | AI service failure | AI throws exception | 500 |

### 16. GenerateExampleSentences (POST /api/sentences/generate)

**Test class**: `GenerateExampleSentencesTests`

| Method | TC | Description | Mock | Expected |
|--------|----|-------------|------|----------|
| ShouldBeSuccessful | 01 | Valid request, 3 sentences | AI returns 3 sentences | 200, sentences |
| ShouldBeUnsuccessful | 01 | Empty word | None | 400 |
| ShouldBeUnsuccessful | 02 | Word exceeds 200 chars | None | 400 |
| ShouldBeUnsuccessful | 03 | Invalid word type | None | 400 |
| ShouldBeUnsuccessful | 04 | Count = 0 | None | 400 |
| ShouldBeUnsuccessful | 05 | Count = 11 | None | 400 |
| ShouldBeUnsuccessful | 06 | AI service failure | AI throws exception | 500 |

### 17. GetRecording (GET /api/recordings/{word})

**Test class**: `GetRecordingTests`

| Method | TC | Description | Mock | Expected |
|--------|----|-------------|------|----------|
| ShouldBeSuccessful | 01 | Cached recording | Storage returns bytes, DB has metadata | 200, audio/mpeg |
| ShouldBeSuccessful | 02 | Uncached, fetch from API | Storage returns null, WireMock returns HTML+audio | 200, audio/mpeg |
| ShouldBeUnsuccessful | 01 | Empty word | None | 400 |
| ShouldBeUnsuccessful | 02 | Word exceeds 100 chars | None | 400 |
| ShouldBeUnsuccessful | 03 | Recording not found | Storage null, WireMock 404 | 404 |
| ShouldBeUnsuccessful | 04 | Dictionary API failure | Storage null, WireMock 500 | 500 or 404 |

## Summary

| Category | Test Classes | Correct TCs | Incorrect TCs | Total TCs |
|----------|-------------|-------------|---------------|-----------|
| App | 1 | 1 | 0 | 1 |
| Words | 6 | 13 | 28 | 41 |
| Sets | 6 | 11 | 21 | 32 |
| Answer | 1 | 2 | 6 | 8 |
| Translations | 1 | 1 | 6 | 7 |
| Sentences | 1 | 1 | 6 | 7 |
| Recordings | 1 | 2 | 4 | 6 |
| **Total** | **17** | **31** | **71** | **102** |
