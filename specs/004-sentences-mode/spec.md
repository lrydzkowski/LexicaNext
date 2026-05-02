# Feature Specification: Sentences Learning Mode

**Feature Branch**: `004-sentences-mode`
**Created**: 2026-05-01
**Status**: Draft
**Input**: User description: "I want to introduce a new learning mode. It should be based on English sentences generated for words in a chosen set. Each question should be based on a sentence with the blank space instead of the word that the sentence was generated for. The user should enter a word in the blank space in the sentence. The UX should be analogous to other sets."

## Clarifications

### Session 2026-05-02

- Q: How should an individual (entry, sentence) question be identified for the per-question session-storage counter (FR-016) and answer recording (FR-017)? → A: Stable index of the sentence within the entry's example-sentence list (key = word entry identifier + sentence index 0/1/2…).
- Q: What should happen to a sentences-mode session if the underlying word entry's example-sentence list is added to, removed from, reordered, or reworded mid-session? → A: Reuse the existing session-validation rule — any change to the set's entries discards the whole session and starts a fresh one (consistent with the other modes).
- Q: When the user submits an empty or whitespace-only answer, should it be recorded via the answer-recording mechanism and reset that sentence-question's correct-answer counter? → A: Record it and reset the counter — treated identically to any other incorrect answer.
- Q: Should there be a cap on the number of sentence-questions generated per entry per session? → A: Yes — at most 5 sentence-questions per entry per session. If an entry has more than 5 usable example sentences, only 5 are selected for the session.
- Q: Should sentences-mode answers be included in the existing Words Statistics aggregation? → A: No — Words Statistics continues to aggregate only open-questions-mode answers; sentences-mode answers are excluded for this feature (the prior assumption stands).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Practice a set in sentences mode (Priority: P1)

As a learner, I want to start a new "sentences" learning mode for one of my sets, so I can practice recalling each word from the context of an English sentence that was originally generated for that word.

**Why this priority**: This is the core value of the feature. Without the ability to launch the mode and see at least one fill-in-the-blank question per word, nothing else in the feature delivers value. P1 because every other story in this feature builds on the basic question/answer loop.

**Independent Test**: Can be fully tested by opening any of the user's sets that has at least one entry with a generated English example sentence, choosing "Sentences Mode" from that set's actions menu (in the same place where Spelling Mode, Full Mode, and Open Questions Mode appear), and confirming that the practice screen loads with a sentence containing a blank where the entry's word used to be.

**Acceptance Scenarios**:

1. **Given** the signed-in user owns a set whose entries include at least one English example sentence, **When** they open the set's actions menu, **Then** "Sentences Mode" appears alongside the existing learning-mode options (Spelling Mode, Full Mode, Open Questions Mode).
2. **Given** the user clicks "Sentences Mode" for a set, **When** the page loads, **Then** they see a card displaying one of the set's example sentences with the target word replaced by a blank, plus an input field, a "Check Answer" button, and a progress indicator — visually consistent with the other learning modes.
3. **Given** a question is shown, **When** the user types the correct word into the blank and submits, **Then** the system marks the answer correct, plays the word's pronunciation, shows the original sentence with the word filled in (highlighted), and offers a "Continue" action that loads the next question.
4. **Given** a question is shown, **When** the user submits an incorrect answer, **Then** the system marks the answer incorrect, displays both the user's answer and the expected word, plays the word's pronunciation, and offers a "Continue" action that loads the next question.

---

### User Story 2 - Track progress and complete the mode (Priority: P2)

As a learner, I want the mode to track which words I have answered correctly and to keep showing me a word until I have demonstrated I know it, so I have a clear signal of when I've finished practicing the set.

**Why this priority**: Progression and a completion state are what differentiate this mode from a flat quiz. P2 because the mode is still useful without it for short practice runs, but the experience is incomplete without a clear end-state, just like the existing modes.

**Independent Test**: Can be tested by starting Sentences Mode on a small set, answering every (entry, sentence) question correctly the required number of times, and confirming that (a) the progress bar fills as questions are mastered, (b) individual sentence-questions drop out of rotation once mastered, (c) a completion screen appears once every question across every entry is mastered, and (d) the completion screen offers a "Back to Sets" link and a "Practice Again" reset.

**Acceptance Scenarios**:

1. **Given** the user has just started Sentences Mode for a set whose eligible entries collectively yield Q usable (entry, sentence) questions, **When** the first question loads, **Then** the progress indicator shows 0 / Q questions completed and the progress bar is at 0%.
2. **Given** the user has answered the same (entry, sentence) question correctly the required number of times (default: 2), **When** the next question is generated, **Then** that specific sentence-question is no longer eligible to be asked again in this session, but other unmastered sentence-questions for the same entry remain eligible.
3. **Given** the user answers a sentence-question incorrectly, **When** the next question is generated, **Then** that sentence-question's correct-answer counter for sentences mode is reset to 0 (it must be answered correctly the full required number of times again to be considered mastered), consistent with the existing modes' counter-reset rule. Other sentence-questions belonging to the same entry are unaffected.
4. **Given** every eligible (entry, sentence) question in the set has been mastered, **When** the next question would be generated, **Then** a completion screen is shown with the set name, congratulatory text, a "Back to Sets" button (returning to the source page), and a "Practice Again" button (restarting the mode).
5. **Given** the user is in the middle of a sentences-mode session, **When** they reload the page, **Then** their per-question progress is restored from session storage (consistent with the other modes' session-resume behaviour).

---

### User Story 3 - Skip entries that cannot be turned into a fill-in-the-blank question (Priority: P3)

As a learner, I want the mode to gracefully handle entries whose example sentences cannot produce a usable blank, so I am never shown a broken question and I always understand why the rotation is shorter than my full set.

**Why this priority**: Sentences are AI-generated and the data is not guaranteed to contain the target word verbatim in every example. P3 because for typical sets the question loop already works without this safety net, but a single bad entry should never crash or confuse the practice screen.

**Independent Test**: Can be tested by practising a set whose entries include (a) words with at least one example sentence that contains the word, (b) words whose example sentences exist but never contain the word, and (c) words with no example sentences at all — and confirming that only words in case (a) appear in the rotation, while cases (b) and (c) are skipped silently. If the entire set falls into (b) or (c), the user sees an empty-state message instead of an empty practice screen.

**Acceptance Scenarios**:

1. **Given** a set entry has no example sentences, **When** Sentences Mode is started, **Then** that entry is excluded from the rotation.
2. **Given** a set entry has example sentences but none of them contains the word (case-insensitive, word-boundary match), **When** Sentences Mode is started, **Then** that entry is excluded from the rotation.
3. **Given** all entries in a set have been excluded for the reasons above, **When** Sentences Mode is opened, **Then** an empty-state message explains that there are no usable example sentences for this set, with a control returning to the Sets list.
4. **Given** an entry has multiple example sentences containing the word, **When** Sentences Mode runs, **Then** the system generates one question per matching sentence — up to a maximum of 5 sentence-questions per entry per session (so an entry with X usable sentences yields min(X, 5) distinct questions) — and the user must master every one of them to clear that entry from the rotation.

---

### Edge Cases

- **Word appears multiple times in the same sentence**: Only the first occurrence is replaced with the blank; the remaining occurrences stay as-is. The user is judged on entering the word, regardless of how many copies appear.
- **Word appears as a substring of another word**: Matching uses word boundaries so the blank is only inserted where the target word stands as a whole word (e.g., the word "cat" is not blanked out of "category").
- **Whitespace-only / empty input**: The user MAY submit an empty or whitespace-only answer; it is treated as an incorrect answer (consistent with the other learning modes), the standard incorrect-answer feedback is shown, the submission is recorded via the answer-recording mechanism (FR-017), and the affected sentence-question's correct-answer counter is reset to 0 per FR-008.
- **Answer comparison casing**: The user's answer is compared case-insensitively with leading/trailing whitespace trimmed (consistent with how the other modes compare answers).
- **Pronunciation playback fails**: If the audio playback errors out (network failure, etc.), the question still completes and the user can advance to the next question, mirroring the spelling-mode fallback.
- **Set is empty (no entries at all)**: The same "no entries found" alert that exists in the other modes is shown.
- **Underlying entries change mid-session**: If any of the set's entries (including their example-sentence lists) are added, removed, reordered, or reworded during a session, the existing session-validation rule applies — the in-progress sentences-mode session is discarded and a fresh one is started, consistent with the other modes. Per-(entry, sentence) counters are not migrated across the change.
- **Unauthenticated access**: Visiting the sentences-mode URL without being signed in routes the user through the existing authentication flow, consistent with the other learning modes.
- **Tie-breaking when picking the next question**: When multiple sentence-questions are still eligible, the system avoids asking the immediately preceding question twice in a row, and — when alternatives exist — prefers a sentence-question belonging to a different entry from the one just asked, unless only sentence-questions from the same entry remain eligible.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST offer a new learning mode called "Sentences Mode" available from each set's actions menu, in the same group as Spelling Mode, Full Mode, and Open Questions Mode.
- **FR-002**: Sentences Mode MUST be reachable through a dedicated URL associated with the chosen set, structured consistently with the URLs of the other per-set learning modes.
- **FR-003**: Each question MUST present an English example sentence belonging to a single entry in the chosen set, with the entry's word removed and replaced by a clearly visible blank placeholder; the rest of the sentence MUST be displayed unchanged.
- **FR-004**: The user MUST be able to type a word into a single-line text input and submit it via a "Check Answer" button or by pressing Enter, identical to the submission affordance used by the existing modes.
- **FR-005**: The system MUST mark the user's answer correct when, after trimming and case-insensitive comparison, it equals the entry's word; otherwise the answer MUST be marked incorrect.
- **FR-006**: After submission, the system MUST show a feedback panel that distinguishes correct from incorrect answers (using the same colour and icon conventions as the existing modes), reveals the entry's word, its translations, and any example sentences, and offers a "Continue" action that advances to the next question.
- **FR-007**: After submission (correct or incorrect), the system MUST play the audio pronunciation of the entry's word, consistent with the post-feedback audio behaviour of the other modes; failures during playback MUST NOT block advancing to the next question.
- **FR-008**: The system MUST generate one distinct question per usable (entry, sentence) pair, capped at a maximum of 5 sentence-questions per entry per session: for an entry that has X example sentences containing the target word as a whole word, min(X, 5) separate questions MUST be produced for the session. When X > 5, the 5 selected sentences MUST be the first 5 by sentence index within the entry's example-sentence list (deterministic and stable across page reloads within the same session). Each such question MUST be considered "mastered" once the user has answered it correctly the required number of times in this mode (default: 2 correct answers per question); a single incorrect answer (including an empty or whitespace-only submission) MUST reset that specific question's per-session correct-answer counter to 0.
- **FR-009**: Once an individual sentence-question is mastered within a session, it MUST be removed from the eligible-question pool for the rest of that session. Other sentence-questions belonging to the same entry MUST remain eligible until they too are mastered.
- **FR-010**: The system MUST avoid asking the same sentence-question twice in immediate succession; when alternatives exist, it SHOULD also avoid asking two consecutive sentence-questions from the same entry, falling back only when the eligible pool is restricted to one entry or one question.
- **FR-011**: When every eligible sentence-question across every eligible entry is mastered, the system MUST show a completion screen titled "🎉 Congratulations!" (visually consistent with the other modes' completion screens) with a "Back to Sets" button that returns to the sets list (preserving the source page via the existing `returnPage` query parameter pattern) and a "Practice Again" button that restarts the mode for the same set.
- **FR-012**: Entries with no example sentences MUST be excluded from the eligible-question pool. Individual example sentences that do not contain the target word as a whole word (case-insensitive) MUST also be excluded; an entry whose every sentence is excluded MUST contribute zero questions.
- **FR-013**: When more than one sentence-question is eligible, the system MUST distribute questions so that all of an entry's sentence-questions are visited rather than re-asking a single sentence-question repeatedly while others for the same entry are still unseen.
- **FR-014**: When the chosen set has no eligible sentence-questions (because every entry was excluded under FR-012, or the set is empty), the page MUST display an empty-state alert that mirrors the wording style used by the existing modes ("No entries found" or "No usable example sentences", with similar visual presentation), and MUST NOT show an empty practice card.
- **FR-015**: The progress indicator MUST show both a horizontal progress bar (filling proportionally to mastered eligible sentence-questions) and an "X / Q questions completed" counter, where Q is the total number of eligible sentence-questions for the session, in the placement and styling used by the existing modes.
- **FR-016**: Per-question progress for the current session MUST be persisted in the same per-set, per-mode session-storage area used by the other modes, keyed by a new mode key for sentences. Each eligible (entry, sentence) pair MUST have its own correct-answer counter persisted independently, keyed by the tuple (word entry identifier, sentence index within that entry's example-sentence list). Reloading the page within the session MUST restore the user's in-progress counters and pick up at the next question.
- **FR-017**: Each submitted answer MUST be recorded through the existing answer-recording mechanism with a new learning-mode discriminator value identifying sentences mode, alongside the question text (the sentence with the blank), the expected word, the user's answer, the correctness flag, the entry's word identifier, and the sentence index within that entry's example-sentence list — consistent with how every other mode records answers.
- **FR-018**: Accessing the sentences-mode URL without being signed in MUST route the user through the existing authentication flow, consistent with the other authenticated pages.
- **FR-019**: The sentences-mode page MUST follow the same page-shell, breadcrumb, and back-navigation conventions used by the other per-set mode pages: a breadcrumb trail rooted at the set, a back arrow returning to the sets list (honouring the `returnPage` query parameter), and the set name displayed as a subtitle next to the mode title.

### Key Entities

- **Sentences Mode Session (existing pattern, new variant)**: A per-user, per-set, in-progress practice session for the new mode. Holds, for each eligible (entry, sentence) pair, an independent counter of consecutive correct answers in the current session. Each pair is keyed by the tuple (word entry identifier, sentence index within that entry's example-sentence list). Persisted in browser session storage under a new mode key; cleared on completion or when the underlying set entries change.
- **Recorded Answer (existing, extended values)**: Each answer the user submits in this mode is stored using the existing answer-recording mechanism with a new mode discriminator value identifying sentences mode. Existing fields (mode, question text, user answer, expected answer, correctness, owning user, word identifier) are reused — no schema change is introduced by this feature; only a new value of the existing mode discriminator.
- **Word Entry (existing)**: The vocabulary entry that a question is built around. Its example sentences and word text are read at session start; any deletion, addition, reordering, or rewording of words or sentences mid-session triggers the existing session-validation logic, which discards the in-progress session (per-question counters included) and starts a fresh one — identical to the behaviour in the other modes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in user who owns at least one set with example sentences can launch Sentences Mode from the set's actions menu in three or fewer interactions (open menu → click mode), matching the discoverability of the existing learning modes.
- **SC-002**: For a set of up to 50 entries, the time from clicking "Sentences Mode" to the first question being interactive is under 2 seconds on a typical broadband connection.
- **SC-003**: At least 95% of generated questions present a sentence whose blank position is unambiguous to a fluent reader (i.e., only one word is missing and the surrounding sentence is intact), measured against a sample of practice sessions.
- **SC-004**: Users in this mode can complete a practice session for a 10-word set in under 6 minutes when answering at the average per-question pace of the other text-input modes.
- **SC-005**: The session-resume behaviour preserves at least 99% of in-progress per-(entry, sentence) counters across a same-tab page reload (matching the resume reliability of the existing modes).
- **SC-006**: Zero questions are ever shown for entries or sentences that were excluded under FR-012 (no example sentences, or sentences not containing the word as a whole word), verified by exclusion logic running before each question is generated.
- **SC-007**: 100% of questions whose answer matches the entry's word (after trim and case-insensitive comparison) are accepted as correct.

## Assumptions

- "English sentences generated for words in a chosen set" refers to the existing example-sentences data already attached to each entry; no new sentence-generation flow or new server-side endpoint is introduced for question generation.
- Words that have no example sentences containing them verbatim are excluded rather than rewritten/lemmatised. Inflected forms (e.g., asking "running" when the entry word is "run") are out of scope; the entry is simply skipped if no sentence has the exact word.
- The mode key persisted on each recorded answer for this mode is a new, distinct value; the existing Words Statistics page (which currently aggregates only the open-questions mode) is not affected by this feature and continues to count only that mode's answers. Including sentences-mode answers in Words Statistics is explicitly out of scope and deferred to a future feature.
- The default mastery threshold is 2 correct answers per sentence-question (not per entry), matching the per-question-type counter used by the open-questions mode. Adjusting the threshold is out of scope for this feature.
- The progress bar, completion screen, error alerts, breadcrumbs, audio-playback rules, and "back to sets" / `returnPage` semantics are reused verbatim from the existing modes; no new visual primitives are introduced.
- Authentication, per-user data scoping, and access-control rules already enforced by the existing authenticated routes apply to this mode without modification.
- The blank placeholder shown to the user is a visually distinct, fixed-width filler (the exact rendering — underscores, a styled span, etc. — is a UI/implementation detail to be settled in `/speckit.plan`).
- The order in which sentence-questions are scheduled is randomised within a session, with a best-effort preference for visiting an entry's not-yet-asked sentences before re-asking one of its already-asked sentences and for alternating between entries.
- An entry contributes at most 5 sentence-questions per session (FR-008 cap). When an entry has more than 5 usable example sentences, the first 5 by sentence index are selected deterministically; sentences beyond index 4 are not asked in that session. The cap is fixed for this feature; making it configurable is out of scope.
