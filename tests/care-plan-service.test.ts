import assert from "node:assert/strict";
import test from "node:test";
import type { CarePlanServiceRepositories } from "@/lib/care-plans/service";
import { activateCarePlan, CarePlanError, replaceCarePlan, syncCarePlan } from "@/lib/care-plans/service";
import type { BonsaiRow, ReminderRow } from "@/types/database";

const now = new Date("2026-03-15T12:00:00.000Z");

function bonsai(overrides: Partial<BonsaiRow> = {}): BonsaiRow {
  return {
    id: 7,
    user_id: "user-1",
    name: "Acer",
    nickname: null,
    species: "Acer",
    latin_name: null,
    location: "Terrasse",
    indoor_outdoor: "OUTDOOR",
    age: null,
    height_cm: null,
    width_cm: null,
    trunk_diameter_mm: null,
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
    notes: null,
    images: [],
    deleted_at: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    care_plan_species_id: "japanese-maple",
    care_plan_active: false,
    care_plan_version: null,
    care_plan_activated_at: null,
    care_plan_replaced_at: null,
    ...overrides,
  };
}

function reminder(overrides: Partial<ReminderRow>): ReminderRow {
  return {
    id: overrides.id ?? 1,
    user_id: "user-1",
    bonsai_id: 7,
    sub_entry_id: null,
    title: "System",
    reminder_date: "2026-03-01",
    status: "PENDING",
    completed_at: null,
    snoozed_until: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
    source: "CARE_PLAN",
    care_type: "REPOTTING",
    care_plan_version: "2026-09-06.v1",
    care_plan_species_id: "japanese-maple",
    care_plan_rule_id: "spring-repot-check",
    care_plan_target_month: "2026-03-01",
    ...overrides,
  };
}

function fakeRepositories(options: { active?: boolean; existing?: ReminderRow[]; tree?: BonsaiRow } = {}) {
  const reminders = [...(options.existing ?? [])];
  const calls = { created: 0, cancelled: 0, state: [] as Partial<BonsaiRow>[] };
  const repositories: CarePlanServiceRepositories = {
    async getBonsai() {
      return options.tree ?? bonsai();
    },
    async getEntitlement(userId, feature) {
      return {
        userId,
        active: options.active === true,
        source: "stripe",
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripeSubscriptionStatus: options.active ? "active" : "canceled",
        currentPeriodEnd: null,
        updatedAt: now.toISOString(),
      };
    },
    async listCarePlanReminders() {
      return reminders;
    },
    async createCarePlanReminder(input) {
      calls.created += 1;
      reminders.push(reminder({
        id: reminders.length + 1,
        reminder_date: input.reminderDate,
        care_type: input.careType,
        care_plan_version: input.carePlanVersion,
        care_plan_species_id: input.carePlanSpeciesId,
        care_plan_rule_id: input.carePlanRuleId,
        care_plan_target_month: input.carePlanTargetMonth,
      }));
    },
    async cancelOpenCarePlanReminders(userId, bonsaiId, keepOrigin) {
      let cancelled = 0;
      for (const item of reminders) {
        if (
          item.status !== "DONE" &&
          (!keepOrigin || item.care_plan_species_id !== keepOrigin.speciesId || item.care_plan_version !== keepOrigin.version)
        ) {
          item.status = "CANCELLED";
          cancelled += 1;
        }
      }
      calls.cancelled += cancelled;
      return cancelled;
    },
    async setBonsaiCarePlanState(userId, bonsaiId, patch) {
      calls.state.push(patch);
    },
  };
  return { repositories, calls, reminders };
}

test("activation is blocked without entitlement and creates no reminders", async () => {
  const { repositories, calls } = fakeRepositories({ active: false });

  await assert.rejects(() => activateCarePlan(repositories, "user-1", 7, now), (error) => {
    assert.equal(error instanceof CarePlanError, true);
    assert.equal((error as CarePlanError).code, "ENTITLEMENT_REQUIRED");
    return true;
  });
  assert.equal(calls.created, 0);
});

test("sync is blocked when replacement is required", async () => {
  const { repositories } = fakeRepositories({
    active: true,
    tree: bonsai({ care_plan_active: true, care_plan_version: "old.v1" }),
    existing: [reminder({ id: 1, status: "PENDING", care_plan_version: "old.v1" })],
  });

  await assert.rejects(() => syncCarePlan(repositories, "user-1", 7, now), (error) => {
    assert.equal(error instanceof CarePlanError, true);
    assert.equal((error as CarePlanError).message, "Bitte ersetze den Pflegeplan explizit, bevor du synchronisierst.");
    return true;
  });
});

test("replacement cancels old same-species version reminders", async () => {
  const existing = [reminder({ id: 1, status: "PENDING", care_plan_version: "old.v1", care_plan_species_id: "japanese-maple" })];
  const { repositories, reminders } = fakeRepositories({
    active: true,
    tree: bonsai({ care_plan_active: true, care_plan_version: "old.v1" }),
    existing,
  });

  await replaceCarePlan(repositories, "user-1", 7, now);

  assert.equal(reminders.find((item) => item.id === 1)?.status, "CANCELLED");
});

test("activation creates origin-keyed reminders and repeated sync is idempotent", async () => {
  const { repositories, calls } = fakeRepositories({ active: true });

  const first = await activateCarePlan(repositories, "user-1", 7, now);
  const second = await syncCarePlan(repositories, "user-1", 7, now);

  assert.ok(first.created > 0);
  assert.equal(second.created, 0);
  assert.equal(calls.created, first.created);
  assert.ok(calls.state.some((patch) => patch.care_plan_active === true));
});

test("done and cancelled care-plan origins are not recreated", async () => {
  const existing = [
    reminder({ id: 1, status: "DONE", care_plan_rule_id: "spring-repot-check", care_plan_target_month: "2026-03-01" }),
    reminder({ id: 2, status: "CANCELLED", care_plan_rule_id: "spring-fertilize-start", care_plan_target_month: "2026-04-01" }),
  ];
  const { repositories, reminders } = fakeRepositories({ active: true, existing });

  await syncCarePlan(repositories, "user-1", 7, now);

  assert.equal(reminders.filter((item) => item.care_plan_rule_id === "spring-repot-check" && item.care_plan_target_month === "2026-03-01").length, 1);
  assert.equal(reminders.filter((item) => item.care_plan_rule_id === "spring-fertilize-start" && item.care_plan_target_month === "2026-04-01").length, 1);
});

test("replacement cancels open old system reminders and keeps done history", async () => {
  const existing = [
    reminder({ id: 1, status: "PENDING", care_plan_species_id: "ficus" }),
    reminder({ id: 2, status: "SNOOZED", care_plan_species_id: "ficus" }),
    reminder({ id: 3, status: "DONE", care_plan_species_id: "ficus" }),
  ];
  const { repositories, reminders } = fakeRepositories({ active: true, existing });

  const result = await replaceCarePlan(repositories, "user-1", 7, now);

  assert.equal(result.cancelled, 2);
  assert.equal(reminders.find((item) => item.id === 1)?.status, "CANCELLED");
  assert.equal(reminders.find((item) => item.id === 2)?.status, "CANCELLED");
  assert.equal(reminders.find((item) => item.id === 3)?.status, "DONE");
});
