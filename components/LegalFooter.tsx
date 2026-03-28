import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { shouldHideNavigation } from "./Navigation";

interface LegalFooterProps {
  onOpenCookieSettings: () => void;
}

export default function LegalFooter({ onOpenCookieSettings }: LegalFooterProps) {
  const router = useRouter();
  const { status } = useSession();
  const isCompact = !shouldHideNavigation(router.pathname, status);

  return (
    <footer className={`legal-footer mx-auto w-full max-w-6xl px-4 ${isCompact ? "legal-footer--compact pb-28 pt-3" : "mt-10 pb-32 pt-4"}`}>
      {isCompact ? (
        <div className="legal-footer__compact">
          <Link href="/impressum" className="legal-footer__compact-link">
            Impressum
          </Link>
          <span className="legal-footer__separator" aria-hidden="true">
            ·
          </span>
          <Link href="/datenschutz" className="legal-footer__compact-link">
            Datenschutz
          </Link>
          <span className="legal-footer__separator" aria-hidden="true">
            ·
          </span>
          <button type="button" className="legal-footer__compact-link" onClick={onOpenCookieSettings}>
            Cookie-Einstellungen
          </button>
        </div>
      ) : (
        <div className="legal-footer__panel rounded-[1.75rem] border px-5 py-4 text-sm text-base-content/75">
          <div className="legal-footer__content">
            <p>Rechtliches und Consent-Einstellungen sind jederzeit von hier aus erreichbar.</p>
            <div className="legal-footer__links">
              <Link href="/impressum" className="legal-footer__link">
                Impressum
              </Link>
              <Link href="/datenschutz" className="legal-footer__link">
                Datenschutz
              </Link>
              <button type="button" className="legal-footer__link" onClick={onOpenCookieSettings}>
                Cookie-Einstellungen
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
