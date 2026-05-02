# Phase 1 — Data Model: Sentences Learning Mode

This feature introduces **no schema changes**. It reuses two existing entities and adds one new in-memory / `localStorage` shape on the frontend.

## Existing entities reused (no change)

### `AnswerEntity` (PostgreSQL `answer` table)

Defined in `LexicaNext.Infrastructure/Db/Common/Entities/AnswerEntity.cs`.

| Field | Type | Reuse for sentences mode |
|---|---|---|
| `AnswerId` | `Guid` (V7) | unchanged |
| `UserId` | `string` | unchanged |
| `ModeType` | `string(50)` | new value: `"sentences"` |
| `QuestionType` | `string(50)` | new value: `"sentence-fill"` |
| `Question` | `string(500)` | the sentence with the blank, e.g. `"The cat sat on the _____."` |
| `GivenAnswer` | `string?(500)` | the user's typed answer (may be empty / whitespace per clarification #3) |
| `ExpectedAnswer` | `string(500)` | the entry's word, e.g. `"mat"` |
| `IsCorrect` | `bool` | result of trim + lowercase comparison |
| `AnsweredAt` | `DateTimeOffset` | unchanged (set by `IDateTimeOffsetProvider`) |
| `WordId` | `Guid` (FK) | the entry's word id |

**No migration needed.** No new column, no new index, no new FK.

### `ExampleSentenceEntity` (PostgreSQL `example_sentence` table)

Defined in `LexicaNext.Infrastructure/Db/Common/Entities/ExampleSentenceEntity.cs`. Read-only for this feature; the existing `GetSet` query already returns `entries[].exampleSentences` as `string[]`, ordered by the entity's `Order` column. The frontend uses the **array index in that returned array** as the canonical "sentence index" referenced by the spec clarification.

## New frontend types

### `SentencesEntry` (component-local)

Defined in `Frontend/lexica-next-front/src/components/sets/modes/SetSentencesMode.tsx`.

```ts
export interface SentencesEntry extends EntryDto {
  selectedSentenceIndices: number[];                // ordered, deterministic, length ≤ 5
  sentenceCounters: Record<number, number>;         // key = sentence index in entry.exampleSentences
}
```

**Derivation rules** at session start:

1. For each `entry` in `set.entries`:
   - Skip the entry entirely if `entry.exampleSentences` is empty/undefined.
   - Compute `eligibleIndices = entry.exampleSentences.map((s, i) => ({ s, i })).filter(({ s }) => containsWholeWord(s, entry.word)).map(({ i }) => i)`.
   - Skip the entry if `eligibleIndices` is empty.
   - `selectedSentenceIndices = eligibleIndices.slice(0, 5)` (the FR-008 cap).
   - `sentenceCounters = Object.fromEntries(selectedSentenceIndices.map(i => [i, 0]))`.
2. The mode's eligible-question pool is `flatMap(entries, e => e.selectedSentenceIndices.map(i => ({ entry: e, sentenceIndex: i })))`.

**State transitions** per `(entry, sentenceIndex)` pair:

| Current counter | Submission | Next counter | Eligibility |
|---|---|---|---|
| 0 | correct | 1 | still eligible |
| 1 | correct | 2 | **mastered** — drops out of pool |
| 0 or 1 | incorrect (incl. empty) | 0 | still eligible |

A pair becomes mastered iff its counter ≥ 2 (default mastery threshold per FR-008).

### `SessionMode` extension

Defined in `Frontend/lexica-next-front/src/services/session-storage.ts`.

```ts
export type SessionMode = 'spelling' | 'full' | 'open-questions' | 'sentences';
type ModeEntriesDto = SpellingEntry[] | OpenQuestionsEntry[] | FullModeEntry[] | SentencesEntry[];
```

`getModeLabel('sentences')` → `'Sentences Mode'`.
`getModeUrl(setId, 'sentences')` → `` `/sets/${setId}/sentences-mode` ``.

The persisted JSON shape per session remains:

```json
{
  "setId": "<guid>",
  "setName": "<name>",
  "mode": "sentences",
  "timestamp": 1714600000000,
  "entries": [
    {
      "wordId": "<guid>",
      "word": "mat",
      "wordType": "noun",
      "translations": ["mata"],
      "exampleSentences": ["The cat sat on the mat.", "I bought a new mat."],
      "selectedSentenceIndices": [0, 1],
      "sentenceCounters": { "0": 2, "1": 0 }
    }
  ]
}
```

## Validation rules summary

| Rule | Where enforced | Source |
|---|---|---|
| `ModeType ∈ {full, open-questions, spelling, sentences}` | `RegisterAnswerRequestPayloadValidator` | FR-017 + clarifications |
| `QuestionType ∈ {english-close, native-close, english-open, native-open, spelling, sentence-fill}` | `RegisterAnswerRequestPayloadValidator` | FR-017 |
| `Question` non-empty, ≤ 500 chars | `RegisterAnswerRequestPayloadValidator` | existing |
| `WordId` non-empty Guid + must reference a word owned by current user | `RegisterAnswerRequestPayloadValidator` | existing |
| Whole-word match (case-insensitive) of `entry.word` against each sentence | `SetSentencesMode` (frontend) | FR-012 |
| Per-entry cap of 5 sentence-questions | `SetSentencesMode` (frontend) | FR-008 |
| Per-`(wordId, sentenceIndex)` mastery threshold = 2 | `SetSentencesMode` (frontend) | FR-008 |
| Session-discard on entries change | shared `validateSession` + per-mode sentence-text re-check (R-4) | clarification #2 |

## Out of scope (no entity / column added)

- **Per-sentence aggregation in `answer` table**: clarification #5 keeps Words Statistics excluding sentences mode, so no `SentenceIndex` column is added to `AnswerEntity`. If a future feature needs to bucket answers by sentence, that is its own migration with its own backfill story.
- **A persistent sentence ID on `ExampleSentenceEntity`**: the spec clarification #1 chose Option A (sentence index within the entry's list) over Option D (a new persistent ID), explicitly to avoid a schema change.
