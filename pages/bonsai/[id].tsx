import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import { apiFetch } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { formatBonsaiAge, formatBonsaiDate, formatBonsaiDisplayText } from "@/lib/bonsai-display";
import { collectBonsaiTimelineImages } from "@/lib/bonsai-images";
import type { BonsaiDetail, ReminderDto } from "@/types/dto";
import {
  DEVELOPMENT_STAGE_LABELS,
  ENTRY_TYPE_LABELS,
  HEALTH_STATUS_LABELS,
  INDOOR_OUTDOOR_LABELS,
  SUN_EXPOSURE_LABELS,
  WINTER_HARDINESS_LABELS,
} from "@/types/domain";

const CARE_PLAN_CARE_TYPE_LABELS: Record<string, string> = {
  FERTILIZING: "Duengung",
  PRUNING: "Schnitt",
  WIRING: "Drahten",
  REPOTTING: "Umtopfen",
  INSPECTION: "Kontrolle",
};

interface DetailResponse {
  ok: boolean;
  data?: BonsaiDetail;
  error?: {
    message: string;
  };
}

interface CarePlanContextResponse {
  ok: boolean;
  data?: {
    carePlanSpeciesId: string | null;
    carePlanActive: boolean;
    species: { id: string; label: string; latinName: string } | null;
    preview: Array<{ date: string; careType: string; title: string; note: string; ruleId: string }>;
    entitlementActive: boolean;
    replacementSuggested: boolean;
    note: string;
  };
  error?: { message: string };
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-base-content/60">{label}</dt>
      <dd className="font-medium">{formatBonsaiDisplayText(value, "-")}</dd>
    </div>
  );
}

export default function BonsaiDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useRequireAuth();
  const [bonsai, setBonsai] = useState<BonsaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [reminders, setReminders] = useState<ReminderDto[]>([]);
  const [carePlan, setCarePlan] = useState<CarePlanContextResponse["data"] | null>(null);
  const [carePlanError, setCarePlanError] = useState<string | null>(null);
  const [carePlanBusy, setCarePlanBusy] = useState(false);
  const [entryFilter, setEntryFilter] = useState<string>("");
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  useEffect(() => {
    if (!id || status !== "authenticated") {
      return;
    }

    void (async () => {
      setLoading(true);
      const response = await apiFetch(`/api/bonsais/${id}`);
      const json = (await response.json()) as DetailResponse;

      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Der Bonsai konnte nicht geladen werden.");
        setLoading(false);
        return;
      }

      setBonsai(json.data);
      const remindersResponse = await apiFetch(`/api/reminders?bonsaiId=${id}`);
      const remindersJson = (await remindersResponse.json()) as { ok: boolean; data?: { items: ReminderDto[] } };
      if (remindersResponse.ok && remindersJson.ok && remindersJson.data) {
        setReminders(remindersJson.data.items);
      }
      const carePlanResponse = await apiFetch(`/api/bonsais/${id}/care-plan`);
      const carePlanJson = (await carePlanResponse.json()) as CarePlanContextResponse;
      if (carePlanResponse.ok && carePlanJson.ok && carePlanJson.data) {
        setCarePlan(carePlanJson.data);
        setCarePlanError(null);
      } else if (carePlanJson.error?.message) {
        setCarePlan(null);
        setCarePlanError(carePlanJson.error.message);
      }
      setError(null);
      setLoading(false);
    })();
  }, [id, status]);

  const timelineItems = useMemo(
    () => bonsai?.subEntries.filter((entry) => (entryFilter ? entry.entryType === entryFilter : true)) ?? [],
    [bonsai, entryFilter],
  );

  const slideshowImages = useMemo(() => {
    return collectBonsaiTimelineImages(bonsai);
  }, [bonsai]);

  async function handleDelete() {
    if (!id) {
      return;
    }
    setDeleting(true);
    const response = await apiFetch(`/api/bonsais/${id}`, { method: "DELETE" });
    setDeleting(false);

    if (!response.ok) {
      setError("Der Bonsai konnte nicht gelöscht werden.");
      return;
    }

    await router.push("/dashboard");
  }

  async function handleRestore() {
    if (!id) {
      return;
    }

    setRestoring(true);
    const response = await apiFetch(`/api/bonsais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    setRestoring(false);

    const json = (await response.json()) as DetailResponse;
    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Der Bonsai konnte nicht reaktiviert werden.");
      return;
    }

    setBonsai(json.data);
  }

  async function runCarePlanAction(action: "activate" | "sync" | "replace") {
    if (!id) {
      return;
    }
    setCarePlanBusy(true);
    setCarePlanError(null);
    const response = await apiFetch(`/api/bonsais/${id}/care-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const json = (await response.json()) as { ok: boolean; error?: { message: string } };
    if (!response.ok || !json.ok) {
      setCarePlanError(json.error?.message ?? "Der Pflegeplan konnte nicht aktualisiert werden.");
      setCarePlanBusy(false);
      return;
    }
    const contextResponse = await apiFetch(`/api/bonsais/${id}/care-plan`);
    const contextJson = (await contextResponse.json()) as CarePlanContextResponse;
    if (contextResponse.ok && contextJson.ok && contextJson.data) {
      setCarePlan(contextJson.data);
    }
    const remindersResponse = await apiFetch(`/api/reminders?bonsaiId=${id}`);
    const remindersJson = (await remindersResponse.json()) as { ok: boolean; data?: { items: ReminderDto[] } };
    if (remindersResponse.ok && remindersJson.ok && remindersJson.data) {
      setReminders(remindersJson.data.items);
    }
    setCarePlanBusy(false);
  }

  async function startCheckout() {
    if (!bonsai) {
      return;
    }
    setCarePlanBusy(true);
    setCarePlanError(null);
    const response = await apiFetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bonsaiId: bonsai.id }),
    });
    const json = (await response.json()) as { ok: boolean; data?: { url: string | null }; error?: { message: string } };
    setCarePlanBusy(false);
    if (!response.ok || !json.ok || !json.data?.url) {
      setCarePlanError(json.error?.message ?? "Stripe Checkout konnte nicht gestartet werden.");
      return;
    }
    window.location.href = json.data.url;
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-6xl px-4 py-6">
      {loading ? <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {!loading && bonsai ? (
        <div className="space-y-6">
          <div className="hero-panel flex flex-col gap-4 rounded-[2rem] p-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Bonsai Detail</p>
              <h1 className="text-3xl font-bold">{bonsai.name}</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              {bonsai.deletedAt ? (
                <button className="btn btn-primary" onClick={() => void handleRestore()} disabled={restoring}>
                  {restoring ? <span className="loading loading-spinner loading-sm" /> : null}
                  Reaktivieren
                </button>
              ) : null}
              <Link href={`/bonsai/edit/${bonsai.id}`} className="btn btn-secondary">
                Bearbeiten
              </Link>
              <Link href={`/bonsai/${bonsai.id}/subentries`} className="btn btn-outline">
                Pflegeeinträge
              </Link>
              <Link href="/feed" className="btn btn-outline">
                Im Feed teilen
              </Link>
              <button className="btn btn-error" onClick={() => {
                const dialog = document.getElementById("delete-bonsai-modal") as HTMLDialogElement | null;
                dialog?.showModal();
              }}>
                Löschen
              </button>
            </div>
          </div>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="surface-card card">
                <div className="card-body">
                  <h2 className="card-title">Übersicht</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Art" value={bonsai.species} />
                    <InfoRow label="Botanischer Name" value={bonsai.latinName} />
                    <InfoRow label="Standort" value={bonsai.location} />
                    <InfoRow label="Haltung" value={INDOOR_OUTDOOR_LABELS[bonsai.indoorOutdoor]} />
                    <InfoRow label="Gesundheit" value={HEALTH_STATUS_LABELS[bonsai.healthStatus]} />
                    <InfoRow label="Entwicklungsstand" value={DEVELOPMENT_STAGE_LABELS[bonsai.developmentStage]} />
                  </dl>
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body">
                  <h2 className="card-title">Maße und Stil</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Alter" value={formatBonsaiAge(bonsai.age, "-")} />
                    <InfoRow label="Höhe" value={bonsai.heightCm !== null ? `${bonsai.heightCm} cm` : null} />
                    <InfoRow label="Breite" value={bonsai.widthCm !== null ? `${bonsai.widthCm} cm` : null} />
                    <InfoRow label="Stammdurchmesser" value={bonsai.trunkDiameterMm !== null ? `${bonsai.trunkDiameterMm} mm` : null} />
                    <InfoRow label="Stil" value={bonsai.style} />
                    <InfoRow label="Eigener Stil" value={bonsai.customStyle} />
                  </dl>
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body">
                  <h2 className="card-title">Pflegeprofil</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Winterhärte" value={bonsai.winterHardiness ? WINTER_HARDINESS_LABELS[bonsai.winterHardiness] : null} />
                    <InfoRow label="Sonneneinstrahlung" value={bonsai.sunExposure ? SUN_EXPOSURE_LABELS[bonsai.sunExposure] : null} />
                    <InfoRow label="Topfart" value={bonsai.potType} />
                    <InfoRow label="Topffarbe" value={bonsai.potColor} />
                    <InfoRow label="Letztes Umtopfen" value={bonsai.lastRepotDate ? new Date(bonsai.lastRepotDate).toLocaleDateString("de-DE") : null} />
                    <InfoRow label="Nächstes Umtopfen" value={bonsai.nextRepotDue ? new Date(bonsai.nextRepotDue).toLocaleDateString("de-DE") : null} />
                  </dl>
                  <div className="space-y-3">
                    <p><span className="font-medium">Bewässerung:</span> {bonsai.wateringNotes ?? "-"}</p>
                    <p><span className="font-medium">Düngung:</span> {bonsai.fertilizingNotes ?? "-"}</p>
                    <p><span className="font-medium">Schnitt:</span> {bonsai.pruningNotes ?? "-"}</p>
                    <p><span className="font-medium">Drahten:</span> {bonsai.wiringNotes ?? "-"}</p>
                  </div>
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body gap-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="card-title">Pflegeplan</h2>
                      <p className="text-sm text-base-content/70">
                        {carePlan?.species?.label ?? "Waehle im Bearbeiten-Formular eine Pflegeplan-Pflanzenart."}
                      </p>
                    </div>
                    {carePlan?.carePlanActive ? <span className="badge badge-success">Aktiv</span> : <span className="badge badge-outline">Vorschau</span>}
                  </div>
                  {carePlanError ? <div className="alert alert-warning">{carePlanError}</div> : null}
                  {carePlan ? (
                    <>
                      <p className="text-sm text-base-content/70">{carePlan.note}</p>
                      <div className="space-y-2">
                        {carePlan.preview.map((item) => (
                          <article key={`${item.ruleId}-${item.date}`} className="rounded-2xl border border-base-300 bg-base-100/50 p-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="font-medium">{item.title}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="badge badge-outline badge-sm">{CARE_PLAN_CARE_TYPE_LABELS[item.careType] ?? item.careType}</span>
                                <span className="text-sm text-base-content/60">{new Date(item.date).toLocaleDateString("de-DE")}</span>
                              </div>
                            </div>
                            <p className="text-sm text-base-content/70">{item.note}</p>
                          </article>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {carePlan.species && carePlan.entitlementActive ? (
                          <>
                            {carePlan.replacementSuggested ? (
                              <button className="btn btn-secondary btn-sm" disabled={carePlanBusy} onClick={() => void runCarePlanAction("replace")}>
                                Pflegeplan ersetzen
                              </button>
                            ) : (
                              <button className="btn btn-primary btn-sm" disabled={carePlanBusy} onClick={() => void runCarePlanAction(carePlan.carePlanActive ? "sync" : "activate")}>
                                {carePlan.carePlanActive ? "Synchronisieren" : "Pflegeplan aktivieren"}
                              </button>
                            )}
                          </>
                        ) : carePlan.species ? (
                          <button className="btn btn-primary btn-sm" disabled={carePlanBusy} onClick={() => void startCheckout()}>
                            Pflegeplan freischalten
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-card card">
                <div className="card-body">
                  <h2 className="card-title">Herkunft und Anschaffung</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Besitz seit" value={formatBonsaiDate(bonsai.ownedSince, "-")} />
                    <InfoRow label="Herkunft" value={bonsai.acquiredFrom} />
                    <InfoRow label="Kaufpreis" value={bonsai.purchasePriceCents !== null ? `${(bonsai.purchasePriceCents / 100).toFixed(2)} EUR` : null} />
                    <InfoRow label="Aktualisiert" value={new Date(bonsai.updatedAt).toLocaleString("de-DE")} />
                  </dl>
                  <p className="mt-4"><span className="font-medium">Notizen:</span> {bonsai.notes ?? "-"}</p>
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body">
                  <h2 className="card-title">Bilder</h2>
                  {bonsai.images.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {bonsai.images.map((image) => (
                        <AuthenticatedImage key={image} src={image} alt={bonsai.name} className="h-48 w-full rounded-2xl object-cover" loading="lazy" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-base-content/60">Noch keine Bilder vorhanden.</p>
                  )}
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Slideshow</h2>
                    {slideshowImages.length > 1 ? (
                      <div className="join">
                        <button className="btn btn-sm join-item" onClick={() => setSlideshowIndex((current) => Math.max(0, current - 1))}>Zurück</button>
                        <button className="btn btn-sm join-item" onClick={() => setSlideshowIndex((current) => Math.min(slideshowImages.length - 1, current + 1))}>Weiter</button>
                      </div>
                    ) : null}
                  </div>
                  {slideshowImages.length > 0 ? (
                    <div className="space-y-3">
                      <AuthenticatedImage src={slideshowImages[slideshowIndex]?.image} alt={bonsai.name} className="h-72 w-full rounded-2xl object-cover" />
                      <p className="text-sm text-base-content/60">
                        {slideshowIndex + 1} / {slideshowImages.length} · {formatBonsaiDate(slideshowImages[slideshowIndex]?.date, "-")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-base-content/60">Noch keine Bilder für die Entwicklungs-Slideshow vorhanden.</p>
                  )}
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Reminder</h2>
                    <Link href="/reminders" className="btn btn-sm btn-outline">Alle Reminder</Link>
                  </div>
                  {reminders.length > 0 ? (
                    <div className="space-y-3">
                      {reminders.map((reminder) => (
                        <article key={reminder.id} className="rounded-2xl border border-base-300 bg-base-100/50 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{reminder.title ?? `Pflege für ${bonsai.name}`}</p>
                            {reminder.source === "CARE_PLAN" ? <span className="badge badge-primary badge-sm">Pflegeplan</span> : null}
                          </div>
                          <p className="text-sm text-base-content/60">{new Date(reminder.reminderDate).toLocaleDateString("de-DE")}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base-content/60">Für diesen Bonsai gibt es aktuell keine offenen Reminder.</p>
                  )}
                </div>
              </div>

              <div className="surface-card card">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h2 className="card-title">Pflegehistorie</h2>
                    <div className="flex gap-2">
                      <select className="select select-bordered select-sm" value={entryFilter} onChange={(event) => setEntryFilter(event.target.value)}>
                        <option value="">Alle Typen</option>
                        {Object.entries(ENTRY_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      <Link href={`/bonsai/${bonsai.id}/subentries`} className="btn btn-sm btn-outline">
                        Verwalten
                      </Link>
                    </div>
                  </div>
                  {timelineItems.length > 0 ? (
                    <div className="space-y-3">
                      {timelineItems.slice(0, 5).map((entry) => (
                        <article key={entry.id} className="rounded-2xl border border-base-300 bg-base-100/50 p-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold">{ENTRY_TYPE_LABELS[entry.entryType]}</h3>
                            <span className="text-sm text-base-content/60">{new Date(entry.date).toLocaleDateString("de-DE")}</span>
                          </div>
                          <p className="mt-2 text-sm text-base-content/70">{entry.notes ?? "Keine Notizen."}</p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="text-base-content/60">Noch keine Pflegeeinträge vorhanden.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      <dialog id="delete-bonsai-modal" className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Bonsai löschen?</h3>
          <p className="py-4">Der Bonsai wird soft-deleted und erscheint nicht mehr in den Business-Ansichten.</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Abbrechen</button>
            </form>
            <button className="btn btn-error" onClick={handleDelete} disabled={deleting}>
              {deleting ? <span className="loading loading-spinner loading-sm" /> : null}
              Löschen
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
