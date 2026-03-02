import type { AppProps } from "next/app";
import { useEffect, useState } from "react";
import { SessionProvider } from "next-auth/react";
import Analytics from "../components/Analytics";
import CookieBanner from "../components/CookieBanner";
import LegalFooter from "../components/LegalFooter";
import Navigation from "../components/Navigation";
import { readAnalyticsConsent, type AnalyticsConsent, writeAnalyticsConsent } from "../lib/consent";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [consent, setConsent] = useState<AnalyticsConsent>("unset");
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const storedConsent = readAnalyticsConsent();
    setConsent(storedConsent);
    setBannerOpen(storedConsent === "unset");
  }, []);

  function handleAcceptAnalytics() {
    writeAnalyticsConsent("accepted");
    setConsent("accepted");
    setBannerOpen(false);
  }

  function handleRejectAnalytics() {
    writeAnalyticsConsent("rejected");
    setConsent("rejected");
    setBannerOpen(false);
  }

  return (
    <SessionProvider session={pageProps.session}>
      <Analytics enabled={consent === "accepted"} />
      <div data-theme="bonsai" className="app-shell min-h-screen">
        <Component {...pageProps} />
        <LegalFooter onOpenCookieSettings={() => setBannerOpen(true)} />
        <Navigation />
        <CookieBanner
          consent={consent}
          isOpen={bannerOpen}
          onAcceptAnalytics={handleAcceptAnalytics}
          onRejectAnalytics={handleRejectAnalytics}
          onClose={() => setBannerOpen(false)}
        />
      </div>
    </SessionProvider>
  );
}
