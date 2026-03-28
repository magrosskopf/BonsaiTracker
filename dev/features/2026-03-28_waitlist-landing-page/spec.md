# Spec: Public Waitlist Landing Page

## Status

IMPLEMENTED

## Purpose/Goal

Provide a dedicated public landing page that can already be shared before the app is broadly available, so interested users can leave their email address and be informed when Bonsai Tracker launches.

## Current Situation

1. The existing homepage at [`pages/index.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/index.tsx) mixes beta login and waitlist access in one screen.
2. The current page is functional for existing closed-beta users, but it is not an intentionally shareable pre-launch landing page.
3. The waitlist backend already exists via [`pages/api/access-requests.ts`](/Users/maius/Projekte/Bonsai-Tracker/pages/api/access-requests.ts).
4. There is no dedicated public page with launch-focused messaging, a clear waitlist CTA, or a distinct shareable URL.

## Product Decision

Add a dedicated public landing page under a separate route, recommended as `/waitlist`, while keeping the current `/` page focused on login and beta access.

Implications:
1. Existing closed-beta login behavior on `/` remains intact.
2. The shareable launch/waitlist page gets its own messaging, layout, and CTA without forcing beta users through marketing copy.
3. The new page reuses the existing access-request backend instead of introducing a second lead-capture flow.

## Functional Requirements

1. The application must expose a public landing page on a dedicated route intended for sharing before launch.
2. The landing page must explain in clear product language what Bonsai Tracker is and why someone should join the waitlist.
3. The landing page must provide one primary CTA for joining the waitlist via email.
4. The waitlist form on the landing page must submit to the existing access-request flow and show success and error states inline.
5. The landing page must be accessible without authentication.
6. The current `/` route must continue to support existing beta login and beta waitlist behavior without regression.
7. The landing page must include a clear reference for users who already have beta access, for example a link back to login.
8. The layout must work on both mobile and desktop and feel intentionally designed rather than like a reused auth form.
9. The page must use the existing product stack and project conventions without introducing a CMS or external form service.

## Technical Constraints

1. The project uses Next.js Pages Router, TypeScript, Tailwind, and DaisyUI.
2. The implementation should reuse the existing `/api/access-requests` endpoint and not introduce a second waitlist table or alternative lead store.
3. The new landing page must remain public and must not depend on NextAuth session state for basic rendering.
4. The existing `/` page must remain functional for login and current beta access flows.
5. `workflows/` must not be changed.

## Acceptance Criteria

1. A new public route exists for the pre-launch waitlist landing page.
2. The new page contains launch-focused hero copy, a waitlist form, and a clear CTA.
3. Submitting the form successfully stores or updates the request through the existing backend and shows a success message.
4. Backend validation and rate limiting errors are surfaced as understandable inline error states.
5. The page links users with existing access back to the login flow.
6. The current homepage login flow still works as before.
7. The new page renders responsively on mobile and desktop.

## Out-of-Scope

1. Replacing the current homepage login flow.
2. Building an email campaign system or automated launch mailer.
3. Adding a CMS or editable marketing backend.
4. Introducing a new waitlist backend separate from `access-requests`.

## Review Checklist

1. The feature has a dedicated public route instead of overloading `/`.
2. The existing waitlist backend is reused.
3. The current beta login flow remains untouched.
4. The acceptance criteria are testable and concrete.
