# To Issues Skill

**Status**: IMPLEMENTED  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Purpose/Goal

Install the external Codex skill `to-issues` from `mattpocock/skills` so Codex can break a plan, spec, PRD, or issue into independently grabbable vertical-slice issues for a project issue tracker.

## Functional Requirements

1. Install the skill from `https://github.com/mattpocock/skills/tree/main/skills/engineering/to-issues`.
2. Preserve the upstream behavior: gather context, optionally inspect the codebase, draft tracer-bullet vertical slices, quiz the user on granularity/dependencies, and publish approved issues.
3. Install the skill into the personal Codex skills directory so Codex can discover it automatically.
4. Apply the minimal compatibility fix needed if upstream frontmatter does not pass local skill validation.
5. Validate the installed skill structure after installation.
6. Do not modify Bonsai Tracker application code.
7. Document workflow artifacts under `dev/features/2026-07-03_to-issues-skill/`.

## Technical Constraints

- Use the `skill-installer` process for GitHub-sourced skills.
- Source repository: `mattpocock/skills`.
- Source path: `skills/engineering/to-issues`.
- Default destination: `${CODEX_HOME:-$HOME/.codex}/skills/to-issues`.
- Upstream currently includes `disable-model-invocation: true`; local validation rejects this key, so remove it after installation if present.
- Network access and writing outside the project directory require command approval.
- Do not modify the central `workflows/` directory.

## Acceptance Criteria

- [ ] `${CODEX_HOME:-$HOME/.codex}/skills/to-issues/SKILL.md` exists.
- [ ] The installed `SKILL.md` uses `name: to-issues`.
- [ ] The installed `SKILL.md` has no unsupported `disable-model-invocation` key.
- [ ] The installed skill passes `quick_validate.py`.
- [ ] Bonsai Tracker application code is unchanged.
- [ ] The user is told to restart Codex to pick up the new skill.

## Out-of-Scope

- Publishing any real issues to an issue tracker.
- Configuring issue tracker credentials or labels.
- Rewriting the upstream skill beyond the minimal validation compatibility fix.
- Changing application behavior, tests, schemas, or build configuration.

## Dependencies

- System `skill-installer` at `/Users/maius/.codex/skills/.system/skill-installer`.
- System validator at `/Users/maius/.codex/skills/.system/skill-creator/scripts/quick_validate.py`.
- GitHub access to `mattpocock/skills`.

## Open Questions

- None. The requested GitHub URL identifies the skill and the validation incompatibility is known.
