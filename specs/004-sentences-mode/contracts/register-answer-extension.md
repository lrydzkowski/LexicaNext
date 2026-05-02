# Contract Extension: `POST /api/answer` accepts sentences mode

This feature adds **no new HTTP endpoints**. It extends the validator-side allow-lists of the existing `POST /api/answer` endpoint to permit a new mode and question-type pair. The wire shape, status codes, error format, authentication, and response body are all unchanged.

## Endpoint

`POST /api/answer` (existing — `LexicaNext.Core/Commands/RegisterAnswer/RegisterAnswerEndpoint.cs`).

| Aspect | Existing | After this change |
|---|---|---|
| HTTP method / path | `POST /api/answer` | unchanged |
| Auth | `RequireAuthorization(AuthorizationPolicies.Auth0OrApiKey)` | unchanged |
| Request body | `RegisterAnswerRequestPayload` | unchanged shape |
| Success status | `204 No Content` | unchanged |
| Error status | `400 Bad Request` (`ProblemDetails`), `401 Unauthorized`, `500` | unchanged |

## Allow-list deltas

Defined in `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerRequestValidator.cs`.

```diff
- private static readonly string[] AllowedModeTypes = ["full", "open-questions", "spelling"];
+ private static readonly string[] AllowedModeTypes = ["full", "open-questions", "sentences", "spelling"];

  private static readonly string[] AllowedQuestionTypes =
-     ["english-close", "native-close", "english-open", "native-open", "spelling"];
+     ["english-close", "native-close", "english-open", "native-open", "sentence-fill", "spelling"];
```

These are the **only two lines** that change in `LexicaNext.Core`. All other validator rules (`Question` non-empty + ≤ 500 chars, `GivenAnswer` ≤ 500 chars (nullable), `ExpectedAnswer` non-empty + ≤ 500 chars, `IsCorrect` non-null, `WordId` non-empty Guid + per-user existence check) apply unchanged.

## Sample request — sentences mode, correct answer

```http
POST /api/answer
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "modeType": "sentences",
  "questionType": "sentence-fill",
  "question": "The cat sat on the _____.",
  "givenAnswer": "mat",
  "expectedAnswer": "mat",
  "isCorrect": true,
  "wordId": "0199e86c-0001-7000-8000-000000000001"
}
```

Response: `204 No Content`. A row is inserted into `answer` with `mode_type = 'sentences'`, `question_type = 'sentence-fill'`, and the rest of the fields populated from the request.

## Sample request — sentences mode, empty submission (still recorded)

```http
POST /api/answer
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "modeType": "sentences",
  "questionType": "sentence-fill",
  "question": "The cat sat on the _____.",
  "givenAnswer": "",
  "expectedAnswer": "mat",
  "isCorrect": false,
  "wordId": "0199e86c-0001-7000-8000-000000000001"
}
```

Response: `204 No Content`. The empty `givenAnswer` is allowed by the existing validator (only length is checked, not non-emptiness), per spec clarification #3.

## Rejection sample — wrong question type for the new mode

```http
POST /api/answer
Content-Type: application/json
Authorization: Bearer <jwt>

{
  "modeType": "sentences",
  "questionType": "sentence-multiple-choice",
  "question": "...",
  "givenAnswer": "mat",
  "expectedAnswer": "mat",
  "isCorrect": true,
  "wordId": "0199e86c-0001-7000-8000-000000000001"
}
```

Response: `400 Bad Request` with a `ProblemDetails` body listing `QuestionType` as the failed property and message `'QuestionType' must be one of: english-close, native-close, english-open, native-open, sentence-fill, spelling.`

## OpenAPI implications

Because `RegisterAnswerRequestPayload` itself does not change shape (the allow-listed values live in the validator, not the C# type), the generated `api-types.ts` does **not** need regeneration. The frontend uses the existing `RegisterAnswerRequestPayload` type from `useRegisterAnswer` and simply passes the new string literals.
