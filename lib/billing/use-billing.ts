import { useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { BillingStatus } from "@/lib/billing/plus";

const EMPTY_BILLING_STATUS: BillingStatus = { offer: null, purchaseState: "unavailable", canManage: false };

export function useBilling() {
  const [status, setStatus] = useState<BillingStatus>(EMPTY_BILLING_STATUS);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refreshStatus(): Promise<void> {
    try {
      const response = await apiFetch("/api/billing/status");
      const json = (await response.json()) as { ok: boolean; data?: BillingStatus };
      if (response.ok && json.ok && json.data) setStatus(json.data);
    } catch {
      setStatus(EMPTY_BILLING_STATUS);
    }
  }

  async function startCheckout(bonsaiId?: number): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const response = await apiFetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bonsaiId ? { bonsaiId } : {}),
      });
      const json = (await response.json()) as {
        ok: boolean;
        data?: { kind: "redirect" | "processing" | "manage"; url?: string | null };
        error?: { message: string };
      };
      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Stripe Checkout konnte nicht gestartet werden. Bitte versuche es später erneut.");
        return;
      }
      if (json.data.kind === "processing") {
        setStatus((current) => ({ ...current, purchaseState: "checkout_processing", canManage: true }));
        return;
      }
      if (json.data.kind === "manage") {
        setStatus((current) => ({ ...current, purchaseState: "subscription_processing", canManage: true }));
        return;
      }
      if (!json.data.url) {
        setError("Stripe Checkout konnte nicht gestartet werden. Bitte versuche es später erneut.");
        return;
      }
      window.location.href = json.data.url;
    } catch {
      setError("Stripe Checkout konnte nicht gestartet werden. Bitte versuche es später erneut.");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal(): Promise<void> {
    setBusy(true);
    setError(null);
    try {
      const response = await apiFetch("/api/billing/portal", { method: "POST" });
      const json = (await response.json()) as { ok: boolean; data?: { url: string | null }; error?: { message: string } };
      if (!response.ok || !json.ok || !json.data?.url) {
        setError(json.error?.message ?? "Die Aboverwaltung konnte nicht geöffnet werden.");
        return;
      }
      window.location.href = json.data.url;
    } catch {
      setError("Die Aboverwaltung konnte nicht geöffnet werden.");
    } finally {
      setBusy(false);
    }
  }

  const markCheckoutConfirmed = () => setStatus((current) => ({ ...current, purchaseState: "subscription_processing", canManage: true }));
  const markEntitlementActive = () => setStatus((current) => ({ ...current, purchaseState: "subscribed" }));

  return { status, busy, error, refreshStatus, startCheckout, openPortal, markCheckoutConfirmed, markEntitlementActive };
}
