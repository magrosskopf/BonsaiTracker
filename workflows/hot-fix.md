# Hot-Fix Workflow

## Scope and Applicability

**This workflow applies to:**
- Critical production bugs requiring immediate fixes
- Security vulnerabilities that need urgent patches
- Data corruption issues
- Service outages or severe performance degradation
- Any issue causing immediate business impact

**This workflow does NOT apply to:**
- Regular bug fixes (use Feature Development workflow)
- Non-critical issues that can wait
- Planned improvements or optimizations
- New features disguised as "fixes"

**Key Principle:** Speed is critical, but documentation is mandatory for learning and accountability.

---

## Workflow Phases

```
INCIDENT → ASSESS → FIX → VERIFY → DEPLOY → LEARNING
```

---

## Critical Rules

### Response Format (MANDATORY)
**Every response MUST start with current phase status marker**

Format: `[STATUS_MARKER] Phase description and current action`

Examples:
- ✅ `[INCIDENT] Logging critical production error...`
- ✅ `[FIX] Implementing emergency patch for authentication bug...`
- ❌ `Working on the bug now.` (Missing status marker)

---

## Phase 1: INCIDENT - Incident Documentation

### Status Marker
`[INCIDENT]`

### Purpose
Document the incident immediately to capture critical information while it's fresh.

### Rules

1. **Create Incident Directory Immediately**
   - Location: `/dev/hotfixes/yyyy-MM-dd_[issue-description]/`
   - Use current date and brief description
   - Example: `/dev/hotfixes/2025-10-28_auth-token-expiry/`

2. **Document Core Information**
   - What is broken?
   - What is the impact? (users affected, services down, data at risk)
   - When was it first detected?
   - Error messages, stack traces, logs
   - Steps to reproduce (if known)

3. **Set Severity Level**
   - **Critical**: Complete service outage, data loss, security breach
   - **High**: Major functionality broken, significant user impact
   - **Medium**: Important feature impaired, workaround exists

### Output

Create `incident.md` file:

```markdown
# Incident: [Brief Description]

**Status**: ACTIVE
**Severity**: [Critical/High/Medium]
**Detected**: [Date and Time]
**Reporter**: [Who reported/detected it]

## Symptoms

[What users/systems are experiencing]

## Impact

- **Users Affected**: [Number or percentage]
- **Services Affected**: [Which services/features]
- **Business Impact**: [Revenue, reputation, compliance, etc.]

## Timeline

- **[Time]**: First detection
- **[Time]**: Issue confirmed
- **[Time]**: Investigation started

## Error Details

```
[Error messages, stack traces, logs]
```

## Initial Observations

[Any immediate findings during triage]

## Communication

- [ ] Stakeholders notified
- [ ] Status page updated (if applicable)
- [ ] Team alerted
```

### Transition

Move to ASSESS once incident is documented.

---

## Phase 2: ASSESS - Root Cause Assessment

### Status Marker
`[ASSESS]`

### Purpose
Quickly identify root cause and determine fix strategy.

### Rules

1. **Time-Boxed Investigation**
   - Spend maximum 30 minutes investigating
   - If root cause unclear after 30 min: implement defensive fix and continue investigation in parallel

2. **Document Findings**
   - Root cause (if identified)
   - Affected components
   - Potential fix approaches
   - Estimated time to fix

3. **Risk Assessment**
   - What could go wrong with the fix?
   - Do we need a rollback plan?
   - Can we deploy safely?

### Output

Update `incident.md` with assessment section:

```markdown
## Root Cause Analysis

**Root Cause**: [Description of underlying issue]

**Affected Components**:
- [Component 1]
- [Component 2]

**Why it happened**: [Technical explanation]

## Fix Strategy

**Approach**: [Chosen fix strategy]

**Alternative Approaches Considered**:
1. [Option 1] - Rejected because [reason]
2. [Option 2] - Rejected because [reason]

**Estimated Time**: [Time estimate]

**Risks**:
- [Risk 1 and mitigation]
- [Risk 2 and mitigation]

**Rollback Plan**:
[How to revert if fix fails]
```

### Transition

Move to FIX once strategy is clear.

---

## Phase 3: FIX - Implement Fix

### Status Marker
`[FIX]`

### Purpose
Implement the emergency fix as quickly and safely as possible.

### Rules

1. **Minimal Change Principle**
   - Fix ONLY what's broken
   - No refactoring, no improvements, no "while I'm here" changes
   - Minimize risk by minimizing scope

2. **Document the Fix**
   - Create `fix.md` in the hotfix directory
   - Explain what was changed and why
   - Include before/after code snippets for critical changes

3. **Code Review (Fast-Track)**
   - Get at least one pair of eyes on the fix
   - Focus on: Does it fix the issue? Are there obvious risks?
   - Don't nitpick style or minor issues

4. **Test Immediately**
   - Verify fix addresses the reported issue
   - Check for obvious regressions
   - Test rollback procedure

### Output

Create `fix.md`:

```markdown
# Fix: [Issue Description]

**Implemented**: [Date and Time]
**Developer**: [Name]
**Reviewer**: [Name]

## Changes Made

### Files Modified
- `path/to/file1.ext` - [What changed]
- `path/to/file2.ext` - [What changed]

### Code Changes

#### Before
```[language]
[Original problematic code]
```

#### After
```[language]
[Fixed code]
```

## Explanation

[Why this fix resolves the issue]

## Testing Performed

- [ ] Verified issue is resolved
- [ ] Checked for obvious regressions
- [ ] Tested rollback procedure

## Deployment Notes

[Any special deployment considerations]

## Technical Debt Created

[Any shortcuts taken that need follow-up]
```

### Transition

Move to VERIFY once fix is implemented.

---

## Phase 4: VERIFY - Verification

### Status Marker
`[VERIFY]`

### Purpose
Confirm fix works in production-like environment before deploying.

### Rules

1. **Test in Staging/Pre-Prod**
   - Deploy to staging environment
   - Reproduce original issue - verify it's fixed
   - Run smoke tests on related functionality

2. **Monitor Metrics**
   - Check error rates
   - Verify performance metrics
   - Confirm fix doesn't introduce new issues

3. **Sign-Off Required**
   - Get explicit approval from senior developer or lead
   - Confirm rollback plan is ready

### Output

Update `fix.md` with verification results:

```markdown
## Verification Results

**Tested in**: [Environment]
**Tested by**: [Name]
**Test Date**: [Date and Time]

### Test Results
- [x] Original issue reproduced in staging
- [x] Fix resolves the issue
- [x] No new errors introduced
- [x] Performance metrics acceptable
- [x] Rollback procedure tested

### Sign-Off
- **Approved by**: [Name]
- **Approval time**: [Date and Time]
```

### Transition

Move to DEPLOY once verification passes.

---

## Phase 5: DEPLOY - Deployment

### Status Marker
`[DEPLOY]`

### Purpose
Deploy fix to production safely.

### Rules

1. **Deployment Checklist**
   - Rollback plan confirmed and ready
   - Monitoring dashboards open
   - Team on standby
   - Communication prepared (users, stakeholders)

2. **Deploy with Monitoring**
   - Deploy fix
   - Monitor error rates, performance, logs
   - Watch for 15-30 minutes post-deployment
   - Be ready to rollback if needed

3. **Communication**
   - Notify stakeholders of deployment
   - Update status page
   - Confirm with affected users (if applicable)

### Output

Update `incident.md` with deployment info:

```markdown
## Deployment

**Deployed to Production**: [Date and Time]
**Deployed by**: [Name]

### Post-Deployment Monitoring (First 30 minutes)

- **[Time+5min]**: Error rates normal
- **[Time+10min]**: Performance metrics stable
- **[Time+15min]**: No new issues reported
- **[Time+30min]**: Fix confirmed working

### Resolution

**Status**: RESOLVED
**Resolved at**: [Date and Time]
**Total Duration**: [Time from detection to resolution]
```

### Transition

Move to LEARNING after successful deployment and initial monitoring period.

---

## Phase 6: LEARNING - Learning & Analysis

### Status Marker
`[LEARNING]`

### Purpose
Learn from the incident to prevent recurrence by understanding what led to the issue and what we can learn for the future.

### Rules

1. **Conduct Within 48 Hours**
   - Schedule post-mortem meeting within 2 days
   - Include all involved parties
   - Blameless culture: focus on systems, not people

2. **Document Learnings**
   - What went well?
   - What could be improved?
   - What should we do differently next time?

3. **Create Action Items**
   - Proper fix (if emergency fix was a workaround)
   - Process improvements
   - Monitoring/alerting enhancements
   - Documentation updates

### Output

Update `incident.md` with learning section:

```markdown
## Learning & Analysis

**Meeting Date**: [Date]
**Attendees**: [Names]

### Timeline (Complete)

[Full timeline from detection to resolution]

### What Led to This Issue?

**Root Cause**: [Detailed root cause explanation]

**Contributing Factors**:
1. [Factor 1 - e.g., "Missing validation in input handler"]
2. [Factor 2 - e.g., "Insufficient test coverage for edge cases"]
3. [Factor 3 - e.g., "Monitoring gap for this error type"]

**Why wasn't this caught earlier?**
[Explain why existing safeguards didn't prevent this]

### What Can We Learn?

**What Went Well**:
- [Thing 1 - e.g., "Fast detection and response time"]
- [Thing 2 - e.g., "Clear communication during incident"]

**What Could Be Improved**:
- [Area 1 - e.g., "Test coverage for edge cases"]
- [Area 2 - e.g., "Monitoring and alerting"]

**Key Insights**:
- [Insight 1 - e.g., "We need better input validation patterns"]
- [Insight 2 - e.g., "Staging environment doesn't reflect production data well"]

### Prevention Measures

**To prevent this specific issue**:
- [Specific measure 1]
- [Specific measure 2]

**To improve our system overall**:
- [Systemic improvement 1]
- [Systemic improvement 2]

### Action Items

- [ ] [Action 1] - Owner: [Name] - Due: [Date]
- [ ] [Action 2] - Owner: [Name] - Due: [Date]
- [ ] Create proper spec for permanent fix: [Spec link when created]

### Related

- **Feature Spec** (if permanent fix needed): [Link to /dev/features/yyyy-MM-dd_name/]
- **Monitoring**: [Links to relevant dashboards]
- **Documentation**: [Links to updated docs]
```

---

## Status Markers

- `[INCIDENT]` - Documenting the incident
- `[ASSESS]` - Assessing root cause and fix strategy
- `[FIX]` - Implementing the fix
- `[VERIFY]` - Verifying the fix works
- `[DEPLOY]` - Deploying to production
- `[LEARNING]` - Learning from the incident

---

## Hot-Fix Directory Structure

```
/dev/hotfixes/
  └── yyyy-MM-dd_[issue-description]/
      ├── incident.md          # Incident documentation (required)
      └── fix.md              # Fix documentation (required)
```

### Examples
- `/dev/hotfixes/2025-10-28_auth-token-expiry/`
- `/dev/hotfixes/2025-10-29_payment-gateway-timeout/`
- `/dev/hotfixes/2025-11-01_database-connection-leak/`

---

## Communication Protocol

### Every Response Must:
1. Start with status marker
2. Include current action
3. State next steps clearly
4. Flag any blockers immediately

### Example Good Response:

```
[FIX] Implementing emergency patch for authentication token expiry bug.

Current action:
- Modified TokenService.validate() to handle edge case
- Added defensive null check in AuthMiddleware
- Added unit test to verify fix

Testing:
- Unit tests passing
- Deploying to staging now for verification

Next: Moving to [VERIFY] phase once staging deployment completes.
```

---

## Relationship to Feature Development Workflow

**After the hot-fix:**
- If the emergency fix is a proper solution: Document in post-mortem and close
- If the emergency fix is a workaround: Create a feature spec for proper implementation
  - Action item: "Create spec at /dev/features/yyyy-MM-dd_proper-auth-token-handling/"
  - Follow full Feature Development workflow for permanent fix

**Technical Debt:**
- All shortcuts taken during hot-fix MUST be documented
- Create follow-up tasks in issue tracker
- Link hot-fix to follow-up work

---

## Best Practices

### DO:
- ✅ Act fast but document everything
- ✅ Focus on minimal, targeted fixes
- ✅ Get another pair of eyes on the fix
- ✅ Test rollback procedure before deploying
- ✅ Monitor intensively after deployment
- ✅ Conduct blameless learning session
- ✅ Create action items to prevent recurrence

### DON'T:
- ❌ Skip documentation "because it's urgent"
- ❌ Make unrelated changes "while I'm here"
- ❌ Deploy without testing rollback
- ❌ Blame individuals in learning session
- ❌ Skip learning session "because we're busy"
- ❌ Forget to create follow-up tasks for proper fixes

---

## Summary

This hot-fix workflow balances:
- **Speed**: Streamlined process for rapid response
- **Safety**: Verification and rollback planning
- **Documentation**: Capture learnings for improvement
- **Accountability**: Clear ownership and communication

Use this for emergencies only. For regular bugs, use the Feature Development workflow.