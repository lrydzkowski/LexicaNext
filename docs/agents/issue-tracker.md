# Issue tracker: Local Markdown

Store issues and specs as Markdown files under `.scratch/`.

## File conventions

- Use one directory per feature: `.scratch/<feature-slug>/`.
- Store the spec in `spec.md` within that directory.
- Store each ticket in `issues/<NN>-<slug>.md`, numbered from `01`.
- Keep ticket numbers unique within each feature.
- Record the triage state in a `Status:` line near the top.
  Use the states in [Triage labels](triage-labels.md).
- Record the category in a `Category:` line: `bug` or `enhancement`.
- Append comments and conversation history under `## Comments`.
- Record closure with `Closed: yes`, preserving the triage state.

## Publish to the issue tracker

Create the spec or ticket at its designated path.
Create parent directories as needed.

## Fetch the relevant ticket

Read the referenced file. Resolve ticket numbers within the named feature.
If a number matches multiple features, ask which feature the user means.

## Wayfinding operations

Use these conventions when a skill requests a map and child tickets.

- Map: `.scratch/<effort>/map.md`, with Notes, Decisions-so-far,
  and Fog sections.
- Child ticket: `.scratch/<effort>/issues/<NN>-<slug>.md`.
  Record its question in the body.
- Type: use a `Type:` line with `research`, `prototype`, `grilling`,
  or `task`.
- Work state: use `Work status: open`, `Work status: claimed`,
  or `Work status: resolved`, separate from the triage `Status:`.
- Blocking: list ticket numbers from the same effort in a
  `Blocked by: NN, NN` line. A ticket is unblocked when every listed
  ticket has `Work status: resolved`.
- Frontier: select the lowest-numbered open, unblocked, unclaimed ticket
  that is not closed.
- Claim: save `Work status: claimed` before starting work.
- Resolve: append the answer under `## Answer`, set
  `Work status: resolved`, and record `Closed: yes`.
  Append a summary and ticket link to Decisions-so-far in `map.md`.
