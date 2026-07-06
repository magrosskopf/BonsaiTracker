import type { ZodError } from "zod";
import type { BonsaiFormValues } from "@/types/forms";

export interface ValidationErrorDetails {
  formErrors?: string[];
  fieldErrors?: Record<string, string[] | undefined>;
}

const BONSAI_FIELD_LABELS: Record<keyof BonsaiFormValues, string> = {
  name: "Name",
  species: "Art",
  latinName: "Botanischer Name",
  location: "Standort",
  indoorOutdoor: "Indoor / Outdoor",
  age: "Alter in Jahren",
  heightCm: "Hoehe in cm",
  widthCm: "Breite in cm",
  trunkDiameterMm: "Stammdurchmesser in mm",
  style: "Stil",
  customStyle: "Eigener Stil",
  ownedSince: "Besitz seit",
  acquiredFrom: "Herkunft / Kaufquelle",
  purchasePriceCents: "Kaufpreis in Euro",
  healthStatus: "Gesundheitsstatus",
  developmentStage: "Entwicklungsstand",
  lastRepotDate: "Letztes Umtopfen",
  nextRepotDue: "Naechstes Umtopfen",
  winterHardiness: "Winterhaerte",
  sunExposure: "Sonneneinstrahlung",
  potType: "Topfart",
  potColor: "Topffarbe",
  wateringNotes: "Bewaesserung",
  fertilizingNotes: "Duengung",
  pruningNotes: "Schnitt",
  wiringNotes: "Drahten",
  notes: "Notizen",
};

function isBonsaiFieldKey(field: string): field is keyof BonsaiFormValues {
  return field in BONSAI_FIELD_LABELS;
}

function withFieldLabel(field: string, message: string): string {
  const label = isBonsaiFieldKey(field) ? BONSAI_FIELD_LABELS[field] : undefined;
  return label ? `${label}: ${message}` : message;
}

export function getFirstValidationMessage(details: ValidationErrorDetails | undefined, fallback: string): string {
  const formError = details?.formErrors?.find((message) => Boolean(message));
  if (formError) {
    return formError;
  }

  if (details?.fieldErrors) {
    for (const [field, messages] of Object.entries(details.fieldErrors)) {
      const fieldError = messages?.find((message) => Boolean(message));
      if (fieldError) {
        return withFieldLabel(field, fieldError);
      }
    }
  }

  return fallback;
}

export function getZodErrorMessage(error: ZodError, fallback: string): { details: ValidationErrorDetails; message: string } {
  const details = error.flatten();
  return {
    details,
    message: getFirstValidationMessage(details, fallback),
  };
}
