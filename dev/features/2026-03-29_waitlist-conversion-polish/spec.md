# Spec: Waitlist Conversion Polish

## Status

IMPLEMENTED

## Purpose/Goal

Sharpen the new public waitlist landing page so it converts better when shared and presents a cleaner preview in messengers and social apps. This includes stronger launch-focused copy, a clearer conversion-oriented structure, and a dedicated social preview asset with matching metadata.

## Current Situation

1. The public landing page at [`pages/waitlist.tsx`](/Users/maius/Projekte/Bonsai-Tracker/pages/waitlist.tsx) already exists and is functional.
2. The page copy is solid but still relatively product-descriptive rather than explicitly conversion-focused.
3. The route currently sets only basic `<title>` and `description` metadata.
4. There is no dedicated Open Graph or Twitter preview image for the shareable waitlist URL.

## Functional Requirements

1. The waitlist landing page must use sharper conversion-oriented copy in hero, CTA, and supporting sections.
2. The page structure must make the primary action clearer, with copy and layout optimized around joining the waitlist.
3. The page must include stronger trust or expectation-setting content so visitors understand what they are signing up for and why now.
4. The route must expose share metadata for the waitlist page, including at minimum page title, description, Open Graph tags, and Twitter card tags.
5. The share metadata must point to a dedicated preview image for the waitlist page.
6. The preview asset must be part of the repository and be usable without a runtime image generation service.
7. The existing waitlist backend and submission flow must remain unchanged.
8. The route path `/waitlist` must remain unchanged.

## Technical Constraints

1. The project uses Next.js Pages Router, TypeScript, Tailwind, DaisyUI, and static assets from `public/`.
2. No CMS, remote image generation, or third-party landing page tooling may be introduced.
3. The existing waitlist form component in [`WaitlistRequestForm.tsx`](/Users/maius/Projekte/Bonsai-Tracker/components/WaitlistRequestForm.tsx) should remain the shared form implementation unless a small extension is required.
4. The visual direction must stay consistent with the established Bonsai Tracker look instead of introducing a disconnected marketing style.
5. Existing homepage `/` login behavior must remain unchanged.

## Acceptance Criteria

1. The copy on `/waitlist` is noticeably more launch- and conversion-oriented than the current version.
2. The page presents one clearly dominant waitlist CTA above the fold.
3. The supporting sections more clearly explain audience, value, and what happens after signup.
4. The route includes Open Graph and Twitter metadata in addition to standard title and description.
5. A dedicated share-preview asset exists in the repository and is referenced by the waitlist metadata.
6. The waitlist form still submits through the existing `/api/access-requests` flow.
7. The updated page remains responsive on mobile and desktop.

## Out-of-Scope

1. Rebuilding the waitlist backend or changing where emails are stored.
2. Adding analytics, A/B testing, or external marketing tooling.
3. Building a dynamic OG image generation endpoint.
4. Changing the route from `/waitlist` to another URL.

## Review Checklist

1. Conversion copy, page structure, and social preview are all explicitly covered.
2. The existing submission backend remains untouched.
3. Static asset handling for the preview image is clearly constrained.
4. Acceptance criteria are concrete enough to verify in code and manually.
