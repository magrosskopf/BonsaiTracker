# Domain Modeling Skill

**Status**: IMPLEMENTED  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Purpose/Goal

Install the external Codex skill `domain-modeling` from `mattpocock/skills` so Codex can help build and sharpen a project's domain model, maintain a glossary/ubiquitous language, and record architectural decisions only when they are genuinely worth preserving.

## Functional Requirements

1. Install the skill from `https://github.com/mattpocock/skills/tree/main/skills/engineering/domain-modeling`.
2. Preserve the upstream skill contents, including `SKILL.md`, `ADR-FORMAT.md`, and `CONTEXT-FORMAT.md`.
3. Install the skill into the personal Codex skills directory so Codex can discover it automatically.
4. Do not modify the Bonsai Tracker application code.
5. Validate the installed skill structure after installation.
6. Document the workflow artifacts for this installation under `dev/features/2026-07-03_domain-modeling-skill/`.

## Technical Constraints

- Use the `skill-installer` process for GitHub-sourced skills.
- Source repository: `mattpocock/skills`.
- Source path: `skills/engineering/domain-modeling`.
- Default destination: `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling`.
- Network access and writing outside the project directory require explicit command approval.
- Do not alter the upstream skill content unless installation validation requires a compatibility fix.
- Do not modify the central `workflows/` directory.

## Acceptance Criteria

- [ ] `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/SKILL.md` exists.
- [ ] `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/ADR-FORMAT.md` exists.
- [ ] `${CODEX_HOME:-$HOME/.codex}/skills/domain-modeling/CONTEXT-FORMAT.md` exists.
- [ ] The installed `SKILL.md` uses `name: domain-modeling`.
- [ ] The installed skill passes `quick_validate.py`.
- [ ] Bonsai Tracker application code is unchanged.
- [ ] The user is told to restart Codex to pick up the new skill.

## Out-of-Scope

- Using the domain-modeling skill to create or update `CONTEXT.md`, `CONTEXT-MAP.md`, or ADRs in this repository.
- Editing the upstream skill instructions for style or preference.
- Publishing or committing the installed personal skill.
- Changing application behavior, tests, schemas, or build configuration.

## Dependencies

- System `skill-installer` at `/Users/maius/.codex/skills/.system/skill-installer`.
- System `skill-creator` validator at `/Users/maius/.codex/skills/.system/skill-creator/scripts/quick_validate.py`.
- GitHub access to `mattpocock/skills`.

## Open Questions

- None. The requested GitHub URL identifies the skill and the standard Codex skill directory is the expected destination.
