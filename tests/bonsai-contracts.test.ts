import assert from "node:assert/strict";
import test from "node:test";
import { mapBonsaiDetail, mapBonsaiSummary, type BonsaiDetailRecord } from "@/lib/mappers";
import { buildBonsaiSearchOr } from "@/lib/search/bonsais";
import { bonsaiDetailToFormValues, bonsaiFormValuesToPayload, emptyBonsaiFormValues } from "@/lib/forms";

function buildBonsaiRecord(): BonsaiDetailRecord {
  const now = new Date("2026-07-05T12:00:00.000Z");

  return {
    id: 4,
    userId: 2,
    name: "Deshojo",
    nickname: "Alter Rufname",
    species: "Acer palmatum",
    latinName: null,
    location: "Terrasse",
    indoorOutdoor: "OUTDOOR",
    age: null,
    heightCm: 30,
    widthCm: 24,
    trunkDiameterMm: 18,
    style: "Unbekannt",
    customStyle: null,
    ownedSince: null,
    acquiredFrom: null,
    purchasePriceCents: null,
    healthStatus: "UNBEKANNT",
    developmentStage: "UNBEKANNT",
    lastRepotDate: null,
    nextRepotDue: null,
    winterHardiness: null,
    sunExposure: null,
    potType: null,
    potColor: null,
    wateringNotes: null,
    fertilizingNotes: null,
    pruningNotes: null,
    wiringNotes: null,
    notes: "Feiner Austrieb.",
    images: ["/uploads/deshojo.webp"],
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
    subEntries: [],
  };
}

test("bonsai dto mappers omit nickname and form mapping no longer expects it", () => {
  const record = buildBonsaiRecord();
  const summary = mapBonsaiSummary({ ...record, _count: { subEntries: 0 } });
  const detail = mapBonsaiDetail(record);
  const formValues = bonsaiDetailToFormValues(detail);
  const payload = bonsaiFormValuesToPayload(emptyBonsaiFormValues);

  assert.equal("nickname" in summary, false);
  assert.equal("nickname" in detail, false);
  assert.equal("nickname" in formValues, false);
  assert.equal("nickname" in payload, false);
});

test("bonsai search helper excludes legacy nickname field", () => {
  const conditions = buildBonsaiSearchOr("rufname");

  assert.deepEqual(conditions, [
    { name: { contains: "rufname", mode: "insensitive" } },
    { species: { contains: "rufname", mode: "insensitive" } },
    { latinName: { contains: "rufname", mode: "insensitive" } },
    { location: { contains: "rufname", mode: "insensitive" } },
    { notes: { contains: "rufname", mode: "insensitive" } },
    { customStyle: { contains: "rufname", mode: "insensitive" } },
  ]);
});
