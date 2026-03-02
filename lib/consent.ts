export type AnalyticsConsent = "accepted" | "rejected" | "unset";

export const ANALYTICS_CONSENT_STORAGE_KEY = "bonsai.analytics-consent";

function isStoredConsent(value: string | null): value is Exclude<AnalyticsConsent, "unset"> {
  return value === "accepted" || value === "rejected";
}

export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === "undefined") {
    return "unset";
  }

  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
    return isStoredConsent(value) ? value : "unset";
  } catch {
    return "unset";
  }
}

export function writeAnalyticsConsent(consent: Exclude<AnalyticsConsent, "unset">) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, consent);
  } catch {
    return;
  }
}

