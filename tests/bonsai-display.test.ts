import assert from "node:assert/strict";
import test from "node:test";
import { formatBonsaiAge, formatBonsaiDate, formatBonsaiDisplayText } from "@/lib/bonsai-display";
import { collectBonsaiTimelineImages } from "@/lib/bonsai-images";
import type { BonsaiDetail } from "@/types/dto";

test("bonsai display helper normalizes technical placeholders and empty values", () => {
  assert.equal(formatBonsaiDisplayText("Unbekannt"), "Nicht angegeben");
  assert.equal(formatBonsaiDisplayText("UNBEKANNT"), "Nicht angegeben");
  assert.equal(formatBonsaiDisplayText("   "), "Nicht angegeben");
  assert.equal(formatBonsaiDisplayText(null), "Nicht angegeben");
  assert.equal(formatBonsaiDisplayText("Acer palmatum"), "Acer palmatum");
});

test("bonsai display helper formats nullable age and dates with caller fallback", () => {
  assert.equal(formatBonsaiAge(null), "Nicht angegeben");
  assert.equal(formatBonsaiAge(12, "-"), "12 Jahre");
  assert.equal(formatBonsaiDate(null, "-"), "-");
  assert.equal(formatBonsaiDate("2026-07-04T00:00:00.000Z"), "04.07.2026");
});

test("bonsai timeline images keep initial bonsai photos and sort them with createdAt fallback", () => {
  const bonsai: BonsaiDetail = {
    id: 1,
    name: "Itoigawa",
    species: "Unbekannt",
    latinName: null,
    location: "Unbekannt",
    indoorOutdoor: "OUTDOOR",
    age: null,
    heightCm: null,
    widthCm: null,
    trunkDiameterMm: null,
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
    notes: null,
    images: ["/uploads/initial-1.webp", "/uploads/initial-2.webp"],
    deletedAt: null,
    createdAt: "2026-01-05T00:00:00.000Z",
    updatedAt: "2026-01-05T00:00:00.000Z",
    subEntries: [
      {
        id: 5,
        bonsaiId: 1,
        date: "2026-02-01T00:00:00.000Z",
        entryType: "FOTO_UPDATE",
        healthObservation: null,
        performedActions: [],
        nextAction: null,
        reminderDate: null,
        notes: null,
        images: ["/uploads/update.webp"],
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
    ],
  };

  assert.deepEqual(
    collectBonsaiTimelineImages(bonsai),
    [
      {
        image: "/uploads/initial-1.webp",
        date: "2026-01-05T00:00:00.000Z",
        createdAt: "2026-01-05T00:00:00.000Z",
        source: "Bonsai",
      },
      {
        image: "/uploads/initial-2.webp",
        date: "2026-01-05T00:00:00.000Z",
        createdAt: "2026-01-05T00:00:00.000Z",
        source: "Bonsai",
      },
      {
        image: "/uploads/update.webp",
        date: "2026-02-01T00:00:00.000Z",
        createdAt: "2026-02-01T00:00:00.000Z",
        source: "FOTO_UPDATE",
      },
    ],
  );
});

test("bonsai timeline images use createdAt as tie-breaker when timeline dates match", () => {
  const bonsai: BonsaiDetail = {
    id: 2,
    name: "Yamadori",
    species: "Pinus",
    latinName: null,
    location: "Unbekannt",
    indoorOutdoor: "OUTDOOR",
    age: null,
    heightCm: null,
    widthCm: null,
    trunkDiameterMm: null,
    style: "Unbekannt",
    customStyle: null,
    ownedSince: "2026-03-01T00:00:00.000Z",
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
    notes: null,
    images: ["/uploads/root.webp"],
    deletedAt: null,
    createdAt: "2026-03-02T00:00:00.000Z",
    updatedAt: "2026-03-02T00:00:00.000Z",
    subEntries: [
      {
        id: 8,
        bonsaiId: 2,
        date: "2026-03-01T00:00:00.000Z",
        entryType: "FOTO_UPDATE",
        healthObservation: null,
        performedActions: [],
        nextAction: null,
        reminderDate: null,
        notes: null,
        images: ["/uploads/earlier.webp"],
        createdAt: "2026-02-28T10:00:00.000Z",
        updatedAt: "2026-02-28T10:00:00.000Z",
      },
      {
        id: 9,
        bonsaiId: 2,
        date: "2026-03-01T00:00:00.000Z",
        entryType: "FOTO_UPDATE",
        healthObservation: null,
        performedActions: [],
        nextAction: null,
        reminderDate: null,
        notes: null,
        images: ["/uploads/later.webp"],
        createdAt: "2026-03-03T10:00:00.000Z",
        updatedAt: "2026-03-03T10:00:00.000Z",
      },
    ],
  };

  assert.deepEqual(
    collectBonsaiTimelineImages(bonsai).map(({ image }) => image),
    ["/uploads/earlier.webp", "/uploads/root.webp", "/uploads/later.webp"],
  );
});
