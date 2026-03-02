# Refactoring Workflow

## Primary Goal

**Make code more readable and maintainable by following Clean Code principles.**

---

## Scope and Applicability

### This workflow applies to:
- Code improvements without changing functionality
- Technical debt reduction
- Code organization and structure improvements
- Performance optimizations (without adding features)
- Dependency upgrades (without API changes)
- Test coverage improvements
- Code style and consistency improvements

### Prerequisites (MANDATORY):
⚠️ **Unit tests MUST exist for all code to be refactored**  
⚠️ **Without tests, refactoring CANNOT proceed safely**

### This workflow does NOT apply to:
- Changes that add new functionality → Use Feature Development workflow
- Bug fixes → Use Feature Development or Hot-Fix workflow
- Changes that modify behavior or APIs → Use Feature Development workflow
- Architectural changes affecting multiple systems → Use Feature Development workflow

---

## Workflow Phases

```
ANALYSIS → PLAN → REFACTOR → VERIFY
```

---

## Critical Rules (MANDATORY - NO EXCEPTIONS)

### Rule 1: Response Format
**EVERY response MUST start with current phase status marker.**

Format: `[STATUS_MARKER] Phase description and current action`

✅ Good examples:
- `[ANALYSIS] Analyzing UserService for refactoring opportunities...`
- `[REFACTOR] Extracting payment logic into separate module...`

❌ Bad example:
- `Improving the code now.` (Missing status marker - UNACCEPTABLE)

### Rule 2: The Golden Rule of Refactoring
**ALL EXISTING TESTS MUST PASS BEFORE AND AFTER REFACTORING.**

**IF** you need to change tests → **THEN** you're probably changing behavior → **THEN** it's NOT refactoring.

**ACTION**: Stop and use Feature Development workflow instead.

### Rule 3: The Clean Code Principle
**REFACTORINGS MUST FOLLOW CLEAN CODE PRINCIPLES.**

Every refactoring MUST make code:
1. **More readable** - Easier to understand at first glance
2. **More maintainable** - Easier to modify and extend
3. **Cleaner** - Following established best practices

**IF** a change doesn't improve readability or maintainability → **THEN** it's NOT a valuable refactoring → **THEN** don't do it.

### Rule 4: The Test Coverage Rule
**CODE CAN ONLY BE REFACTORED IF UNIT TESTS EXIST FOR IT.**

Without tests, you CANNOT guarantee code still works as expected.

**IF** code has NO tests:
1. **STOP** - Do NOT proceed with refactoring
2. **SET STATUS** to `[BLOCKED]`
3. **CHOOSE** one option:
   - Write unit tests first (use Feature Development workflow)
   - Document as technical debt and skip refactoring
   - Get explicit approval to refactor without tests (HIGH RISK - not recommended)

**ONLY EXCEPTION**: Trivial changes (renaming variables, formatting) with explicit tech lead approval AND documented risk.

---

## Phase 1: ANALYSIS - Code Analysis

### Status Marker
`[ANALYSIS]`

### Purpose
Analyze current code to identify what needs improvement and why, focusing on Clean Code violations and opportunities to improve readability and maintainability.

### Mandatory Steps

#### Step 1: Create Refactoring Directory
**ACTION**: Create directory `/dev/refactorings/yyyy-MM-dd_[refactoring-name]/`

**Format**: `yyyy-MM-dd_[refactoring-name]`  
**Example**: `/dev/refactorings/2025-10-28_extract-payment-service/`

#### Step 2: Document Current State
**ACTION**: Document these items in `analysis.md`:
- What code needs improvement?
- WHY does it need improvement? (code smells, performance, maintainability)
- What are the pain points?
- Current metrics: complexity, test coverage, duplication

#### Step 3: Identify Scope and Verify Test Coverage (CRITICAL)
**ACTION**: For each file to be refactored:

1. List the file
2. List its test files
3. Calculate test coverage percentage
4. **IF** coverage < 80% → Document untested parts
5. **IF** NO tests exist → **STOP** - Set status to `[BLOCKED]`

**Test Coverage Decision Tree:**

```
IF test coverage > 80%
  THEN status = PASS → Proceed to next step
ELSE IF test coverage 50-80%
  THEN status = WARNING → Write more tests first
ELSE IF test coverage < 50%
  THEN status = BLOCKED → MUST write tests before refactoring
ELSE IF NO tests exist (0%)
  THEN status = BLOCKED → MUST write tests before refactoring
```

**WHEN BLOCKED**: Create feature spec for test coverage and use Feature Development workflow to write tests first.

#### Step 4: Define Success Criteria
**ACTION**: Define measurable success criteria:
- What does "better" look like?
- How will we measure improvement?
- What MUST NOT change? (behavior, APIs, test results)

### Required Output

**FILE**: `analysis.md`  
**STATUS in file**: DRAFT

**Template**: See template section below.

### Transition Rules

**Decision Point: Is analysis complete and is there sufficient test coverage?**

```
IF analysis.md created and complete
  AND test coverage ≥ 80% for all code to be refactored
  AND all tests currently passing
  AND success criteria defined
  THEN → Move to [PLAN] phase
  THEN → Announce: "Analysis complete with sufficient test coverage. Moving to [PLAN] phase."

ELSE IF analysis complete BUT test coverage < 80%
  THEN → Set status to [BLOCKED]
  THEN → Document insufficient coverage in analysis.md
  THEN → Create feature spec for test coverage improvement
  THEN → Use Feature Development workflow to write tests
  THEN → Return to [ANALYSIS] when tests are ready
  THEN → Announce: "[BLOCKED] Insufficient test coverage. Must write tests before refactoring."

ELSE IF analysis complete BUT NO tests exist (0%)
  THEN → Set status to [BLOCKED]
  THEN → STOP refactoring process
  THEN → Create feature spec for test coverage
  THEN → Use Feature Development workflow to write tests first
  THEN → Announce: "[BLOCKED] No tests exist. Cannot refactor without tests."

ELSE IF analysis incomplete
  THEN → Stay in [ANALYSIS] phase
  THEN → Complete missing sections
```

**CRITICAL REQUIREMENT**: Minimum 80% test coverage for affected code  
**NEXT PHASE**: 
- `[PLAN]` (if analysis complete AND coverage ≥ 80%)
- `[BLOCKED]` (if coverage < 80% or no tests)

---

## Phase 2: PLAN - Refactoring Plan

### Status Marker
`[PLAN]`

### Purpose
Create detailed, step-by-step plan for refactoring that maintains Clean Code focus.

### Mandatory Steps

#### Step 1: Break Into Small Steps
**REQUIREMENTS** (ALL must be met):
- ✅ Each step MUST be independently committable
- ✅ Each step MUST keep tests green
- ✅ Steps MUST be ordered to minimize risk
- ✅ Each step MUST improve Clean Code aspects

#### Step 2: Identify Refactoring Techniques
**ACTION**: For each improvement, specify which refactoring technique will be used.

**Reference**: Martin Fowler's refactoring catalog (see reference section)

#### Step 3: Plan for Safety
**REQUIRED in plan**:
- How to verify each step
- Rollback strategy if something goes wrong
- Branch strategy (feature branch RECOMMENDED)

#### Step 4: Document Clean Code Focus
**REQUIRED in plan**:
- What readability improvements will be achieved?
- What maintainability improvements will be achieved?
- How does each step contribute to Clean Code goals?

### Required Output

**FILE**: `plan.md`  
**STATUS in file**: DRAFT (then APPROVED after review)

**Template**: See template section below.

### Transition Rules

**Decision Point: Is refactoring plan complete and approved?**

```
IF plan.md created with all required sections
  AND all steps clearly defined
  AND each step includes Clean Code improvement
  AND safety mechanisms defined
  AND explicit approval received (user says "approved" or "PLAN-APPROVED")
  THEN → Update plan.md status to "APPROVED"
  THEN → Move to [REFACTOR] phase
  THEN → Announce: "Plan approved. Moving to [REFACTOR] phase."

ELSE IF plan has issues OR needs revision
  THEN → Stay in [PLAN] phase
  THEN → Address feedback
  THEN → Re-submit for review
  THEN → Announce: "Plan needs revision. Addressing feedback."

ELSE IF plan incomplete
  THEN → Stay in [PLAN] phase
  THEN → Complete missing sections
```

**NEXT PHASE**: `[REFACTOR]` (after approval)

---

## Phase 3: REFACTOR - Execute Refactoring

### Status Marker
`[REFACTOR]`

### Purpose
Execute the refactoring plan step-by-step, keeping tests green and improving Clean Code aspects.

### Mandatory Rules

#### Rule 1: Follow the Plan (NO DEVIATIONS)
**MUST**:
- ✅ Execute steps in exact order
- ✅ Complete each step fully before moving to next
- ✅ DO NOT skip steps
- ✅ DO NOT add "extra" improvements not in plan

**IF** you want to deviate from plan:
1. **STOP** current step
2. **UPDATE** `plan.md` with proposed change
3. **REQUEST** review
4. **WAIT** for approval
5. **CONTINUE** only after approval

#### Rule 2: Keep Tests Green (ABSOLUTE REQUIREMENT)
**AFTER EVERY CHANGE** (no exceptions):
1. Run FULL test suite (not just relevant tests)
2. **IF** all tests pass → Continue
3. **IF** ANY test fails:
   - **STOP** immediately
   - **REVERT** the change
   - **DEBUG** what went wrong
   - **FIX** the issue
   - **COMMIT** fix separately

**NEVER COMMIT FAILING TESTS** - This is absolutely forbidden.

#### Rule 3: Commit After Each Step
**AFTER** completing each step:
1. Verify all tests pass
2. Verify behavior unchanged
3. Verify Clean Code improvement achieved
4. Commit with format: `refactor: [brief description from plan]`
5. Update `plan.md` marking step as complete
6. Move to next step

#### Rule 4: Stay Focused (NO SCOPE CREEP)
**DO NOT**:
- ❌ Fix unrelated issues
- ❌ Add features
- ❌ Change behavior
- ❌ Refactor code outside the defined scope

**IF** you find other issues → Document them for separate refactoring.

#### Rule 5: Verify Clean Code After Each Step
**AFTER** each step, ask yourself:
- "Is the code more readable than before this step?"
- "Is the code more maintainable than before this step?"

**IF** answer is NO → **THEN** revert the step - it's not a valid refactoring.

### Recommended Working Flow

**FOR EACH STEP** in plan:

```
1. Read step from plan
2. Make changes
3. Run ALL tests (MANDATORY)
4. IF tests fail → REVERT and debug
5. IF tests pass → Verify behavior unchanged
6. Verify Clean Code improvement
7. Commit: "refactor: [description]"
8. Update plan.md with completion status
9. Move to next step
```

### Progress Updates

**UPDATE** `plan.md` continuously with:
- Which steps are complete ✅
- Which step is in progress 🔄
- Any notes or discoveries
- Timestamp for each completion

### Required Output

**PRIMARY**: Progress updates in `plan.md`  
**SECONDARY**: Git commits for each completed step

### Transition Rules

**Decision Point: Are all refactoring steps complete with tests green?**

```
IF all steps in plan completed
  AND all tests passing (100%)
  AND all commits made
  AND no deviations from plan
  THEN → Move to [VERIFY] phase
  THEN → Announce: "Refactoring complete. All tests green. Moving to [VERIFY] phase."

ELSE IF ANY test fails during refactoring
  THEN → STOP immediately
  THEN → REVERT last change
  THEN → Stay in [REFACTOR] phase
  THEN → Debug and fix issue
  THEN → Continue when tests green again
  THEN → Announce: "[REFACTOR] Tests failed. Reverted change. Debugging issue."

ELSE IF deviation from plan needed
  THEN → STOP current step
  THEN → Update plan.md with proposed changes
  THEN → Document reason for deviation
  THEN → Request review
  THEN → Wait for approval
  THEN → Continue after approval
  THEN → Announce: "[REFACTOR] Deviation needed. Plan updated. Awaiting approval."

ELSE IF refactoring not complete
  THEN → Stay in [REFACTOR] phase
  THEN → Continue with next step from plan
  THEN → Update progress in plan.md

ELSE IF Clean Code improvement not achieved in a step
  THEN → REVERT that step
  THEN → Stay in [REFACTOR] phase
  THEN → Reassess approach
  THEN → Announce: "Step did not improve code quality. Reverted."
```

**CRITICAL REQUIREMENT**: All tests MUST pass after EVERY step  
**NEXT PHASE**: 
- `[VERIFY]` (if all steps complete and tests green)
- Stay in `[REFACTOR]` (if steps remaining or issues to fix)

---

## Phase 4: VERIFY - Verification

### Status Marker
`[VERIFY]`

### Purpose
Comprehensively verify that refactoring achieved goals without breaking anything, with special focus on Clean Code improvements.

### Mandatory Verification Steps

#### Step 1: Complete Test Suite (MANDATORY)
**ACTION**: Run ALL tests:
1. Full unit test suite
2. Integration tests
3. End-to-end tests (if applicable)

**REQUIREMENT**: 100% of tests MUST pass.

**IF** ANY test fails:
- **THEN** → Status: FAILED
- **THEN** → Return to `[REFACTOR]` phase
- **THEN** → Fix issues
- **THEN** → Return to `[VERIFY]`

#### Step 2: Verify Success Criteria
**ACTION**: Check EVERY success criterion from `analysis.md`:
- Measure code metrics (complexity, duplication, etc.)
- Compare before vs. after
- Verify ALL criteria are met

**IF** any criterion not met:
- **THEN** → Document why
- **THEN** → Either fix or justify deviation

#### Step 3: Behavior Verification (CRITICAL)
**ACTION**: Verify these are unchanged:
- ✅ No API changes (or documented if unavoidable)
- ✅ No behavior changes
- ✅ No performance regression (benchmark if applicable)

**IF** behavior changed:
- **THEN** → This was NOT a refactoring
- **THEN** → Revert changes
- **THEN** → Use Feature Development workflow instead

#### Step 4: Clean Code Verification (MANDATORY)
**ACTION**: Complete this checklist:

**Readability Check:**
- [ ] Code is easier to understand at first glance
- [ ] Variable/method names are self-documenting
- [ ] Comments explain "why", not "what"
- [ ] Code structure is logical and intuitive

**Maintainability Check:**
- [ ] Easier to modify and extend
- [ ] Single Responsibility Principle followed
- [ ] No code duplication
- [ ] Clear separation of concerns
- [ ] Consistent abstraction levels

**Reviewer Assessment:**
- Question: "Is this code easier to work with than before?"
- **REQUIRED**: Answer MUST be "Yes" with explanation

**IF** any check fails:
- **THEN** → Refactoring did not achieve Clean Code goals
- **THEN** → Return to `[REFACTOR]` and improve

#### Step 5: Code Review (REQUIRED)
**ACTION**: Get review from at least ONE other developer.

**Review Focus**:
- Correctness
- Clarity
- No hidden behavior changes
- Clean Code improvements achieved

**REQUIREMENT**: Explicit approval from reviewer.

#### Step 6: Documentation
**ACTION**: Update documentation where needed:
- Code comments (where helpful)
- README (if applicable)
- API docs (if applicable)

### Required Output

**FILE**: Verification summary in `plan.md`

**MUST INCLUDE**:
- Test results
- Metrics comparison (before/after)
- Success criteria verification
- Clean Code verification results
- Code review sign-off

### Transition Rules

**Decision Point: Does refactoring pass all verification checks?**

```
IF all tests passing (100%)
  AND all success criteria met
  AND Clean Code verification checklist complete
  AND code review approved
  AND reviewer confirms "code is easier to work with"
  AND no behavior changes
  AND no performance regression
  THEN → Update analysis.md status to "COMPLETE"
  THEN → Update plan.md status to "COMPLETE"
  THEN → Merge to main branch
  THEN → Mark as COMPLETE
  THEN → Announce: "Refactoring complete and verified. Code merged."

ELSE IF any tests failing
  THEN → Document which tests failed
  THEN → Return to [REFACTOR] phase
  THEN → Fix issues
  THEN → Return to [VERIFY] phase
  THEN → Announce: "Tests failed. Returning to [REFACTOR] to fix."

ELSE IF Clean Code goals not achieved
  THEN → Review what went wrong
  THEN → Return to [REFACTOR] phase
  THEN → Improve code further
  THEN → Return to [VERIFY] phase
  THEN → Announce: "Clean Code goals not met. Returning to [REFACTOR]."

ELSE IF behavior changed (tests need modification)
  THEN → STOP verification
  THEN → This was NOT a refactoring
  THEN → REVERT all changes
  THEN → Use Feature Development workflow instead
  THEN → Announce: "Behavior changed detected. This is not refactoring. Reverted."

ELSE IF performance regression detected
  THEN → Return to [REFACTOR] phase
  THEN → Optimize problematic areas
  THEN → Return to [VERIFY] phase

ELSE IF code review finds issues
  THEN → Return to [REFACTOR] phase
  THEN → Address reviewer feedback
  THEN → Return to [VERIFY] phase
```

**CRITICAL CHECKS**:
- Tests: 100% must pass (no exceptions)
- Behavior: Must be unchanged
- Clean Code: Must be improved
- Reviewer: Must confirm improvement

**FINAL STATE**: 
- Complete (if all checks pass)
- Return to [REFACTOR] (if any check fails)

---

## Status Markers

**ALWAYS use these markers at the start of responses:**

- `[ANALYSIS]` - Analyzing code for refactoring
- `[BLOCKED]` - Blocked due to insufficient test coverage
- `[PLAN]` - Creating refactoring plan
- `[REFACTOR]` - Executing refactoring steps
- `[VERIFY]` - Verifying refactoring results

---

## Directory Structure

```
/dev/refactorings/
  └── yyyy-MM-dd_[refactoring-name]/
      ├── analysis.md          # Code analysis (required)
      └── plan.md             # Refactoring plan (required)
```

### Naming Rules
- **Format**: `yyyy-MM-dd_[refactoring-name]`
- **Date**: ISO 8601 format (yyyy-MM-dd)
- **Name**: lowercase, hyphen-separated words

### Examples
- `/dev/refactorings/2025-10-28_extract-payment-service/`
- `/dev/refactorings/2025-11-01_simplify-user-validation/`
- `/dev/refactorings/2025-11-05_reduce-controller-complexity/`

---

## Templates

### analysis.md Template

```markdown
# Refactoring: [Name]

**Status**: DRAFT
**Created**: [Date]
**Developer**: [Name]

## Motivation

[Why is this refactoring needed? What problem does it solve?]

**Clean Code Goals:**
- Make code more readable: [How?]
- Make code more maintainable: [How?]
- Follow Clean Code principles: [Which ones?]

## Current State

### Code Location
- Primary files: [List main files]
- Supporting files: [List related files]
- Test files: [List test files]

### Current Issues

1. **[Issue 1]**: [Description]
   - Impact: [How this affects development/maintenance]
   - Evidence: [Code examples, metrics, or specific problems]

2. **[Issue 2]**: [Description]
   - Impact: [...]
   - Evidence: [...]

### Metrics (Before)

- **Cyclomatic Complexity**: [Number]
- **Lines of Code**: [Number]
- **Test Coverage**: [Percentage]
- **Code Duplication**: [Percentage or instances]
- **Number of Dependencies**: [Number]

### Code Smells Identified

- [ ] Long Method (methods > 50 lines)
- [ ] Large Class (class > 300 lines)
- [ ] Duplicate Code
- [ ] Long Parameter List (> 4 parameters)
- [ ] Feature Envy
- [ ] Data Clumps
- [ ] Primitive Obsession
- [ ] Switch Statements (could be polymorphism)
- [ ] Lazy Class
- [ ] Speculative Generality
- [ ] Other: [Specify]

### Clean Code Violations

- [ ] Unclear naming (variables, methods, classes)
- [ ] Missing or misleading comments
- [ ] Inconsistent formatting
- [ ] Magic numbers without constants
- [ ] Deep nesting (> 3 levels)
- [ ] Mixed levels of abstraction
- [ ] Side effects in methods
- [ ] Non-descriptive boolean flags
- [ ] God objects/classes
- [ ] Violation of Single Responsibility Principle
- [ ] Other: [Specify]

## Scope

### Files to Refactor
- `path/to/file1.ext` - [What will change]
- `path/to/file2.ext` - [What will change]

### Files to Create (if any)
- `path/to/new/file.ext` - [Purpose]

### Dependencies
[List any external dependencies or integrations affected]

### Test Files
- `path/to/test1.test.ext` - [Should remain unchanged]
- `path/to/test2.test.ext` - [Should remain unchanged]

**Test Coverage Check (MANDATORY):**
- **Total tests for affected code**: [N] tests
- **Coverage percentage**: [X]%
- **Untested code blocks**: [List any untested parts]

**Status**: 
- [ ] ✅ PASS - Sufficient test coverage (>80%)
- [ ] ⚠️ WARNING - Partial coverage (50-80%) - Write more tests first
- [ ] ❌ BLOCKED - Insufficient coverage (<50%) - MUST write tests before refactoring
- [ ] ❌ BLOCKED - NO tests exist - MUST write tests before refactoring

**Critical**: All [N] tests must pass before and after refactoring.

## Success Criteria

### Functional Requirements (MANDATORY)
- [ ] All existing tests pass
- [ ] No behavior changes
- [ ] No API changes (or documented if unavoidable)
- [ ] No performance regression

### Quality Improvements
- [ ] [Specific improvement 1, e.g., "Cyclomatic complexity < 10 per method"]
- [ ] [Specific improvement 2, e.g., "No duplicate code blocks"]
- [ ] [Specific improvement 3, e.g., "Test coverage > 80%"]

### Clean Code Goals (MANDATORY)
- [ ] Code is more readable than before
- [ ] Code is more maintainable than before
- [ ] Names are clear and self-documenting
- [ ] Methods have single responsibility
- [ ] Abstractions are at consistent levels
- [ ] Comments explain "why", not "what"
- [ ] No magic numbers (constants used)

### Out of Scope
- [What will NOT be changed]
- [Features that will NOT be added]

## Risks

- **Risk 1**: [Potential issue]
  - Mitigation: [How to avoid/handle]
- **Risk 2**: [Potential issue]
  - Mitigation: [How to avoid/handle]

## Estimated Effort

**Time Estimate**: [Hours/days]
**Complexity**: [Low/Medium/High]
```

### plan.md Template

```markdown
# Refactoring Plan: [Name]

**Status**: DRAFT
**Created**: [Date]

## Reference
- **Analysis**: `analysis.md`
- **Success Criteria**: [Key criteria from analysis]

## Strategy

### Approach
[High-level strategy - e.g., "Extract payment logic into dedicated service"]

### Clean Code Focus
- **Readability improvements**: [What will be more readable?]
- **Maintainability improvements**: [What will be easier to maintain?]

### Refactoring Techniques to Use
- **[Technique 1]**: [Where it will be applied - e.g., "Extract Method for validation logic"]
- **[Technique 2]**: [Where it will be applied]
- **[Technique 3]**: [Where it will be applied]

## Step-by-Step Plan

### Step 1: [Step Name]
**Goal**: [What this step achieves]

**Technique**: [Refactoring technique used - e.g., "Extract Method"]

**Clean Code Improvement**: [How this step improves readability/maintainability]

**Actions**:
1. [Concrete action 1]
2. [Concrete action 2]
3. [Concrete action 3]

**Files Modified**: `file1.ext`, `file2.ext`

**Safety Check** (MANDATORY after this step):
- Run all tests → must pass
- Verify no behavior change
- Verify Clean Code improvement
- Commit: "refactor: [brief description]"

**Estimated Time**: [Minutes/hours]

### Step 2: [Step Name]
[Repeat format for all steps...]

## Before/After Comparison

### Code Structure (Before)
```
[Current structure - high level]
```

### Code Structure (After)
```
[Improved structure - high level]
```

### Readability Improvements
- **Before**: [Description of readability issues - e.g., "Unclear variable names, deeply nested conditions"]
- **After**: [How readability is improved - e.g., "Self-documenting names, flat structure"]
- **Example**: [Concrete before/after code snippet showing improvement]

### Maintainability Improvements
- **Before**: [Description of maintainability issues - e.g., "Payment logic mixed with UI code"]
- **After**: [How maintainability is improved - e.g., "Payment logic isolated in testable service"]
- **Example**: [What's easier to change/extend after refactoring]

## Testing Strategy

### Existing Tests
- All [N] existing tests must pass throughout
- NO test modifications required
- **IF** test changes needed: STOP - you're changing behavior

### New Tests (if applicable)
- [New test 1]: [Purpose]
- [New test 2]: [Purpose]

### Performance Tests (if applicable)
- Benchmark: [Specific metric to measure]
- Baseline: [Current performance]
- Target: [Acceptable performance after refactoring]

## Rollback Plan

**IF something goes wrong:**
1. Revert last commit
2. Fix issue in separate commit
3. Continue from previous safe state

**Branch Strategy**:
- Work in feature branch: `refactor/[name]`
- Commit after each step
- Merge to main only when complete and verified

## Safety Mechanisms

### Continuous Verification
- Run tests after EVERY step (MANDATORY)
- Use watch mode during refactoring (RECOMMENDED)
- CI/CD must pass before merge (REQUIRED)

### Code Review
- Request review from: [Team member]
- Focus areas: [Specific concerns]

### Metrics Tracking
- [ ] Complexity before: [value] → after: [target]
- [ ] Coverage before: [value] → after: [target]
- [ ] Duplication before: [value] → after: [target]

## Validation Checklist

Before marking as complete:
- [ ] All files created/modified as planned
- [ ] All tests passing
- [ ] Code follows project conventions
- [ ] Documentation updated (if needed)
- [ ] All success criteria met
- [ ] No breaking changes (or documented)
- [ ] Performance benchmarks met (if applicable)
- [ ] Code review completed
- [ ] Clean Code improvements verified
```

---

## Refactoring Techniques Reference

### Composing Methods
- **Extract Method** - Turn code fragment into method
- **Inline Method** - Put method body into caller, remove method
- **Extract Variable** - Put complex expression into variable
- **Inline Variable** - Replace variable with expression
- **Replace Temp with Query** - Replace temporary variable with method call

### Moving Features
- **Move Method** - Move method to class that uses it most
- **Move Field** - Move field to class that uses it most
- **Extract Class** - Create new class for subset of features
- **Inline Class** - Merge class into another if too small

### Organizing Data
- **Replace Magic Number with Constant** - Use named constant instead of literal
- **Encapsulate Field** - Make field private, provide accessors
- **Replace Array with Object** - Use object for array with different data types

### Simplifying Conditionals
- **Decompose Conditional** - Extract condition and branches into methods
- **Consolidate Conditional Expression** - Combine conditions with same result
- **Remove Dead Code** - Delete unused code

### Simplifying Method Calls
- **Rename Method** - Make method name describe what it does
- **Add Parameter** - Add parameter for needed data
- **Remove Parameter** - Remove unused parameter
- **Replace Parameter with Method** - Remove parameter, call method instead

---

## Best Practices

### ALWAYS DO (MANDATORY):
- ✅ Follow Clean Code principles in every change
- ✅ Make code more readable with each step
- ✅ Improve names to be self-documenting
- ✅ Extract methods to clarify intent
- ✅ Remove code duplication
- ✅ Keep methods small and focused (single responsibility)
- ✅ Verify test coverage BEFORE starting refactoring
- ✅ Run tests after EVERY change
- ✅ Make small, incremental changes
- ✅ Commit after each safe step
- ✅ Work in a feature branch
- ✅ Get code review before merging
- ✅ Ask: "Is this easier to understand and maintain?"

### NEVER DO (FORBIDDEN):
- ❌ Make code more complex or harder to read
- ❌ Use clever tricks that obscure intent
- ❌ Leave unclear or misleading names
- ❌ Create long methods or large classes
- ❌ Refactor code without unit tests
- ❌ Change behavior (that's not refactoring)
- ❌ Add new features while refactoring
- ❌ Skip tests ("I'll fix them later")
- ❌ Make multiple unrelated changes in one commit
- ❌ Change tests to make them pass
- ❌ Commit failing tests

---

## When to Switch Workflows

### Switch to Feature Development IF:
- You discover you need to add functionality
- You need to change APIs or interfaces
- You need to modify behavior

**ACTION**: Stop refactoring, create feature spec, use Feature Development workflow.

### Switch to Hot-Fix IF:
- You discover a critical bug during refactoring
- Production issues arise

**ACTION**: Stop refactoring, use Hot-Fix workflow, return to refactoring later.

### Continue Refactoring IF:
- Only code structure changes
- All tests stay green
- No behavior modifications

---

## Communication Protocol

### Response Format (MANDATORY)

**EVERY response MUST include:**

1. **Status marker** (at the very start)
2. **Progress indicator** (X/Y steps complete)
3. **What was done**
4. **Test status** (MANDATORY)
5. **Clean Code improvement** (what got better)
6. **Next steps**

### Example: Good Response

```
[REFACTOR] Executing Step 3: Extracting error handling logic.

Progress: 3/7 steps complete

Current action:
- Extracted handlePaymentError method from processPayment
- Moved error formatting to dedicated ErrorFormatter class
- Updated 3 call sites to use new structure

Clean Code improvement: Error handling now has single responsibility 
and is easily testable. Method names are self-documenting.

Tests: ✅ All 47 tests passing

Next: Step 4 - Simplify conditional logic in validateTransaction
```

### Example: Blocked Response

```
[BLOCKED] Cannot proceed with refactoring - insufficient test coverage.

Analysis complete, but test coverage check failed:
- PaymentService.ts: 0% test coverage (0 tests)
- TransactionValidator.ts: 35% test coverage (12 tests, missing edge cases)

Required actions before refactoring:
1. Write unit tests for PaymentService (minimum 80% coverage)
2. Complete test coverage for TransactionValidator edge cases

Recommendation: Create feature spec for "Add test coverage for payment module" 
and use Feature Development workflow to write tests first.

Once tests are in place, we can proceed with this refactoring.
```

### Example: Bad Response (DO NOT DO THIS)

```
Working on improving the payment code now. Made some changes.
```

**Why this is bad:**
- ❌ No status marker
- ❌ Unclear which phase
- ❌ No test status
- ❌ No specific actions described
- ❌ No next steps

---

## Summary

### This workflow ensures:
- ✅ **Clean Code**: Every refactoring follows Clean Code principles
- ✅ **Readability**: Code becomes easier to understand
- ✅ **Maintainability**: Code becomes easier to modify and extend
- ✅ **Safety**: Tests green at every step
- ✅ **Structure**: Methodical approach prevents chaos
- ✅ **Quality**: Measurable improvements
- ✅ **Discipline**: Focus on code improvement, not feature addition

### Core Philosophy:
**"If it doesn't make the code cleaner, more readable, or more maintainable, it's not worth doing."**

### Remember:
If you're changing behavior or adding features, use the Feature Development workflow instead.