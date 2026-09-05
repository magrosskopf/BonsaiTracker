import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { REMINDER_STATUS_OPTIONS } from "@/types/domain";
import { commentPatchSchema } from "@/lib/validators/comment";
import { reminderPatchSchema } from "@/lib/validators/reminder";

const PRIVATE_V1_ROUTES = [
  "pages/api/v1/bonsais/index.ts",
  "pages/api/v1/bonsais/[id].ts",
  "pages/api/v1/subentries/index.ts",
  "pages/api/v1/subentries/[id].ts",
  "pages/api/v1/reminders/index.ts",
  "pages/api/v1/reminders/[id].ts",
  "pages/api/v1/posts/index.ts",
  "pages/api/v1/posts/[id].ts",
  "pages/api/v1/posts/[id]/likes.ts",
  "pages/api/v1/posts/[id]/comments/index.ts",
  "pages/api/v1/posts/[id]/comments/[commentId].ts",
  "pages/api/v1/posts/[id]/reports.ts",
  "pages/api/v1/posts/[id]/comments/[commentId]/reports.ts",
  "pages/api/v1/profile/me.ts",
  "pages/api/v1/profiles/[id].ts",
  "pages/api/v1/upload.ts",
  "pages/api/v1/media/[...key].ts",
];

test("all private public-client v1 routes exist and use the shared boundary", () => {
  for (const route of PRIVATE_V1_ROUTES) {
    const source = fs.readFileSync(path.join(process.cwd(), route), "utf8");
    assert.match(source, /requirePublicClient/);
    assert.doesNotMatch(source, /req\.body\.[a-zA-Z0-9_]*userId|req\.body\.[a-zA-Z0-9_]*user_id/);
  }
});

test("mobile aliases for removed signup gating routes do not exist", () => {
  assert.equal(fs.existsSync(path.join(process.cwd(), "pages/api/v1/auth/precheck.ts")), false);
  assert.equal(fs.existsSync(path.join(process.cwd(), "pages/api/v1/access-requests.ts")), false);
});

test("reminder cancellation is part of domain and validation", () => {
  assert.equal(REMINDER_STATUS_OPTIONS.includes("CANCELLED"), true);
  assert.equal(reminderPatchSchema.parse({ status: "CANCELLED" }).status, "CANCELLED");
});

test("comment patch validation supports editing own comments", () => {
  assert.equal(commentPatchSchema.parse({ text: "Aktualisiert" }).text, "Aktualisiert");
  assert.throws(() => commentPatchSchema.parse({ text: "" }));
});
