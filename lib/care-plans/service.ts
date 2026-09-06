import type { BonsaiRow, ReminderRow } from "@/types/database";
import type { IndoorOutdoorOption } from "@/types/domain";
import { getCarePlanSpecies, isCarePlanSpeciesId } from "./catalog";
import { CARE_PLAN_FEATURE, type CarePlanEntitlement } from "./entitlements";
import { generateCarePlanPreview, type CarePlanPreviewItem } from "./generate";
import { CARE_PLAN_VERSION } from "./rules";

export class CarePlanError extends Error {
  constructor(
    public code: "NOT_FOUND" | "SPECIES_REQUIRED" | "INVALID_SPECIES" | "ENTITLEMENT_REQUIRED",
    message: string,
  ) {
    super(message);
  }
}

export interface CarePlanReminderOrigin {
  userId: string;
  bonsaiId: number;
  title: string;
  reminderDate: string;
  careType: string;
  carePlanVersion: string;
  carePlanSpeciesId: string;
  carePlanRuleId: string;
  carePlanTargetMonth: string;
}

export interface CarePlanServiceRepositories {
  getBonsai(userId: string, bonsaiId: number): Promise<BonsaiRow | null>;
  getEntitlement(userId: string, feature: string): Promise<CarePlanEntitlement | null>;
  listCarePlanReminders(userId: string, bonsaiId: number): Promise<ReminderRow[]>;
  createCarePlanReminder(input: CarePlanReminderOrigin): Promise<void>;
  cancelOpenCarePlanReminders(userId: string, bonsaiId: number, keepOrigin?: { speciesId: string; version: string }): Promise<number>;
  setBonsaiCarePlanState(userId: string, bonsaiId: number, patch: Partial<BonsaiRow>): Promise<void>;
}

export interface CarePlanContext {
  bonsai: BonsaiRow;
  species: NonNullable<ReturnType<typeof getCarePlanSpecies>> | null;
  preview: CarePlanPreviewItem[];
  entitlementActive: boolean;
  replacementSuggested: boolean;
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function monthKey(item: CarePlanPreviewItem): string {
  return `${item.version}:${item.speciesId}:${item.ruleId}:${item.targetMonth}`;
}

function rowOriginKey(row: ReminderRow): string | null {
  if (!row.care_plan_version || !row.care_plan_species_id || !row.care_plan_rule_id || !row.care_plan_target_month) {
    return null;
  }
  return `${row.care_plan_version}:${row.care_plan_species_id}:${row.care_plan_rule_id}:${dateOnly(new Date(row.care_plan_target_month))}`;
}

function ensureSpecies(bonsai: BonsaiRow): NonNullable<ReturnType<typeof getCarePlanSpecies>> {
  const speciesId = bonsai.care_plan_species_id;
  if (!speciesId) {
    throw new CarePlanError("SPECIES_REQUIRED", "Bitte waehle zuerst eine Pflanzenart fuer den Pflegeplan.");
  }
  const species = getCarePlanSpecies(speciesId);
  if (!species) {
    throw new CarePlanError("INVALID_SPECIES", "Die gewaehlte Pflegeplan-Pflanzenart ist unbekannt.");
  }
  return species;
}

async function getOwnedContext(
  repositories: CarePlanServiceRepositories,
  userId: string,
  bonsaiId: number,
  now: Date,
  requireSpecies = false,
): Promise<CarePlanContext> {
  const bonsai = await repositories.getBonsai(userId, bonsaiId);
  if (!bonsai) {
    throw new CarePlanError("NOT_FOUND", "Bonsai nicht gefunden.");
  }
  const species = requireSpecies ? ensureSpecies(bonsai) : getCarePlanSpecies(bonsai.care_plan_species_id);
  if (bonsai.care_plan_species_id && !species) {
    throw new CarePlanError("INVALID_SPECIES", "Die gewaehlte Pflegeplan-Pflanzenart ist unbekannt.");
  }
  const preview = generateCarePlanPreview({
    speciesId: species?.id,
    indoorOutdoor: bonsai.indoor_outdoor as IndoorOutdoorOption | null,
    from: now,
  });
  const entitlement = await repositories.getEntitlement(userId, CARE_PLAN_FEATURE);
  const entitlementActive = entitlement?.active === true;
  const existingCarePlanReminders = bonsai.care_plan_active ? await repositories.listCarePlanReminders(userId, bonsaiId) : [];
  const replacementSuggested = Boolean(
    bonsai.care_plan_active &&
      bonsai.care_plan_species_id &&
      species &&
      (bonsai.care_plan_version !== CARE_PLAN_VERSION ||
        existingCarePlanReminders.some(
          (reminder) =>
            (reminder.status === "PENDING" || reminder.status === "SNOOZED") &&
            (reminder.care_plan_species_id !== species.id || reminder.care_plan_version !== CARE_PLAN_VERSION),
        )),
  );

  return { bonsai, species, preview, entitlementActive, replacementSuggested };
}

async function assertEntitlement(repositories: CarePlanServiceRepositories, userId: string): Promise<void> {
  const entitlement = await repositories.getEntitlement(userId, CARE_PLAN_FEATURE);
  if (entitlement?.active !== true) {
    throw new CarePlanError("ENTITLEMENT_REQUIRED", "Pflegeplan-Zugang ist nicht aktiv.");
  }
}

async function createMissingReminders(
  repositories: CarePlanServiceRepositories,
  userId: string,
  bonsaiId: number,
  preview: CarePlanPreviewItem[],
): Promise<number> {
  const existing = await repositories.listCarePlanReminders(userId, bonsaiId);
  const existingKeys = new Set(existing.map(rowOriginKey).filter((value): value is string => Boolean(value)));
  let created = 0;

  for (const item of preview) {
    if (existingKeys.has(monthKey(item))) {
      continue;
    }
    await repositories.createCarePlanReminder({
      userId,
      bonsaiId,
      title: item.title,
      reminderDate: item.date,
      careType: item.careType,
      carePlanVersion: item.version,
      carePlanSpeciesId: item.speciesId,
      carePlanRuleId: item.ruleId,
      carePlanTargetMonth: item.targetMonth,
    });
    existingKeys.add(monthKey(item));
    created += 1;
  }

  return created;
}

export function getCarePlanPreview(input: { speciesId?: string | null; indoorOutdoor?: IndoorOutdoorOption | null; from?: string | Date | null }) {
  if (input.speciesId && !isCarePlanSpeciesId(input.speciesId)) {
    throw new CarePlanError("INVALID_SPECIES", "Die gewaehlte Pflegeplan-Pflanzenart ist unbekannt.");
  }
  return generateCarePlanPreview({ ...input, speciesId: input.speciesId ?? null });
}

export async function getBonsaiCarePlanContext(
  repositories: CarePlanServiceRepositories,
  userId: string,
  bonsaiId: number,
  now = new Date(),
): Promise<CarePlanContext> {
  return getOwnedContext(repositories, userId, bonsaiId, now);
}

export async function activateCarePlan(
  repositories: CarePlanServiceRepositories,
  userId: string,
  bonsaiId: number,
  now = new Date(),
): Promise<{ created: number }> {
  const context = await getOwnedContext(repositories, userId, bonsaiId, now, true);
  await assertEntitlement(repositories, userId);
  const created = await createMissingReminders(repositories, userId, bonsaiId, context.preview);
  await repositories.setBonsaiCarePlanState(userId, bonsaiId, {
    care_plan_active: true,
    care_plan_version: CARE_PLAN_VERSION,
    care_plan_activated_at: now.toISOString(),
    care_plan_replaced_at: null,
  });
  return { created };
}

export async function syncCarePlan(
  repositories: CarePlanServiceRepositories,
  userId: string,
  bonsaiId: number,
  now = new Date(),
): Promise<{ created: number }> {
  const context = await getOwnedContext(repositories, userId, bonsaiId, now, true);
  await assertEntitlement(repositories, userId);
  if (context.replacementSuggested) {
    throw new CarePlanError("INVALID_SPECIES", "Bitte ersetze den Pflegeplan explizit, bevor du synchronisierst.");
  }
  return { created: await createMissingReminders(repositories, userId, bonsaiId, context.preview) };
}

export async function replaceCarePlan(
  repositories: CarePlanServiceRepositories,
  userId: string,
  bonsaiId: number,
  now = new Date(),
): Promise<{ cancelled: number; created: number }> {
  const context = await getOwnedContext(repositories, userId, bonsaiId, now, true);
  await assertEntitlement(repositories, userId);
  const cancelled = await repositories.cancelOpenCarePlanReminders(userId, bonsaiId, {
    speciesId: context.species!.id,
    version: CARE_PLAN_VERSION,
  });
  const created = await createMissingReminders(repositories, userId, bonsaiId, context.preview);
  await repositories.setBonsaiCarePlanState(userId, bonsaiId, {
    care_plan_active: true,
    care_plan_version: CARE_PLAN_VERSION,
    care_plan_replaced_at: now.toISOString(),
  });
  return { cancelled, created };
}
