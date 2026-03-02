import assert from "node:assert/strict";
import test from "node:test";
import { fail, ok } from "@/lib/api/response";

function createResponseMock() {
  return {
    statusCode: 200,
    payload: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(body: unknown) {
      this.payload = body;
      return this;
    },
  };
}

test("ok wraps data in the success envelope", () => {
  const res = createResponseMock();
  ok(res as never, { id: 1 }, 201);

  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.payload, { ok: true, data: { id: 1 } });
});

test("fail wraps errors in the error envelope", () => {
  const res = createResponseMock();
  fail(res as never, "VALIDATION_ERROR", "Ungültig", 422, { field: "name" });

  assert.equal(res.statusCode, 422);
  assert.deepEqual(res.payload, {
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Ungültig",
      details: { field: "name" },
    },
  });
});
