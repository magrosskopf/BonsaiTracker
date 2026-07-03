# Grill With Docs Skill Fix

**Status**: REVIEW  
**Created**: 2026-07-03  
**Last Modified**: 2026-07-03

## Purpose/Goal

Repair the existing personal Codex skill `grill-with-docs` so it is structurally valid, discoverable in the UI, and clearly composes the already installed `grilling` and `domain-modeling` skills.

## Functional Requirements

1. Keep the existing skill name `grill-with-docs`.
2. Preserve the intended behavior: run a relentless plan/design grilling session while maintaining domain-modeling documentation such as glossary/context terms and ADRs.
3. Replace invalid `SKILL.md` frontmatter with valid skill metadata.
4. Add or regenerate `agents/openai.yaml` so the skill has UI metadata.
5. Use skill invocation language that matches Codex skill conventions, referring to `$grilling` and `$domain-modeling` instead of slash-command style references.
6. Validate the repaired skill with `quick_validate.py`.
7. Do not modify Bonsai Tracker application code.

## Technical Constraints

- Existing skill path: `${CODEX_HOME:-$HOME/.codex}/skills/grill-with-docs`.
- Frontmatter must not include `disable-model-invocation` because `quick_validate.py` rejects it.
- Frontmatter should contain only supported keys; prefer `name` and `description`.
- `agents/openai.yaml` should follow the system `skill-creator` `openai_yaml.md` guidance.
- Writing to the personal Codex skills directory may require escalated approval.
- Do not modify the central `workflows/` directory.

## Acceptance Criteria

- [ ] `${CODEX_HOME:-$HOME/.codex}/skills/grill-with-docs/SKILL.md` exists.
- [ ] `SKILL.md` frontmatter uses `name: grill-with-docs`.
- [ ] `SKILL.md` frontmatter has no unsupported `disable-model-invocation` key.
- [ ] `SKILL.md` description clearly triggers when the user wants both grilling and docs.
- [ ] `SKILL.md` body explicitly composes `$grilling` and `$domain-modeling`.
- [ ] `agents/openai.yaml` exists with suitable `display_name`, `short_description`, and `default_prompt`.
- [ ] `quick_validate.py` passes for `/Users/maius/.codex/skills/grill-with-docs`.
- [ ] Bonsai Tracker application code remains unchanged.

## Out-of-Scope

- Rewriting the installed `grilling` or `domain-modeling` skills.
- Creating or editing project `CONTEXT.md`, `CONTEXT-MAP.md`, or ADR files.
- Changing app behavior, tests, schemas, or build configuration.
- Forward-testing with subagents unless explicitly requested.

## Dependencies

- Existing skill: `/Users/maius/.codex/skills/grilling`.
- Existing skill: `/Users/maius/.codex/skills/domain-modeling`.
- System validator: `/Users/maius/.codex/skills/.system/skill-creator/scripts/quick_validate.py`.
- Optional metadata generator: `/Users/maius/.codex/skills/.system/skill-creator/scripts/generate_openai_yaml.py`.

## Open Questions

- None. The observed validation failure and missing metadata define the repair scope.
