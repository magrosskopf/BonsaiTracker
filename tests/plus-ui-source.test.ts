import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const source = (...parts: string[]) => readFileSync(join(process.cwd(), ...parts), "utf8");

test("quickstart points to the optional care-plan species and distinguishes it from free text", () => {
  const form = source("components", "BonsaiForm.tsx");
  const config = source("lib", "config", "forms.ts");
  assert.match(form, /Pflegeplan-Pflanzenart.*Weitere Details/s);
  assert.match(config, /Art-Freitext/);
  assert.match(config, /Pflegeplan-Pflanzenart/);
});

test("bonsai care-plan context keeps preview and exposes selection, purchase, return, activation and reminder paths", () => {
  const detail = source("pages", "bonsai", "[id].tsx");
  assert.match(detail, /id="pflegeplan"/);
  assert.match(detail, /Pflegeplan-Pflanzenart auswählen/);
  assert.match(detail, /PlusOfferCard/);
  assert.match(detail, /CheckoutReturnNotice/);
  assert.match(detail, /System-Reminder wurden angelegt/);
  assert.match(detail, /href="\/reminders"/);
  assert.match(detail, /carePlan\.preview\.map/);
});

test("profile offers Plus independently and never prints raw Stripe status values", () => {
  const profile = source("pages", "profile.tsx");
  assert.match(profile, /Bonsai Tracker Plus/);
  assert.match(profile, /PlusOfferCard/);
  assert.match(profile, /CheckoutReturnNotice/);
  assert.match(profile, /Bonsai auswählen/);
  assert.doesNotMatch(profile, /carePlanEntitlement\.status/);
  assert.doesNotMatch(profile, /Status:/);
});
