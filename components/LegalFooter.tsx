import Link from "next/link";

interface LegalFooterProps {
  onOpenCookieSettings: () => void;
}

export default function LegalFooter({ onOpenCookieSettings }: LegalFooterProps) {
  return (
    <footer className="legal-footer mx-auto mt-10 w-full max-w-6xl px-4 pb-32 pt-4">
      <div className="legal-footer__panel rounded-[1.75rem] border px-5 py-4 text-sm text-base-content/75">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Rechtliches und Consent-Einstellungen sind jederzeit von hier aus erreichbar.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/impressum" className="link link-hover">
              Impressum
            </Link>
            <Link href="/datenschutz" className="link link-hover">
              Datenschutz
            </Link>
            <button type="button" className="link link-hover text-left" onClick={onOpenCookieSettings}>
              Cookie-Einstellungen
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

