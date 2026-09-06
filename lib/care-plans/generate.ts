import type { IndoorOutdoorOption } from "@/types/domain";
import { getCarePlanSpecies, type CarePlanSpeciesId } from "./catalog";
import { CARE_PLAN_RULES, CARE_PLAN_VERSION, type CarePlanCareType, type CarePlanRule } from "./rules";

export interface CarePlanPreviewItem {
  date: string;
  targetMonth: string;
  careType: CarePlanCareType;
  title: string;
  note: string;
  ruleId: string;
  speciesId: CarePlanSpeciesId;
  version: string;
}

export interface CarePlanPreviewInput {
  speciesId: string | null | undefined;
  indoorOutdoor?: IndoorOutdoorOption | null;
  from?: string | Date | null;
}

function startOfUtcMonth(value: Date): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1));
}

function addUtcMonths(value: Date, months: number): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth() + months, 1));
}

function dateOnly(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function normalizePlacement(value: IndoorOutdoorOption | null | undefined): "INDOOR" | "OUTDOOR" {
  return value === "INDOOR" ? "INDOOR" : "OUTDOOR";
}

function ruleApplies(rule: CarePlanRule, speciesId: CarePlanSpeciesId, month: number, placement: "INDOOR" | "OUTDOOR"): boolean {
  return rule.speciesIds.includes(speciesId) && rule.months.includes(month) && (!rule.placement || rule.placement === placement);
}

export function generateCarePlanPreview(input: CarePlanPreviewInput): CarePlanPreviewItem[] {
  const species = getCarePlanSpecies(input.speciesId);
  if (!species) {
    return [];
  }

  const from = input.from ? new Date(input.from) : new Date();
  const firstMonth = startOfUtcMonth(from);
  const placement = normalizePlacement(input.indoorOutdoor);
  const items: CarePlanPreviewItem[] = [];

  for (let offset = 0; offset < 12; offset += 1) {
    const targetDate = addUtcMonths(firstMonth, offset);
    const month = targetDate.getUTCMonth() + 1;
    for (const rule of CARE_PLAN_RULES) {
      if (!ruleApplies(rule, species.id, month, placement)) {
        continue;
      }
      const targetMonth = dateOnly(targetDate);
      items.push({
        date: targetMonth,
        targetMonth,
        careType: rule.careType,
        title: rule.title,
        note: rule.note,
        ruleId: rule.id,
        speciesId: species.id,
        version: CARE_PLAN_VERSION,
      });
    }
  }

  return items.sort((left, right) => left.date.localeCompare(right.date) || left.ruleId.localeCompare(right.ruleId));
}
