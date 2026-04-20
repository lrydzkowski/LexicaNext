# Feature Specification: Words Statistics Page

**Feature Branch**: `003-words-statistics`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "I want to introduce a new subpage with words statistics. The new page should contain the list of answers made in only open questions mode. We should use data that we already have in the database. I want to show the following columns: word, the number of correct answers, the number of incorrect answers, go to word button (it should redirect to edit word form). It should be possible to filter the list by words. It should be possible to sort by the number of correct answers and by the number of incorrect answers."

## Clarifications

### Session 2026-04-20

- Q: Word aggregation strategy — match answers to words by stored text, or by a new `WordId` FK on `AnswerEntity`? → A: Option B — add a non-nullable `WordId` FK on `AnswerEntity`, populate it at answer time, and aggregate statistics by `WordId`. (Cascade policy specified by the Q3 answer below.)
- Q: URL state scope for filter and sort on the Words Statistics page — URL-persist all of filter+sort+page, only page, or all plus browser storage? → A: Option A — filter text, sort column, sort direction, and page number all live in URL query parameters (deep-linkable; return-from-edit re-opens the source URL).
- Q: How should rows be displayed for answers whose word has been deleted? → A: Short — "Remove orphaned answers when remove words". Deleting a `Word` cascades to its `AnswerEntity` rows (`OnDelete(Cascade)`), so orphaned rows do not exist. This overrides the Q1 default of `OnDelete(SetNull)` and simplifies the UI: every statistics row's "go to word" action always resolves to a real word.
- Q: How should existing answer rows be handled when the non-nullable `WordId` column is introduced? → A: Option B — best-effort backfill. For each existing `AnswerEntity`, attempt to match the recorded question/expected-answer text to one of the owning user's `Word` entities (trimmed, case-insensitive). Rows that match uniquely get `WordId` set; rows with zero or ambiguous matches are deleted during the migration. The migration is a one-time data-fix step and MUST be transactional so the `WordId` column is only promoted to non-nullable after backfill/cleanup completes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Review per-word accuracy in open questions mode (Priority: P1)

As a learner, I want to see how I have performed on each individual word while practicing in the "open questions" learning mode, so I can identify which words I know well and which I still struggle with.

**Why this priority**: This is the core value of the feature — without an aggregated per-word view across all my past open-question answers, the existing answer data is only useful as a raw log. P1 because the rest of the feature (filtering, sorting, navigation) depends on this baseline view.

**Independent Test**: Can be fully tested by signing in as a user who has previously submitted answers in open questions mode, navigating to the new Words Statistics page, and confirming that each practiced word is listed on a single row with its correct-answer count and incorrect-answer count matching the historical answers the user gave.

**Acceptance Scenarios**:

1. **Given** the signed-in user has answered the word "apple" correctly 3 times and incorrectly 1 time in open questions mode, **When** they open the Words Statistics page, **Then** the row for "apple" shows 3 in the correct-answers column and 1 in the incorrect-answers column.
2. **Given** the signed-in user has never submitted an answer in open questions mode, **When** they open the Words Statistics page, **Then** they see an empty-state message explaining that no open-questions answers have been recorded yet.
3. **Given** the signed-in user has answers recorded in other learning modes (e.g., spelling, full) but none in open questions mode, **When** they open the Words Statistics page, **Then** no rows are shown, because only open-questions answers are counted.
4. **Given** another user has answers for the same word, **When** the current user views the Words Statistics page, **Then** only their own answers are counted — other users' data is never included.

---

### User Story 2 - Sort statistics by correct or incorrect answer counts (Priority: P2)

As a learner, I want to sort the list by the number of correct or incorrect answers, so I can quickly focus on my weakest words (most incorrect answers) or confirm my strongest words (most correct answers).

**Why this priority**: Sorting transforms the page from a flat list into a diagnostic tool. P2 because the page is still useful without sorting for small datasets, but becomes hard to scan as the user accumulates many practiced words.

**Independent Test**: Can be tested by populating the page with several words that have different correct/incorrect counts, clicking the correct-answers column header to sort ascending and descending, and clicking the incorrect-answers column header to do the same — the row order must change accordingly on each click.

**Acceptance Scenarios**:

1. **Given** the statistics list contains multiple words with different correct-answer counts, **When** the user sorts by correct answers descending, **Then** the word with the highest correct-answer count appears first and counts decrease down the list.
2. **Given** the statistics list is sorted by correct answers descending, **When** the user toggles the same column, **Then** the list is re-sorted by correct answers ascending.
3. **Given** the statistics list contains multiple words with different incorrect-answer counts, **When** the user sorts by incorrect answers descending, **Then** the word with the highest incorrect-answer count appears first.
4. **Given** no explicit sort has been applied, **When** the page first loads, **Then** rows appear in a stable default order (by the number of incorrect answers descending).

---

### User Story 3 - Filter statistics by word text (Priority: P2)

As a learner, I want to filter the list by typing part of a word, so I can quickly locate a specific word's statistics without scrolling through my full history.

**Why this priority**: Filtering becomes essential once the user has practiced dozens or hundreds of words. P2 because it is a usability accelerator rather than a blocker for smaller datasets.

**Independent Test**: Can be tested by loading a populated statistics page, entering a substring into the filter input, and confirming that only rows whose word contains that substring (case-insensitively) remain visible; clearing the filter restores the full list.

**Acceptance Scenarios**:

1. **Given** the statistics list contains many words, **When** the user types "app" in the filter input, **Then** only rows whose word contains "app" (case-insensitive) remain visible.
2. **Given** the user has typed a filter value, **When** they clear the input, **Then** the full list is shown again.
3. **Given** no word matches the current filter value, **When** the filter is applied, **Then** the user sees an empty-state message that matches the "no results for filter" case (distinct from the "no data yet" case).
4. **Given** a filter is active, **When** the user also applies a sort, **Then** the visible filtered rows are sorted according to the selected column and direction.

---

### User Story 4 - Jump from a statistics row to the word's edit form and return (Priority: P3)

As a learner, I want a "go to word" action on each row that takes me to the word's edit form, and I want the "back" control on that edit form to bring me back to where I came from (the Words Statistics page, with my filter, sort, and page preserved), so I can review or update a word's definition and then continue analysing my statistics without losing my place.

**Why this priority**: This is a convenience shortcut. P3 because the user can still reach the word edit form through the existing Words page — but the shortcut plus the return path closes the "I see I'm weak at this word → let me review it → now let me check the next one" loop without forcing the user to re-establish their filter/sort/page.

**Independent Test**: Can be tested by applying a filter, sort, and page on the Words Statistics page, clicking the "go to word" action for any row, editing the word (or not), clicking the edit form's "back" control, and confirming that the browser lands back on the Words Statistics page with the same filter, sort, and page as before.

**Acceptance Scenarios**:

1. **Given** a statistics row is displayed, **When** the user clicks the row's "go to word" action, **Then** the application navigates to the edit form for that word. (The row is always associated with a resolvable word because deleting a word also removes all its recorded answers — see FR-005.)
2. **Given** the user deletes a word from the Words page, **When** they open the Words Statistics page, **Then** no rows remain for that word (the answers were cascade-deleted along with the word).
3. **Given** the user navigated to the word edit form from the Words Statistics page (with a filter, sort, and page applied), **When** the user clicks the "back" control on the edit form, **Then** they return to the Words Statistics page with the same filter text, sort column and direction, and page number they had before.
4. **Given** the user navigated to the word edit form from the Words page (not the Words Statistics page), **When** the user clicks the "back" control on the edit form, **Then** they return to the Words page — the existing Words-page return behavior is preserved.

---

### User Story 5 - Browse a long statistics list with pagination (Priority: P2)

As a learner with a long practice history, I want the Words Statistics list to be split into pages — the same way the Sets and Words lists are — so the page stays responsive and I can navigate my history in predictable chunks.

**Why this priority**: Without pagination the page would have to render every aggregated row at once, which hurts responsiveness for heavy users and clashes with the established navigation pattern on Sets and Words. P2 because small-history users can still use the page without pagination, but for anyone with a non-trivial practice history this is what makes the list usable.

**Independent Test**: Can be tested by populating the user's history with more rows than fit on a single page, loading the Words Statistics page, confirming that only one page-worth of rows is shown at a time, that a pagination control is displayed, and that clicking through pages reveals the remaining rows.

**Acceptance Scenarios**:

1. **Given** the user's aggregated statistics would produce more rows than fit on a single page, **When** the user opens the Words Statistics page, **Then** only the first page of rows is shown and a pagination control reports the total number of pages.
2. **Given** the user is on page 1 of the paginated list, **When** they select page 2 via the pagination control, **Then** the next page of rows is shown and the URL reflects the new page number (consistent with how Sets and Words lists expose the current page).
3. **Given** the user changes the filter or sort while not on page 1, **When** the filter or sort takes effect, **Then** the list resets to page 1 so the user sees the most relevant rows first (matching the Sets and Words list behaviour).
4. **Given** the user uses the browser's forward/back buttons after navigating between pages, **When** they return to an earlier page state, **Then** the list restores the filter, sort, and page number that were active at that point.

---

### Edge Cases

- **Unauthenticated access**: Visiting the Words Statistics URL without being signed in must behave the same as any other authenticated page — the user is redirected to the sign-in flow.
- **Word deleted while being viewed in the statistics list**: If the user deletes a word from another tab and then clicks "go to word" on a now-stale statistics row, the edit form resolves as it would for any other missing word (current Words-page behaviour on 404). No orphaned data persists in the database (see FR-005).
- **Very large answer history**: A user with tens of thousands of recorded answers should still receive a usable page within reasonable load time; the list is paginated (see FR-015) so only one page-worth of rows is rendered at a time.
- **Current page falls outside the result set**: If the user is on a page whose number is greater than the total pages after a filter (or after data changes), the page resets to page 1 and the pagination control reflects the new total.
- **Ties during sorting**: When two rows share the same sort-column value, the tie-breaker is alphabetical order by the word so the order is deterministic.
- **Filter with only whitespace**: Whitespace-only filter input is treated as an empty filter (no filtering applied).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST provide a new authenticated page titled "Words Statistics" reachable from the primary navigation (alongside Sets, Words, About).
- **FR-002**: The page MUST display one row per unique word for which the currently signed-in user has at least one recorded answer in the "only open questions" learning mode.
- **FR-003**: Each row MUST display the following columns: the word, the total count of correct answers, the total count of incorrect answers, and a "go to word" action that redirects to the existing word edit form.
- **FR-004**: Aggregation MUST only include answers whose mode is "only open questions" and whose owning user matches the currently signed-in user; answers from other modes and other users MUST NOT contribute to the counts.
- **FR-005**: Correct-answer and incorrect-answer counts MUST be derived from the existing recorded-answer data. A new non-nullable `WordId` foreign key MUST be added to the recorded-answer entity, populated at answer time, and linked to `WordEntity` with `OnDelete(Cascade)`: deleting a word MUST also delete all its associated recorded answers. No other changes to the answer-recording behaviour are introduced by this feature.
- **FR-019**: The migration that introduces `WordId` MUST perform a best-effort backfill against existing answer rows: for each row, match the recorded question/expected-answer text against the owning user's `Word` entities (trimmed, case-insensitive). Rows with exactly one match MUST have `WordId` set; rows with zero or multiple matches MUST be deleted in the same migration. `WordId` is then added as non-nullable. The migration MUST run in a single transaction so a partially-backfilled database can never be left behind.
- **FR-006**: Users MUST be able to filter the list by entering text; rows whose word contains the entered substring (case-insensitive) remain visible and all others are hidden.
- **FR-007**: Users MUST be able to sort the list by the correct-answers column and by the incorrect-answers column, toggling between ascending and descending order by interacting with the column header.
- **FR-008**: The page MUST show a default sort order (by the number of incorrect answers, descending) when no explicit sort has been chosen.
- **FR-009**: When a sort is tied on the selected column, the list MUST fall back to alphabetical order by word as a deterministic tie-breaker.
- **FR-010**: Filtering and sorting MUST be composable — applying a filter and then a sort (or vice-versa) MUST produce the filtered rows in the selected sort order.
- **FR-011**: The page MUST distinguish between "no open-questions answers recorded yet" (primary empty state) and "current filter matches no rows" (filtered empty state) with appropriate messaging.
- **FR-012**: The "go to word" action MUST target the word's edit form using the `WordId` recorded on the answer. Because answers are cascade-deleted with their word (per FR-005), every visible statistics row always has a resolvable `WordId`.
- **FR-013**: Accessing the page without being signed in MUST route the user through the existing authentication flow, consistent with the rest of the authenticated pages.
- **FR-014**: The page MUST never expose another user's answer data; all aggregation and display MUST be scoped to the currently signed-in user's identifier.
- **FR-015**: The list MUST be paginated. The current page, the filter text, the sort column, and the sort direction MUST ALL be exposed as URL query parameters, making the view shareable/bookmarkable and letting browser back/forward navigate between list states. The pagination control itself and the page size MUST match the ones used by the existing Sets and Words lists.
- **FR-016**: Changing the filter text or the sort column/direction MUST reset the list to the first page, consistent with the Sets and Words list behaviour.
- **FR-017**: The "back" control on the word edit form MUST return the user to their source list: when the user arrived from the Words Statistics page, "back" MUST return to the Words Statistics page; when they arrived from the Words page, "back" MUST return to the Words page (existing behaviour, preserved).
- **FR-018**: When the word edit form returns the user to the Words Statistics page, the filter text, sort column, sort direction, and page number that were active at the moment they left MUST be restored. Because those values live in the URL (per FR-015), return is achieved by navigating back to the source URL.

### Key Entities

- **Word Statistics Row**: A per-user, per-word aggregation of that user's answers in the "only open questions" learning mode. It is calculated ad hoc (no persisted aggregate). Attributes: the word identifier, the word text for display, count of correct answers, count of incorrect answers.
- **Recorded Answer (existing, modified)**: Each individual answer the user has submitted, already stored in the database. Relevant attributes for this feature: owning user identifier, learning mode, whether the answer was correct, and — newly added by this feature — a non-nullable `WordId` foreign key pointing to the `Word` entity the answer referred to. Deleting the referenced word cascade-deletes all of its answers (`OnDelete(Cascade)`), so an answer never outlives its word.
- **Word (existing)**: The entity referenced by `Recorded Answer.WordId` and targeted by the "go to word" action. Statistics rows link back to the user's word collection so the existing edit form can be reused.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in user who has practiced open-questions mode can reach the Words Statistics page and understand their per-word accuracy within one minute of first discovering the feature.
- **SC-002**: For a user with up to 10,000 recorded open-questions answers, the first page of results becomes visible within 2 seconds on a typical broadband connection.
- **SC-003**: Filtering by a word substring narrows the visible (paginated) list within 300 milliseconds of the user pausing typing, for underlying collections up to 5,000 aggregated rows.
- **SC-004**: 100% of "go to word" clicks on a currently-rendered row resolve to the matching word edit form (cascade delete removes any answer whose word is gone, so stale/orphaned targets cannot be rendered).
- **SC-005**: Zero answer records belonging to other users ever appear in a given user's Words Statistics page, verified by scoped data access on every request.
- **SC-006**: Users can identify their three weakest words (most incorrect answers) in under 10 seconds by using the sort controls, starting from the default view.
- **SC-007**: Users who follow the "go to word" action from the statistics page and click "back" on the word edit form return to the Words Statistics page with their filter, sort, and page number intact in at least 99% of cases.

## Assumptions

- The user's identity is resolved by the same authentication mechanism already used across the existing authenticated pages (Sets, Words).
- "Only open questions mode" refers to the existing learning mode served by the existing open-questions-mode route; the mode discriminator already persisted on answer records is sufficient to filter for it without adding new fields.
- Words are matched across answers by the new `WordId` foreign key on each answer, not by text. There are no orphaned answers: deleting a word cascades to its answers, so every stored answer has a resolvable `WordId`.
- The "go to word" action uses `WordId` to target the word edit form directly. Because answers cannot outlive their word (cascade delete), the action is never in a "word missing" state for a visible row.
- Pagination uses the pagination control and page size established by the Sets and Words lists. This page additionally URL-persists filter text and sort state (extending the existing `page`-only pattern) so the whole list view is deep-linkable and survives reloads.
- Return-to-source context (filter text, sort column, sort direction, page number) does not need a separate carrier: the source URL already encodes all of it (per FR-015). The "go to word" action passes the source URL (or the information needed to reconstruct it) to the word edit form so its "back" control can navigate back exactly.
- The page is accessible to every signed-in user; there is no role-based gating beyond authentication.
