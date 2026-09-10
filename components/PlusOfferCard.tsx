import type { BillingStatus } from "@/lib/billing/plus";

interface PlusOfferCardProps extends BillingStatus {
  busy?: boolean;
  entitlementActive?: boolean;
  onCheckout: () => void;
  onManage: () => void;
}

export default function PlusOfferCard({ offer, purchaseState, canManage, busy = false, entitlementActive = false, onCheckout, onManage }: PlusOfferCardProps) {
  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold">{offer?.productName ?? "Bonsai Tracker Plus"}</h3>
          {offer ? <p className="text-lg font-bold text-primary">{offer.priceLabel} {offer.billingPeriodLabel}</p> : null}
        </div>
        <p className="text-sm">Enthalten: Pflegeplan-Vorschau für 12 Monate und automatische System-Reminder für typische saisonale Arbeiten.</p>
        <p className="text-sm text-base-content/70">Das Abo verlängert sich automatisch. Du kannst es jederzeit im Profil über die Aboverwaltung kündigen.</p>
        <p className="text-sm text-base-content/70">Die Zahlung schaltet den Zugang frei. Reminder entstehen erst, wenn du den Pflegeplan anschließend ausdrücklich aktivierst.</p>
        {!offer || purchaseState === "unavailable" ? (
          <div className="space-y-3">
            <div className="alert alert-info text-sm">Der aktuelle Preis ist derzeit nicht verfügbar. Bitte versuche es später erneut.</div>
            {canManage ? <button className="btn btn-outline btn-sm" disabled={busy} onClick={onManage}>Abo verwalten</button> : null}
          </div>
        ) : purchaseState === "checkout_processing" ? (
          <div className="alert alert-info text-sm">Ein Checkout wird bereits verarbeitet. Bitte schließe ihn ab oder prüfe den Zugang erneut.</div>
        ) : (purchaseState === "subscribed" || purchaseState === "subscription_processing") && !entitlementActive ? (
          <div className="space-y-3">
            <div className="alert alert-info text-sm">Deine Bonsai-Tracker-Plus-Subscription wird verarbeitet. Ein weiteres Abo kann nicht abgeschlossen werden.</div>
            {canManage ? <button className="btn btn-outline btn-sm" disabled={busy} onClick={onManage}>Abo verwalten</button> : null}
          </div>
        ) : purchaseState === "available" ? (
          <button className="btn btn-primary btn-sm" disabled={busy} onClick={onCheckout}>
            {busy ? <span className="loading loading-spinner loading-sm" /> : null}
            {offer.priceLabel} {offer.billingPeriodLabel} kostenpflichtig abonnieren
          </button>
        ) : canManage ? (
          <button className="btn btn-outline btn-sm" disabled={busy} onClick={onManage}>Abo verwalten</button>
        ) : null}
      </div>
    </div>
  );
}
