import assert from "node:assert/strict";
import test from "node:test";
import {
  AUTH_CALLBACK_ERROR_MESSAGE,
  AUTH_RECOVERY_REDIRECT,
  AUTH_SUCCESS_REDIRECT,
  getCallbackCode,
  getCallbackStartPageError,
  getCallbackSuccessRedirect,
  getFirstQueryValue,
  getStartPageAuthErrorUrl,
  isRecoveryCallback,
  shouldShowMissingCallbackCodeError,
} from "@/pages/auth/callback";

test("auth callback uses the dashboard as successful login target", () => {
  assert.equal(AUTH_SUCCESS_REDIRECT, "/dashboard");
});

test("auth callback routes recovery links to the password reset page", () => {
  assert.equal(AUTH_RECOVERY_REDIRECT, "/auth/reset-password");
  assert.equal(isRecoveryCallback({ type: "recovery" }), true);
  assert.equal(isRecoveryCallback({ type: "signup" }), false);
  assert.equal(getCallbackSuccessRedirect({ type: "recovery" }), AUTH_RECOVERY_REDIRECT);
  assert.equal(getCallbackSuccessRedirect({ code: "oauth-code" }), AUTH_SUCCESS_REDIRECT);
});

test("auth callback normalizes query values", () => {
  assert.equal(getFirstQueryValue("abc"), "abc");
  assert.equal(getFirstQueryValue(["first", "second"]), "first");
  assert.equal(getFirstQueryValue(undefined), undefined);
  assert.equal(getCallbackCode({ code: ["oauth-code"] }), "oauth-code");
});

test("auth callback maps denied signup errors back to the home page", () => {
  assert.equal(getCallbackStartPageError({ error: "access_denied" }), "AccessDenied");
  assert.equal(getCallbackStartPageError({ error_description: "User is not approved for signup" }), "AccessDenied");
  assert.equal(getStartPageAuthErrorUrl("AccessDenied"), "/?error=AccessDenied");
});

test("auth callback maps configuration errors and keeps a local fallback message", () => {
  assert.equal(getCallbackStartPageError({ error_description: "Google provider is not enabled" }), "Configuration");
  assert.equal(getCallbackStartPageError({ error: "server_error" }), "Callback");
  assert.equal(getCallbackStartPageError({}), null);
  assert.equal(AUTH_CALLBACK_ERROR_MESSAGE, "Der Login konnte nicht abgeschlossen werden.");
});

test("auth callback treats a ready callback without code as a local error", () => {
  assert.equal(shouldShowMissingCallbackCodeError({}), true);
  assert.equal(shouldShowMissingCallbackCodeError({ code: "oauth-code" }), false);
  assert.equal(shouldShowMissingCallbackCodeError({ error: "access_denied" }), false);
});
