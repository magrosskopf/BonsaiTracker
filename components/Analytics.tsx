import Script from "next/script";
import { getAnalyticsMeasurementId } from "@/lib/consent";

const measurementId = getAnalyticsMeasurementId();

interface AnalyticsProps {
  enabled: boolean;
}

export default function Analytics({ enabled }: AnalyticsProps) {
  if (!enabled || !measurementId) {
    return null;
  }

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window['ga-disable-${measurementId}'] = false;
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = window.gtag || gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
