export const STYLE_OPTIONS = [
  "Chokkan",
  "Moyogi",
  "Shakan",
  "Kengai",
  "Han-Kengai",
  "Bunjingi",
  "Fukinagashi",
  "Sokan",
  "Kabudachi",
  "Yose-ue",
  "Hokidachi",
  "Ishitsuki",
  "Neagari",
  "Sonstiger",
] as const;

export const INDOOR_OUTDOOR_OPTIONS = ["INDOOR", "OUTDOOR", "BEIDES"] as const;
export const HEALTH_STATUS_OPTIONS = ["UNBEKANNT", "SEHR_GUT", "GUT", "BEOBACHTEN", "KRITISCH"] as const;
export const DEVELOPMENT_STAGE_OPTIONS = ["ROHLING", "IN_GESTALTUNG", "VERFEINERUNG", "REIF"] as const;
export const WINTER_HARDINESS_OPTIONS = ["NICHT_WINTERHART", "BEDINGT_WINTERHART", "WINTERHART"] as const;
export const SUN_EXPOSURE_OPTIONS = ["VOLLE_SONNE", "HALBSCHATTEN", "SCHATTEN"] as const;
export const ENTRY_TYPE_OPTIONS = ["GIESSEN", "DUENGEN", "SCHNEIDEN", "DRAHTEN", "UMTOPFEN", "KONTROLLE", "FOTO_UPDATE", "SONSTIGES"] as const;
export const REMINDER_STATUS_OPTIONS = ["PENDING", "DONE", "SNOOZED"] as const;
export const POST_TYPE_OPTIONS = ["SHOWCASE", "HELP"] as const;

export type StyleOption = (typeof STYLE_OPTIONS)[number];
export type IndoorOutdoorOption = (typeof INDOOR_OUTDOOR_OPTIONS)[number];
export type HealthStatusOption = (typeof HEALTH_STATUS_OPTIONS)[number];
export type DevelopmentStageOption = (typeof DEVELOPMENT_STAGE_OPTIONS)[number];
export type WinterHardinessOption = (typeof WINTER_HARDINESS_OPTIONS)[number];
export type SunExposureOption = (typeof SUN_EXPOSURE_OPTIONS)[number];
export type EntryTypeOption = (typeof ENTRY_TYPE_OPTIONS)[number];
export type ReminderStatusOption = (typeof REMINDER_STATUS_OPTIONS)[number];
export type PostTypeOption = (typeof POST_TYPE_OPTIONS)[number];

export const INDOOR_OUTDOOR_LABELS: Record<IndoorOutdoorOption, string> = {
  INDOOR: "Indoor",
  OUTDOOR: "Outdoor",
  BEIDES: "Beides",
};

export const HEALTH_STATUS_LABELS: Record<HealthStatusOption, string> = {
  UNBEKANNT: "Unbekannt",
  SEHR_GUT: "Sehr gut",
  GUT: "Gut",
  BEOBACHTEN: "Beobachten",
  KRITISCH: "Kritisch",
};

export const DEVELOPMENT_STAGE_LABELS: Record<DevelopmentStageOption, string> = {
  ROHLING: "Rohling",
  IN_GESTALTUNG: "In Gestaltung",
  VERFEINERUNG: "Verfeinerung",
  REIF: "Reif",
};

export const WINTER_HARDINESS_LABELS: Record<WinterHardinessOption, string> = {
  NICHT_WINTERHART: "Nicht winterhart",
  BEDINGT_WINTERHART: "Bedingt winterhart",
  WINTERHART: "Winterhart",
};

export const SUN_EXPOSURE_LABELS: Record<SunExposureOption, string> = {
  VOLLE_SONNE: "Volle Sonne",
  HALBSCHATTEN: "Halbschatten",
  SCHATTEN: "Schatten",
};

export const ENTRY_TYPE_LABELS: Record<EntryTypeOption, string> = {
  GIESSEN: "Gießen",
  DUENGEN: "Düngen",
  SCHNEIDEN: "Schneiden",
  DRAHTEN: "Drahten",
  UMTOPFEN: "Umtopfen",
  KONTROLLE: "Kontrolle",
  FOTO_UPDATE: "Foto-Update",
  SONSTIGES: "Sonstiges",
};

export const REMINDER_STATUS_LABELS: Record<ReminderStatusOption, string> = {
  PENDING: "Offen",
  DONE: "Erledigt",
  SNOOZED: "Verschoben",
};

export const POST_TYPE_LABELS: Record<PostTypeOption, string> = {
  SHOWCASE: "Praesentation",
  HELP: "Hilfe",
};
