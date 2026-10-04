# Domain docs

This repository uses a single-context domain documentation layout.

## Read before exploring

- Read `GLOSSARY.md` at the repository root.
- Read relevant architecture decision records in `docs/adr/`.

If these files do not exist, continue without reporting their absence
or proposing their creation upfront. The `domain-modeling` skill creates
them when domain terms or decisions are resolved.

## File layout

- `GLOSSARY.md`: shared domain vocabulary.
- `docs/adr/`: architecture decision records.

## Use the glossary's vocabulary

Use glossary terms when naming domain concepts in issues, proposals,
hypotheses, and tests. Avoid synonyms the glossary excludes.

If a term is missing, check whether the codebase already uses another
term. Record genuine vocabulary gaps for `domain-modeling`.

## Report ADR conflicts

If a proposal contradicts an existing ADR, identify the ADR and explain
why the decision needs reconsideration. Do not silently override it.
