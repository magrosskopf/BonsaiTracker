import type { NextApiRequest, NextApiResponse } from "next";
import { fail, ok } from "@/lib/api/response";
import { firstQueryValue } from "@/lib/api/request";
import { CarePlanError, getCarePlanPreview } from "@/lib/care-plans/service";
import { INDOOR_OUTDOOR_OPTIONS, type IndoorOutdoorOption } from "@/types/domain";

export default function handler(req: NextApiRequest, res: NextApiResponse): void {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    fail(res, "BAD_REQUEST", `Methode ${req.method} wird nicht unterstützt.`, 400);
    return;
  }

  const speciesId = firstQueryValue(req.query.speciesId);
  const indoorOutdoor = firstQueryValue(req.query.indoorOutdoor);
  const from = firstQueryValue(req.query.from);

  if (indoorOutdoor && !INDOOR_OUTDOOR_OPTIONS.includes(indoorOutdoor as IndoorOutdoorOption)) {
    fail(res, "BAD_REQUEST", "Ungueltiger indoorOutdoor-Wert.", 400);
    return;
  }

  try {
    ok(res, {
      items: getCarePlanPreview({
        speciesId,
        indoorOutdoor: indoorOutdoor as IndoorOutdoorOption | undefined,
        from,
      }),
      note: "Pflegeplan-Termine sind typische Monatszeitpunkte. Bitte pruefe deinen Bonsai vor jeder Massnahme.",
    });
  } catch (error) {
    if (error instanceof CarePlanError) {
      fail(res, "BAD_REQUEST", error.message, 400);
      return;
    }
    fail(res, "INTERNAL_SERVER_ERROR", "Die Pflegeplan-Vorschau konnte nicht geladen werden.", 500);
  }
}
