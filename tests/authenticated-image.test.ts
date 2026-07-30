import assert from "node:assert/strict";
import test from "node:test";
import { isManagedMediaPath } from "@/components/AuthenticatedImage";

test("AuthenticatedImage distinguishes managed and external URLs", () => {
  assert.equal(isManagedMediaPath("/api/media/supabase/user/path.webp"), true);
  assert.equal(isManagedMediaPath("https://example.com/avatar.webp"), false);
});
