# Spec: Production CSS Fix for Login and DaisyUI Components

## Status

IMPLEMENTED

## Purpose/Goal

Fix the deployed login page and any other affected screens that appear partially unstyled because DaisyUI component styles are missing from the production CSS bundle.

## Functional Requirements

1. The production build must include the DaisyUI base/component styles required by currently used classes such as `btn`, `card`, `card-body`, `input`, `input-bordered`, `badge`, `alert`, `fieldset`, and related variants.
2. The login view on `/` must render in production with the same component styling expectations as in local development.
3. The fix must apply globally so other existing pages using the same DaisyUI classes also render correctly after deployment.

## Technical Constraints

1. The project uses Next.js Pages Router, Tailwind CSS 3, and DaisyUI 5.
2. The existing visual theme in `styles/globals.css` must remain intact.
3. The fix must avoid changing `workflows/`.
4. Existing unrelated generated Prisma changes must not be reverted.

## Verified Findings

1. `npm run build` succeeds, and a production CSS bundle is generated.
2. The generated CSS bundle contains Tailwind preflight, utility classes, and custom overrides from `styles/globals.css`.
3. The generated CSS bundle does not contain DaisyUI component base rules for classes such as `.card`, `.card-body`, `.input`, `.input-bordered`, `.fieldset`, or `.fieldset-legend`.
4. `tailwind.config.js` currently uses `plugins: [require("daisyui")]`.
5. In this environment, `require("daisyui")` returns an object with a `default` export, not the plugin function itself.
6. This causes Tailwind to receive the wrong plugin value, so DaisyUI component CSS is not injected into the final bundle.

## Acceptance Criteria

1. `tailwind.config.js` loads the actual DaisyUI plugin function.
2. A fresh production build contains DaisyUI component rules for the classes used on the login page and other existing pages.
3. `npm run build` completes successfully after the change.
4. `npm run typecheck` completes successfully after the change.

## Out-of-Scope

1. Reworking the login page layout or copy.
2. Replacing DaisyUI usage with plain Tailwind classes across the app.
3. Refactoring unrelated styling or auth flows.
