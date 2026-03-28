# Implementation Plan: Public Waitlist Landing Page

## Status

COMPLETE

## Overview

Implement a dedicated public waitlist landing page at `/waitlist` that can be shared before launch, while leaving the current `/` route focused on beta login and existing access. The implementation reuses the current access-request backend and adds a purpose-built marketing-style page with a responsive layout, inline form feedback, and a clear path back to login for users who already have access.

## Reference

- Spec: [spec.md](/Users/maius/Projekte/Bonsai-Tracker/dev/features/2026-03-28_waitlist-landing-page/spec.md)
- Key acceptance criteria:
  - Dedicated public route exists
  - Launch-focused hero copy and waitlist CTA exist
  - Existing `/api/access-requests` flow is reused
  - Success and error states render inline
  - Existing login flow on `/` remains intact
  - Page works on mobile and desktop

## File Structure

## Files to Create

- [pages/waitlist.tsx](/Users/maius/Projekte/Bonsai-Tracker/pages/waitlist.tsx)
- [components/WaitlistRequestForm.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/WaitlistRequestForm.tsx)
- [tests/waitlist-page.test.ts](/Users/maius/Projekte/Bonsai-Tracker/tests/waitlist-page.test.ts)

## Files to Modify

- [pages/index.tsx](/Users/maius/Projekte/Bonsai-Tracker/pages/index.tsx)
- [components/Navigation.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx)
- [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css)

## Code Architecture

### Waitlist form reuse

Extract the current waitlist request client logic from `/` into a shared `WaitlistRequestForm` component so both pages use the same submission flow, loading state, and inline success/error handling.

Responsibilities:
- Manage email input, submit state, success state, and inline error rendering
- Submit to `/api/access-requests`
- Support small copy variations through props without changing backend behavior

Suggested component contract:

```ts
type WaitlistRequestFormProps = {
  title: string;
  description?: string;
  submitLabel?: string;
  successFallbackMessage?: string;
  variant?: "embedded" | "feature";
};
```

### Public landing page

`pages/waitlist.tsx` will be a public marketing page composed from:
- a hero section with stronger launch messaging
- a primary waitlist signup card using `WaitlistRequestForm`
- secondary trust/value sections that explain what users will get
- a link for existing beta users back to `/`

The page should use the existing visual language but be more intentional than the current auth screen, with a dedicated section structure, spacing rhythm, and supporting background treatment.

### Navigation behavior

The authenticated bottom dock currently hides only on `/`. It should also stay hidden on `/waitlist` so authenticated internal users do not get the app navigation over the public landing page.

## Technical Decisions

1. Reuse the existing `/api/access-requests` endpoint exactly as-is.
   Reason: the spec explicitly forbids a second lead capture backend and the current endpoint already handles validation, normalization, upsert, and rate limiting.

2. Extract the waitlist client logic into a component instead of duplicating it in two pages.
   Reason: this keeps success/error behavior consistent between `/` and `/waitlist`, and avoids drift when copy or error handling changes later.

3. Keep `/` as the login-first page and only reduce duplication there.
   Reason: the approved spec keeps the beta login flow intact.

4. Hide the authenticated dock on `/waitlist`.
   Reason: `/waitlist` is a public marketing surface, not an in-app screen.

5. Add basic page metadata in the landing page via `next/head`.
   Reason: a shareable URL should at least have a clear title and description, even without a custom social image.

## Integration Points

1. [pages/api/access-requests.ts](/Users/maius/Projekte/Bonsai-Tracker/pages/api/access-requests.ts)
   The new page must submit to this endpoint and preserve current success/error semantics.

2. [pages/index.tsx](/Users/maius/Projekte/Bonsai-Tracker/pages/index.tsx)
   Replace the inline waitlist form implementation with the shared component, while leaving the login flow and beta copy intact.

3. [components/Navigation.tsx](/Users/maius/Projekte/Bonsai-Tracker/components/Navigation.tsx)
   Extend the route guard so the dock remains hidden on the new public landing page.

4. [styles/globals.css](/Users/maius/Projekte/Bonsai-Tracker/styles/globals.css)
   Add only the minimal extra utility classes needed for the new landing page sections and visual treatment.

## Implementation Steps

1. Create the shared waitlist form component.
   Move the current client-side request logic out of `pages/index.tsx`, keep the same backend contract, and expose lightweight props for headings and button text.

2. Refactor the homepage to use the shared form.
   Preserve the current beta login behavior and copy structure, but replace the duplicated waitlist submission logic with `WaitlistRequestForm`.

3. Build the new `/waitlist` page.
   Add a public layout with hero copy, benefits/value framing, the shared waitlist form as the main CTA, and a clear login link for existing beta users.

4. Adjust navigation behavior for public marketing routes.
   Ensure the bottom dock does not render on `/waitlist` even when an authenticated session exists.

5. Add lightweight style support.
   Introduce only the CSS classes needed for the new layout sections, visual accents, and responsive spacing while preserving the existing product look.

6. Add verification tests.
   Cover the new renderable pieces and the extracted waitlist form behavior with the project’s existing Node test setup where practical.

## Test Strategy

The project currently uses `tsx --test` with Node-based tests, not browser E2E or React Testing Library. The implementation should therefore focus on testable extracted logic and low-friction render-level assertions.

Planned verification:

1. Add a focused test file for the new landing page module and shared form helpers if extraction yields directly testable pure functions.
2. Keep backend submission behavior covered indirectly by the existing `/api/access-requests` endpoint, which is reused unchanged.
3. Run:
   - `npm test`
   - `npm run typecheck`
   - `npm run build`

If the UI implementation ends up not being realistically unit-testable within the current toolchain, document that limitation and rely on typecheck/build plus manual verification of the acceptance criteria.

## Edge Cases and Error Handling

1. Waitlist closed
   The UI must surface the API success envelope message indicating that the waitlist is currently closed.

2. Validation errors
   Invalid email or malformed request responses must show as understandable inline errors.

3. Rate limiting
   HTTP 429 responses must render the backend error text inline and must not clear the typed email prematurely.

4. Duplicate submissions
   Repeated submissions for the same email should still show the success message because the backend uses upsert semantics.

5. Authenticated visitors
   Existing users who open `/waitlist` should still see the public page content, but with no app dock and with an easy route back to login/dashboard context.

6. Mobile layout
   Hero, value blocks, and form card must stack cleanly without relying on large-screen-only composition.

## Validation Checklist

- `/waitlist` exists and renders without authentication
- waitlist submission uses `/api/access-requests`
- inline loading, success, and error states exist on the landing page
- `/` still supports beta login without regression
- `/` reuses the shared waitlist form logic instead of duplicating it
- dock navigation does not appear on `/waitlist`
- page title and description are set for the shareable route
- mobile and desktop layouts remain usable
- `npm test` passes
- `npm run typecheck` passes
- `npm run build` passes
