import assert from "node:assert/strict";
import test from "node:test";
import { bonsaiCreateSchema } from "@/lib/validators/bonsai";
import { subEntryCreateSchema } from "@/lib/validators/subentry";
import { validateImageFile } from "@/lib/validators/upload";

test("bonsai validator normalizes dates and enforces customStyle", () => {
  const parsed = bonsaiCreateSchema.safeParse({
    name: "Acer",
    nickname: "",
    species: "Acer palmatum",
    latinName: "",
    location: "Terrasse",
    indoorOutdoor: "OUTDOOR",
    age: 8,
    heightCm: "",
    widthCm: "",
    trunkDiameterMm: "",
    style: "Sonstiger",
    customStyle: "Freiform",
    ownedSince: "2024-05-29",
    acquiredFrom: "",
    purchasePriceCents: "",
    healthStatus: "GUT",
    developmentStage: "IN_GESTALTUNG",
    lastRepotDate: "",
    nextRepotDue: "",
    winterHardiness: "",
    sunExposure: "",
    potType: "",
    potColor: "",
    wateringNotes: "",
    fertilizingNotes: "",
    pruningNotes: "",
    wiringNotes: "",
    notes: "",
    images: [],
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.ownedSince.toISOString(), "2024-05-29T00:00:00.000Z");
    assert.equal(parsed.data.customStyle, "Freiform");
  }
});

test("subentry validator rejects reminder dates before the entry date", () => {
  const parsed = subEntryCreateSchema.safeParse({
    bonsaiId: 1,
    date: "2024-05-29",
    entryType: "KONTROLLE",
    healthObservation: "",
    performedActions: ["Kontrolle"],
    nextAction: "",
    reminderDate: "2024-05-28",
    notes: "",
    images: [],
  });

  assert.equal(parsed.success, false);
});

test("upload validator accepts webp and rejects oversize files", () => {
  assert.deepEqual(validateImageFile({ mimetype: "image/webp", size: 1024 }), { ok: true });
  assert.deepEqual(validateImageFile({ mimetype: "image/png", size: 6 * 1024 * 1024 }), {
    ok: false,
    code: "PAYLOAD_TOO_LARGE",
    message: "Dateien dürfen maximal 5 MB groß sein.",
  });
});
