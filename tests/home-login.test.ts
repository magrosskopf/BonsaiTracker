import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import {
  AUTH_CALLBACK_PATH,
  EMAIL_PASSWORD_LOGIN_LABEL,
  EMAIL_PASSWORD_SIGNUP_LABEL,
  GOOGLE_LOGIN_LABEL,
  MAGIC_LINK_FALLBACK_LABEL,
  PASSWORD_RESET_LABEL,
  getAuthCallbackUrl,
  getAuthErrorMessage,
  getAuthModeTitle,
  normalizeAuthEmail,
  validatePasswordSignup,
} from "@/pages/index";

const repoRoot = process.cwd();

test("home page exposes Google and email/password as standard auth options", () => {
  assert.equal(GOOGLE_LOGIN_LABEL, "Mit Google anmelden");
  assert.equal(EMAIL_PASSWORD_LOGIN_LABEL, "Mit E-Mail anmelden");
  assert.equal(EMAIL_PASSWORD_SIGNUP_LABEL, "Mit E-Mail registrieren");
  assert.equal(PASSWORD_RESET_LABEL, "Passwort vergessen?");
});

test("home page keeps Magic Link wording as fallback instead of primary email CTA", () => {
  assert.equal(MAGIC_LINK_FALLBACK_LABEL, "Login-Link per E-Mail senden");
  assert.notEqual(MAGIC_LINK_FALLBACK_LABEL, EMAIL_PASSWORD_LOGIN_LABEL);
});

test("home page builds Supabase auth callback URLs from the current origin", () => {
  assert.equal(AUTH_CALLBACK_PATH, "/auth/callback");
  assert.equal(getAuthCallbackUrl("http://localhost:3000"), "http://localhost:3000/auth/callback");
  assert.equal(getAuthCallbackUrl("http://localhost:3000/"), "http://localhost:3000/auth/callback");
});

test("home page maps known auth errors to actionable messages", () => {
  assert.match(getAuthErrorMessage("AccessDenied") ?? "", /geschlossene Beta/);
  assert.match(getAuthErrorMessage("OAuthAccountNotLinked") ?? "", /bereits ein Zugang/);
  assert.match(getAuthErrorMessage("Configuration") ?? "", /nicht vollständig konfiguriert/);
  assert.equal(getAuthErrorMessage(undefined), null);
  assert.equal(getAuthErrorMessage(["AccessDenied"]), getAuthErrorMessage("AccessDenied"));
});

test("home page normalizes auth email before Supabase calls", () => {
  assert.equal(normalizeAuthEmail("  USER@Example.COM "), "user@example.com");
});

test("home page validates email/password signup passwords client-side", () => {
  assert.match(validatePasswordSignup("1234567", "1234567") ?? "", /mindestens 8 Zeichen/);
  assert.match(validatePasswordSignup("12345678", "abcdefgh") ?? "", /stimmen nicht/);
  assert.equal(validatePasswordSignup("12345678", "12345678"), null);
});

test("home page exposes stable titles for auth modes", () => {
  assert.equal(getAuthModeTitle("login"), EMAIL_PASSWORD_LOGIN_LABEL);
  assert.equal(getAuthModeTitle("signup"), EMAIL_PASSWORD_SIGNUP_LABEL);
  assert.equal(getAuthModeTitle("reset"), "Passwort zurücksetzen");
});

test("home page uses password auth and gated signup Supabase calls", () => {
  const source = readFileSync(join(repoRoot, "pages", "index.tsx"), "utf8");

  assert.match(source, /signInWithPassword/);
  assert.match(source, /apiFetch\("\/api\/auth\/precheck"/);
  assert.match(source, /signUp/);
  assert.match(source, /resetPasswordForEmail/);
});
