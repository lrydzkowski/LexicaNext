| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-05-03 |
| **Status** | done |
| **Complexity** | small |

# TinySpec: Edit a word inline from the create/edit set form

## What

In the set create/edit form (`SetForm`), add an "Edit" action on every word row that opens a fullScreen modal hosting `WordForm` in edit mode for that row's word — structurally analogous to the existing `CreateWordModal` opened by the "Create New Word" button. Saving updates the word via the existing `useUpdateWord` mutation and refreshes the row's displayed `word` / `wordType` in the form's `selectedWords` state without losing the user's pending set selections.

> **Scope check**: 1 new modal component + `SetForm.tsx` modified + 1 Playwright spec. No backend or API changes. Comfortable tinyspec.

## Context

| File | Role |
|------|------|
| `Frontend/lexica-next-front/src/components/sets/EditWordModal.tsx` | NEW — shared modal mirroring `CreateWordModal` (`Modal.Root`, `size="lg"`, `fullScreen`, `returnFocus`, header with title + `Modal.CloseButton`, body in `Container size="md"`). Internally calls `useWord(wordId)` and renders `<WordForm mode="edit" wordId={wordId} word={word} isLoading={...} onSuccess={...} onCancel={...} />`. |
| `Frontend/lexica-next-front/src/components/sets/SetForm.tsx` | MODIFIED — add an `IconPencil` `ActionIcon` to each desktop table row and each mobile `Paper` row (placed left of the existing `IconTrash` remove button); track `editingWordId` state; render `<EditWordModal opened={...} wordId={editingWordId} onClose={...} onSuccess={...} />`; on success, update the matching `selectedWords` entry's `word` / `wordType`. |
| `Frontend/lexica-next-front/src/components/sets/CreateWordModal.tsx` | REFERENCE — modal shell to mirror exactly (same Mantine props, same `Container size="md"` body wrapper, same `onEntered` focus handoff to `WordFormRef`). |
| `Frontend/lexica-next-front/src/components/words/WordForm.tsx` | REFERENCE — already supports `mode="edit"`, accepts `wordId` + `word`, calls `onSuccess({ wordId, word, wordType })` after `useUpdateWord`, and respects `onCancel` (no navigation when provided). |
| `Frontend/lexica-next-front/src/hooks/api.ts` | REFERENCE — `useWord(wordId)` query (line 192) is enabled only when `wordId` is truthy; safe to mount `EditWordModal` only when an id has been selected. |
| `Frontend/lexica-next-front-e2e-tests/tests/sets/18-edit-word-from-set-form.spec.ts` | NEW — Playwright spec covering: open edit modal from a row in the set edit form, change the word/translation, save, assert the row's displayed word updates, save the set, and re-open the set to confirm persistence. Mirrors `03-edit-set.spec.ts` setup/cleanup pattern. |
| `Frontend/lexica-next-front-e2e-tests/tests/sets/03-edit-set.spec.ts` | REFERENCE — established Playwright pattern for editing a set (auth-token capture, `createWordViaApiReturningId`, `createSetViaApi`, navigation, cleanup via `deleteSetViaApi` / `deleteWordsViaApi`). |

## Requirements

1. Every selected-word row in `SetForm` (both the mobile `Paper` layout and the desktop `Table` layout) shows an "Edit word" `ActionIcon` (e.g., `IconPencil`) placed immediately to the left of the existing remove (`IconTrash`) button.
2. Clicking the Edit button opens a modal whose shell exactly mirrors `CreateWordModal`: `Modal.Root` with `size="lg"`, `fullScreen`, `returnFocus`, header containing title `Edit Word` and `Modal.CloseButton`, body wrapped in `Container size="md"`.
3. The modal hosts `<WordForm mode="edit" .../>` pre-populated with the row's word data (fetched via `useWord(wordId)`), shows a `LoadingOverlay` while loading, and focuses the first input after the entrance transition (same `onEntered` → `WordFormRef.focus()` pattern as `CreateWordModal`).
4. Saving the form calls the existing `useUpdateWord` mutation (already wired inside `WordForm`), closes the modal on success, and updates the matching entry in `selectedWords` so the row immediately reflects the new `word` / `wordType` without a page reload.
5. Cancelling the form (or closing the modal via the close button / overlay click / `Escape`) closes the modal with no mutation and no change to `selectedWords`.
6. The user's in-progress set state — current `setName` value, the order and membership of `selectedWords`, any unsaved additions/removals — is preserved across opening, saving, and closing the edit modal.
7. The Edit button does not interfere with existing keyboard shortcuts on `SetForm` (Save, Cancel, Add Words, Create New Word, row-delete number keys).
8. A Playwright E2E spec covers: from `/sets/:setId/edit`, click Edit on a row, change the word text, save, assert the row shows the new word, then save the set and re-navigate to confirm persistence.

## Plan

1. **Create `EditWordModal.tsx`** under `Frontend/lexica-next-front/src/components/sets/`:
   - Props: `{ opened: boolean; onClose: () => void; wordId: string | null; onSuccess: (data: WordFormSuccessData) => void }`.
   - Mirror `CreateWordModal.tsx` structure verbatim (`Modal.Root` + `Modal.Overlay` + `Modal.Content` + `Modal.Header` with `Container size="md"` and title `Edit Word` + `Modal.Body` with `Container size="md"`).
   - Inside the body, call `useWord(wordId ?? '')` (the hook is `enabled: !!wordId`, so it stays idle when no row is selected). Render `<WordForm ref={formRef} mode="edit" wordId={wordId} word={data} isLoading={isLoading} onSuccess={(data) => { onSuccess(data); onClose(); }} onCancel={onClose} />`.
   - Reuse the `transitionProps={{ onEntered: handleModalEntered }}` pattern to focus the first input via `WordFormRef`.

2. **Modify `SetForm.tsx`**:
   - Add `import { IconPencil } from '@tabler/icons-react';` (already imports `IconPlus`, `IconTrash`).
   - Add `import { EditWordModal } from './EditWordModal';`.
   - Add state: `const [editingWordId, setEditingWordId] = useState<string | null>(null);` and a `useDisclosure(false)` pair `[editModalOpened, { open: openEditModal, close: closeEditModal }]`.
   - Add handler `handleEditWord(wordId: string) => { setEditingWordId(wordId); openEditModal(); }`.
   - Add handler `handleWordEdited(data: WordFormSuccessData) => { setSelectedWords((prev) => prev.map((w) => w.wordId === data.wordId ? { ...w, word: data.word, wordType: data.wordType } : w)); }`.
   - In both the mobile `Paper` row and the desktop `Table` row, insert an `ActionIcon variant="subtle" color="blue" size="sm" aria-label="Edit word" onClick={() => handleEditWord(word.wordId)}><IconPencil size={14} /></ActionIcon>` immediately before the existing remove `ActionIcon`.
   - At the bottom of the `<>` fragment, render `<EditWordModal opened={editModalOpened} onClose={() => { closeEditModal(); setEditingWordId(null); }} wordId={editingWordId} onSuccess={handleWordEdited} />`.
   - Do NOT alter the existing `addWordsButtonRef`, `desktopDeleteButtonRefs`, `mobileDeleteButtonRefs`, or shortcut wiring — the new button is purely additive.

3. **Add Playwright E2E spec** at `Frontend/lexica-next-front-e2e-tests/tests/sets/18-edit-word-from-set-form.spec.ts`:
   - Reuse the helper/setup pattern from `03-edit-set.spec.ts` (auth-token capture, per-test API-created word + set, cleanup in `afterAll`).
   - One test: create a set with one word, navigate to `/sets/:setId/edit`, click the row's Edit button (`page.getByRole('button', { name: 'Edit word' })`), assert the `Edit Word` modal heading is visible, change the word's first translation (or word text), click Save, assert the modal closes, assert the row in the set form shows the updated value, click the form's Save button, navigate back to `/sets/:setId/edit`, confirm the updated value persists.
   - Cancel-path test: open the edit modal, click Cancel (or close), assert the modal closes and the row's text is unchanged.

4. **Verify** `npm run build` and `npm run lint` are clean in `Frontend/lexica-next-front`; new Playwright spec parses (`npx playwright test tests/sets/18-edit-word-from-set-form.spec.ts --list`); manual smoke-test in dev confirms editing a row updates it inline without losing other in-progress set changes.

## Tasks

- [x] Add `Frontend/lexica-next-front/src/components/sets/EditWordModal.tsx` (mirrors `CreateWordModal` shell; loads via `useWord`; hosts `WordForm` in `mode="edit"`).
- [x] Modify `SetForm.tsx`: add `IconPencil` action button to mobile `Paper` rows and desktop `Table` rows; wire `editingWordId` state, `useDisclosure` pair, `handleEditWord`, `handleWordEdited`; render `<EditWordModal />`.
- [x] Add Playwright E2E spec `tests/sets/18-edit-word-from-set-form.spec.ts` (happy path + cancel path).
- [x] `npm run build` + `npm run lint` clean; Playwright spec parses (`--list`).

## Done When

- [x] All tasks checked off.
- [x] Each row in the create-set and edit-set forms exposes an Edit button that opens a fullScreen `WordForm` modal pre-populated with the word's data.
- [x] Saving the modal updates the row inline and preserves all other in-progress set state; cancelling makes no changes.
- [~] Playwright spec `18-edit-word-from-set-form.spec.ts` parses and lists both tests; live run is deferred to the user (requires running backend + Auth0 + dev server).
- [x] No new lint, type, or build errors.
