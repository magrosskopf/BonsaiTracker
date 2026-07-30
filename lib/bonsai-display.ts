const UNKNOWN_DISPLAY_VALUES = new Set(["unbekannt"]);
const BONSAI_DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function normalizeBonsaiDisplayText(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  if (trimmed === "") {
    return null;
  }

  return UNKNOWN_DISPLAY_VALUES.has(trimmed.toLocaleLowerCase("de-DE")) ? null : trimmed;
}

export function formatBonsaiDisplayText(
  value: string | null | undefined,
  fallback = "Nicht angegeben",
): string {
  return normalizeBonsaiDisplayText(value) ?? fallback;
}

export function formatBonsaiAge(age: number | null, fallback = "Nicht angegeben"): string {
  return age === null ? fallback : `${age} Jahre`;
}

export function formatBonsaiDate(
  value: string | null | undefined,
  fallback = "Nicht angegeben",
): string {
  const normalized = normalizeBonsaiDisplayText(value);
  return normalized ? BONSAI_DATE_FORMATTER.format(new Date(normalized)) : fallback;
}
