# Spec: Legal Footer Mobile Polish

## Status

IMPLEMENTED

## Purpose/Goal

Improve the mobile presentation of the legal footer bar so it does not compete visually with the app navigation. The legal links should remain accessible, but on in-app screens they should render as a very subtle fine-print row instead of a second prominent bar above the navigation dock.

## Current Situation

1. The legal footer in [components/LegalFooter.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/LegalFooter.tsx) is rendered globally across the app.
2. On authenticated in-app screens, it appears directly above the fixed bottom navigation.
3. In that position, a panel-like footer reads like a second navigation bar and feels unnecessarily prominent.

## Functional Requirements

1. The legal footer must still expose links to Impressum, Datenschutz, and cookie settings.
2. On screens where the in-app bottom navigation is visible, the legal area must render much more subtly than the main navigation.
3. The links for Impressum, Datenschutz, and cookie settings must remain accessible.
4. The fuller explanatory footer may remain on public pages where no app navigation dock is shown.

## Technical Constraints

1. No route changes or new legal content are part of this work.
2. No new libraries or client-side logic are needed.
3. The solution should stay within the existing Tailwind and global CSS styling approach.

## Acceptance Criteria

1. On authenticated in-app screens, the legal footer no longer appears as a second prominent bar above the mobile navigation.
2. Impressum, Datenschutz, and cookie settings remain accessible in a clearly readable but subtle presentation.
3. Public pages remain responsive and visually consistent.

## Out-of-Scope

1. Rewriting legal copy or changing destinations.
2. Adding icons or new footer actions.
