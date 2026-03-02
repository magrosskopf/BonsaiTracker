# Implementation Plan: Next.js Security Update

**Status**: COMPLETE  
**Created**: 2026-03-02  
**Last Modified**: 2026-03-02

## Overview

Update the project from the lockfile-resolved `next@15.3.3` to a patched 15.3.x release and pin framework dependencies to deterministic versions.

## Reference

- Spec: `/work/dev/features/2026-03-02_nextjs-security-update/spec.md`
- Key acceptance criteria:
  - Pin `next` to a patched version
  - Align `package-lock.json`
  - Verify with a production build

## File Structure

- Modify `/work/package.json`
- Modify `/work/package-lock.json`
- Create `/work/dev/features/2026-03-02_nextjs-security-update/spec.md`
- Create `/work/dev/features/2026-03-02_nextjs-security-update/implementation.md`

## Implementation Steps

1. Inspect the currently resolved versions in `package-lock.json`.
2. Replace `latest` for `next`, `react`, and `react-dom` with explicit versions.
3. Refresh the lockfile so `next` resolves to the patched release.
4. Run the production build to verify the deployment blocker is removed locally.

## Code Architecture

No runtime code changes. The update only affects package resolution for the existing Next.js Pages Router application.

## Technical Decisions

1. Stay on Next.js 15 and apply the smallest available patched version in the same release line.
2. Pin `react` and `react-dom` to the already installed compatible versions to remove nondeterminism from `latest`.

## Integration Points

1. Vercel build uses `package-lock.json`; both manifest and lockfile must agree.
2. Next.js build compatibility depends on the current React 19 versions already in use.

## Test Strategy

1. Run `npm run build`.

## Edge Cases & Error Handling

1. If the patched version changes peer dependency requirements, re-resolve with the existing React 19 line.
2. If the build fails for unrelated pre-existing issues, report them separately from the security update.

## Validation Checklist

- `package.json` no longer uses `latest` for framework packages
- `package-lock.json` resolves patched `next`
- Production build passes
