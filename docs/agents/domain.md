# Domain docs

Use a single-context domain layout for LexicaNext.

## Read before exploring

- Read `GLOSSARY.md` at the repository root.
- Read decisions in `docs/adr/` that apply to the task.

If these files do not exist, continue without flagging their absence
or suggesting their creation upfront. The domain-modeling skill creates
them when domain terms or decisions are resolved.

## File layout

- `GLOSSARY.md`: shared domain terms.
- `docs/adr/`: architecture decision records.

## Use the glossary vocabulary

Use glossary terms in issue titles, proposals, hypotheses, and test names.
Avoid synonyms that the glossary excludes.

If a term is missing, check existing project terminology.
Record genuine gaps for domain-modeling.

## Report decision conflicts

If a proposal contradicts an existing ADR, identify that ADR and explain
why the decision needs reconsideration. Do not silently override it.
