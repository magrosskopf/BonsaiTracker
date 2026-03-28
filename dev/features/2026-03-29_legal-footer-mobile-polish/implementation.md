# Implementation Plan: Legal Footer Mobile Polish

## Status

COMPLETE

## Overview

Polish the legal footer so it adapts to context. On public pages it can remain fuller, but on authenticated in-app screens with the bottom dock visible it should collapse into a much subtler fine-print link row.

## Reference

- Spec: [spec.md](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-29_legal-footer-mobile-polish/spec.md)
- Key acceptance criteria:
  - app screens no longer show a second prominent bar above the dock
  - legal actions remain accessible in a subtle presentation
  - destinations and behavior remain unchanged

## Files to Modify

- [components/LegalFooter.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/LegalFooter.tsx)
- [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css)

## Technical Decisions

1. Add a context-aware compact variant for app screens with visible bottom navigation.
   Reason: the main problem is not only spacing, but that the footer is too prominent next to the dock.

2. Keep the existing fuller treatment for public pages.
   Reason: the footer is more appropriate there because it does not compete with app navigation.

3. Use simple text links in compact mode instead of panel-like pills.
   Reason: the user explicitly wants this area to be very subtle.

## Implementation Steps

1. Detect whether the app bottom navigation is visible in [components/LegalFooter.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/LegalFooter.tsx).
2. Render a compact footer variant for in-app screens and keep the fuller footer for public routes.
3. Adjust styles in [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css) so the compact variant reads as fine print rather than a second bar.
4. Verify with project checks that the presentation-only change does not break the app build.

## Test Strategy

1. Run `npm run typecheck`.
2. Run `npm run build`.

## Edge Cases and Error Handling

1. Long link labels must still wrap cleanly on very narrow devices.
2. The cookie-settings button must keep the same click behavior.

## Validation Checklist

- legal footer on app pages is visually subdued above the dock
- routes and button behavior remain unchanged
- typecheck passes
- build passes
