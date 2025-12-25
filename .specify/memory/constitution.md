# LexicaNext Constitution

## Core Principles

### I. Explicit Over Implicit

All code MUST express intent clearly through naming, structure, and explicit data flow.

- Variable, function, and class names MUST describe purpose without requiring comments
- Dependencies MUST be injected explicitly; no hidden singletons or ambient state
- Configuration MUST flow from defined sources; no magic strings or hardcoded values
- Side effects MUST be visible at call sites; pure functions preferred where possible

**Rationale**: Code is read far more often than written. Explicit code reduces cognitive load and prevents bugs caused by hidden behavior.

### II. Single Responsibility

Each unit of code MUST have one reason to change.

- Functions MUST do one thing; if describing requires "and", split it
- Classes MUST represent one concept or aggregate one behavior set
- Files MUST contain related code only; no utility dumps or mixed concerns
- Modules/projects MUST have clear boundaries with minimal coupling

**Rationale**: Focused units are easier to understand, modify, and replace without cascading changes.

### III. Fail Fast with Context

Errors MUST surface immediately with actionable information.

- Validate inputs at system boundaries (API endpoints, user input, external data)
- Throw exceptions with context: what failed, why, and what state was expected
- Never silently swallow exceptions; log and rethrow or handle explicitly
- Use guard clauses and early returns to make error paths obvious

**Rationale**: Early failures with context reduce debugging time and prevent corrupted state from propagating.

### IV. Incremental Change

All modifications MUST be small and independently releasable.

- Commits MUST be atomic: one logical change per commit
- Refactoring MUST be separated from behavior changes
- Database migrations MUST be backward compatible until old code is removed

**Rationale**: Small changes are easier to revert and bisect when issues arise.

### V. Simplicity First

Choose the simplest solution that meets current requirements.

- YAGNI: Do not add functionality until it is needed
- Prefer composition over inheritance
- Prefer standard library and framework patterns over custom abstractions
- Remove dead code immediately; do not comment out or leave "for later"
- Three similar lines are better than a premature abstraction

**Rationale**: Every abstraction has a cost. Complexity compounds over time; simplicity enables sustainable velocity.

## Code Style Standards

Consistent formatting reduces cognitive friction and enables automated tooling.

- **Backend (.NET)**: Follow Microsoft C# coding conventions; use nullable reference types
- **Frontend (TypeScript)**: ESLint and Prettier configurations are authoritative
- **Naming**: Use domain language; match terms in spec and code
- **File organization**: Group by feature/domain, not by technical layer when practical
- **Maximum function length**: Target 20 lines; investigate if exceeding 40 lines
- **Maximum file length**: Target 300 lines; split if exceeding 500 lines

## Quality Gates

All code MUST pass these gates before merging to protected branches.

- **Build**: Solution MUST compile with zero warnings (TreatWarningsAsErrors enabled)
- **Lint**: All linting rules MUST pass with zero violations
- **Documentation**: Public APIs MUST have clear contracts; breaking changes MUST be documented

## Governance

This constitution supersedes informal practices.

**Amendment Process**: Modify this file with rationale and update the amendment date.

**Last Amended**: 2025-12-25
