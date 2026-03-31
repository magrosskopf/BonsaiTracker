export type AnalyticsConsent = "accepted" | "rejected" | "unset";

export const ANALYTICS_CONSENT_STORAGE_KEY = "bonsai.analytics-consent";

const ANALYTICS_COOKIE_PREFIXES = ["_ga", "_gid", "_gat", "_gac", "_dc_gtm"] as const;

function isStoredConsent(value: string | null): value is Exclude<AnalyticsConsent, "unset"> {
  return value === "accepted" || value === "rejected";
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function getAnalyticsDisableFlag(measurementId: string): string {
  return `ga-disable-${measurementId}`;
}

function getDomainVariants(hostname: string): string[] {
  const normalizedHostname = hostname.trim().replace(/^\.+/, "");
  if (!normalizedHostname || normalizedHostname === "localhost") {
    return [];
  }

  const parts = normalizedHostname.split(".").filter(Boolean);
  const variants = new Set<string>();
  for (let index = 0; index < parts.length - 1; index += 1) {
    const domain = parts.slice(index).join(".");
    variants.add(domain);
    variants.add(`.${domain}`);
  }

  return Array.from(variants);
}

function expireCookie(name: string, domain?: string) {
  const domainAttribute = domain ? `; domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/${domainAttribute}; SameSite=Lax`;
}

function isAnalyticsCookie(name: string): boolean {
  return ANALYTICS_COOKIE_PREFIXES.some((prefix) => name === prefix || name.startsWith(`${prefix}_`));
}

export function getAnalyticsMeasurementId(): string | null {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return measurementId ? measurementId : null;
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

export function enableAnalyticsTracking(measurementId = getAnalyticsMeasurementId()) {
  if (!isBrowser() || !measurementId) {
    return;
  }

  const analyticsWindow = window as unknown as Record<string, unknown> & {
    gtag?: (...args: unknown[]) => void;
  };
  analyticsWindow[getAnalyticsDisableFlag(measurementId)] = false;
}

export function disableAnalyticsTracking(measurementId = getAnalyticsMeasurementId()) {
  if (!isBrowser() || !measurementId) {
    return;
  }

  const analyticsWindow = window as unknown as Record<string, unknown> & {
    gtag?: (...args: unknown[]) => void;
  };
  analyticsWindow[getAnalyticsDisableFlag(measurementId)] = true;

  const gtag = analyticsWindow.gtag;
  if (typeof gtag === "function") {
    gtag("consent", "update", { analytics_storage: "denied" });
  }
}

export function clearAnalyticsCookies() {
  if (!isBrowser()) {
    return;
  }

  const cookieNames = document.cookie
    .split(";")
    .map((entry) => entry.trim().split("=")[0]?.trim())
    .filter((name): name is string => Boolean(name) && isAnalyticsCookie(name));

  const namesToExpire = new Set<string>([
    ...cookieNames,
    "_ga",
    "_gid",
    "_gat",
    "_gat_gtag_UA",
    "_gat_gtag_GA",
  ]);

  const domainVariants = getDomainVariants(window.location.hostname);
  for (const name of namesToExpire) {
    expireCookie(name);
    for (const domain of domainVariants) {
      expireCookie(name, domain);
    }
  }
}

export function revokeAnalyticsConsent(measurementId = getAnalyticsMeasurementId()) {
  disableAnalyticsTracking(measurementId);
  clearAnalyticsCookies();
}
