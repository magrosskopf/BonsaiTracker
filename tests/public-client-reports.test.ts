import assert from "node:assert/strict";
import test from "node:test";
import { reportCreateSchema } from "@/lib/validators/report";

test("report validator accepts configured reasons", () => {
  const parsed = reportCreateSchema.parse({ reason: "SPAM" });

  assert.equal(parsed.reason, "SPAM");
});

test("report validator requires note for OTHER", () => {
  assert.throws(() => reportCreateSchema.parse({ reason: "OTHER" }));
  assert.equal(reportCreateSchema.parse({ reason: "OTHER", note: "Nicht abgedeckt." }).note, "Nicht abgedeckt.");
});

test("report validator enforces note length", () => {
  assert.throws(() => reportCreateSchema.parse({ reason: "SPAM", note: "x".repeat(501) }));
});
