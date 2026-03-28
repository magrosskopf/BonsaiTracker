# Spec: Mobile Navigation Dock Polish

## Status

IMPLEMENTED

## Purpose/Goal

Improve the in-app bottom navigation on mobile so it no longer feels like a heavy full-width bar. The dock should feel lighter, remain readable on narrow screens, and respect device safe areas without changing the app's navigation structure.

## Current Situation

1. The authenticated navigation in [components/Navigation.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx) currently renders as a generic dock bar.
2. On narrow screens, the dock reads as a thick edge-to-edge bar and does not provide a strong active-state treatment.
3. The app shell in [pages/_app.tsx](/Users/maius/Projekte/Bonsai-Tracker/pages/_app.tsx) already reserves bottom space, but the dock styling itself is not tuned for a more intentional mobile presentation.

## Functional Requirements

1. The authenticated bottom navigation must remain available on the same in-app routes as before.
2. On mobile, the navigation should render as a more compact floating dock instead of a visually heavy full-width bar.
3. Each navigation item must remain readable on narrow screens without horizontal overflow.
4. The currently active route must have a clearer visual state than inactive items.
5. The dock must respect bottom safe-area insets so it does not sit flush against device UI chrome.

## Technical Constraints

1. No new navigation routes, labels, or product structure changes are part of this work.
2. No additional UI libraries or icon packages may be introduced.
3. Existing hidden-route behavior for `/` and `/waitlist` must remain intact.
4. The solution must fit the existing Tailwind plus global CSS approach already used in the app.

## Acceptance Criteria

1. Authenticated in-app pages show a floating rounded dock on mobile instead of a full-width bar.
2. Navigation labels remain legible on narrow screens without horizontal scrolling.
3. The active item is visibly highlighted compared with inactive items.
4. The dock remains hidden on `/` and `/waitlist`.
5. The app keeps enough bottom spacing so docked content is not obscured.

## Out-of-Scope

1. Adding icons, badges, or a new information architecture for navigation.
2. Changing desktop page structure outside the dock styling itself.
3. Reworking footer or cookie-banner behavior.
