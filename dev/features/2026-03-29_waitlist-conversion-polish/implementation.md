# Implementation Plan: Waitlist Conversion Polish

## Status

COMPLETE

## Overview

Refine the existing `/waitlist` landing page so it converts better when shared and visited cold. The implementation will tighten the copy, strengthen the above-the-fold CTA structure, add clearer expectation-setting sections, and ship a dedicated static social preview image referenced by Open Graph and Twitter metadata.

## Reference

- Spec: [spec.md](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-29_waitlist-conversion-polish/spec.md)
- Key acceptance criteria:
  - copy is more conversion-oriented
  - one dominant waitlist CTA is clear above the fold
  - supporting sections explain value and what happens after signup
  - Open Graph and Twitter metadata exist
  - a dedicated preview asset is stored in the repo and referenced by metadata

## File Structure

## Files to Create

- [public/waitlist-preview.svg](/Users/maius/Projekte/Bonsai-Tracker/public/waitlist-preview.svg)

## Files to Modify

- [pages/waitlist.tsx](/Users/maius/Projekte/Bonsai-Tracker/pages/waitlist.tsx)
- [components/WaitlistRequestForm.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/WaitlistRequestForm.tsx)
- [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css)
- [.env.example](/Users/maius/Projekte/Bonsai-Tracker/.env.example)
- [tests/waitlist-page.test.ts](/Users/maius/Projekte/Bonsai-Tracker/tests/waitlist-page.test.ts)

## Code Architecture

### Content model inside `pages/waitlist.tsx`

Keep the waitlist page self-contained, but make its copy structure more explicit through exported constants for:
- headline
- subheadline
- CTA label and supporting trust copy
- value bullets
- “what happens next” expectations

This preserves the current lightweight architecture and keeps the new messaging testable without introducing a content system.

### Metadata strategy

Add a small helper layer inside `pages/waitlist.tsx` for:
- canonical waitlist URL
- preview image URL
- Open Graph tags
- Twitter card tags

The implementation should use a configurable public app URL from environment, with a localhost fallback for development.

Suggested constant:

```ts
const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
```

The preview image path should be a stable static asset under `public/`.

### Preview asset

Create a repo-owned SVG preview image sized for sharing, matching the current visual language:
- product name
- short waitlist message
- warm bonsai-inspired background shapes
- no dependency on uploaded media or runtime generation

SVG is preferred because it is deterministic, easy to version, and does not require adding image tooling.

## Technical Decisions

1. Use a static SVG social preview asset in `public/`.
   Reason: no image generation infrastructure exists, and a repo-owned SVG is easy to maintain and deploy.

2. Add `NEXT_PUBLIC_APP_URL` to `.env.example`.
   Reason: metadata should resolve to absolute URLs in production, not rely on relative paths.

3. Keep the waitlist form backend unchanged.
   Reason: conversion polish should not alter submission storage or validation behavior.

4. Extend the shared form only minimally.
   Reason: the current component already handles submission well; only presentation-level hooks should be added if needed.

5. Keep the page in the existing visual system.
   Reason: the landing page should feel like Bonsai Tracker, not a disconnected marketing microsite.

## Integration Points

1. [pages/waitlist.tsx](/Users/maius/Projekte/Bonsai-Tracker/pages/waitlist.tsx)
   Main copy, structure, and metadata changes live here.

2. [components/WaitlistRequestForm.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/WaitlistRequestForm.tsx)
   May receive small display enhancements such as supporting trust copy or a tighter CTA hierarchy, while keeping request behavior unchanged.

3. [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css)
   Add or tune only the classes needed for stronger section hierarchy and visual emphasis.

4. [.env.example](/Users/maius/Projekte/Bonsai-Tracker/.env.example)
   Document `NEXT_PUBLIC_APP_URL` for absolute share metadata.

5. [tests/waitlist-page.test.ts](/Users/maius/Projekte/Bonsai-Tracker/tests/waitlist-page.test.ts)
   Update assertions for the exported copy and metadata constants.

## Implementation Steps

1. Refine the content model for the waitlist page.
   Replace the current generic launch copy with stronger promise-oriented copy and clearer expectation-setting sections.

2. Strengthen the above-the-fold CTA area.
   Ensure the hero makes the signup benefit and next step obvious immediately, with one dominant CTA and supporting trust text.

3. Add a “what happens next” or equivalent reassurance section.
   Make it explicit what signing up means and what users should expect after submitting their email.

4. Add absolute social metadata.
   Extend `<Head>` with canonical URL, Open Graph title/description/image, and Twitter card tags, all built from a stable public base URL.

5. Create the static preview asset.
   Add `public/waitlist-preview.svg` and reference it from the metadata constants.

6. Update tests and environment documentation.
   Extend the waitlist test file to cover the new exported copy and metadata constants, and document the required env variable in `.env.example`.

## Test Strategy

The project still uses lightweight Node tests. The best return here is to keep exported waitlist constants testable and verify build/typecheck for the metadata wiring.

Planned verification:

1. Extend [tests/waitlist-page.test.ts](/Users/maius/Projekte/Bonsai-Tracker/tests/waitlist-page.test.ts) to assert:
   - updated key copy constants
   - preview image path
   - title/description constants
   - metadata helper output if exported
2. Manually verify in the rendered page:
   - stronger CTA hierarchy
   - responsive layout still intact
   - preview asset reachable at `/waitlist-preview.svg`
3. Run:
   - `npm test`
   - `npm run typecheck`
   - `npm run build`

## Edge Cases and Error Handling

1. Missing `NEXT_PUBLIC_APP_URL`
   Metadata must still render using a localhost fallback in development.

2. Social preview path changes
   The image path should be defined once as an exported constant to avoid drift between metadata tags and tests.

3. Long copy on mobile
   Revised text must not break the hero or CTA layout on narrow screens.

4. Existing waitlist behavior
   Copy and presentation changes must not alter the current success/error behavior of form submission.

## Validation Checklist

- `/waitlist` copy is clearly more conversion-oriented
- one dominant CTA is obvious above the fold
- supporting sections explain audience, value, and next steps
- Open Graph tags are present
- Twitter card tags are present
- preview asset exists in `public/`
- metadata references the preview asset via absolute URL
- waitlist submission flow still uses `/api/access-requests`
- `NEXT_PUBLIC_APP_URL` is documented in `.env.example`
- `npm test` passes
- `npm run typecheck` passes
- `npm run build` passes
