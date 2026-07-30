import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import test from "node:test";
import { createElement } from "react";
import BonsaiForm from "@/components/BonsaiForm";
import { bonsaiFormStepConfigs } from "@/lib/config/forms";
import { mapBonsaiDetail, mapBonsaiSummary, type BonsaiDetailRecord } from "@/lib/mappers";
import { bonsaiDetailToFormValues, bonsaiFormValuesToPayload, emptyBonsaiFormValues } from "@/lib/forms";
import { getSupabaseDirectory } from "@/scripts/supabase-project";

const require = createRequire(import.meta.url);
const { renderToStaticMarkup } = require("react-dom/server") as {
  renderToStaticMarkup: (element: ReturnType<typeof createElement>) => string;
};

function buildBonsaiRecord(): BonsaiDetailRecord {
  const now = "2026-07-05T12:00:00.000Z";

  return {
    id: 4,
    user_id: "11111111-1111-4111-8111-111111111111",
    name: "Deshojo",
    nickname: "Alter Rufname",
    species: "Acer palmatum",
    latin_name: null,
    location: "Terrasse",
    indoor_outdoor: "OUTDOOR",
    age: null,
    height_cm: 30,
    width_cm: 24,
    trunk_diameter_mm: 18,
    style: "Unbekannt",
    custom_style: null,
    owned_since: null,
    acquired_from: null,
    purchase_price_cents: null,
    health_status: "UNBEKANNT",
    development_stage: "UNBEKANNT",
    last_repot_date: null,
    next_repot_due: null,
    winter_hardiness: null,
    sun_exposure: null,
    pot_type: null,
    pot_color: null,
    watering_notes: null,
    fertilizing_notes: null,
    pruning_notes: null,
    wiring_notes: null,
    notes: "Feiner Austrieb.",
    images: ["/api/media/supabase/11111111-1111-4111-8111-111111111111/bonsais/deshojo.webp"],
    deleted_at: null,
    created_at: now,
    updated_at: now,
    sub_entries: [],
  };
}

function fieldConfigByKey() {
  return Object.fromEntries(bonsaiFormStepConfigs.flatMap((step) => step.fields).map((field) => [field.key, field]));
}

test("bonsai dto mappers omit nickname and form mapping no longer expects it", () => {
  const record = buildBonsaiRecord();
  const summary = mapBonsaiSummary({ ...record, sub_entry_count: 0 });
  const detail = mapBonsaiDetail(record);
  const formValues = bonsaiDetailToFormValues(detail);
  const payload = bonsaiFormValuesToPayload(emptyBonsaiFormValues);

  assert.equal("nickname" in summary, false);
  assert.equal("nickname" in detail, false);
  assert.equal("nickname" in formValues, false);
  assert.equal("nickname" in payload, false);
});

test("bonsai search is delegated to parameterized Supabase RPC", () => {
  const migration = readFileSync(join(getSupabaseDirectory(), "migrations", "20260718000300_service_rpcs.sql"), "utf8");
  assert.match(migration, /p_search is null or b\.name ilike '%' \|\| p_search/);
  assert.doesNotMatch(migration, /nickname ilike/);
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
    mapBonsaiDetail({ ...buildBonsaiRecord(), purchase_price_cents: 1250 }),
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
