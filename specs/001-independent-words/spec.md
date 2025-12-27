# Feature Specification: Independent Word Management

**Feature Branch**: `001-independent-words`
**Created**: 2025-12-27
**Status**: Draft
**Input**: User description: "Reorganize word management - create words independently and choose them for sets"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Words List (Priority: P1)

As a user, I want to view a list of all my vocabulary words in a dedicated page so that I can see and manage my word collection independently from sets.

**Why this priority**: This is the foundation for independent word management. Without the ability to view words, users cannot interact with the new word management system.

**Independent Test**: Can be fully tested by navigating to `/words` page and verifying the table displays words with correct columns (Word, Word Type, Created, Edited, Actions) and delivers a clear overview of the vocabulary collection.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they navigate to `/words`, **Then** they see a table with all their vocabulary words displaying Word, Word Type, Created date, Edited date, and Actions columns.
2. **Given** the user has no words created, **When** they navigate to `/words`, **Then** they see an empty state message indicating no words exist.
3. **Given** the user has many words, **When** they view the words table, **Then** results are paginated with controls to navigate between pages.

---

### User Story 2 - Create New Word (Priority: P1)

As a user, I want to create new vocabulary words independently so that I can build a word library that can later be used across multiple sets.

**Why this priority**: Creating words is essential for populating the word library. This enables the core value proposition of reusable words across sets.

**Independent Test**: Can be fully tested by clicking "Create New Word" button, filling out the form (word, word type, translations, example sentences), saving, and verifying the word appears in the words list.

**Acceptance Scenarios**:

1. **Given** the user is on the `/words` page, **When** they click "Create New Word", **Then** they see a form with fields for word, word type, translations, and example sentences (identical to the current entry form in set creation).
2. **Given** the user is filling the create word form, **When** they enter a word with at least one translation and submit, **Then** the word is created and they are redirected to the words list.
3. **Given** the user is filling the create word form, **When** they enter a word that already exists with the same word type, **Then** they see a validation error indicating the word already exists.
4. **Given** the user is filling the create word form, **When** they click cancel, **Then** they return to the words list without creating a word.

---

### User Story 3 - Search, Sort, and Paginate Words (Priority: P1)

As a user, I want to search, sort, and paginate through my words so that I can efficiently find specific words in a large vocabulary collection.

**Why this priority**: These capabilities are essential for usability when the word collection grows. They mirror the existing sets functionality and are required for the word selection feature in sets.

**Independent Test**: Can be fully tested by using the search field to filter words, clicking column headers to sort, and using pagination controls to navigate through pages.

**Acceptance Scenarios**:

1. **Given** the user is on the words page with multiple words, **When** they type in the search field, **Then** the table filters to show only words matching the search query.
2. **Given** the user is on the words page, **When** they click a sortable column header, **Then** the table sorts by that column in ascending/descending order.
3. **Given** the user has more words than fit on one page, **When** they click next page, **Then** they see the next set of words.
4. **Given** the user performs a search, **When** the search returns no results, **Then** they see an appropriate empty state message.

---

### User Story 4 - Edit Word (Priority: P2)

As a user, I want to edit an existing word so that I can correct mistakes or add additional translations and example sentences.

**Why this priority**: Editing is important but secondary to creating and viewing. Users need the ability to refine their vocabulary over time.

**Independent Test**: Can be fully tested by clicking "Edit Word" action on any word, modifying the word details, saving, and verifying the changes are reflected in the words list.

**Acceptance Scenarios**:

1. **Given** the user is on the words page, **When** they click "Edit Word" action for a word, **Then** they see the edit form pre-populated with the word's current data.
2. **Given** the user is editing a word, **When** they modify the word, translations, or example sentences and save, **Then** the changes are persisted and the Edited date is updated.
3. **Given** the user is editing a word, **When** they change the word to one that already exists with the same word type, **Then** they see a validation error.
4. **Given** the user is editing a word, **When** they click cancel, **Then** they return to the words list without saving changes.

---

### User Story 5 - Delete Word (Priority: P2)

As a user, I want to delete a word so that I can remove words I no longer need from my vocabulary collection.

**Why this priority**: Deletion is important for maintaining a clean word library but is used less frequently than viewing or editing.

**Independent Test**: Can be fully tested by clicking "Delete Word" action, confirming deletion, and verifying the word no longer appears in the words list.

**Acceptance Scenarios**:

1. **Given** the user is on the words page, **When** they click "Delete Word" action for a word, **Then** they see a confirmation dialog asking if they are sure.
2. **Given** the user sees the delete confirmation, **When** they confirm deletion, **Then** the word is deleted and removed from the list.
3. **Given** the user sees the delete confirmation, **When** they cancel, **Then** the word remains in the list.
4. **Given** a word is used in one or more sets, **When** the user deletes the word, **Then** the word is removed from all sets that reference it.

---

### User Story 6 - Select Words for Set (Priority: P1)

As a user, I want to select existing words when creating or editing a set so that I can reuse my vocabulary across multiple sets without re-entering data.

**Why this priority**: This is the core value of the feature - enabling word reuse. Without this, independent word management has limited value.

**Independent Test**: Can be fully tested by creating a new set, using the word selection table to add words to the set, and verifying the set contains the selected words.

**Acceptance Scenarios**:

1. **Given** the user is creating or editing a set, **When** they view the set form, **Then** they see a word selection table (with the same look and functionality as the words page table).
2. **Given** the user is in the set form with the word selection table, **When** they select words from the table, **Then** the selected words are added to the set.
3. **Given** the user has selected words for a set, **When** they save the set, **Then** the set is created/updated with references to the selected words.
4. **Given** a word is already in the current set, **When** the user views the word selection table, **Then** that word is shown as already selected/included.
5. **Given** the user is viewing the word selection table, **When** they search/sort/paginate, **Then** the table behaves identically to the standalone words page.

---

### User Story 7 - Remove Word from Set (Priority: P2)

As a user, I want to remove a word from a set without deleting the word itself so that I can adjust set contents while preserving my vocabulary collection.

**Why this priority**: This complements the word selection feature and is important for set management, but is secondary to the ability to add words.

**Independent Test**: Can be fully tested by editing a set, removing a word from the selection, saving, and verifying the word still exists in the words list but is no longer in the set.

**Acceptance Scenarios**:

1. **Given** the user is editing a set with selected words, **When** they remove a word from the selection, **Then** the word is marked for removal from the set.
2. **Given** the user has marked a word for removal, **When** they save the set, **Then** the word is no longer associated with the set but still exists in the words list.

---

### Edge Cases

- What happens when a user tries to create a word with the same spelling but different word type? The system treats these as distinct words (e.g., "run" as Noun vs "run" as Verb are separate words).
- What happens when a user searches with special characters? The search handles special characters gracefully without errors.
- What happens when a user tries to delete a word that is used in multiple sets? The word is removed from all sets, and the user is warned about this in the confirmation dialog showing which sets will be affected.
- What happens when pagination/sorting is applied and a word is deleted? The table refreshes and maintains the current page if possible, or navigates to the last available page.

## Requirements *(mandatory)*

### Functional Requirements

**Words Management:**

- **FR-001**: System MUST provide a `/words` page accessible to authenticated users.
- **FR-002**: System MUST display words in a table with columns: Word, Word Type, Created, Edited, Actions.
- **FR-003**: System MUST support server-side pagination for the words table with configurable page size.
- **FR-004**: System MUST support server-side sorting for the words table on all displayed columns.
- **FR-005**: System MUST support server-side search/filtering for words by word text and word type.
- **FR-006**: Users MUST be able to create new words with: word text (required, 1-200 chars), word type (required), translations (at least 1 required, 1-200 chars each), and example sentences (optional, max 500 chars each).
- **FR-007**: System MUST validate word uniqueness based on the combination of word text and word type.
- **FR-008**: Users MUST be able to edit existing words and update all fields.
- **FR-009**: System MUST automatically update the Edited timestamp when a word is modified.
- **FR-010**: Users MUST be able to delete words with a confirmation dialog.
- **FR-011**: System MUST display a warning when deleting a word that is used in sets, showing which sets will be affected.
- **FR-012**: System MUST provide a "Create New Word" button on the words page.
- **FR-013**: System MUST provide a "Refresh" button on the words page to reload the table.

**Set-Word Association:**

- **FR-014**: System MUST allow sets to reference existing words instead of containing embedded word data.
- **FR-015**: Users MUST be able to select words for a set using a table interface identical to the words page.
- **FR-016**: The word selection table MUST support the same pagination, sorting, and search functionality as the words page.
- **FR-017**: System MUST indicate which words are already selected for the current set in the selection table.
- **FR-018**: Users MUST be able to add and remove words from a set without deleting the words themselves.
- **FR-019**: System MUST maintain word order within a set (the order in which words appear during study).
- **FR-020**: When a word is deleted, System MUST automatically remove it from all sets that reference it.

**UI Consistency:**

- **FR-021**: The create/edit word form MUST have the same fields and layout as the current entry form in set creation (word, word type, translations, example sentences).
- **FR-022**: The words page MUST follow the same UI patterns as the sets page (table/card layout, action buttons, loading states, empty states).

### Key Entities

- **Word**: Independent vocabulary item with word text, word type, translations, example sentences, created timestamp, and edited timestamp. Words can be referenced by multiple sets.
- **Set**: Collection of vocabulary items for study. References words by ID rather than containing embedded word data. Maintains order of words within the set.
- **Translation**: Text translation associated with a word. Multiple translations per word are supported.
- **ExampleSentence**: Example sentence demonstrating word usage. Multiple sentences per word are supported.
- **WordType**: Categorization of a word (Noun, Verb, Adjective, Adverb, None).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a new word and see it in the words list within 3 seconds.
- **SC-002**: Users can search for a word and see filtered results within 1 second.
- **SC-003**: Users can add an existing word to a set in under 5 clicks.
- **SC-004**: Users can create a set with 10 words in under 2 minutes (selecting from existing words).
- **SC-005**: The words table loads and displays results within 2 seconds for collections up to 1000 words.
- **SC-006**: 100% of existing vocabulary learning functionality (spelling mode, full mode, open questions mode) continues to work with the new word-set structure.
- **SC-007**: Word reuse rate: Users can use the same word in multiple sets without re-entering any data.

## Assumptions

- The existing authentication and authorization system (Auth0) will be used for the new words endpoints.
- The current database technology (PostgreSQL with Entity Framework Core) will be used for storing independent words.
- The existing UI component library (Mantine) will be used for the words page and forms.
- Audio recordings will continue to be fetched from the external English Dictionary API based on word text and type.
- The "Generate Translations" and "Generate Sentences" AI features will continue to work in the word creation/edit form.
- Migration of existing embedded words to independent words is out of scope for this feature (existing sets will continue to work, new sets will use the new model).
