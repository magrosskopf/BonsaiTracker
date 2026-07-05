import type { BonsaiFormValues } from "@/types/forms";
import {
  DEVELOPMENT_STAGE_LABELS,
  DEVELOPMENT_STAGE_OPTIONS,
  HEALTH_STATUS_LABELS,
  HEALTH_STATUS_OPTIONS,
  INDOOR_OUTDOOR_LABELS,
  INDOOR_OUTDOOR_OPTIONS,
  STYLE_OPTIONS,
  SUN_EXPOSURE_LABELS,
  SUN_EXPOSURE_OPTIONS,
  WINTER_HARDINESS_LABELS,
  WINTER_HARDINESS_OPTIONS,
  ENTRY_TYPE_LABELS,
  ENTRY_TYPE_OPTIONS,
} from "@/types/domain";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "textarea" | "select" | "date";
  required?: boolean;
  min?: number;
  max?: number | string;
  options?: SelectOption[];
  placeholder?: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel" | "search" | "email" | "url";
  condition?: (values: BonsaiFormValues) => boolean;
}

export interface FormStepConfig {
  id: string;
  title: string;
  description: string;
  sectionTitle: string;
  fields: FormFieldConfig[];
}

function asOptions<T extends readonly string[]>(values: T, labels: Record<T[number], string>): SelectOption[] {
  return values.map((value) => ({
    value,
    label: (labels as Record<string, string>)[value],
  }));
}

export const bonsaiFormStepConfigs: FormStepConfig[] = [
  {
    id: "grunddaten",
    title: "Grunddaten",
    description: "Identität, Art und Standort des Bonsai.",
    sectionTitle: "Grunddaten",
    fields: [
      { key: "name", label: "Name", type: "text", required: true },
      { key: "species", label: "Art", type: "text" },
      { key: "latinName", label: "Botanischer Name", type: "text" },
      { key: "location", label: "Standort", type: "text", required: true },
      {
        key: "indoorOutdoor",
        label: "Indoor / Outdoor",
        type: "select",
        required: true,
        options: asOptions(INDOOR_OUTDOOR_OPTIONS, INDOOR_OUTDOOR_LABELS),
      },
    ],
  },
  {
    id: "gestaltung",
    title: "Masse & Stil",
    description: "Physische Masse und gestalterische Einordnung.",
    sectionTitle: "Masse und Gestaltung",
    fields: [
      { key: "age", label: "Alter in Jahren", type: "number", min: 0, max: 200 },
      { key: "heightCm", label: "Höhe in cm", type: "number", min: 0, max: 500 },
      { key: "widthCm", label: "Breite in cm", type: "number", min: 0, max: 500 },
      { key: "trunkDiameterMm", label: "Stammdurchmesser in mm", type: "number", min: 0, max: 1000 },
      {
        key: "style",
        label: "Stil",
        type: "select",
        options: STYLE_OPTIONS.map((option) => ({ value: option, label: option })),
      },
      {
        key: "customStyle",
        label: "Eigener Stil",
        type: "text",
        required: true,
        condition: (values) => values.style === "Sonstiger",
      },
    ],
  },
  {
    id: "herkunft",
    title: "Herkunft",
    description: "Besitz, Entwicklung und Historie.",
    sectionTitle: "Herkunft und Entwicklung",
    fields: [
      { key: "ownedSince", label: "Besitz seit", type: "date" },
      { key: "acquiredFrom", label: "Herkunft / Kaufquelle", type: "text" },
      {
        key: "purchasePriceCents",
        label: "Kaufpreis in Euro",
        type: "text",
        inputMode: "decimal",
        placeholder: "z. B. 12,50",
      },
      {
        key: "healthStatus",
        label: "Gesundheitsstatus",
        type: "select",
        options: asOptions(HEALTH_STATUS_OPTIONS, HEALTH_STATUS_LABELS),
      },
      {
        key: "developmentStage",
        label: "Entwicklungsstand",
        type: "select",
        options: asOptions(DEVELOPMENT_STAGE_OPTIONS, DEVELOPMENT_STAGE_LABELS),
      },
      { key: "lastRepotDate", label: "Letztes Umtopfen", type: "date" },
      { key: "nextRepotDue", label: "Nächstes Umtopfen", type: "date" },
    ],
  },
  {
    id: "pflege",
    title: "Pflegeprofil",
    description: "Pflegehinweise und optionale Kulturdetails.",
    sectionTitle: "Pflegeprofil",
    fields: [
      {
        key: "winterHardiness",
        label: "Winterhärte",
        type: "select",
        options: [{ value: "", label: "Bitte wählen" }, ...asOptions(WINTER_HARDINESS_OPTIONS, WINTER_HARDINESS_LABELS)],
      },
      {
        key: "sunExposure",
        label: "Sonneneinstrahlung",
        type: "select",
        options: [{ value: "", label: "Bitte wählen" }, ...asOptions(SUN_EXPOSURE_OPTIONS, SUN_EXPOSURE_LABELS)],
      },
      { key: "potType", label: "Topfart", type: "text" },
      { key: "potColor", label: "Topffarbe", type: "text" },
      { key: "wateringNotes", label: "Bewässerung", type: "textarea" },
      { key: "fertilizingNotes", label: "Düngung", type: "textarea" },
      { key: "pruningNotes", label: "Schnitt", type: "textarea" },
      { key: "wiringNotes", label: "Drahten", type: "textarea" },
    ],
  },
  {
    id: "notizen",
    title: "Notizen",
    description: "Freitext und finale Prüfung vor dem Speichern.",
    sectionTitle: "Freitextnotizen",
    fields: [
      { key: "notes", label: "Notizen", type: "textarea" },
    ],
  },
];

export const subEntryFieldConfigs = {
  entryTypeOptions: ENTRY_TYPE_OPTIONS.map((value) => ({ value, label: ENTRY_TYPE_LABELS[value] })),
  healthStatusOptions: [{ value: "", label: "Keine" }, ...asOptions(HEALTH_STATUS_OPTIONS, HEALTH_STATUS_LABELS)],
};
