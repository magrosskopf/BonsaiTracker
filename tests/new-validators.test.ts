import assert from "node:assert/strict";
import test from "node:test";
import { commentCreateSchema } from "@/lib/validators/comment";
import { postCreateSchema } from "@/lib/validators/post";
import { reminderPatchSchema } from "@/lib/validators/reminder";

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
