| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-05-03 |
| **Status** | done |
| **Complexity** | small |

# TinySpec: Show "Words in this mode" list inside every learning mode

## What

Add a header button in every learning-mode page (Full, Spelling, Open Questions, Sentences) that opens a modal listing all words currently being practiced in that session. The modal mirrors the structure of `CreateWordModal` (Mantine `Modal.Root`, `size="lg"`, `fullScreen`, `returnFocus`). The list reflects the actual entries the mode is iterating over — for Sentences mode this excludes entries that had no eligible example sentence; for the other modes this is the full set entry list.

> **Scope check**: 1 new modal component + 4 mode components modified. Cohesive, additive, no backend changes. Comfortable tinyspec.

## Context

| File | Role |
|------|------|
| `Frontend/lexica-next-front/src/components/sets/modes/ModeWordsListModal.tsx` | NEW — shared modal that takes `entries: EntryDto[]` and renders the words/translations/word-types list. Mirrors `CreateWordModal` structure (fullScreen, returnFocus, header with title + CloseButton, body with `Container size="md"`). |
| `Frontend/lexica-next-front/src/components/sets/modes/SetFullMode.tsx` | MODIFIED — add a "Show Words" button in the existing top `Stack` (next to/under the progress text), wire `useDisclosure`, render the modal with `entries` (the working list). |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSpellingMode.tsx` | MODIFIED — same pattern, passes its own `entries` state. |
| `Frontend/lexica-next-front/src/components/sets/modes/SetOnlyOpenQuestionsMode.tsx` | MODIFIED — same pattern, passes its own `entries` state (also covers the library-wide Random/Weakest practice pages — both reuse this component). |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSentencesMode.tsx` | MODIFIED — same pattern, passes its own `entries` state (already filtered to entries with eligible sentences). |
| `Frontend/lexica-next-front/src/components/sets/CreateWordModal.tsx` | REFERENCE — modal shell to mirror (`Modal.Root` + `fullScreen` + `returnFocus` + header layout). |
| `Frontend/lexica-next-front/src/components/sets/WordCard.tsx` | REFERENCE — established way to render a word with translations/word-type Badge. |
| `Frontend/lexica-next-front/src/utils/utils.ts` | REFERENCE — `serialize(entry.translations)` helper used by the existing modes. |
| `Frontend/lexica-next-front-e2e-tests/tests/sets/17-mode-words-list.spec.ts` | NEW — Playwright spec covering the "Show Words" button across all four modes. Mirrors the helper/setup pattern of `11-open-questions-mode.spec.ts` (per-test set creation via API helpers, cleanup in `afterEach`/end of test). |
| `Frontend/lexica-next-front-e2e-tests/tests/sets/11-open-questions-mode.spec.ts` | REFERENCE — established Playwright pattern (auth-token capture, `createFreshOpenQSet`, `cleanupSet`, navigation to `/sets/:setId/<mode>`). |

## Requirements

1. Every learning-mode page (Full, Spelling, Open Questions, Sentences) shows a "Show Words" button that is visible during the practice phase (i.e., while `currentQuestion` is rendered) and during the completion screen — but hidden when the "No entries found" / "No questions available" alert states are shown.
2. Clicking the button opens a modal with the same structural shape as `CreateWordModal`: `Modal.Root` with `size="lg"`, `fullScreen`, `returnFocus`, header containing a title (e.g., `Words in this mode`) and `Modal.CloseButton`, body wrapped in `Container size="md"`.
3. The modal lists every entry currently in the mode's working `entries` state, in the order it holds them. Each list row shows the word, its word-type Badge, and the translations (rendered the same way as the existing feedback panel, e.g., `serialize(entry.translations)` or as a stacked list).
4. For Sentences mode, the list contains only entries that have at least one eligible sentence (i.e., the post-`buildSentencesEntries` set). For the other three modes, it contains every set entry.
5. Closing the modal returns focus to the button that opened it (Mantine `returnFocus` already does this when used as in `CreateWordModal`).
6. No new endpoints, no API call — the data is already in the mode component's `entries` state.
7. The button does not interfere with the existing keyboard shortcuts (Enter to submit, number keys for options in `SetFullMode`).
8. A Playwright E2E spec covers all four modes: opening the modal shows every expected word; for Sentences mode, words whose example sentences do NOT contain the headword as a whole word are NOT shown; closing the modal returns the user to the practice screen with focus restored to the trigger button.

## Plan

1. **Create `ModeWordsListModal.tsx`** under `src/components/sets/modes/`. Props: `{ opened: boolean; onClose: () => void; entries: EntryDto[] }`. Internally:
   - Render `Modal.Root` mirroring `CreateWordModal` (fullScreen, size="lg", returnFocus, header with `Title` "Words in this mode" + `Modal.CloseButton`, body in `Container size="md"`).
   - Render entries as a `Stack`: each row is a `Paper` (or `Card`) showing `<Text fw={600}>{entry.word}</Text>`, a `Badge` for `entry.wordType`, and translations via `serialize(entry.translations)` or a small bulleted `Stack`. Keep it deliberately simple — no audio button, no example sentences (those exist on the per-question feedback panel and on `WordCard`).
   - If `entries.length === 0`, render a small dimmed "No words in this session" text.

2. **Wire button + modal into each mode component**. In each of `SetFullMode`, `SetSpellingMode`, `SetOnlyOpenQuestionsMode`, `SetSentencesMode`:
   - Add `import { useDisclosure } from '@mantine/hooks';` (already imported elsewhere in the project; check for existing import in each file first).
   - Add `const [wordsModalOpened, { open: openWordsModal, close: closeWordsModal }] = useDisclosure(false);`.
   - In the `return (...)` JSX, just under (or beside) the existing `Text size="sm" c="dimmed" ta="center">{getCompletedCount(...)} / {entries.length} words completed</Text>` line, add a small `Group justify="center"` containing a `Button variant="subtle" size="xs" onClick={openWordsModal}>Show Words</Button>`.
   - At the bottom of the component's `return`, add `<ModeWordsListModal opened={wordsModalOpened} onClose={closeWordsModal} entries={entries} />`.
   - For `SetSentencesMode`, `entries` is already `SentencesEntry[]` (which extends `EntryDto`) — pass it as-is; the modal only needs `EntryDto` fields.

3. **Add Playwright E2E spec** at `Frontend/lexica-next-front-e2e-tests/tests/sets/17-mode-words-list.spec.ts`. Use the same auth-token + API-helper setup as `11-open-questions-mode.spec.ts`. One `describe('mode words list')` block with one test per mode (`full`, `spelling`, `open-questions`, `sentences`). Each test:
   - Creates a fresh set with 2-3 known words via the API helpers (`createWordViaApiReturningId`, `createSetViaApi`).
   - For the `sentences` test, additionally seed at least one extra word whose example sentences do NOT contain the headword as a whole word, so we can assert it is filtered OUT of the modal list.
   - Navigates to the corresponding mode URL (`/sets/:setId/full-mode`, `/spelling-mode`, `/open-questions-mode`, `/sentences-mode`).
   - Clicks the "Show Words" button (`page.getByRole('button', { name: 'Show Words' })`).
   - Asserts the modal heading "Words in this mode" is visible and each expected word is present (`expect(page.getByText(word)).toBeVisible()` scoped to the modal).
   - Closes the modal via the `Modal.CloseButton` and asserts the practice screen is visible again.
   - Cleans up via `cleanupSet`.

4. **Verify** `npm run build` and `npm run lint` are clean; new Playwright spec passes locally (`npx playwright test tests/sets/17-mode-words-list.spec.ts`); manual smoke-test on each mode confirms the modal lists exactly the entries being practiced.

## Tasks

- [x] Add `Frontend/lexica-next-front/src/components/sets/modes/ModeWordsListModal.tsx` (mirrors `CreateWordModal` shell; renders `entries` list).
- [x] Wire button + modal into `SetFullMode.tsx`.
- [x] Wire button + modal into `SetSpellingMode.tsx`.
- [x] Wire button + modal into `SetOnlyOpenQuestionsMode.tsx`.
- [x] Wire button + modal into `SetSentencesMode.tsx`.
- [x] Add Playwright E2E spec `tests/sets/17-mode-words-list.spec.ts` (one test per mode + Sentences-mode filtering assertion).
- [x] `npm run build` + `npm run lint` clean; new Playwright spec passes `--list` (parses + discovers all 4 tests). Live `npx playwright test` run deferred — requires running backend + Auth0 + dev server, which is not available in this implementation environment.

## Done When

- [x] All tasks checked off.
- [x] Each of the four modes has a "Show Words" button that opens a fullScreen modal shaped like `CreateWordModal`.
- [x] The modal lists exactly the entries the mode component is iterating (Sentences mode list excludes entries with no eligible sentence — guaranteed by passing the component's own filtered `entries` state into the modal).
- [~] Playwright spec `17-mode-words-list.spec.ts` parses + lists all four tests; live run requires the dev backend and was deferred to the user.
- [x] No new lint, type, or build errors (`npm run lint` clean; `npm run build` clean).
- [x] Per-set Random/Weakest Open Questions practice pages also show the button automatically (they reuse `SetOnlyOpenQuestionsMode` — no extra work needed).
