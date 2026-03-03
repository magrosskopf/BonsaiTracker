# Implementation Plan: Production CSS Fix for Login and DaisyUI Components

## Status

COMPLETE

## Overview

Restore DaisyUI component CSS generation in production by loading the actual DaisyUI plugin function in Tailwind configuration, then verify that the expected component selectors appear in the production bundle.

## Reference

Spec: `/work/dev/features/2026-03-03_login-css-production/spec.md`

Key acceptance criteria:
- DaisyUI plugin function is loaded correctly.
- Production CSS contains missing DaisyUI component rules.
- Build and typecheck succeed.

## File Structure

Modify:
- `/work/tailwind.config.js`

Verify:
- `/work/.next/static/css/*`

## Implementation Steps

1. Update `tailwind.config.js` so DaisyUI is referenced via its actual plugin function export rather than the ESM wrapper object returned by `require("daisyui")`.
2. Rebuild the production bundle with `npm run build`.
3. Inspect the generated CSS for representative DaisyUI selectors such as `.card`, `.card-body`, `.input`, `.input-bordered`, `.fieldset`, and `.fieldset-legend`.
4. Run `npm run typecheck` to confirm the configuration change does not introduce regressions.

## Code Architecture

1. Tailwind loads plugins from `tailwind.config.js` at build time.
2. DaisyUI 5 is published as an ESM module and exposes the plugin on the `default` export when consumed through CommonJS `require`.
3. Passing the wrapper object prevents Tailwind from executing the plugin, which skips DaisyUI component generation.

## Technical Decisions

1. Fix the integration point at Tailwind config level instead of patching individual pages.
2. Keep DaisyUI as the source of component styling because the app already depends on it broadly.
3. Verify generated CSS directly to prove the deployment issue is fixed at the root cause.

## Integration Points

1. Tailwind config affects the entire UI bundle.
2. Existing custom theme overrides in `styles/globals.css` should continue to layer on top of DaisyUI classes once the plugin loads correctly.

## Test Strategy

1. Run `npm run build`.
2. Confirm the build output CSS contains missing selectors for DaisyUI components used on `/`.
3. Run `npm run typecheck`.

## Edge Cases & Error Handling

1. If DaisyUI export shape differs between environments, use a compatibility fallback that supports both direct CommonJS and `default` export forms.
2. Avoid changes that assume Tailwind v4 CSS-plugin syntax because the project is configured for Tailwind v3.

## Validation Checklist

- Tailwind config updated with compatible DaisyUI plugin resolution.
- Production CSS includes representative DaisyUI component selectors.
- Build passes.
- Typecheck passes.
