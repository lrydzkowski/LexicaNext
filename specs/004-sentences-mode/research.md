# Phase 0 — Research: Sentences Learning Mode

This file records decisions reached while reading the existing codebase against the spec for the new mode. Each entry follows: **Decision / Rationale / Alternatives considered**.

---

## R-1. Backend surface area: extend the validator whitelists, do not add new contracts

**Decision**: Add `"sentences"` to `RegisterAnswerRequestPayloadValidator.AllowedModeTypes` and `"sentence-fill"` to `AllowedQuestionTypes`. Do not introduce a new endpoint, command, request DTO, repository, or migration.

**Rationale**: The spec (FR-017) explicitly reuses the existing answer-recording mechanism with a new mode discriminator. Inspecting `LexicaNext.Core/Commands/RegisterAnswer/Services/RegisterAnswerRequestValidator.cs` confirms that the only thing standing between the new mode and a successful POST is two whitelist checks. The `AnswerEntity` columns (`ModeType`, `QuestionType`, `Question`, `GivenAnswer`, `ExpectedAnswer`, `IsCorrect`, `WordId`, `AnsweredAt`) are all sufficient as-is — sentence text fits in the 500-char `Question` column. No DB migration is required.

**Alternatives considered**:

- *Add a new `/api/sentences-answer` endpoint and dedicated `SentencesAnswerEntity` table.* Rejected — duplicates an already-shared concern, contradicts FR-017, and adds an unjustified migration. The sole differentiator is the discriminator value, which is exactly what `ModeType`/`QuestionType` exist for.
- *Persist the sentence index as a separate `AnswerEntity.SentenceIndex` column.* Rejected for this feature — Words Statistics aggregation excludes sentences mode (clarification 5), so no consumer needs to bucket answers by sentence index server-side. The frontend already encodes the sentence into `Question` (the blank-bearing sentence), which is sufficient for human inspection of the `answer` table. If future work needs server-side aggregation per sentence, that becomes its own migration with its own backfill story.

---

## R-2. Question-type discriminator value

**Decision**: Use the literal `"sentence-fill"` for the new `QuestionType`.

**Rationale**: The existing values (`"english-close"`, `"native-close"`, `"english-open"`, `"native-open"`, `"spelling"`) follow a `<context>-<format>` convention. `"sentence-fill"` keeps that convention: the question shows a sentence with a blank, and the user fills the blank. Naming it just `"sentences"` would collide conceptually with the new `ModeType` value of the same name. There is exactly one question shape in this mode, so no further sub-types are needed.

**Alternatives considered**:

- `"english-blank"` — close, but `"blank"` reads as a noun in this domain (the placeholder), not a format.
- `"sentence-cloze"` — accurate linguistic terminology but obscure to readers of the codebase. Rejected for IV. Clear Intent.

---

## R-3. Per-question session-storage shape

**Decision**: Extend the existing per-set/per-mode `localStorage` slot (`lexica-session:<setId>:<mode>`) under the new mode key `'sentences'`. Each persisted entry is an `EntryDto` augmented with a `sentenceCounters: Record<number, number>` map keyed by the sentence's index in `entry.exampleSentences`. The map only contains keys for sentences that were *included* in the session (i.e., those that passed the whole-word regex check and survived the per-entry cap of 5 — see R-5).

```ts
export interface SentencesEntry extends EntryDto {
  sentenceCounters: Record<number, number>;
}
```

**Rationale**: This matches the spec clarification (key = `wordId` + sentence index within the entry's example-sentence list) and the existing `loadSession<T>(setId, mode)` API (`services/session-storage.ts`). It keeps the storage shape per-entry, so the existing `validateSession(savedEntries, currentEntries)` (which compares the *set of words*) still works for the "discard if entries change" rule. The per-pair counters live nested under each entry, so a single JSON blob still serializes the whole session.

**Alternatives considered**:

- *Flat array of `(wordId, sentenceIndex, counter)` triples.* Rejected — would require either bypassing or reimplementing `validateSession`. The nested shape lets us reuse it as-is for the entries-changed check; only the per-pair semantics live inside each entry.
- *A separate `lexica-session:<setId>:sentences-questions` slot disjoint from the entries.* Rejected — two slots that have to be kept in sync are worse than one nested structure.

---

## R-4. `validateSession` semantics for the new mode

**Decision**: For sentences mode, in addition to the existing word-set comparison done by `validateSession`, the component performs a second check inside the `useEffect` that loads the session: for each saved entry, every sentence index that has a counter recorded MUST still resolve to the *same* sentence text in the current `entry.exampleSentences`. If any saved sentence index points to a different string (or is now out of range), the saved session is treated as invalid and discarded — matching the clarification *"any change to the set's entries discards the whole session and starts a fresh one."*

**Rationale**: `validateSession` lives in a shared module and currently only compares word sets, which is sufficient for the other modes whose state is per-entry. Sentences mode's state is per-(entry, sentence index), so a saved-but-stale sentence index could otherwise re-display the wrong sentence. Keeping the additional check inside `SetSentencesMode` (rather than overloading `validateSession` with mode-specific knowledge) preserves the principle of *learn from existing code* without bending the shared validator's signature.

**Alternatives considered**:

- *Generalise `validateSession` to take a per-mode validator function.* Rejected — premature abstraction; the other three modes' shape is stable and there is no third call site asking for this generalisation.
- *Bump a `schemaVersion` field in the session blob and discard on mismatch.* Rejected — solves a different problem (versioning); it does not catch in-place sentence rewrites, which is precisely the failure mode the clarification calls out.

---

## R-5. Question selection per entry (FR-008 cap of 5)

**Decision**: At session start, for each entry compute its eligible sentences as `entry.exampleSentences.filter((s, i) => containsWholeWord(s, entry.word))`, preserving the original sentence indices. If more than 5 eligible sentences remain, take the first 5 by original index (the cap from the clarification, *"deterministic and stable across page reloads within the same session"*). Store the selected sentence indices on the entry alongside the counters.

**Rationale**: Deterministic by-index selection is the boring, obvious choice; it survives page reloads without needing a separate seeded RNG, and it matches the explicit clarification text. The whole-word check is a single regex — no Unicode-segmentation library is needed for the small set of Latin-alphabet entries this app handles.

**Alternatives considered**:

- *Random sampling of 5 with a stored seed.* Rejected — extra complexity (must persist the seed), no functional benefit because the spec's only requirement is determinism within a session.
- *Score-based ranking (e.g., prefer shorter sentences).* Rejected — no such criterion is in the spec, and adding one now is a feature creep risk.

---

## R-6. Whole-word matching and blanking logic

**Decision**: A sentence "contains the word as a whole word" iff the regex `new RegExp("\\b" + escapeRegExp(entry.word) + "\\b", "i")` matches it. The blank is created by replacing only the **first** match with a fixed-width placeholder. Any later occurrences are left untouched (per the explicit edge case in the spec). The placeholder rendering is `_____` (five underscores) inline within the sentence text — the simplest, most accessible option, no new visual primitive needed.

**Rationale**: `\b` in JS RegExp is well-defined for ASCII word characters, which covers English vocabulary entries. `String.prototype.replace` with a non-global regex replaces only the first match by default. Five underscores is a recognisable blank in fill-in-the-blank UIs and renders fine in Mantine `Text`.

**Alternatives considered**:

- *Replace all occurrences of the word with the blank.* Rejected — the spec edge case explicitly says "only the first occurrence is replaced; the remaining occurrences stay as-is."
- *Render the blank as a styled `<span>` with a coloured underline.* Rejected for now — adds a visual primitive that the constitution and spec both flag as out of scope (assumption: "the exact rendering — underscores, a styled span, etc. — is a UI/implementation detail to be settled in `/speckit.plan`"). Choosing underscores keeps the implementation minimal; if a richer treatment is wanted later it is a one-line change.

---

## R-7. Comparison rule for the user's answer

**Decision**: A submission is correct iff `userAnswer.trim().toLowerCase() === entry.word.toLowerCase()`. Polish-diacritic stripping (used by `compareAnswers` in `utils/utils.ts`) is **not** applied because the target word is always English (the entry's `word` field).

**Rationale**: This mirrors the existing `SetSpellingMode` comparison (line 113 of `SetSpellingMode.tsx`) — both modes compare an English word the user typed against the entry's English word, so the same rule applies. `compareAnswers` is appropriate when the answer might be a Polish translation (open-questions native-open). Using it here would silently accept an answer differing only in Polish-style accent stripping, which would be misleading.

**Alternatives considered**:

- *Use `compareAnswers` for parity.* Rejected — it splits on commas and applies Polish-diacritic stripping, neither of which is meaningful for a single English word.
- *Accept morphological variants (e.g., plural).* Rejected — explicitly out of scope per the spec's assumption that inflected forms are handled by simply skipping non-matching sentences.

---

## R-8. Empty/whitespace-only submission handling

**Decision**: An empty or whitespace-only answer is a valid submission. It posts to `/api/answer` like any other answer (with `givenAnswer: ""`), is judged incorrect by the comparison rule above, shows the standard incorrect-answer feedback, and resets the affected sentence-question's counter to 0.

**Rationale**: Matches clarification #3. The existing `RegisterAnswerRequestPayloadValidator.AddValidationForGivenAnswer` does NOT mark `GivenAnswer` as required; it only caps length. The existing `useRegisterAnswer` hook already accepts the empty string. So no validator or hook change is needed — just remove any UI-side `disabled` guard on the "Check Answer" button.

**Alternatives considered**:

- *Send `null` as `givenAnswer` for empty submissions.* Rejected — the existing code already passes the raw `userAnswer` string; introducing a null branch is needless complexity.
- *Suppress recording empty submissions in stats.* Rejected — clarification #3 explicitly says record-and-reset.

---

## R-9. Pronunciation playback after submission

**Decision**: Reuse the existing `usePronunciation` hook with `autoPlay: false` and the same post-feedback `setTimeout(playAudio, 100)` pattern used by `SetOnlyOpenQuestionsMode`. The pronunciation audio is the entry's word, not the sentence.

**Rationale**: FR-007 says "play the audio pronunciation of the entry's word, consistent with the post-feedback audio behaviour of the other modes." `SetOnlyOpenQuestionsMode` is the closest mirror (text-input + post-feedback word audio), so its pattern lifts cleanly. `usePronunciation` already returns gracefully when audio errors out, and the existing modes already let the user advance to the next question regardless — covering the spec's "playback fails" edge case with no extra code.

**Alternatives considered**:

- *Read the whole sentence aloud.* Rejected — no spec requirement, no existing endpoint, would need a TTS pipeline.

---

## R-10. Backend test coverage for the validator change

**Decision**: Extend `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/`:

- Add a new `Data/CorrectTestCases/TestCase03.cs` that posts a sentences-mode payload (`ModeType = "sentences"`, `QuestionType = "sentence-fill"`, `Question = "The cat sat on the _____."`, `GivenAnswer = "mat"`, `ExpectedAnswer = "mat"`, `IsCorrect = true`, valid `WordId`) and asserts 204.
- Add a new `Data/IncorrectTestCases/TestCase16.cs` that posts a payload with `ModeType = "sentences"` but a `QuestionType` outside the expanded whitelist (e.g., `"sentence-mc"`) and asserts the validator rejection. This locks in the principle that *only* the new question type is enabled, not the whole class.
- Re-run `dotnet test` to regenerate `RegisterAnswer_ShouldBeSuccessful.verified.txt` and `RegisterAnswer_ShouldBeUnsuccessful.verified.txt`.

**Rationale**: The Verify-snapshot pattern is the project's regression net for HTTP contracts (Constitution V). One correct case proves the new whitelist value flows end-to-end (DB row written, 204 returned); one incorrect case pins the boundary and protects against accidental whitelist drift.

**Alternatives considered**:

- *Skip backend tests because the change is "just a string in a list".* Rejected — even single-string contract changes have produced snapshot diffs in this repo before, and Constitution V is non-negotiable for HTTP-contract changes.
- *Only add a correct case.* Rejected — a single positive case does not guard against a future change that loosens the whitelist by accident.

---

## R-11. Frontend E2E test coverage

**Decision**: Two new Playwright specs under `Frontend/lexica-next-front-e2e-tests/tests/sets/`:

- `15-sentences-mode.spec.ts` — mirrors `11-open-questions-mode.spec.ts`. Tests: page loads with correct heading/progress/input/button; correct answer → green feedback + Continue; incorrect answer → red feedback + given/expected lines + Continue; empty answer → incorrect feedback (covers clarification #3); Enter key submits; back arrow returns to `/sets`; multi-sentence-per-word entry yields multiple distinct questions (covers FR-008 / FR-013); per-entry cap of 5 (covers FR-008); completion screen with Back-to-Sets and Practice-Again.
- `16-sentences-mode-session-resume.spec.ts` — mirrors `14-open-questions-mode-session-resume.spec.ts`. Tests: persistence to `localStorage` after one answer; correct restoration of per-pair counters on reload; session cleared after completion; existing-resume modal flow works for the new mode key; session is discarded when the underlying entry's sentences are changed (covers clarification #2 + edge case "Underlying entries change mid-session").

**Rationale**: Constitution V mandates Playwright coverage for every user-visible journey. The existing per-mode test layout under `tests/sets/` is the established home for this; adding two new spec files keeps the diff localised and reviewable.

**Alternatives considered**:

- *Combine page-flow and resume into one spec.* Rejected — the two existing modes split them, and one-purpose-per-file makes failures easier to bisect.
- *Skip the multi-sentence and cap tests since they overlap with existing coverage.* Rejected — they are the *only* tests that directly verify the new spec clarifications (multi-sentence + per-entry cap), which is exactly what regression coverage exists to defend.

---

## R-12. Menu icon and link copy

**Decision**: Add the new menu item in `SetsList.SetActionMenu` immediately after `Open Questions Mode`, with label `"Sentences Mode"` and icon `IconBlockquote` from `@tabler/icons-react`. URL helper `links.sentencesMode.getUrl({ setId }, { returnPage: currentPage.toString() })`.

**Rationale**: Position keeps the existing menu order (Spelling → Full → Open Questions → Sentences) — alphabetical/historical adjacency is the convention. `IconBlockquote` is already in the `@tabler/icons-react` set used elsewhere in the menu (`IconHeadphones`/`IconBrain`/`IconTarget`) and visually evokes a sentence/quote.

**Alternatives considered**:

- *Insert at the top of the Learning Modes group.* Rejected — would silently re-order the existing menu and surprise users.
- *Use `IconLetterCase` or `IconAbc`.* Either would also work; `IconBlockquote` was picked for closer semantic fit.

---

## All NEEDS CLARIFICATION resolved

The Technical Context section of `plan.md` contains no `NEEDS CLARIFICATION` markers — the five spec clarifications already pinned down the design choices that would otherwise be ambiguous. Phase 1 may proceed.
