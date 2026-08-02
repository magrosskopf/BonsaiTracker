import assert from "node:assert/strict";
import test from "node:test";
import { decodeCreatedAtCursor, encodeCreatedAtCursor, parseLimit } from "@/lib/api/pagination";

test("public client pagination uses default and max limits", () => {
  assert.equal(parseLimit(undefined, { defaultLimit: 20, maxLimit: 50 }), 20);
  assert.equal(parseLimit("50", { defaultLimit: 20, maxLimit: 50 }), 50);
  assert.equal(parseLimit("51", { defaultLimit: 20, maxLimit: 50 }), null);
  assert.equal(parseLimit("0", { defaultLimit: 20, maxLimit: 50 }), null);
});

test("createdAt cursor round-trips sort values", () => {
  const cursor = encodeCreatedAtCursor({ createdAt: "2026-08-02T12:00:00.000Z", id: 42 });

  assert.deepEqual(decodeCreatedAtCursor(cursor), {
    createdAt: "2026-08-02T12:00:00.000Z",
    id: 42,
  });
});

test("createdAt cursor rejects malformed values", () => {
  assert.throws(() => decodeCreatedAtCursor("not-a-cursor"));
});
