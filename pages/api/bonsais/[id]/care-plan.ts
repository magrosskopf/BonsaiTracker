import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { CarePlanError, activateCarePlan, getBonsaiCarePlanContext, replaceCarePlan, syncCarePlan } from "@/lib/care-plans/service";
import { supabaseCarePlanRepositories } from "@/lib/care-plans/repositories";

const actionSchema = z.object({
  action: z.enum(["activate", "sync", "replace"]),
});

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function failCarePlan(res: NextApiResponse, error: CarePlanError): void {
  if (error.code === "NOT_FOUND") {
    fail(res, "NOT_FOUND", error.message, 404);
    return;
  }
  if (error.code === "ENTITLEMENT_REQUIRED") {
    fail(res, "PAYMENT_REQUIRED", error.message, 402);
    return;
  }
  fail(res, "BAD_REQUEST", error.message, 400);
}

function mapContext(context: Awaited<ReturnType<typeof getBonsaiCarePlanContext>>) {
  return {
    bonsaiId: context.bonsai.id,
    carePlanSpeciesId: context.bonsai.care_plan_species_id,
    carePlanActive: context.bonsai.care_plan_active,
    carePlanVersion: context.bonsai.care_plan_version,
    species: context.species,
    preview: context.preview,
    entitlementActive: context.entitlementActive,
    replacementSuggested: context.replacementSuggested,
    note: "Pflegeplan-Termine sind typische Monatszeitpunkte. Bitte pruefe deinen Bonsai vor jeder Massnahme.",
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }
  const bonsaiId = parseId(req.query.id);
  if (!bonsaiId) {
    fail(res, "BAD_REQUEST", "Ungueltige Bonsai-ID.", 400);
    return;
  }

  try {
    if (req.method === "GET") {
      const context = await getBonsaiCarePlanContext(supabaseCarePlanRepositories, actor.id, bonsaiId);
      ok(res, mapContext(context));
      return;
    }
    if (req.method === "POST") {
      const { action } = actionSchema.parse(req.body);
      const result =
        action === "activate"
          ? await activateCarePlan(supabaseCarePlanRepositories, actor.id, bonsaiId)
          : action === "sync"
            ? await syncCarePlan(supabaseCarePlanRepositories, actor.id, bonsaiId)
            : await replaceCarePlan(supabaseCarePlanRepositories, actor.id, bonsaiId);
      ok(res, result);
      return;
    }
  } catch (error) {
    if (error instanceof CarePlanError) {
      failCarePlan(res, error);
      return;
    }
    if (error instanceof ZodError) {
      fail(res, "VALIDATION_ERROR", "Die Pflegeplan-Aktion ist ungueltig.", 422, error.flatten());
      return;
    }
    fail(res, "INTERNAL_SERVER_ERROR", "Der Pflegeplan konnte nicht verarbeitet werden.", 500);
    return;
  }

  res.setHeader("Allow", "GET, POST");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
