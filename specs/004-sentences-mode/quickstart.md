# Quickstart: Sentences Learning Mode

How to manually exercise the new mode end-to-end on a developer machine, after the implementation lands.

## Prerequisites

- The full backend running locally: `dotnet run --project LexicaNext.WebApp`.
- The frontend dev server: `cd Frontend/lexica-next-front; npm run dev`.
- A signed-in browser session (Auth0).
- At least one set whose entries have AI-generated example sentences (use the existing **Generate example sentences** action in the word-edit page, or seed via the API).

## Happy-path walk-through

1. Open `/sets`. Pick any set with example-sentence-bearing entries.
2. Click the actions menu (`⋯`) → **Sentences Mode**. The page loads at `/sets/<setId>/sentences-mode?returnPage=<page>`.
3. The header shows `Sentences Mode` and the set name. The progress bar reads `0 / Q questions completed` (where `Q` is the number of usable `(entry, sentence)` pairs across the set, capped at 5 per entry).
4. The card displays one of the entry's sentences with the target word replaced by `_____`, plus the input, the **Check Answer** button, and the progress bar.
5. Type the missing word → press **Enter** (or click **Check Answer**). The feedback banner turns green, the entry's word audio plays, the original sentence (with the word filled in) is shown, and a **Continue** button appears. Click it.
6. Repeat. After two correct answers for the same `(entry, sentence)` pair, that specific pair is mastered and removed from the rotation. Other sentence-questions for the same entry remain in play.
7. When every eligible `(entry, sentence)` pair is mastered, the completion screen appears with **Back to Sets** and **Practice Again**.

## Negative paths to verify

- **Wrong answer** → red feedback banner, given vs. expected lines, **Continue** still works, that pair's counter resets to 0.
- **Empty submission** (just hit Enter with no input) → red feedback banner, recorded as incorrect, counter reset (matches clarification #3).
- **Set with no eligible sentences** (e.g., every entry's sentences omit the target word, or the set is empty) → empty-state alert; no practice card.
- **Reload mid-session** → counters survive. Continue from the next eligible question.
- **Edit one of the entry's sentences in another tab, then reload** → the sentences-mode session is discarded and a fresh one starts (per clarification #2).

## Per-feature sanity for the spec clarifications

| Clarification | How to confirm |
|---|---|
| #1 — sentence identity = `wordId + sentence index` | After answering one sentence-question, inspect `localStorage` key `lexica-session:<setId>:sentences`; the `sentenceCounters` map keys should be numeric indices into `entry.exampleSentences`. |
| #2 — entry mutation discards session | Edit the entry's sentence list in another tab, reload sentences-mode for that set; the previous progress should be gone and `Q` should reflect the new sentence list. |
| #3 — empty submission recorded + reset | Submit an empty answer at counter=1; the row should appear in the `answer` table with `given_answer = ''`, `is_correct = false`, and the affected `sentenceCounters[i]` in `localStorage` should be 0. |
| #4 — per-entry cap of 5 | Seed an entry with > 5 sentences containing the word; Q should grow by 5 (not by the full number) for that entry. |
| #5 — Words Statistics excludes sentences mode | Submit a few sentences-mode answers, then open Words Statistics — the counts for those words should NOT change (open-questions mode only). |

## Backend test commands

```powershell
# All backend tests (includes the extended RegisterAnswer Verify cases)
dotnet test LexicaNext.sln

# Just the RegisterAnswer feature
dotnet test --filter "FullyQualifiedName~RegisterAnswerTests"
```

If a Verify snapshot mismatch is reported, inspect the generated `*.received.txt` next to the `*.verified.txt`, confirm the diff is intentional (it should now contain a sentences-mode row), and accept the new snapshot.

## Frontend E2E test commands

```powershell
cd Frontend/lexica-next-front-e2e-tests

# Run the two new specs
npx playwright test tests/sets/15-sentences-mode.spec.ts
npx playwright test tests/sets/16-sentences-mode-session-resume.spec.ts

# Run all session-related tests for sets
npx playwright test tests/sets/
```

## Completion checklist

- [ ] Validator allow-lists updated and `dotnet test` passes (including the regenerated Verify snapshots).
- [ ] `links.sentencesMode` registered, route added in `AppRouter.tsx` with breadcrumb.
- [ ] **Sentences Mode** entry visible in the per-set actions menu.
- [ ] `services/session-storage.ts` extended (`SessionMode`, `ModeEntriesDto`, `getModeLabel`, `getModeUrl`).
- [ ] `SetSentencesMode` and `SetSentencesModePage` implemented and following the existing modes' visual conventions.
- [ ] All five clarification-driven behaviours verified manually (table above).
- [ ] Both new Playwright specs pass locally (`npx playwright test tests/sets/15-sentences-mode.spec.ts tests/sets/16-sentences-mode-session-resume.spec.ts`).
- [ ] `npm run lint`, `npm run prettier`, and `npm run build` are green.
