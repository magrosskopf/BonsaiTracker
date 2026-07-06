import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import BonsaiForm from "@/components/BonsaiForm";
import { bonsaiFormStepConfigs } from "@/lib/config/forms";
import { mapBonsaiDetail, mapBonsaiSummary, type BonsaiDetailRecord } from "@/lib/mappers";
import { buildBonsaiSearchOr } from "@/lib/search/bonsais";
import { bonsaiDetailToFormValues, bonsaiFormValuesToPayload, emptyBonsaiFormValues } from "@/lib/forms";

const require = createRequire(import.meta.url);
const { renderToStaticMarkup } = require("react-dom/server") as {
  renderToStaticMarkup: (element: ReturnType<typeof createElement>) => string;
};

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

function fieldConfigByKey() {
  return Object.fromEntries(bonsaiFormStepConfigs.flatMap((step) => step.fields).map((field) => [field.key, field]));
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

test("bonsai form mappings support euro prices and nullable detail fields", () => {
  const detail = mapBonsaiDetail(buildBonsaiRecord());
  const formValues = bonsaiDetailToFormValues(detail);
  const commaPricePayload = bonsaiFormValuesToPayload({
    ...emptyBonsaiFormValues,
    name: "Deshojo",
    age: "",
    ownedSince: "",
    purchasePriceCents: "12,50",
  });
  const dotPricePayload = bonsaiFormValuesToPayload({
    ...emptyBonsaiFormValues,
    name: "Deshojo",
    purchasePriceCents: "12.50",
  });
  const blankPricePayload = bonsaiFormValuesToPayload({
    ...emptyBonsaiFormValues,
    name: "Deshojo",
    purchasePriceCents: "",
  });
  const pricedFormValues = bonsaiDetailToFormValues(
    mapBonsaiDetail({ ...buildBonsaiRecord(), purchasePriceCents: 1250 }),
  );

  assert.equal(formValues.age, "");
  assert.equal(formValues.ownedSince, "");
  assert.equal(formValues.purchasePriceCents, "");
  assert.equal(pricedFormValues.purchasePriceCents, "12,50");
  assert.equal(commaPricePayload.age, null);
  assert.equal(commaPricePayload.ownedSince, null);
  assert.equal(commaPricePayload.purchasePriceCents, 1250);
  assert.equal(dotPricePayload.purchasePriceCents, 1250);
  assert.equal(blankPricePayload.purchasePriceCents, null);
});

test("bonsai detail form config keeps selected fields optional and labels price in euro", () => {
  const byKey = fieldConfigByKey();

  assert.equal(byKey.species.required, undefined);
  assert.equal(byKey.age.required, undefined);
  assert.equal(byKey.style.required, undefined);
  assert.equal(byKey.ownedSince.required, undefined);
  assert.equal(byKey.healthStatus.required, undefined);
  assert.equal(byKey.acquiredFrom.required, undefined);
  assert.equal(byKey.developmentStage.required, undefined);
  assert.equal(byKey.purchasePriceCents.label, "Kaufpreis in Euro");
  assert.equal(byKey.purchasePriceCents.inputMode, "decimal");
  assert.equal(byKey.purchasePriceCents.placeholder, "z. B. 12,50");
});

test("bonsai create form starts in compact quickstart mode", () => {
  const markup = renderToStaticMarkup(
    createElement(BonsaiForm, {
      mode: "create",
      initialValues: emptyBonsaiFormValues,
      submitLabel: "Bonsai speichern",
      onSubmit: async () => {},
    }),
  );

  assert.match(markup, /Schnellstart/);
  assert.match(markup, /Weitere Details anzeigen/);
  assert.match(markup, /Name \*/);
  assert.doesNotMatch(markup, /Standort \*/);
  assert.doesNotMatch(markup, /Indoor \/ Outdoor/);
  assert.doesNotMatch(markup, /Wizard/);
});

test("bonsai edit form keeps wizard layout with required base fields", () => {
  const markup = renderToStaticMarkup(
    createElement(BonsaiForm, {
      mode: "edit",
      initialValues: emptyBonsaiFormValues,
      submitLabel: "Änderungen speichern",
      onSubmit: async () => {},
    }),
  );

  assert.match(markup, /Wizard/);
  assert.match(markup, /Grunddaten/);
  assert.match(markup, /Standort \*/);
  assert.match(markup, /Indoor \/ Outdoor \*/);
  assert.doesNotMatch(markup, /Schnellstart/);
  assert.doesNotMatch(markup, /Weitere Details anzeigen/);
});
