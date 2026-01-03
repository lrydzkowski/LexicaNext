# Feature Specification: Set Name Auto-Proposal

**Feature Branch**: `001-set-name-proposal`
**Created**: 2026-01-03
**Status**: Draft
**Input**: User description: "I want to propose set names based on the following pattern: set_0001, set_0002, set_0003 etc. When a user opens a new set form, then we should propose the next available name. The next available number in the proposed name should be based on a sequence in the database. We should have name uniqueness validation when a user saves a set."

## Clarifications

### Session 2026-01-03

- Q: Is the `set_XXXX` pattern enforced or just a suggestion? → A: Any name allowed (proposal is just a convenience default)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Proposed Set Name on New Set Form (Priority: P1)

When a user opens the new set creation form, they see a pre-filled name suggestion following the pattern `set_XXXX` where XXXX is the next available sequence number (e.g., `set_0001`, `set_0042`). This reduces friction in set creation by providing a sensible default.

**Why this priority**: This is the core feature that delivers immediate value - users get a ready-to-use name without having to think of one, speeding up set creation.

**Independent Test**: Can be fully tested by opening the new set form and verifying a proposed name appears in the name field. Delivers value by eliminating the need to manually enter a name.

**Acceptance Scenarios**:

1. **Given** the user is authenticated, **When** they open the new set form, **Then** the name field is pre-filled with the next available set name (e.g., `set_0001`)
2. **Given** the database sequence is at 41, **When** the user opens the new set form, **Then** the proposed name is `set_0042`
3. **Given** the user has opened the new set form with a proposed name, **When** they decide to change the name, **Then** they can edit the name field freely

---

### User Story 2 - Save Set with Unique Name Validation (Priority: P2)

When a user attempts to save a set, the system validates that the set name is unique. If the name already exists, the user receives a clear error message and cannot save until they provide a unique name.

**Why this priority**: Critical for data integrity but secondary to name proposal since users need to create sets first. Prevents duplicate naming conflicts.

**Independent Test**: Can be tested by attempting to save a set with a duplicate name and verifying the error message appears.

**Acceptance Scenarios**:

1. **Given** a set named "set_0001" already exists, **When** the user tries to save a new set with name "set_0001", **Then** they receive an error message indicating the name is already taken
2. **Given** a set named "set_0001" already exists, **When** the user tries to save a new set with name "set_0002", **Then** the set saves successfully
3. **Given** the user is editing an existing set named "set_0001", **When** they save without changing the name, **Then** the set saves successfully (own name is not considered a duplicate)
4. **Given** a set named "MySet" already exists, **When** the user tries to save a new set with name "myset", **Then** they receive an error message indicating the name is already taken (case-insensitive validation)

---

### User Story 3 - Update Existing Set with Unique Name Validation (Priority: P3)

When a user edits an existing set and changes its name, the system validates that the new name is unique among other sets (excluding the current set being edited).

**Why this priority**: Extends validation to edit scenarios, ensuring consistency across all name-changing operations.

**Independent Test**: Can be tested by editing a set, changing its name to a duplicate, and verifying the error.

**Acceptance Scenarios**:

1. **Given** sets "set_0001" and "set_0002" exist, **When** the user edits "set_0001" and changes the name to "set_0002", **Then** they receive an error message indicating the name is already taken
2. **Given** sets "set_0001" and "set_0002" exist, **When** the user edits "set_0001" and changes the name to "set_0003", **Then** the set saves successfully

---

### Edge Cases

- What happens when the sequence number exceeds 9999? The pattern continues with 5+ digits (e.g., `set_10000`, `set_10001`)
- What happens if two users open the new set form simultaneously and get the same proposed name? Both see the same proposed name; the first user to save claims that name, the second user receives a duplicate name error and must choose a different name
- What happens if a user opens the form but never saves? The sequence number is not consumed; the same proposed name will be shown next time the form is opened
- What happens if the name field is left empty? Standard required field validation applies; name cannot be empty
- What happens if a user saves with a custom name (not the `set_XXXX` pattern)? The set saves normally; the sequence remains unchanged since only pattern-matching names affect it

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST maintain a database sequence for generating set name numbers
- **FR-002**: System MUST propose a set name in the format `set_XXXX` (where XXXX is zero-padded to at least 4 digits) when the new set form is opened
- **FR-003**: System MUST return the next sequence value (without incrementing) when the new set form is opened; the sequence is only incremented when a set is successfully saved with the proposed name pattern
- **FR-004**: System MUST validate set name uniqueness when creating a new set
- **FR-005**: System MUST validate set name uniqueness when updating an existing set (excluding the set being edited)
- **FR-006**: System MUST perform case-insensitive name uniqueness validation
- **FR-007**: System MUST display a clear error message when a duplicate name is detected
- **FR-008**: System MUST prevent saving a set with a duplicate name
- **FR-009**: System MUST allow users to modify the proposed name before saving
- **FR-010**: System MUST update the sequence when a set is saved with a name matching the `set_XXXX` pattern, ensuring future proposals use a higher number than any existing set name
- **FR-011**: System MUST accept any valid text as a set name; the `set_XXXX` pattern is a convenience default, not a requirement

### Key Entities

- **Set Name Sequence**: A database sequence that tracks the next available number for set name proposals. Monotonically increasing, incremented only when a set is saved with the proposed name pattern.
- **Set**: Existing entity extended with uniqueness constraint on the name attribute.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new set forms display a proposed name immediately upon opening
- **SC-002**: Users can create a new set with the proposed name in under 5 seconds (excluding word entry time)
- **SC-003**: 0% of sets have duplicate names after feature deployment
- **SC-004**: Users attempting to save a duplicate name receive feedback within 2 seconds
- **SC-005**: All existing sets remain accessible and unaffected after deployment
