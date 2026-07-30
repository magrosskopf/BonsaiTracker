import type { NextApiRequest, NextApiResponse } from "next";
import { ZodError } from "zod";
import { requireUser } from "@/lib/authz";
import { fail, ok } from "@/lib/api/response";
import { mapBonsaiDetail } from "@/lib/mappers";
import { logError } from "@/lib/observability";
import { getOwnedBonsai, patchOwnedBonsai, setOwnedBonsaiArchived } from "@/lib/repositories/bonsais";
import { removeManagedMediaBatch } from "@/lib/storage";
import { bonsaiPatchSchema, bonsaiPersistedSchema } from "@/lib/validators/bonsai";

function parseId(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function safeCleanup(mediaPaths: string[], context: Record<string, unknown>): Promise<void> {
  try {
    await removeManagedMediaBatch(mediaPaths);
  } catch (error) {
    logError("bonsai.removed_media_cleanup_failed", error, context);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  const actor = await requireUser(req, res);
  if (!actor) {
    return;
  }

  const bonsaiId = parseId(req.query.id);
  if (!bonsaiId) {
    fail(res, "BAD_REQUEST", "Ungültige Bonsai-ID.", 400);
    return;
  }

  if (req.method === "GET") {
    const bonsai = await getOwnedBonsai(actor.id, bonsaiId, true);

    if (!bonsai) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    ok(res, mapBonsaiDetail(bonsai));
    return;
  }

  if (req.method === "PATCH") {
    const restore = req.body?.restore === true;
    const existing = await getOwnedBonsai(actor.id, bonsaiId, restore);
    if (!existing) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    if (restore) {
      await setOwnedBonsaiArchived(actor.id, bonsaiId, false);
      const restored = await getOwnedBonsai(actor.id, bonsaiId, true);
      ok(res, mapBonsaiDetail(restored!));
      return;
    }

    try {
      const patch = bonsaiPatchSchema.parse(req.body);
      const candidate = bonsaiPersistedSchema.parse({
        name: existing.name,
        species: existing.species,
        latinName: existing.latin_name,
        location: existing.location,
        indoorOutdoor: existing.indoor_outdoor,
        age: existing.age,
        heightCm: existing.height_cm,
        widthCm: existing.width_cm,
        trunkDiameterMm: existing.trunk_diameter_mm,
        ownedSince: existing.owned_since,
        acquiredFrom: existing.acquired_from,
        purchasePriceCents: existing.purchase_price_cents,
        healthStatus: existing.health_status,
        developmentStage: existing.development_stage,
        lastRepotDate: existing.last_repot_date,
        nextRepotDue: existing.next_repot_due,
        winterHardiness: existing.winter_hardiness,
        sunExposure: existing.sun_exposure,
        potType: existing.pot_type,
        potColor: existing.pot_color,
        wateringNotes: existing.watering_notes,
        fertilizingNotes: existing.fertilizing_notes,
        pruningNotes: existing.pruning_notes,
        wiringNotes: existing.wiring_notes,
        notes: existing.notes,
        style: patch.style ?? existing.style,
        customStyle: patch.style
          ? patch.style === "Sonstiger"
            ? (patch.customStyle ?? existing.custom_style)
            : null
          : patch.customStyle ?? existing.custom_style,
        images: patch.images ?? existing.images,
      });

      const nextImages = patch.images ?? existing.images;
      const removedImages = existing.images.filter((image) => !nextImages.includes(image));
      const addedImages = nextImages.filter((image) => !existing.images.includes(image));
      await patchOwnedBonsai(actor.id, bonsaiId, { ...patch, customStyle: candidate.style === "Sonstiger" ? candidate.customStyle : null }, addedImages, removedImages);
      const updated = await getOwnedBonsai(actor.id, bonsaiId, true);

      await safeCleanup(removedImages, { userId: actor.id, bonsaiId });

      ok(res, mapBonsaiDetail(updated!));
      return;
    } catch (error) {
      if (error instanceof ZodError) {
        fail(res, "VALIDATION_ERROR", "Die Bonsai-Daten sind ungültig.", 422, error.flatten());
        return;
      }
      fail(res, "INTERNAL_SERVER_ERROR", "Der Bonsai konnte nicht aktualisiert werden.", 500);
      return;
    }
  }

  if (req.method === "DELETE") {
    const existing = await getOwnedBonsai(actor.id, bonsaiId);
    if (!existing) {
      fail(res, "NOT_FOUND", "Bonsai nicht gefunden.", 404);
      return;
    }

    await setOwnedBonsaiArchived(actor.id, bonsaiId, true);

    res.status(204).end();
    return;
  }

  res.setHeader("Allow", "GET, PATCH, DELETE");
  fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
}
