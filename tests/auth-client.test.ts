import assert from "node:assert/strict";
import test from "node:test";
import { toApiError } from "@/lib/supabase/errors";

test("Supabase error mapper sanitizes common constraint errors", () => {
  assert.deepEqual(toApiError({ code: "23505", message: "duplicate key value violates unique constraint users_email_key" }), {
    code: "CONFLICT",
    message: "Die Ressource existiert bereits oder steht in Konflikt.",
    status: 409,
  });
  assert.equal(toApiError({ code: "23514", message: "raw database detail" }).status, 400);
  assert.equal(toApiError({ code: "PGRST116", message: "not found" }).status, 404);
});
