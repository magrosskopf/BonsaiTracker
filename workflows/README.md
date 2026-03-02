# Team Workflows for Claude Code

Centralized workflow definitions for consistent development with Claude Code across all team projects.

---
docker run --rm -it \
  -v "$PWD:/work" \
  -w /work \
  node:20-bullseye bash

npm install -g @openai/codex

codex --sandbox danger-full-access

## What's in This Repository

This repository contains three workflow definitions:

- **feature-development.md** - Complete 6-phase workflow for features, changes, and bug fixes
- **hot-fix.md** - Rapid response workflow for production emergencies
- **refactoring.md** - Test-driven code improvement workflow

These workflows ensure consistent, high-quality development across all team projects.

---

## How to Use in Your Project



### Step 2: Create Project Directories

```bash
# Create directories for development documentation
mkdir -p dev/features dev/hotfixes dev/refactorings

git add dev/
git commit -m "Add development documentation directories"
```

### Step 3: Create CLAUDE.md

Create a `CLAUDE.md` file in your project root. This is the first file Claude Code will read.

**Minimal CLAUDE.md template**:
```markdown
# Claude Code Instructions

## Workflow Selection (MANDATORY)

BEFORE starting work, read and follow: `/workflows/feature-development.md`, `/workflows/hot-fix.md`, or `/workflows/refactoring.md`

Decision tree:
- New feature/change/bug → feature-development.md
- Production emergency → hot-fix.md  
- Code improvement with tests → refactoring.md

## Critical Rules

1. EVERY response MUST start with status marker: `[STATUS_MARKER] Description`
2. Read COMPLETE workflow before starting
3. Follow all phases - no shortcuts

## Project Structure

- `/workflows/` - Team workflows (Git Submodule)
- `/dev/features/` - Feature specs
- `/dev/hotfixes/` - Hotfix docs
- `/dev/refactorings/` - Refactoring plans
```

For a complete CLAUDE.md template, see the `examples/` directory in this repo.

### Step 4: Commit and Push

```bash
git add CLAUDE.md
git commit -m "Add Claude Code instructions"
git push
```

---

## Team Member Onboarding

### When Cloning a Project with Workflows

**Option A: Clone with submodules (recommended)**
```bash
git clone --recurse-submodules https://github.com/team/your-project.git
```

**Option B: Clone, then initialize submodules**
```bash
git clone https://github.com/team/your-project.git
cd your-project
git submodule update --init --recursive
```

### Verify Setup

After cloning, verify the workflows are present:
```bash
ls workflows/
# Should show: README.md, feature-development.md, hot-fix.md, refactoring.md
```

---

## Understanding Git Submodules

### What Happens When You Add a Submodule?

When you run:
```bash
git submodule add https://github.com/team/workflows.git workflows
```

**Git does the following:**

1. **Clones the repository** into the `workflows/` directory
2. **Checks out the latest commit** from the default branch (usually `main`)
3. **Stores that specific commit hash** in your project
4. **Creates a `.gitmodules` file** with the submodule configuration

**Important**: Your project stores a **fixed commit hash**, not "always use latest".

### Example Timeline

**Day 1: You add the submodule**
```bash
# workflows repo is at commit abc123 (latest)
git submodule add https://github.com/team/workflows.git workflows

# Your project now stores: workflows @ abc123
git add .gitmodules workflows
git commit -m "Add workflows submodule"
```

**Day 2: Team improves workflows**
```bash
# Someone pushes new commits to workflows repo
# workflows repo is now at commit xyz789 (latest)
```

**Day 2: Your project is STILL at abc123**
```bash
cd workflows
git log --oneline -1
# abc123 Initial version

# Your project still uses the old version!
```

**Day 3: You update to the new version**
```bash
# Update to latest version
git submodule update --remote workflows
# Now at xyz789

# Save in main project
git add workflows
git commit -m "Update workflows to latest version"
```

### Why This Is Good

✅ **Projects remain stable** - No surprise workflow changes  
✅ **Each project can use its own workflow version**  
✅ **Updates are controlled and intentional**

### Visualization

**When adding:**
```
workflows-Repo (Azure DevOps):
    v1.0 → v1.1 → v2.0 (main)
                    ↑
                  abc123 (latest commit)

Your Project after 'git submodule add':
    workflows @ abc123 ✅ (points to v2.0)
```

**Later (new commits in workflows repo):**
```
workflows-Repo (Azure DevOps):
    v1.0 → v1.1 → v2.0 → v2.1 → v2.2 (main)
                  abc123      xyz789 (latest)

Your Project:
    workflows @ abc123 (still points to v2.0)
                ↑
           Stays here until you update!
```

**After update:**
```
git submodule update --remote workflows

Your Project:
    workflows @ xyz789 ✅ (now at v2.2)
```

---

## Updating Workflows in Your Project

### When Workflows Are Updated Centrally

When the team improves workflows in the central repository, your project doesn't automatically get these updates. You need to explicitly update.

**To get the latest workflow updates:**

```bash
# In your project directory
git submodule update --remote workflows

# This fetches the latest commit from the workflows repo
# and updates your local workflows/ directory

# Commit the update to your project
git add workflows
git commit -m "Update workflows to latest version"
git push
```

**What `git submodule update --remote` does:**
- Fetches latest commit from workflows repo (e.g., from `main` branch)
- Updates your local `workflows/` directory to that commit
- Your project now references the new commit

### Checking Current Workflow Version

```bash
cd workflows
git log --oneline -1
# Shows current commit your project is using

cd ..
```

### After Team Member Updates Workflows

When someone on your team updates the workflows in a project:

```bash
# You pull the project
git pull

# Git shows: workflows has new commits
git status
# modified:   workflows (new commits)

# Update your local workflows to match
git submodule update workflows
# Note: No --remote flag! This uses the version from the project

# Now your workflows match the project's version
```

**Difference between commands:**

| Command | What It Does |
|---------|-------------|
| `git submodule update workflows` | Sets workflows to commit **stored in your project** |
| `git submodule update --remote workflows` | Fetches **latest commit** from workflows repo |

**Use `update` (no --remote)** after `git pull` to sync with project  
**Use `update --remote`** when you want to get the newest workflows

### Pinning to Specific Workflow Version

If you want to use a specific version (not latest):

```bash
cd workflows
git checkout v2.0.0  # or specific commit hash
cd ..

git add workflows
git commit -m "Pin workflows to v2.0.0"
```

This is useful when:
- You want stability (don't want breaking changes)
- You're testing new workflows before team-wide adoption
- Your project requires a specific workflow version

---

## Project Structure Best Practices

### Recommended Structure

```
your-project/
├── workflows/                          # Team workflows (submodule)
├── dev/
│   ├── features/
│   │   └── 2025-11-12_user-auth/
│   │       ├── spec.md
│   │       └── implementation.md
│   ├── hotfixes/
│   │   └── 2025-11-12_login-bug/
│   │       ├── incident.md
│   │       └── fix.md
│   └── refactorings/
│       └── 2025-11-12_cleanup/
│           ├── analysis.md
│           └── plan.md
├── src/                               # Your application code
├── tests/                             # Your tests
├── CLAUDE.md                          # Claude Code instructions
└── README.md                          # Project README
```

### Directory Naming Convention

All dev/ subdirectories use the format: `yyyy-MM-dd_description`

Examples:
- `2025-11-12_user-authentication`
- `2025-11-12_payment-bug`
- `2025-11-12_refactor-validation`

---

## Working with Claude Code

### How Claude Code Uses Workflows

1. **Reads CLAUDE.md** in your project root
2. **Selects appropriate workflow** based on the task
3. **Reads complete workflow file** from `/workflows/`
4. **Follows workflow phases** strictly
5. **Creates documentation** in `/dev/` directories

### What You Need to Do

1. **Ensure workflows are up-to-date** in your project
2. **Review Claude's work** at each phase gate (REVIEW, PLAN-APPROVED, etc.)
3. **Approve phase transitions** explicitly when Claude requests it
4. **Check status markers** - Claude should use them in every response

---

## Customizing for Your Project

### Project-Specific Rules

While the core workflows are centralized, you can add project-specific rules in your `CLAUDE.md`:

```markdown
## Project-Specific Notes

### Technology Stack
- Language: TypeScript
- Framework: Next.js 14
- Database: PostgreSQL 15

### Testing Requirements
- Minimum coverage: 80%
- Must use Jest for unit tests
- Must use Playwright for E2E tests

### Code Conventions
- Follow Airbnb style guide
- Use absolute imports
- All components must have JSDoc comments
```

### DO NOT Modify Workflow Files

❌ **Don't** edit files in `/workflows/` - they are managed centrally  
✅ **Do** add project-specific notes to your `CLAUDE.md`

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Submodule appears empty after clone

**Symptoms:**
```bash
ls workflows/
# Empty directory or shows nothing
```

**Why this happens:**
When you clone a project with `git clone` (without `--recurse-submodules`), Git creates the submodule directory but doesn't populate it.

**Solution:**
```bash
git submodule update --init --recursive
```

**Prevention:**
Always clone with:
```bash
git clone --recurse-submodules https://github.com/team/your-project.git
```

---

#### Issue 2: "modified: workflows (new commits)" after git pull

**Symptoms:**
```bash
git pull
git status
# modified:   workflows (new commits)
```

**What this means:**
Someone on your team updated the workflows version in the project. Your local workflows/ directory is still at the old version.

**Solution:**
```bash
git submodule update workflows
# This updates to the version specified in the project
```

**Do NOT run `git submodule update --remote`** - that would get the latest from GitHub, not the version your project expects.

---

#### Issue 3: "modified: workflows (modified content)" in git status

**Symptoms:**
```bash
git status
# modified:   workflows (modified content)
```

**What this means:**
You (or someone) made changes inside the workflows/ directory, or workflows is pointing to a different commit than the project expects.

**Solutions:**

**Option A: You want to keep your changes (updating workflows for the project)**
```bash
cd workflows
git status  # See what changed
# If you made improvements to workflows
cd ..
git add workflows
git commit -m "Update workflows"
```

**Option B: You want to discard changes (go back to project version)**
```bash
git submodule update workflows
# Resets workflows to project's version
```

**Option C: Check what changed**
```bash
cd workflows
git diff  # See changes
git log --oneline -5  # See recent commits
```

---

#### Issue 4: "Permission denied" when accessing workflows

**Symptoms:**
```bash
git submodule update --init
# Permission denied (publickey)
```

**Why this happens:**
You don't have access to the workflows repository.

**Solution:**
1. Ensure you have read access to `https://github.com/team/workflows.git`
2. Check your SSH key is configured: `ssh -T git@github.com`
3. Contact team lead to grant you access

---

#### Issue 5: Submodule shows "detached HEAD"

**Symptoms:**
```bash
cd workflows
git branch
# * (HEAD detached at abc123)
```

**What this means:**
This is **NORMAL** for submodules! Submodules are always in "detached HEAD" state because they point to a specific commit, not a branch.

**You can safely ignore this.** It's not an error.

**If you want to work on workflows:**
```bash
cd workflows
git checkout main  # Switch to main branch
# Make changes
git add .
git commit -m "Improve workflows"
git push

cd ..
git add workflows
git commit -m "Update workflows to include my improvements"
```

---

#### Issue 6: "fatal: reference is not a tree" when updating submodule

**Symptoms:**
```bash
git submodule update workflows
# fatal: reference is not a tree: abc123
```

**Why this happens:**
The commit your project references (abc123) doesn't exist in your local workflows repository (maybe it was force-pushed or deleted).

**Solution:**
```bash
cd workflows
git fetch origin  # Fetch all commits from remote
cd ..
git submodule update workflows
```

**If that doesn't work:**
```bash
# Reset to latest version
git submodule update --remote workflows
git add workflows
git commit -m "Reset workflows to latest version"
```

---

#### Issue 7: Changes in workflows/ not showing in git diff

**Symptoms:**
```bash
# You changed files in workflows/
git diff
# Shows nothing or only shows submodule line
```

**Why this happens:**
Git only tracks the **commit hash** of submodules in the main project, not the file contents.

**To see changes:**
```bash
cd workflows
git diff  # See file changes
cd ..

# In main project
git diff workflows
# Shows commit hash change
```

---

#### Issue 8: Can't push because submodule is "dirty"

**Symptoms:**
```bash
git push
# error: contains modified content
```

**Why this happens:**
You have uncommitted changes in the workflows/ directory.

**Solution:**
```bash
cd workflows
git status  # See what's changed

# Either commit changes
git add .
git commit -m "Your changes"
cd ..
git add workflows

# Or discard changes
git reset --hard
cd ..
```

---

## Common Scenarios (Step-by-Step)

### Scenario 1: Starting Work on a New Project

**You're joining an existing project:**

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/team/project.git
cd project

# Verify workflows are present
ls workflows/
# Should show: README.md, feature-development.md, etc.

# You're ready to work!
```

**If you already cloned without --recurse-submodules:**
```bash
cd project
git submodule update --init --recursive
```

---

### Scenario 2: Team Updated Workflows, You Need to Sync

**Someone on your team updated workflows in the project:**

```bash
# Pull latest project changes
git pull

# Git shows workflows has changes
git status
# modified:   workflows (new commits)

# Update your local workflows to match
git submodule update workflows

# Now you're synced!
```

---

### Scenario 3: You Want to Use Latest Workflows

**You want to update your project to use the newest workflows:**

```bash
# Get latest workflows
git submodule update --remote workflows

# Check what changed
cd workflows
git log --oneline -5  # See recent commits
cd ..

# Commit the update to your project
git add workflows
git commit -m "Update workflows to latest version"
git push
```

**Your team members will then run:**
```bash
git pull
git submodule update workflows
```

---

### Scenario 4: You Want to Improve the Workflows

**You found a bug or want to improve a workflow:**

```bash
# Go into workflows
cd workflows

# Switch to main branch (submodules are in detached HEAD by default)
git checkout main

# Make your changes
vim feature-development.md
# ... make improvements ...

# Commit and push to workflows repo
git add .
git commit -m "Improve feature workflow clarity"
git push origin main

# Go back to project
cd ..

# Update project to use your improvements
git add workflows
git commit -m "Update to improved workflows"
git push
```

**Announce to team:**
"I've updated the workflows. Please run `git pull && git submodule update workflows`"

---

### Scenario 5: Workflows Broken, You Want to Rollback

**The latest workflows have a problem, you want to go back:**

```bash
# Go into workflows
cd workflows

# See recent commits
git log --oneline -10

# Go back to a good commit (e.g., 2 commits ago)
git checkout abc123  # Use actual commit hash

cd ..

# Save this version in project
git add workflows
git commit -m "Rollback workflows to stable version abc123"
git push
```

---

### Scenario 6: New Team Member Setup

**You're new and setting up your environment:**

```bash
# 1. Clone the project
git clone --recurse-submodules https://github.com/team/project.git
cd project

# 2. Verify workflows are there
ls workflows/

# 3. Read the instructions
cat CLAUDE.md

# 4. Start working with Claude Code
# Claude will automatically use the workflows in /workflows/
```

---

## Git Submodule Commands Quick Reference

### Daily Commands

```bash
# Clone project with submodules
git clone --recurse-submodules <url>

# Update submodules after git pull
git submodule update

# Get latest workflows from GitHub
git submodule update --remote workflows

# Initialize submodules (if not cloned with --recurse-submodules)
git submodule update --init --recursive
```

### Checking Status

```bash
# Check submodule status
git submodule status

# See which commit workflows points to
git ls-tree HEAD workflows

# See changes in workflows
cd workflows && git log --oneline -5 && cd ..
```

### Making Changes

```bash
# Update workflows in your project
git add workflows
git commit -m "Update workflows"

# Work on workflows themselves
cd workflows
git checkout main
# make changes
git push
cd ..
```

---

## Understanding Git Messages

### "modified: workflows (new commits)"

**Message:**
```
modified:   workflows (new commits)
```

**Meaning:** 
The commit that workflows points to in the project is different from your local workflows directory.

**Most common cause:** You did `git pull` and someone updated the workflows version.

**Solution:** `git submodule update workflows`

---

### "modified: workflows (modified content)"

**Message:**
```
modified:   workflows (modified content)
```

**Meaning:**
Files inside workflows/ have been changed, or workflows is at a different commit than expected.

**Solution:**
- Check: `cd workflows && git status`
- Reset: `git submodule update workflows`
- Or commit: `git add workflows && git commit`

---

### "HEAD detached at abc123" (inside workflows/)

**Message:**
```
* (HEAD detached at abc123)
```

**Meaning:**
This is **normal** for submodules. They always point to a specific commit, not a branch.

**Not an error!** Only matters if you want to make changes to workflows.

**To work on workflows:** `git checkout main`

---

## DO's and DON'Ts

### DO ✅

✅ **Clone with `--recurse-submodules`** to get everything at once
```bash
git clone --recurse-submodules <url>
```

✅ **Run `git submodule update` after `git pull`** if workflows changed
```bash
git pull
git submodule update workflows
```

✅ **Check what changed before updating**
```bash
cd workflows
git log --oneline -5
```

✅ **Commit submodule updates to your project**
```bash
git add workflows
git commit -m "Update workflows"
```

✅ **Communicate with team when you update workflows**
"Hey team, I updated workflows to v2.1. Please run `git pull && git submodule update workflows`"

---

### DON'T ❌

❌ **Don't edit files in workflows/ directly without committing them**
Either commit to workflows repo first, or discard changes.

❌ **Don't run `git submodule update --remote` after `git pull`**
Use `git submodule update` (without --remote) to sync with project version.

❌ **Don't panic when you see "detached HEAD" in workflows/**
This is normal for submodules.

❌ **Don't forget to run `git submodule update` after `git pull`**
Your workflows will be out of sync with the project.

❌ **Don't force push to workflows repository**
This breaks projects that reference old commits.

❌ **Don't delete .gitmodules file**
This file is essential for submodules to work.

---

## Mental Model for Submodules

Think of submodules like this:

### Your Project is Like a Recipe

```
Recipe (Your Project):
- 2 eggs (your src/ code)
- 1 cup flour (your tests/)
- Workflows v2.0 (specific version, frozen)
  ↑
  This doesn't automatically update when a new workflows version exists
```

### When You Want a New Workflows Version

```
You need to explicitly say:
"Update my recipe to use Workflows v2.1"

git submodule update --remote workflows
git commit -m "Use newer workflows"
```

### When Your Team Updates Workflows

```
Your teammate updates the recipe:
"I'm using Workflows v2.1 now"

You need to update your copy:
git pull  (gets the updated recipe)
git submodule update workflows  (gets the v2.1 workflows)
```

---

## Contributing to Workflows

### Improving Workflows

If you want to improve the workflows:

1. **Discuss with team** - Workflows affect everyone
2. **Create branch** in this (workflows) repository
3. **Make improvements** to workflow files
4. **Test** in a project first
5. **Create Pull Request**
6. **Get team approval**
7. **Merge** to main
8. **Announce** to team