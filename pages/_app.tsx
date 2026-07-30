import type { AppProps } from "next/app";
import Head from "next/head";
import { useEffect, useState } from "react";
import Analytics from "../components/Analytics";
import { AuthProvider } from "../components/AuthProvider";
import CookieBanner from "../components/CookieBanner";
import LegalFooter from "../components/LegalFooter";
import Navigation from "../components/Navigation";
import {
  enableAnalyticsTracking,
  readAnalyticsConsent,
  revokeAnalyticsConsent,
  type AnalyticsConsent,
  writeAnalyticsConsent,
} from "../lib/consent";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [consent, setConsent] = useState<AnalyticsConsent>("unset");
  const [bannerOpen, setBannerOpen] = useState(false);

  useEffect(() => {
    const storedConsent = readAnalyticsConsent();
    if (storedConsent === "accepted") {
      enableAnalyticsTracking();
    }
    if (storedConsent === "rejected") {
      revokeAnalyticsConsent();
    }
    setConsent(storedConsent);
    setBannerOpen(storedConsent === "unset");
  }, []);

  function handleAcceptAnalytics() {
    writeAnalyticsConsent("accepted");
    enableAnalyticsTracking();
    setConsent("accepted");
    setBannerOpen(false);
  }

  function handleRejectAnalytics() {
    writeAnalyticsConsent("rejected");
    revokeAnalyticsConsent();
    setConsent("rejected");
    setBannerOpen(false);
  }

  return (
    <AuthProvider>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
    </AuthProvider>
  );
}
