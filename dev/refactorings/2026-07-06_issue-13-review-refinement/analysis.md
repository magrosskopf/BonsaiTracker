Status: COMPLETE

Last Modified: 2026-07-06

# Analysis

## Scope

- `lib/bonsai-display.ts`
- `lib/posts.ts`
- `pages/feed.tsx`
- `pages/profile/[id].tsx`
- `tests/posts.test.ts`

## What needs improvement

- `lib/bonsai-display.ts` introduces a new exported wrapper that only forwards to an existing private normalizer, which adds an extra layer without adding behavior.
- `lib/posts.ts` builds post metadata as an array of segments even though the only consumers immediately join it into a display string.
- The two page consumers repeat the `" · "` join detail instead of consuming a single presentation-ready helper result.

## Why it needs improvement

- These helpers sit on the display path for community posts, so small inconsistencies in helper shape create avoidable noise in multiple UI files.
- A direct formatter-style API is easier to scan and aligns better with the existing `formatBonsaiDisplayText` and `formatBonsaiDate` helpers.

## Pain points

- A reader has to jump through `normalizeDisplayValue` and `normalizeBonsaiDisplayText` to understand one normalization rule.
- `buildPostSnapshotMeta(...).join(" · ")` splits one presentation concern across helper and caller.
- The feed and profile pages both embed the separator detail even though the content assembly is already centralized.

## Current metrics

- Complexity:
  - `lib/bonsai-display.ts`: low
  - `lib/posts.ts`: low
- Duplication:
  - One redundant pass-through export in `lib/bonsai-display.ts`
  - Repeated segment joining in the feed and profile pages
- Test coverage:
  - `tests/posts.test.ts` covers the post helper behavior introduced on this branch.
  - `tests/bonsai-display.test.ts` covers the shared display/date helpers used by the post helper.

## Test coverage verification

- `lib/bonsai-display.ts`
  - Tests: `tests/bonsai-display.test.ts`
  - Coverage assessment: sufficient for the exported normalization/date behavior used by this refactoring.
- `lib/posts.ts`
  - Tests: `tests/posts.test.ts`
  - Coverage assessment: sufficient for the branch-specific snapshot metadata behavior, including `snapshotSpecies = "Unbekannt"`.
- `pages/feed.tsx`, `pages/profile/[id].tsx`
  - Tests: no direct page tests identified
  - Decision: keep the page edits mechanical and limited to consuming the refactored helper API.

## Success criteria

- Shared helper APIs describe their purpose directly and avoid redundant abstraction layers.
- Post snapshot metadata is exposed as one presentation-ready string.
- Feed and profile pages no longer duplicate the segment-joining detail.
- Test output, rendered text, and branch behavior remain unchanged.
- `npm test`, `npm run typecheck`, and `npm run build` pass after the refactoring.

## Outcome

- The display normalizer is now exported directly under its domain name instead of through a pass-through wrapper.
- Post snapshot metadata is formatted in one helper, making page consumers simpler and more consistent with the rest of the display helpers.
- Existing helper tests continue to document the same unknown-species behavior and formatted post date output.
