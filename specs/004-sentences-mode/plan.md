# Implementation Plan: Sentences Learning Mode

**Branch**: `004-sentences-mode` | **Date**: 2026-05-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/004-sentences-mode/spec.md`

## Summary

Introduce a fourth learning mode — **Sentences Mode** — that asks fill-in-the-blank questions built from each entry's existing AI-generated example sentences. For every entry in the chosen set, every example sentence containing the entry's word as a whole word becomes its own question (capped at 5 sentence-questions per entry per session). Each sentence-question must be answered correctly twice to be mastered; an incorrect answer (including an empty submission) resets that specific sentence-question's counter. The page reuses the existing per-set mode page-shell, the existing answer-recording endpoint, the existing pronunciation playback, and the existing per-set/per-mode `localStorage` session-resume mechanism.

Delivery approach (aligned with user input — *"Follow existing patterns. Include implementing front-end E2E tests, include implementing back-end tests if the feature requires back-end changes."*):

- **Frontend** is the bulk of the work: a new `SetSentencesMode` component (mirrors `SetOnlyOpenQuestionsMode` and `SetSpellingMode`), a new `SetSentencesModePage` (mirrors `SetOnlyOpenQuestionsModePage`), a new `links.sentencesMode` entry, a new `/sets/:setId/sentences-mode` route with breadcrumbs in `AppRouter.tsx`, a new menu item in `SetsList.SetActionMenu`, and a new `'sentences'` value in the `SessionMode` union plus a `getModeLabel`/`getModeUrl` arm in `services/session-storage.ts`. Per-question state is keyed by `(wordId, sentenceIndex)` per the spec clarification.
- **Backend** changes are deliberately tiny — only the `RegisterAnswerRequestPayloadValidator`'s `AllowedModeTypes` and `AllowedQuestionTypes` whitelists need a new entry (`"sentences"` and `"sentence-fill"`). No new endpoint, no schema change, no migration. The `Question` column already accepts up to 500 chars, which holds the sentence-with-blank.
- **Backend tests**: extend `RegisterAnswerTests` with new correct/incorrect Verify test cases that exercise the new mode/question-type values; regenerate the affected `verified.txt` snapshots.
- **Frontend E2E tests**: new `tests/sets/15-sentences-mode.spec.ts` (page structure, correct/incorrect feedback, Enter-to-submit, back navigation, completion screen) and `tests/sets/16-sentences-mode-session-resume.spec.ts` (session persistence, restore on reload, reset on word changes, per-(entry,sentence) counters), mirroring the existing `11-open-questions-mode.spec.ts` and `14-open-questions-mode-session-resume.spec.ts`.

## Technical Context

**Language/Version**: .NET 10 / C# with `<Nullable>enable</Nullable>` on the backend; TypeScript + React 19 via Vite on the frontend.
**Primary Dependencies**: ASP.NET Core minimal APIs, EF Core (Npgsql/PostgreSQL), FluentValidation, Scrutor, xUnit v3 + Verify on BE; Mantine UI, React Router 7, @tanstack/react-query, Auth0-react, openapi-typescript on FE; Playwright for E2E.
**Storage**: PostgreSQL via existing `AppDbContext` (`answer`, `word`, `example_sentence` tables — read-only here; no schema change). Browser `localStorage` (NOT `sessionStorage`, despite the spec wording — the existing `services/session-storage.ts` uses `localStorage` under the `lexica-session:` key prefix, and the new mode reuses it verbatim).
**Testing**: xUnit v3 integration tests with Verify snapshots under `LexicaNext.WebApp.Tests.Integration/Features/Answers/RegisterAnswer/`; Playwright E2E under `Frontend/lexica-next-front-e2e-tests/tests/sets/`.
**Target Platform**: Web (SPA served by ASP.NET Core host); Linux container via `compose.yaml`.
**Project Type**: Web application (frontend + backend).
**Performance Goals**: First question interactive within 2 s on a 50-entry set (SC-002); whole 10-word session completable in under 6 minutes at the existing modes' average pace (SC-004).
**Constraints**: Per-user data scoping enforced server-side on every `RegisterAnswer` request via `IUserContextResolver` (existing); no new HTTP contracts; no new DB indexes; the `Question` column maximum length is 500 characters (sentences exceeding it are caught by FluentValidation today and would surface as a registration failure — see Risks).
**Scale/Scope**: Single feature: 0 new endpoints; 1 backend validator change (whitelist additions); ~2 changed BE test generators + regenerated Verify snapshots; 1 new React component + 1 new page + 1 new route + 1 new menu item + 1 new link entry + 1 extended session-storage union; 2 new Playwright E2E specs.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution v1.0.0 (`.specify/memory/constitution.md`) is now in force. Each principle is checked against this plan:

- **I. Incremental Progress** — PASS. The change set splits cleanly into BE validator + BE Verify snapshots, FE link/route/session-mode plumbing, FE component, FE E2E tests; each commit can keep `dotnet build` and `npm run build` green.
- **II. Learn From Existing Code** — PASS. The new component mirrors `SetOnlyOpenQuestionsMode` / `SetSpellingMode`; the new page mirrors `SetOnlyOpenQuestionsModePage`; the new menu item, link entry, breadcrumb route, and E2E test layout follow the existing per-mode pattern. No new libraries are introduced.
- **III. Composition & Explicit Dependencies** — PASS. No new backend services to register; the FE component receives `set` via prop (matches the other modes), and reads `returnPage` from `useSearchParams` (same as the other modes).
- **IV. Clear Intent Over Cleverness** — PASS. Question generation is a straightforward filter-and-flatten on `set.entries[].exampleSentences[]`; the per-(wordId, sentenceIndex) state shape is named for what it is.
- **V. Test-First Verification (NON-NEGOTIABLE)** — PASS. The user-visible journey is covered by the two new Playwright specs; the only backend HTTP-contract change (a new value in the validator whitelist) is covered by new Verify test cases under `RegisterAnswer/`. No new HTTP contract is introduced, so no new feature-folder under `LexicaNext.WebApp.Tests.Integration/Features/...` is required beyond extending the existing `RegisterAnswer` cases.
- **VI. Fail-Fast With Context** — PASS. `RegisterAnswerRequestPayloadValidator` already returns `ProblemDetails` for unknown mode/question-type values; we keep that boundary. The frontend reuses the existing `compareAnswers` and `useRegisterAnswer` plumbing — no new try/catch required.

**Gate decision (pre-Phase 0)**: PASS. No principle requires a Complexity Tracking entry.

**Gate decision (post-Phase 1, re-check)**: PASS. The Phase 1 artifacts (`research.md`, `data-model.md`, `contracts/register-answer-extension.md`, `quickstart.md`) introduce no new cross-cutting concerns: no new project, no new language, no new infrastructure tier, no new HTTP contract beyond an already-validated value being added to an existing whitelist.

## Project Structure

### Documentation (this feature)

```text
specs/004-sentences-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── register-answer-extension.md   # Documents the additive validator-whitelist change
├── checklists/
│   └── requirements.md  # From /speckit.specify
└── spec.md
```

### Source Code (repository root)

Web-application layout. Backend is the existing .NET solution (`LexicaNext.Core` domain / CQRS, `LexicaNext.Infrastructure` persistence, `LexicaNext.WebApp` host, `LexicaNext.WebApp.Tests.Integration` tests). Frontend is the existing Vite SPA with the co-located Playwright E2E project.

```text
LexicaNext.Core/
└── Commands/
    └── RegisterAnswer/
        └── Services/
            └── RegisterAnswerRequestValidator.cs   # MODIFIED — add "sentences" to AllowedModeTypes
                                                    # and "sentence-fill" to AllowedQuestionTypes.
                                                    # No other lines change.

LexicaNext.WebApp.Tests.Integration/
└── Features/
    └── Answers/
        └── RegisterAnswer/
            ├── Data/
            │   ├── CorrectTestCases/
            │   │   └── TestCase03.cs               # NEW — sentences mode + sentence-fill, isCorrect=true
            │   └── IncorrectTestCases/
            │       └── TestCase16.cs               # NEW — invalid mode (or invalid question type) sanity case
            ├── RegisterAnswerTests.RegisterAnswer_ShouldBeSuccessful.verified.txt   # REGENERATED
            └── RegisterAnswerTests.RegisterAnswer_ShouldBeUnsuccessful.verified.txt # REGENERATED

Frontend/lexica-next-front/
├── src/
│   ├── AppRouter.tsx                                # MODIFIED — add :setId/sentences-mode route + breadcrumb
│   ├── config/links.ts                              # MODIFIED — add `sentencesMode` link
│   ├── components/
│   │   └── sets/
│   │       ├── SetsList.tsx                         # MODIFIED — add "Sentences Mode" Menu.Item to SetActionMenu
│   │       └── modes/
│   │           └── SetSentencesMode.tsx             # NEW — fill-in-the-blank component (mirrors SetOnlyOpenQuestionsMode)
│   ├── pages/
│   │   └── sets/
│   │       └── modes/
│   │           └── SetSentencesModePage.tsx         # NEW — mirrors SetOnlyOpenQuestionsModePage
│   └── services/
│       └── session-storage.ts                       # MODIFIED — extend `SessionMode` to include 'sentences',
│                                                    # extend `ModeEntriesDto`, extend `getModeLabel` and
│                                                    # `getModeUrl`, extend `validateSession` ONLY if needed
│                                                    # (current shape is per-entry; sentences mode is per-pair —
│                                                    # see research.md for the chosen approach)

Frontend/lexica-next-front-e2e-tests/
└── tests/
    └── sets/
        ├── 15-sentences-mode.spec.ts               # NEW — page structure, correct/incorrect feedback, Enter,
        │                                            # back arrow, completion screen, multi-sentence per word
        └── 16-sentences-mode-session-resume.spec.ts # NEW — session persistence, reload-resume, per-pair counters,
                                                     # session reset on entry/sentence-list change
```

**Structure Decision**: Web-application layout, no new projects. The feature fits cleanly into the existing tiering. Frontend code lives alongside the other learning modes (`src/components/sets/modes/` + `src/pages/sets/modes/`) so the Mantine styling, audio playback, and `localStorage` session pattern can be reused wholesale. Playwright tests live alongside the existing per-mode specs under `tests/sets/`.

## Complexity Tracking

> Not applicable — no constitutional violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
