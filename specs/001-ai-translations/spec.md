# Feature Specification: AI-Generated Translations and Example Sentences

**Feature Branch**: `001-ai-translations`
**Created**: 2025-12-25
**Status**: Draft
**Input**: User description: "AI generated Polish translations for English words and AI generated example sentences with English words using modern LLM"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Translations for a Word (Priority: P1)

As a user creating or editing a vocabulary set, I want to generate Polish translations for an English word so that I don't have to manually look up translations.

When editing a word entry, I click a "Generate Translations" button next to the word. The system asks me how many translations I want (defaulting to 3) and uses the word type (noun, verb, etc.) to generate accurate translations. The translations are returned ordered from most common to least common usage. I can then select which translations to add to my word entry.

**Why this priority**: This is the core value proposition - reducing manual translation lookup effort. Without this, the feature has no utility.

**Independent Test**: Can be fully tested by creating a set with one English word, clicking generate translations, and verifying that Polish translations appear ranked by popularity.

**Acceptance Scenarios**:

1. **Given** I am editing a word entry with "run" as a verb, **When** I click "Generate Translations" without changing the count, **Then** I see 3 Polish translations ordered from most to least common (e.g., "biegać", "działać", "prowadzić")
2. **Given** I am editing a word entry with "bank" as a noun, **When** I click "Generate Translations" and select 2 translations, **Then** I see 2 Polish translations appropriate for the noun form (e.g., "bank", "brzeg")
3. **Given** I am editing multiple words in a set, **When** I generate translations for one word, **Then** only that word's translations are affected; other words remain unchanged

---

### User Story 2 - Generate Example Sentences (Priority: P2)

As a user creating or editing a vocabulary set, I want to generate example sentences for English words so that I can see the words used in context during study sessions.

When editing a word entry, I click a "Generate Example Sentences" button. The system asks me how many sentences I want (defaulting to 3) and generates English sentences demonstrating proper usage of the word. When I save the set, the example sentences are persisted with the word.

**Why this priority**: Example sentences enhance learning but are secondary to the core translation feature. Users can still learn vocabulary without examples.

**Independent Test**: Can be fully tested by creating a word entry, generating example sentences, saving the set, and verifying the sentences persist after reload.

**Acceptance Scenarios**:

1. **Given** I am editing a word entry for "perseverance", **When** I click "Generate Example Sentences" without changing the count, **Then** I see 3 English sentences using "perseverance" in context
2. **Given** I am editing a word entry, **When** I click "Generate Example Sentences" and select 5 sentences, **Then** I see 5 English sentences for that word
3. **Given** I have generated example sentences for a word, **When** I save the vocabulary set, **Then** the example sentences are saved and visible when I reopen the set
4. **Given** I have existing example sentences for a word, **When** I click "Generate Example Sentences" again, **Then** new sentences replace the previous ones

---

### User Story 3 - View Example Sentences in Content Page (Priority: P3)

As a user viewing my vocabulary set content, I want to see the example sentences alongside each word so that I can review words in context.

When viewing the Content page for a set, each word that has an example sentence displays that sentence below or alongside the word and its translations.

**Why this priority**: This is a display feature that depends on example sentences existing. It enhances the review experience but requires Story 2 to be complete first.

**Independent Test**: Can be fully tested by navigating to Content page for a set with example sentences and verifying sentences are visible.

**Acceptance Scenarios**:

1. **Given** I have a vocabulary set where some words have example sentences, **When** I view the Content page, **Then** words with example sentences display those sentences
2. **Given** a word has no example sentence, **When** I view the Content page, **Then** the word displays without an example sentence (no error, no placeholder)

---

### User Story 4 - Display Example Sentences in Study Modes (Priority: P4)

As a user studying vocabulary, I want to see example sentences in the results of Spelling Mode, Full Mode, and Open Questions Mode so that I can learn words in context.

After answering a question in any study mode, the result screen shows the example sentences for the word (when example sentences exist).

**Why this priority**: This enhances the study experience but is the final integration point. Core functionality must work first.

**Independent Test**: Can be fully tested by entering any study mode with a set containing example sentences, answering a question, and verifying the sentences appear in results.

**Acceptance Scenarios**:

1. **Given** I am in Spelling Mode with a word that has example sentences, **When** I submit my answer and view the result, **Then** the example sentences are displayed
2. **Given** I am in Full Mode, **When** I view the result, **Then** the example sentences for the word are displayed
3. **Given** I am in Open Questions Mode, **When** I view the result, **Then** the example sentences for the word are displayed
4. **Given** I am viewing a result for a word without example sentences, **When** the result displays, **Then** no example sentence section appears (graceful absence)

---

### Edge Cases

- What happens when the AI service is unavailable? Display a user-friendly error message and allow retry.
- What happens when a word has no valid translations? Display a message indicating no translations were found.
- What happens when generating translations for a word without a word type selected? Prompt user to select a word type first, or generate general translations with a warning.
- How does the system handle very obscure or misspelled English words? Return whatever translations the AI can provide, or a "no results" message.
- What happens if the user requests more translations than exist? Return all available translations with a note that fewer were found.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a "Generate Translations" button for each word entry in the set editor
- **FR-002**: System MUST allow users to specify the number of translations to generate (default: 3)
- **FR-003**: System MUST use the word's selected word type (noun, verb, adjective, etc.) when generating translations
- **FR-004**: System MUST return translations ordered from most common to least common usage
- **FR-005**: System MUST provide a "Generate Example Sentences" button for each word entry in the set editor
- **FR-006**: System MUST allow users to specify the number of example sentences to generate (default: 3)
- **FR-007**: System MUST generate contextually appropriate English example sentences
- **FR-008**: System MUST persist example sentences when the vocabulary set is saved
- **FR-009**: System MUST display example sentences on the Content page for words that have them
- **FR-010**: System MUST display example sentences in Spelling Mode results
- **FR-011**: System MUST display example sentences in Full Mode results
- **FR-012**: System MUST display example sentences in Open Questions Mode results
- **FR-013**: System MUST handle AI service failures gracefully with user-friendly error messages
- **FR-014**: System MUST allow independent translation generation for each word (generating for one word does not affect others)

### Key Entities

- **ExampleSentence**: An English sentence demonstrating usage of a word; belongs to a Word entry; contains the sentence text
- **Translation**: A Polish translation of an English word; belongs to a Word entry; has a popularity/order ranking

## Assumptions

- Users have an active internet connection when generating translations or example sentences
- The LLM service will be accessed via a backend API (not directly from the browser)
- Translation generation is on-demand (user-initiated), not automatic
- Example sentences are generated in batches (user-specified count, default 3)
- The existing word type enumeration (noun, verb, etc.) is sufficient for translation context

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can generate translations for a word in under 5 seconds
- **SC-002**: Users can generate an example sentence for a word in under 5 seconds
- **SC-003**: Generated translations are relevant to the word type at least 90% of the time
- **SC-004**: Generated example sentences correctly use the target word in context 95% of the time
- **SC-005**: Example sentences persist correctly across page reloads and sessions 100% of the time
- **SC-006**: Example sentences display correctly in all three study modes when applicable
