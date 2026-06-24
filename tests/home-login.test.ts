import assert from "node:assert/strict";
import test from "node:test";
import { EMAIL_FALLBACK_LOGIN_LABEL, GOOGLE_LOGIN_LABEL, getAuthErrorMessage } from "@/pages/index";

test("home page exposes Google login as primary CTA", () => {
  assert.equal(GOOGLE_LOGIN_LABEL, "Mit Google anmelden");
  assert.equal(EMAIL_FALLBACK_LOGIN_LABEL, "Login-Link senden");
});

test("home page maps known auth errors to actionable messages", () => {
  assert.match(getAuthErrorMessage("AccessDenied") ?? "", /geschlossene Beta/);
  assert.match(getAuthErrorMessage("OAuthAccountNotLinked") ?? "", /bereits ein Zugang/);
  assert.match(getAuthErrorMessage("Configuration") ?? "", /nicht vollständig konfiguriert/);
  assert.equal(getAuthErrorMessage(undefined), null);
  assert.equal(getAuthErrorMessage(["AccessDenied"]), getAuthErrorMessage("AccessDenied"));
});
