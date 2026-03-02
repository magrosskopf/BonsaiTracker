import type { AnalyticsConsent } from "@/lib/consent";

interface CookieBannerProps {
  consent: AnalyticsConsent;
  isOpen: boolean;
  onAcceptAnalytics: () => void;
  onRejectAnalytics: () => void;
  onClose: () => void;
}

export default function CookieBanner({
  consent,
  isOpen,
  onAcceptAnalytics,
  onRejectAnalytics,
  onClose,
}: CookieBannerProps) {
  if (!isOpen) {
    return null;
  }

  const canClose = consent !== "unset";

  return (
    <aside className="cookie-banner surface-card" aria-live="polite" aria-label="Cookie-Einstellungen">
      <div className="cookie-banner__content">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Cookies & Datenschutz</p>
          <h2 className="text-xl font-semibold">Optionale Statistik nur mit Einwilligung</h2>
          <p className="text-sm text-base-content/75">
            Wir nutzen nur technisch notwendige Funktionen standardmaessig. Google Analytics wird erst geladen, wenn du
            dem Statistik-Tracking aktiv zustimmst.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="btn btn-outline" onClick={onRejectAnalytics}>
            Nur notwendige Cookies
          </button>
          <button type="button" className="btn btn-primary" onClick={onAcceptAnalytics}>
            Analytics akzeptieren
          </button>
          {canClose ? (
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Schliessen
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

