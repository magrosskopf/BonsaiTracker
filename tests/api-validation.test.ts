import assert from "node:assert/strict";
import test from "node:test";
import { getFirstValidationMessage } from "@/lib/api/validation";

test("validation message prefers form errors when available", () => {
  const message = getFirstValidationMessage(
    {
      formErrors: ["Formular ist ungueltig."],
      fieldErrors: {
        name: ["Name ist erforderlich."],
      },
    },
    "Fallback",
  );

  assert.equal(message, "Formular ist ungueltig.");
});

test("validation message falls back to first field error", () => {
  const message = getFirstValidationMessage(
    {
      formErrors: [],
      fieldErrors: {
        name: undefined,
        ownedSince: ["Datum darf nicht in der Zukunft liegen."],
        customStyle: ["Bitte gib einen eigenen Stil an."],
      },
    },
    "Fallback",
  );

  assert.equal(message, "Besitz seit: Datum darf nicht in der Zukunft liegen.");
});

test("validation message uses fallback when no details are usable", () => {
  const message = getFirstValidationMessage(
    {
      formErrors: [],
      fieldErrors: {
        name: [],
      },
    },
    "Die Bonsai-Daten sind ungueltig.",
  );

  assert.equal(message, "Die Bonsai-Daten sind ungueltig.");
});
