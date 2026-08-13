import assert from "node:assert/strict";
import test from "node:test";
import { commentCreateSchema } from "@/lib/validators/comment";
import { postCreateSchema } from "@/lib/validators/post";
import { reminderCreateSchema, reminderPatchSchema } from "@/lib/validators/reminder";

test("post validator accepts posts without images", () => {
  const parsed = postCreateSchema.safeParse({
    bonsaiId: 1,
    text: "Bitte helft mir",
    postType: "HELP",
    entryIds: [],
    manualImages: [],
  });

  assert.equal(parsed.success, true);
});

test("post validator rejects more than five images", () => {
  const parsed = postCreateSchema.safeParse({
    bonsaiId: 1,
    text: "Update",
    postType: "SHOWCASE",
    entryIds: [],
    manualImages: ["1", "2", "3", "4", "5", "6"],
  });

  assert.equal(parsed.success, false);
});

test("comment validator rejects empty comments", () => {
  const parsed = commentCreateSchema.safeParse({ text: "   " });
  assert.equal(parsed.success, false);
});

test("reminder patch validator accepts snooze days", () => {
  const parsed = reminderPatchSchema.safeParse({ snoozeDays: 14 });
  assert.equal(parsed.success, true);
});

test("reminder patch validator accepts editable fields", () => {
  const parsed = reminderPatchSchema.safeParse({
    bonsaiId: "42",
    title: "Draht kontrollieren",
    reminderDate: "2026-08-20",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.bonsaiId, 42);
    assert.equal(parsed.data.title, "Draht kontrollieren");
    assert.equal(parsed.data.reminderDate?.toISOString(), "2026-08-20T00:00:00.000Z");
  }
});

test("reminder patch validator stays strict", () => {
  const parsed = reminderPatchSchema.safeParse({ unknownField: true });
  assert.equal(parsed.success, false);
});

test("reminder create validator accepts standalone reminders without sub entry", () => {
  const parsed = reminderCreateSchema.safeParse({
    bonsaiId: 1,
    title: "Düngen prüfen",
    reminderDate: "2026-08-20",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.subEntryId, null);
    assert.equal(parsed.data.reminderDate.toISOString(), "2026-08-20T00:00:00.000Z");
  }
});
