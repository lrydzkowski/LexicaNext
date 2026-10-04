# Issue tracker: Local Markdown

Issues and specs live as Markdown files under `.scratch/`.

## Conventions

- Use one directory per feature: `.scratch/<feature-slug>/`.
- Store the spec in `spec.md` within that directory.
- Store each implementation ticket in `issues/<NN>-<slug>.md`,
  numbered from `01`. Keep tickets in separate files.
- Record triage state in a `Status:` line near the top of each ticket.
  Use the values in [Triage labels](triage-labels.md).
- Append conversation history under a `## Comments` heading.

## Publish to the issue tracker

Create the spec or ticket file at its conventional path.
Create parent directories as needed.

## Fetch the relevant ticket

Read the referenced file. If a ticket number matches multiple features,
ask which feature the user means.

## Wayfinding operations

The `/wayfinder` skill uses these conventions:

- Map: `.scratch/<effort>/map.md`, containing notes, decisions so far,
  and open questions.
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`,
  numbered from `01`, with the question in the body.
- Type: record `research`, `prototype`, `grilling`, or `task`
  in a `Type:` line.
- Lifecycle: wayfinding tickets use `Status: claimed` or
  `Status: resolved` after those transitions.
- Blocking: list dependencies in a `Blocked by: NN, NN` line.
  A ticket is unblocked when every listed ticket is resolved.
- Frontier: select the first ticket by number that is unblocked,
  unclaimed, and unresolved.
- Claim: set `Status: claimed` and save before starting work.
- Resolve: append the answer under `## Answer`, set `Status: resolved`,
  and add a summary with a ticket link to the map's decisions.
