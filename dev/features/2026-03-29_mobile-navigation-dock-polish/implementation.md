# Implementation Plan: Mobile Navigation Dock Polish

## Status

COMPLETE

## Overview

Polish the authenticated bottom navigation for mobile by replacing the generic heavy-looking dock treatment with a lighter floating component that has better spacing, stronger active-state feedback, and safe-area-aware positioning.

## Reference

- Spec: [spec.md](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-29_mobile-navigation-dock-polish/spec.md)
- Key acceptance criteria:
  - floating rounded mobile dock
  - readable labels on narrow screens
  - clearer active state
  - hidden-route behavior unchanged
  - bottom spacing remains sufficient

## File Structure

## Files to Modify

- [components/Navigation.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx)
- [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css)

## Files to Create

- [tests/navigation.test.ts](/Users/maius/Projekte/Bonsai-Tracker/tests/navigation.test.ts)

## Code Architecture

Keep the navigation component simple, but extract tiny pure helpers so behavior can be verified without rendering React:

- a helper for route/status-based visibility
- a helper for active/inactive item class names

The dock layout and appearance are handled in global CSS because the component is shared app-wide and already depends on shared shell spacing and theme variables.

## Technical Decisions

1. Replace the DaisyUI-style generic dock treatment with project-specific `bonsai-dock` classes.
   Reason: the visual problem is mainly presentation, and bespoke styles give tighter control over mobile spacing and shape.

2. Keep labels text-only.
   Reason: the request is polish, not a navigation redesign.

3. Increase shell bottom padding slightly and make the dock safe-area-aware.
   Reason: a floating dock needs a little more breathing room to avoid obscuring page content on mobile.

## Implementation Steps

1. Extract small navigation helpers in [components/Navigation.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx).
2. Replace the current dock/item class usage with app-specific class names.
3. Add floating dock, item, and active-state styles in [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css).
4. Add focused tests for helper behavior in [tests/navigation.test.ts](/Users/maius/Projekte/Bonsai-Tracker/tests/navigation.test.ts).

## Test Strategy

1. Verify helper behavior with `tsx --test`.
2. Run `npm test`.
3. Run `npm run typecheck`.

## Edge Cases and Error Handling

1. Unauthenticated or loading session state must still suppress the dock.
2. Hidden public routes must still suppress the dock even when a session exists.
3. Narrow screens must not cause labels to overflow horizontally.

## Validation Checklist

- mobile dock is floating and rounded
- active item is more obvious
- labels remain readable on narrow screens
- `/` and `/waitlist` still hide navigation
- tests and typecheck pass
