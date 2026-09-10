import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { createEntitlementPoller, stripCheckoutParams, type EntitlementPoller } from "@/lib/billing/checkout-return";

type ReturnPhase = "idle" | "verifying" | "processing" | "ready" | "timeout" | "cancelled" | "invalid";

interface CheckoutReturnNoticeProps {
  context: "bonsai" | "profile";
  checkEntitlement: () => Promise<boolean>;
  canManage: boolean;
  onManage: () => void;
  onCheckoutConfirmed?: () => void;
}

export default function CheckoutReturnNotice({ context, checkEntitlement, canManage, onManage, onCheckoutConfirmed }: CheckoutReturnNoticeProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<ReturnPhase>("idle");
  const processed = useRef<string | null>(null);
  const poller = useRef<EntitlementPoller | null>(null);
  const checkEntitlementRef = useRef(checkEntitlement);
  checkEntitlementRef.current = checkEntitlement;

  useEffect(() => {
    if (!router.isReady) return;
    const checkout = Array.isArray(router.query.checkout) ? router.query.checkout[0] : router.query.checkout;
    const sessionId = Array.isArray(router.query.session_id) ? router.query.session_id[0] : router.query.session_id;
    if (!checkout) return;
    const key = `${checkout}:${sessionId ?? ""}`;
    if (processed.current === key) return;
    processed.current = key;

    const cleanUrl = () => router.replace({ pathname: router.pathname, query: stripCheckoutParams(router.query) }, undefined, { shallow: true });
    if (checkout === "cancelled") {
      setPhase("cancelled");
      void cleanUrl();
      return;
    }
    if (checkout !== "success" || !sessionId) {
      setPhase("invalid");
      void cleanUrl();
      return;
    }

    setPhase("verifying");
    void (async () => {
      const response = await apiFetch(`/api/billing/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
      const json = (await response.json()) as { ok: boolean; data?: { confirmed: true } };
      if (response.ok && json.ok && json.data?.confirmed) {
        onCheckoutConfirmed?.();
        setPhase("processing");
      } else {
        setPhase("invalid");
      }
      await cleanUrl();
    })();
  }, [onCheckoutConfirmed, router]);

  useEffect(() => {
    if (phase !== "processing") return;
    const controller = createEntitlementPoller({
      checkAccess: () => checkEntitlementRef.current(),
      isVisible: () => document.visibilityState === "visible",
      onActive: () => setPhase("ready"),
      onTimeout: () => setPhase("timeout"),
    });
    poller.current = controller;
    document.addEventListener("visibilitychange", controller.handleVisibilityChange);
    controller.start();
    return () => {
      document.removeEventListener("visibilitychange", controller.handleVisibilityChange);
      controller.stop();
      poller.current = null;
    };
  }, [phase]);

  if (phase === "idle") return null;
  if (phase === "cancelled") return <div className="alert alert-info">Checkout abgebrochen. Es wurde nichts aktiviert und es wurden keine Reminder erzeugt.</div>;
  if (phase === "invalid") return <div className="alert alert-warning">Der Checkout konnte nicht sicher bestätigt werden. Bitte prüfe dein Abo im Profil oder versuche es später erneut.</div>;
  if (phase === "verifying") return <div className="alert alert-info"><span className="loading loading-spinner loading-sm" />Checkout wird sicher bestätigt …</div>;
  if (phase === "processing") return <div className="alert alert-info"><span className="loading loading-spinner loading-sm" />Zahlung bestätigt. Dein Zugang wird verarbeitet …</div>;
  if (phase === "ready") {
    return context === "bonsai" ? (
      <div className="alert alert-success">Zahlung bestätigt. Als Nächstes: <a className="link font-semibold" href="#pflegeplan">Pflegeplan aktivieren</a>.</div>
    ) : (
      <div className="alert alert-success">Zahlung bestätigt. Wähle jetzt einen Bonsai und aktiviere dort den Pflegeplan. <Link className="link font-semibold" href="/dashboard">Bonsai auswählen</Link></div>
    );
  }
  return (
    <div className="alert alert-warning flex-col items-start">
      <span>Die Zahlung ist bestätigt, aber der Zugang ist noch nicht aktiv. Prüfe erneut oder verwalte dein Abo.</span>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-sm" onClick={() => setPhase("processing")}>Erneut prüfen</button>
        {canManage ? <button className="btn btn-outline btn-sm" onClick={onManage}>Abo verwalten</button> : null}
        <a className="btn btn-ghost btn-sm" href="mailto:info@magrosskopf.de">Support kontaktieren</a>
      </div>
    </div>
  );
}
