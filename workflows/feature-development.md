# Spec-Driven Development Workflow for Claude Code

## Scope and Applicability

**This workflow applies to:**
- New features
- Significant changes to existing features
- Architecture changes
- API changes
- Database schema changes
- Any work that affects multiple files or components

**This workflow does NOT apply to:**
- Hot-fixes (see separate hot-fix workflow)
- Refactorings (see separate refactoring workflow)
- Documentation-only changes
- Typo corrections
- Formatting/linting fixes
- Dependency updates without functional changes

When in doubt, use this workflow. It's better to have too much structure than too little.

---

## Workflow Phases

```
SPEC → REVIEW → IMPLEMENTATION-PLAN → IMPL → VERIFY → DONE
```

---

## Critical Rules

### Response Format (MANDATORY)
**Every response MUST start with current phase status marker**

Format: `[STATUS_MARKER] Phase description and current action`

Examples:
- ✅ `[SPEC] Creating specification for user authentication...`
- ✅ `[IMPL] Implementing step 2: Database schema...`
- ❌ `Working on the feature now.` (Missing status marker)

---

## Phase 1: SPEC - Specification Creation

### Rules

1. **No Implementation Without Spec**
   - No code is written before an accepted spec exists
   - Exception: Exploratory prototypes must be marked as such

2. **Spec Completeness**
   
   Every spec MUST contain:
   - **Purpose/Goal**: Why is this feature needed?
   - **Functional Requirements**: What should the feature do?
   - **Technical Constraints**: What technical framework conditions apply?
   - **Acceptance Criteria**: When is the implementation considered successful?
   - **Out-of-Scope**: What is explicitly NOT part of this spec?

3. **Unambiguity**
   - No room for interpretation
   - When unclear: Ask questions instead of making assumptions
   - Use concrete examples where appropriate

4. **Feature Directory Structure**
   - Each feature has its own directory: `/dev/features/yyyy-MM-dd_[feature-name]/`
   - Directory naming: Date prefix in format `yyyy-MM-dd_` followed by feature name
   - Example: `/dev/features/2025-01-15_user-authentication/`
   - Directory contains:
     - `spec.md` - The specification document (required)
     - `implementation.md` - Implementation plan (required before coding)
     - `tests/` - Test files (optional)
     - `examples/` - Code examples or usage demos (optional)
     - `assets/` - Diagrams, mockups, or other supporting files (optional)
   - Versioning is handled by Git

---

## Phase 2: REVIEW - Spec Review

### Rules

1. **Mandatory Review**
   - Every spec goes through review before implementation

2. **Review Checklist**
   
   Check:
   - ✓ Are all requirements clearly and unambiguously formulated?
   - ✓ Are there contradictions or inconsistencies?
   - ✓ Are the acceptance criteria measurable and testable?
   - ✓ Are important technical details missing?
   - ✓ Are dependencies and interfaces defined?
   - ✓ Are error scenarios considered?

3. **Blocking on Unclear Points**
   - With open questions: NO implementation
   - Status: "BLOCKED - Awaiting Clarification"
   - Open points are explicitly communicated

4. **Explicit Approval Required**
   - Approval signal: "APPROVED" or explicit confirmation
   - Only after approval: Transition to IMPLEMENTATION-PLAN

---

## Phase 3: IMPLEMENTATION-PLAN - Implementation Planning

### Rules

1. **Plan Before Code**
   - No implementation without approved implementation plan
   - The implementation plan bridges spec and code
   - Plan must provide complete context for Claude Code

2. **Plan Completeness**
   
   Every implementation plan MUST contain:
   - **Overview**: Brief summary of what will be implemented
   - **Reference**: Link to spec and key acceptance criteria
   - **File Structure**: All files to create/modify
   - **Implementation Steps**: Step-by-step actions with clear goals
   - **Code Architecture**: Components, data models, interactions
   - **Technical Decisions**: Framework choices, patterns, approaches
   - **Integration Points**: How it connects to existing code
   - **Test Strategy**: Unit tests, integration tests, test data
   - **Edge Cases & Error Handling**: Complete coverage
   - **Validation Checklist**: Before marking as complete

3. **Self-Contained Context**
   - Claude Code should only need `implementation.md` to work
   - All necessary context included in the plan
   - References to spec for requirements, not duplication

4. **Technical Detail Level**
   - Specific enough to guide implementation
   - Flexible enough to allow implementation choices
   - Includes data structures, function signatures, module interactions

5. **Explicit Approval Required**
   - Approval signal: "PLAN-APPROVED" or explicit confirmation
   - Only after approval: Transition to IMPL phase
   - Changes during IMPL require plan update and re-approval

---

## Phase 4: IMPL - Implementation

### Rules

1. **Implementation Plan as Context**
   - Implementation follows the `implementation.md` file
   - The implementation plan contains all necessary context
   - Claude Code only needs `implementation.md` to complete the work

2. **No Silent Changes**
   - Deviations from the implementation plan MUST be communicated
   - Process for changes: IMPL → IMPLEMENTATION-PLAN-UPDATE → REVIEW → IMPL

3. **Iterative Approach Allowed**
   - Implementation can be incremental
   - Each step must follow the implementation plan
   - Partial implementations must be marked as such

4. **Code Documentation**
   - Complex parts reference relevant sections
   - Format: `// See /dev/features/yyyy-MM-dd_[feature-name]/implementation.md - Section X`

5. **Continuous Validation**
   - After each step: Verify against implementation plan
   - Run tests early and often
   - Document blockers immediately

---

## Phase 5: VERIFY - Verification

### Rules

1. **Test-First Approach**
   - Tests are derived from acceptance criteria
   - Test coverage planned in implementation plan

2. **Complete Coverage**
   - ALL acceptance criteria must be verified by tests
   - Edge cases and error scenarios included
   - Both unit and integration tests executed

3. **No Merge Without Green Tests**
   - Code is only complete when all tests pass
   - On failure: Back to IMPL phase
   - Document any skipped tests with justification

4. **Check Spec Compliance**
   - Verify: Does the implementation meet all requirements?
   - Cross-reference with acceptance criteria
   - On deviations: Document and justify

5. **Validation Checklist**
   - All files created/modified as planned
   - Code follows project conventions
   - Documentation updated
   - No breaking changes (or documented)
   - Performance benchmarks met
   - Security review completed

---

## Phase 6: DONE - Completion

### Criteria

✓ Spec exists and is approved  
✓ Implementation plan exists and is approved  
✓ Code implemented according to plan  
✓ All tests pass  
✓ Code is documented  
✓ All acceptance criteria met  
✓ No open points

### Final Steps

1. **Update Status**
   - Mark spec.md status as "IMPLEMENTED"
   - Mark implementation.md status as "COMPLETE"
   - Update last modified date

2. **Documentation**
   - Ensure all code comments are in place
   - Update project documentation if needed
   - Add usage examples if applicable

3. **Communication**
   - Announce completion with `[DONE]` status
   - Summary of what was delivered
   - Reference to spec and implementation plan

---

## Status Markers

Use these status markers in responses:

- `[SPEC]` - Specification is being created
- `[REVIEW]` - Review in progress
- `[BLOCKED]` - Awaiting clarification
- `[APPROVED]` - Spec approved, ready for implementation planning
- `[IMPLEMENTATION-PLAN]` - Implementation plan is being created
- `[PLAN-REVIEW]` - Implementation plan under review
- `[PLAN-APPROVED]` - Implementation plan approved, ready for coding
- `[IMPL]` - In implementation
- `[VERIFY]` - In verification
- `[DONE]` - Completed

---

## Feature Directory Structure

Each feature is organized in its own directory with date prefix:

```
/dev/features/
  └── yyyy-MM-dd_[feature-name]/
      ├── spec.md              # Main specification (required)
      ├── implementation.md    # Implementation plan (required before coding)
      ├── tests/               # Test specifications (optional)
      ├── examples/            # Usage examples (optional)
      └── assets/              # Diagrams, mockups, etc. (optional)
```

### Directory Naming Rules

- **Format**: `yyyy-MM-dd_[feature-name]`
- **Date**: Creation date of the specification
- **Feature name**: Lowercase, words separated by hyphens
- **Versioning**: Handled by Git (commit history)
- **Examples**: 
  - `2025-01-15_user-authentication`
  - `2025-02-03_payment-integration`
  - `2025-10-28_dashboard-redesign`

### Example Structure

```
/dev/features/
  └── 2025-01-15_user-authentication/
      ├── spec.md
      ├── implementation.md
      ├── tests/
      │   ├── login-tests.md
      │   └── password-reset-tests.md
      ├── examples/
      │   └── api-usage.js
      └── assets/
          ├── login-flow.svg
          └── mockup.png
```

---

## Spec Template (spec.md)

```markdown
# [Feature Name]

**Status**: [DRAFT/REVIEW/APPROVED/IMPLEMENTED]  
**Created**: [Date]  
**Last Modified**: [Date]

## Purpose/Goal

[Why is this feature needed?]

## Functional Requirements

1. [Requirement 1]
2. [Requirement 2]

## Technical Constraints

- [Constraint 1]
- [Constraint 2]

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Out-of-Scope

- [What is explicitly NOT part]

## Dependencies

- [Other specs, APIs, services]

## Open Questions

- [Question 1]
```

---

## Implementation Plan Template (implementation.md)

```markdown
# Implementation Plan: [Feature Name]

**Status**: [DRAFT/REVIEW/APPROVED/COMPLETE]  
**Created**: [Date]  
**Last Modified**: [Date]

## Overview

[Brief summary of what will be implemented]

## Reference

- **Spec**: `spec.md`
- **Acceptance Criteria**: [List key criteria from spec]

## File Structure

### Files to Create
- `path/to/file1.ext` - [Purpose]
- `path/to/file2.ext` - [Purpose]

### Files to Modify
- `path/to/existing.ext` - [What changes]

## Implementation Steps

### Step 1: [Step Name]
**Goal**: [What this step achieves]

**Actions**:
1. [Concrete action 1]
2. [Concrete action 2]

**Files involved**: `file1.ext`, `file2.ext`

### Step 2: [Step Name]
[Continue for all steps...]

## Code Architecture

### Key Components

#### Component 1: [Name]
- **Purpose**: [What it does]
- **Location**: `path/to/component`
- **Key Methods/Functions**:
  - `functionName()` - [Purpose]
  - `anotherFunction()` - [Purpose]
- **Dependencies**: [What it depends on]

#### Component 2: [Name]
[Continue for all components...]

### Data Models

```typescript
// Example data structures
interface UserAuth {
  userId: string;
  token: string;
  expiresAt: Date;
}
```

### Module Interactions

```
[Component A] --calls--> [Component B]
[Component B] --emits--> [Event X]
[Component C] --listens--> [Event X]
```

## Technical Decisions

### Framework/Library Choices
- **[Technology]**: [Why chosen, how used]
- **[Library]**: [Why chosen, how used]

### Patterns & Approaches
- **[Pattern Name]**: [Where applied, why]
- **Error Handling**: [Approach]
- **State Management**: [Approach]

### Configuration
- **Environment Variables**: [What's needed]
- **Config Files**: [What needs to be updated]

## Integration Points

### Existing Code Integration
- **[System/Module]**: [How we integrate]
- **[API]**: [Which endpoints we use]

### Database Changes
- **Tables**: [Create/modify]
- **Migrations**: [What needs to run]

## Test Strategy

### Unit Tests
- **File**: `tests/unit/[name].test.ext`
- **Coverage**: [What to test]
  - Test case 1: [Description]
  - Test case 2: [Description]

### Integration Tests
- **File**: `tests/integration/[name].test.ext`
- **Coverage**: [What to test]

### Test Data
- **Fixtures**: [What test data needed]
- **Mocks**: [What to mock]

## Edge Cases & Error Handling

### Edge Cases
1. [Edge case 1]: [How to handle]
2. [Edge case 2]: [How to handle]

### Error Scenarios
1. [Error scenario 1]: [How to handle]
2. [Error scenario 2]: [How to handle]

## Performance Considerations

- [Performance aspect 1]
- [Performance aspect 2]

## Security Considerations

- [Security aspect 1]
- [Security aspect 2]

## Rollback Plan

If implementation fails:
1. [Rollback step 1]
2. [Rollback step 2]

## Validation Checklist

Before marking as complete:
- [ ] All files created/modified as planned
- [ ] All tests passing
- [ ] Code follows project conventions
- [ ] Documentation updated
- [ ] All acceptance criteria met
- [ ] No breaking changes (or documented)
- [ ] Performance benchmarks met
- [ ] Security review completed

## Notes

[Any additional context, gotchas, or important notes]
```

---

## Change Management

### During SPEC Phase
- Changes are normal and expected
- Update spec.md directly
- Communicate changes clearly

### During REVIEW Phase
- Address feedback by updating spec.md
- Re-submit for review after changes
- Track open questions

### During IMPLEMENTATION-PLAN Phase
- Refine plan based on technical insights
- Update implementation.md
- Get approval before proceeding to IMPL

### During IMPL Phase
**Implementation Plan Changes:**

1. **Pause implementation**
2. **Update `implementation.md`** with changes
3. **Document reason** for change
4. **Commit changes** to Git with descriptive message
5. **Request review** of the change
6. **Wait for approval** (`[PLAN-APPROVED]`)
7. **Continue implementation**

**Emergency Changes:**
- Document as technical debt
- Create follow-up spec for proper implementation
- Mark with `// FIXME:` in code

### During VERIFY Phase
- Bug fixes go back to IMPL
- Spec issues trigger spec review
- Test failures are documented

---

## Communication Rules

### General Principles
- **MANDATORY**: Every response must start with the current phase status marker
- Each phase ends with explicit confirmation
- Current workflow status must be communicated
- On blockers: Return to previous phase
- Phase transitions require explicit approval

### Required Response Format

**Every response MUST start with:**
```
[STATUS_MARKER] Current Phase Description
```

**Examples:**
- `[SPEC] Creating specification for user authentication...`
- `[REVIEW] Reviewing the authentication spec...`
- `[IMPLEMENTATION-PLAN] Planning the implementation steps...`
- `[IMPL] Implementing step 2: Database schema...`
- `[VERIFY] Running integration tests...`

### Status Updates
- **Every response starts with phase status marker** - No exceptions
- Start of work: Announce phase with status marker
- During work: Regular progress updates with status marker
- Blockers: Immediate communication with `[BLOCKED]`
- Completion: Summary with status marker

### Approval Requests
- Clear signal that approval is needed
- Summary of what needs approval
- Wait for explicit approval before proceeding

### Examples

**Good:**
```
[SPEC] I've created the specification for user authentication.
Ready for review. Please approve to proceed to implementation planning.
```

**Good:**
```
[IMPLEMENTATION-PLAN] Implementation plan is complete.
It covers all 5 steps, architecture, and test strategy.
Awaiting [PLAN-APPROVED] to begin coding.
```

**Good:**
```
[IMPL] Currently implementing Step 3: API endpoints.
Progress: 2/5 steps completed.
```

**Bad:**
```
I made a spec. Moving to implementation.
(Missing: Status marker, no clear phase indication)
```

**Bad:**
```
Working on the authentication feature now.
(Missing: Status marker, unclear which phase)
```

---

## Best Practices

### For Specs
- Start simple, iterate
- Use concrete examples
- Define success clearly
- Explicitly state what's out of scope
- Consider error cases early

### For Implementation Plans
- Think through the entire implementation before coding
- Break into logical, testable steps
- Document architectural decisions
- Include rollback strategy
- Be specific about file locations and structure

### For Implementation
- Follow the plan strictly
- Commit frequently
- Run tests after each significant change
- Document deviations immediately
- Keep plan synchronized with reality

### For Verification
- Test against acceptance criteria first
- Don't skip edge cases
- Document test failures thoroughly
- Verify non-functional requirements
- Get peer review when possible

---

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         START                                │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  [SPEC]       │
                    │  Create Spec  │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │  [REVIEW]     │◄──────────┐
                    │  Review Spec  │           │
                    └───────┬───────┘           │
                            │                   │
                    ┌───────▼────────┐          │
                    │  Clear?        │          │
                    └───┬────────┬───┘          │
                        │        │              │
                    No  │        │ Yes          │
                        │        │              │
                ┌───────▼─────┐  │              │
                │  [BLOCKED]  │  │              │
                │  Clarify    │  │              │
                └───────┬─────┘  │              │
                        │        │              │
                        └────────┘              │
                                 │              │
                                 ▼              │
                         ┌───────────────┐     │
                         │  [APPROVED]   │     │
                         │  Spec OK      │     │
                         └───────┬───────┘     │
                                 │              │
                                 ▼              │
                    ┌────────────────────┐     │
                    │ [IMPLEMENTATION-   │     │
                    │  PLAN]             │     │
                    │ Create Plan        │     │
                    └─────────┬──────────┘     │
                              │                │
                              ▼                │
                    ┌────────────────────┐     │
                    │ [PLAN-REVIEW]      │     │
                    │ Review Plan        │     │
                    └─────────┬──────────┘     │
                              │                │
                      ┌───────▼────────┐       │
                      │  Clear?        │       │
                      └───┬────────┬───┘       │
                          │        │           │
                      No  │        │ Yes       │
                          │        │           │
                          └────────┘           │
                                   │           │
                                   ▼           │
                         ┌──────────────────┐  │
                         │ [PLAN-APPROVED] │  │
                         │ Plan OK         │  │
                         └────────┬─────────┘  │
                                  │            │
                                  ▼            │
                         ┌────────────────┐    │
                         │  [IMPL]        │    │
                         │  Implement     │    │
                         └────────┬───────┘    │
                                  │            │
                    ┌─────────────▼─────────┐  │
                    │  Deviation from plan? │  │
                    └─────┬───────────┬─────┘  │
                          │           │        │
                      Yes │           │ No     │
                          │           │        │
                          └───────────┘        │
                                    │          │
                                    ▼          │
                           ┌─────────────┐     │
                           │  [VERIFY]   │     │
                           │  Test       │     │
                           └──────┬──────┘     │
                                  │            │
                          ┌───────▼────────┐   │
                          │  Tests pass?   │   │
                          └───┬────────┬───┘   │
                              │        │       │
                          No  │        │ Yes   │
                              │        │       │
                              └────────┘       │
                                       │       │
                                       ▼       │
                              ┌─────────────┐  │
                              │   [DONE]    │  │
                              │  Complete   │  │
                              └─────────────┘  │
                                               │
                                               │
                    (All loops can go back to  │
                     appropriate earlier phase)│
                                               │
                                               └──┘
```

---

## Summary

This workflow ensures:
- **Quality**: Nothing moves forward without approval
- **Clarity**: Every phase has clear rules and outputs
- **Traceability**: Full documentation from concept to code
- **Flexibility**: Iterative improvements at every stage
- **Autonomy**: Claude Code can work independently with implementation plans
- **Safety**: Change management prevents silent drift
- **Transparency**: Status always visible through markers

Follow these phases strictly for consistent, high-quality results.