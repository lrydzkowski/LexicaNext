| Field | Value |
|-------|-------|
| **Branch** | `develop` |
| **Date** | 2026-05-05 |
| **Status** | done |
| **Complexity** | small-to-medium |

# TinySpec: Preserve full list state when navigating back

## What

`WordsStatisticsList` already preserves its full table state (page, sort field,
sort order, search query) when the user navigates to the word edit form and
back. It does so by passing `returnTo: <currentUrl-with-search>` on every
forward link, and the destination page reads `returnTo` (with a `startsWith('/')`
safety check) to navigate back. Replicate that exact pattern in every other
list-with-go-back-button flow currently relying on the older `returnPage`-only
mechanism, so sort/filter/search state survives a round-trip from `WordsList`,
`SetsList`, the four `Set*Mode` pages, and any inner forms (`WordForm`,
`SetForm`, mode completion screens).

> **Scope warning**: this touches ~14 files across two areas (Words, Sets +
> modes). It exceeds the typical tinyspec ceiling of 5 files / 10 tasks.
> The change is mechanical (uniform `returnPage` → `returnTo` swap) and the
> tasks are organised by area, but if you prefer one PR per area, split into:
> (a) shared helper, (b) Words area, (c) Sets list/form/content, (d) Set mode
> pages. Otherwise proceed as one tinyspec.

## Context

| File | Role |
|------|------|
| `Frontend/lexica-next-front/src/components/wordsStatistics/WordsStatisticsList.tsx` | REFERENCE — canonical implementation. `currentUrl = /words-statistics${location.search}` is passed as `{ returnTo: currentUrl }` on every Edit link. |
| `Frontend/lexica-next-front/src/pages/words/WordEditPage.tsx` | REFERENCE — canonical receiver: reads `returnTo`, validates `startsWith('/')`, falls back to `links.words.getUrl({}, { page: returnPage })`. The `returnPage` fallback can be deleted once all callers send `returnTo`. |
| `Frontend/lexica-next-front/src/hooks/useReturnTo.ts` | NEW — shared hook that returns `(navigate: () => void)` given a default URL: parses `returnTo`, validates `startsWith('/')`, falls back to default. Replaces the duplicated 3-line pattern across destination pages. |
| `Frontend/lexica-next-front/src/utils/links.ts` *(or inline)* | NEW helper — `buildReturnTo(location: Location)` returns `${location.pathname}${location.search}` so list pages don't hand-roll the URL each time. (Optional; the inline form is only one line.) |
| `Frontend/lexica-next-front/src/components/words/WordsList.tsx` | MODIFIED — replace `{ returnPage: currentPage.toString() }` on every link (`editWord`, `newWord` × 3) with `{ returnTo: '/words${location.search}' }` derived from `useLocation()`. |
| `Frontend/lexica-next-front/src/components/sets/SetsList.tsx` | MODIFIED — replace `{ returnPage: currentPage.toString() }` on every link (`newSet` × 2, `spellingMode`, `sentencesMode`, `fullMode`, `openQuestionsMode`, `setContent`, `editSet`) with `returnTo` derived from `useLocation()`. |
| `Frontend/lexica-next-front/src/pages/words/WordEditPage.tsx` | MODIFIED — switch to `useReturnTo(links.words.getUrl())`; drop the `returnPage` fallback. |
| `Frontend/lexica-next-front/src/pages/words/WordNewPage.tsx` | MODIFIED — same: use `useReturnTo`. |
| `Frontend/lexica-next-front/src/components/words/WordForm.tsx` | MODIFIED — `handleCancel` and `handleSubmit` success branch use `useReturnTo(links.words.getUrl())` instead of `{ page: returnPage }`. |
| `Frontend/lexica-next-front/src/pages/sets/SetNewPage.tsx` | MODIFIED — use `useReturnTo`. |
| `Frontend/lexica-next-front/src/pages/sets/SetEditPage.tsx` | MODIFIED — use `useReturnTo`. |
| `Frontend/lexica-next-front/src/pages/sets/SetContentPage.tsx` | MODIFIED — use `useReturnTo`. |
| `Frontend/lexica-next-front/src/components/sets/SetForm.tsx` | MODIFIED — `handleCancel` and the update-success navigate use `useReturnTo`. |
| `Frontend/lexica-next-front/src/pages/sets/modes/SetSpellingModePage.tsx` | MODIFIED — use `useReturnTo`. |
| `Frontend/lexica-next-front/src/pages/sets/modes/SetSentencesModePage.tsx` | MODIFIED — use `useReturnTo`. |
| `Frontend/lexica-next-front/src/pages/sets/modes/SetFullModePage.tsx` | MODIFIED — use `useReturnTo`. |
| `Frontend/lexica-next-front/src/pages/sets/modes/SetOnlyOpenQuestionsModePage.tsx` | MODIFIED — derive `backUrl` via `useReturnTo`, keep passing `backUrl` prop into `SetOnlyOpenQuestionsMode`. |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSpellingMode.tsx` | MODIFIED — completion-screen "Back to Sets" button uses `useReturnTo`. |
| `Frontend/lexica-next-front/src/components/sets/modes/SetSentencesMode.tsx` | MODIFIED — completion-screen "Back to Sets" button uses `useReturnTo`. |
| `Frontend/lexica-next-front/src/components/sets/modes/SetFullMode.tsx` | MODIFIED — completion-screen "Back to Sets" button uses `useReturnTo`. |
| `Frontend/lexica-next-front-e2e-tests/tests/sets/01-sets-list.spec.ts` *(or analogous)* | MODIFIED OR NEW — Playwright spec asserting that page/sort/search state is preserved after Edit → Save → Back round-trip from `WordsList` and `SetsList`. |

## Requirements

1. Every "go back" arrow on `WordEditPage`, `WordNewPage`, `SetNewPage`,
   `SetEditPage`, `SetContentPage`, and the four `Set*ModePage`s navigates to
   the URL provided in `?returnTo=…` when present and `startsWith('/')`,
   falling back to `links.{words|sets}.getUrl()` (no query) otherwise.
2. Every forward link from `WordsList` (Edit, three Create links) sets
   `returnTo` to the current `WordsList` URL including `location.search`
   (page, search query, etc.). Same for every forward link from `SetsList`
   (Create × 2, four mode links, View Content, Edit Set).
3. The `returnPage` query parameter is fully removed from both originators
   and destinations — there is one canonical mechanism (`returnTo`).
4. Inner components that own a back/cancel action (`WordForm`, `SetForm`,
   `SetSpellingMode` / `SetSentencesMode` / `SetFullMode` completion screens,
   `SetOnlyOpenQuestionsMode` via the `backUrl` prop) navigate using the
   same `returnTo` value, so cancelling a form returns to the exact list
   state the user came from.
5. The shared `useReturnTo(defaultUrl: string)` hook is the single source of
   parsing + validation logic. No file repeats the
   `searchParams.get('returnTo'); startsWith('/')` pattern inline.
6. After a Words list user filters, sorts, or pages, then clicks Edit, edits
   a word, saves, and clicks back — the list lands on the exact same page,
   sort field, sort order, and search query.
7. Same end-to-end behavior for Sets list → Edit Set → back, Sets list →
   View Content → back, and each Sets list → mode page → back.
8. A Playwright spec covers at minimum: `WordsList` round-trip with a
   non-default page+search and `SetsList` round-trip with a non-default page.
9. The change is purely client-side; no backend, no API contract, no
   migration. `npm run build`, `npm run lint`, and existing Playwright specs
   remain green.

## Plan

1. **Add `useReturnTo` hook** at `Frontend/lexica-next-front/src/hooks/useReturnTo.ts`:
   - Signature: `function useReturnTo(defaultUrl: string): () => void`.
   - Internally calls `useNavigate()` and `useSearchParams()`, reads
     `returnTo`, validates `value && value.startsWith('/')`, returns a
     navigate-callback that goes to the parsed URL or the default.
   - Export a sibling `getReturnToFromLocation(location: Location): string`
     helper that returns `${location.pathname}${location.search}` for
     callers building the forward link (used in `WordsList`/`SetsList`).

2. **Migrate destination pages** (replace `returnPage` reading + the inline
   navigate-back lambda with `const goBack = useReturnTo(<defaultUrl>);` and
   `onClick={goBack}`):
   - `WordEditPage`, `WordNewPage`
   - `SetNewPage`, `SetEditPage`, `SetContentPage`
   - `SetSpellingModePage`, `SetSentencesModePage`, `SetFullModePage`
   - `SetOnlyOpenQuestionsModePage` (also update the `backUrl` it passes
     down — pass the resolved URL string, computed via the same hook).

3. **Migrate inner form/mode components** (use the same hook in the same
   way for cancel/save success/completion-screen "Back to Sets"):
   - `WordForm.tsx` — `handleCancel`, `handleSubmit` create/edit success.
   - `SetForm.tsx` — `handleCancel`, update-success.
   - `SetSpellingMode.tsx`, `SetSentencesMode.tsx`, `SetFullMode.tsx` —
     completion screen buttons.

4. **Migrate originator list pages** (build `returnTo` once from
   `useLocation()` and replace every `{ returnPage: currentPage.toString() }`
   with `{ returnTo }`):
   - `WordsList.tsx` — `currentUrl = /words${location.search}` (analogous to
     `WordsStatisticsList`); use it on Edit and Create links.
   - `SetsList.tsx` — `currentUrl = /sets${location.search}`; use it on
     all eight forward links.

5. **Playwright spec(s)**: add (or extend an existing) test that
   - Navigates to `/words?page=2&searchQuery=foo`, clicks Edit on a row,
     saves an unrelated edit, asserts URL after Back is exactly
     `/words?page=2&searchQuery=foo`.
   - Same shape for `/sets?page=2`, exercising the Edit Set forward link.

6. **Verify**: `npm run build`, `npm run lint`, `npm run prettier --check`
   in `Frontend/lexica-next-front` are clean. Existing Playwright suite
   passes (`returnPage` removal must not break any spec — search the e2e
   tests for `returnPage` first and update if found).

## Tasks

- [x] Add `Frontend/lexica-next-front/src/hooks/useReturnTo.ts` with
  `useReturnTo(defaultUrl)` and `getReturnToFromLocation(location)`.
- [x] Migrate Words area: `WordsList.tsx` (originator), `WordEditPage.tsx`,
  `WordNewPage.tsx`, `WordForm.tsx`. Remove `returnPage` reads.
- [x] Migrate Sets list/form/content: `SetsList.tsx` (originator),
  `SetNewPage.tsx`, `SetEditPage.tsx`, `SetContentPage.tsx`, `SetForm.tsx`.
- [x] Migrate Set mode pages: `SetSpellingModePage.tsx`,
  `SetSentencesModePage.tsx`, `SetFullModePage.tsx`,
  `SetOnlyOpenQuestionsModePage.tsx`, plus inner mode components'
  completion screens (`SetSpellingMode.tsx`, `SetSentencesMode.tsx`,
  `SetFullMode.tsx`).
- [x] Search the codebase and Playwright specs for any remaining
  `returnPage` references; remove or migrate them.
- [x] Add/extend Playwright spec asserting list state preservation for
  `/words` and `/sets` round-trips.
- [x] `npm run build`, `npm run lint` clean; prettier ran on every modified
  file; Playwright specs parse via `--list`. (Live Playwright run is
  deferred — requires backend + Auth0 + dev server.)

## Done When

- [x] All tasks checked off.
- [x] `returnPage` no longer appears anywhere in
  `Frontend/lexica-next-front/src` or `Frontend/lexica-next-front-e2e-tests`.
- [x] `WordsList` and `SetsList` round-trips preserve page/sort/search
  exactly, matching `WordsStatisticsList` behavior (verified by build, type
  check, and Playwright spec discovery).
- [x] No new lint, type, or build errors. New Playwright specs parse and
  list; live Playwright run deferred (requires backend + Auth0 + dev
  server).
