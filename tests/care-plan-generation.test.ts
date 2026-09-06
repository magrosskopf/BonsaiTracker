import assert from "node:assert/strict";
import test from "node:test";
import { CARE_PLAN_SPECIES } from "@/lib/care-plans/catalog";
import { generateCarePlanPreview } from "@/lib/care-plans/generate";
import { CARE_PLAN_CARE_TYPES } from "@/lib/care-plans/rules";

test("care-plan catalog contains the ten initial species", () => {
  assert.deepEqual(CARE_PLAN_SPECIES.map((species) => species.id), [
    "ficus",
    "chinese-elm",
    "japanese-maple",
    "juniper",
    "pine",
    "azalea",
    "privet",
    "hornbeam",
    "beech",
    "serissa",
  ]);
});

test("preview uses rolling twelve months, first day of target month, and known care types", () => {
  const items = generateCarePlanPreview({ speciesId: "japanese-maple", indoorOutdoor: "OUTDOOR", from: "2026-09-06T12:00:00.000Z" });
  const dates = new Set(items.map((item) => item.date));

  assert.ok(items.length > 0);
  assert.ok([...dates].every((date) => date.endsWith("-01")));
  assert.ok([...dates].every((date) => date >= "2026-09-01" && date <= "2027-08-01"));
  assert.ok(items.every((item) => CARE_PLAN_CARE_TYPES.includes(item.careType)));
  assert.ok(items.every((item) => item.version === "2026-09-06.v1"));
});

test("preview applies placement constraints and defaults missing placement to outdoor", () => {
  const defaulted = generateCarePlanPreview({ speciesId: "ficus", from: "2026-05-01" });
  const indoor = generateCarePlanPreview({ speciesId: "ficus", indoorOutdoor: "INDOOR", from: "2026-05-01" });
  const outdoor = generateCarePlanPreview({ speciesId: "ficus", indoorOutdoor: "OUTDOOR", from: "2026-05-01" });

  assert.deepEqual(defaulted, outdoor);
  assert.ok(indoor.some((item) => item.ruleId === "tropical-prune"));
  assert.ok(!outdoor.some((item) => item.ruleId === "tropical-prune"));
});

test("preview excludes watering advice and unknown species", () => {
  const items = generateCarePlanPreview({ speciesId: "azalea", indoorOutdoor: "OUTDOOR", from: "2026-01-01" });
  const text = items.map((item) => `${item.careType} ${item.title} ${item.note}`).join("\n");

  assert.equal(generateCarePlanPreview({ speciesId: "unknown", from: "2026-01-01" }).length, 0);
  assert.doesNotMatch(text, /watering|gieß|giess|bewässer/i);
});
