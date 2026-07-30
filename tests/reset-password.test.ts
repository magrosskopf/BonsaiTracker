import assert from "node:assert/strict";
import test from "node:test";
import { RESET_PASSWORD_SUBMIT_LABEL, RESET_PASSWORD_SUCCESS_REDIRECT, validatePasswordReset } from "@/pages/auth/reset-password";

test("reset password page exposes stable labels and redirect target", () => {
  assert.equal(RESET_PASSWORD_SUBMIT_LABEL, "Passwort speichern");
  assert.equal(RESET_PASSWORD_SUCCESS_REDIRECT, "/dashboard");
});

test("reset password page validates password confirmation", () => {
  assert.match(validatePasswordReset("1234567", "1234567") ?? "", /mindestens 8 Zeichen/);
  assert.match(validatePasswordReset("12345678", "87654321") ?? "", /stimmen nicht/);
  assert.equal(validatePasswordReset("12345678", "12345678"), null);
});
