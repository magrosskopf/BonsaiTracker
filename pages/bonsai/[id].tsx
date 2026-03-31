import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import type { BonsaiDetail, ReminderDto } from "@/types/dto";
import {
  DEVELOPMENT_STAGE_LABELS,
  ENTRY_TYPE_LABELS,
  HEALTH_STATUS_LABELS,
  INDOOR_OUTDOOR_LABELS,
  SUN_EXPOSURE_LABELS,
  WINTER_HARDINESS_LABELS,
} from "@/types/domain";

interface DetailResponse {
  ok: boolean;
  data?: BonsaiDetail;
  error?: {
    message: string;
  };
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-sm text-base-content/60">{label}</dt>
      <dd className="font-medium">{value ?? "-"}</dd>
    </div>
  );
}

export default function BonsaiDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.replace("/");
    },
  });
  const [bonsai, setBonsai] = useState<BonsaiDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [reminders, setReminders] = useState<ReminderDto[]>([]);
  const [entryFilter, setEntryFilter] = useState<string>("");
  const [slideshowIndex, setSlideshowIndex] = useState(0);

  useEffect(() => {
    if (!id || status !== "authenticated") {
      return;
    }

    void (async () => {
      setLoading(true);
      const response = await fetch(`/api/bonsais/${id}`);
      const json = (await response.json()) as DetailResponse;

      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Der Bonsai konnte nicht geladen werden.");
        setLoading(false);
        return;
      }

      setBonsai(json.data);
      const remindersResponse = await fetch(`/api/reminders?bonsaiId=${id}`);
      const remindersJson = (await remindersResponse.json()) as { ok: boolean; data?: { items: ReminderDto[] } };
      if (remindersResponse.ok && remindersJson.ok && remindersJson.data) {
        setReminders(remindersJson.data.items);
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
    if (!bonsai) {
      return [];
    }

    const images = [
      ...bonsai.images.map((image) => ({
        image,
        date: bonsai.ownedSince,
        createdAt: bonsai.createdAt,
      })),
      ...bonsai.subEntries.flatMap((entry) =>
        entry.images.map((image) => ({
          image,
          date: entry.date,
          createdAt: entry.createdAt,
        })),
      ),
    ];

    return images.sort((left, right) => {
      if (left.date !== right.date) {
        return new Date(left.date).getTime() - new Date(right.date).getTime();
      }
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    });
  }, [bonsai]);

  async function handleDelete() {
    if (!id) {
      return;
    }
    setDeleting(true);
    const response = await fetch(`/api/bonsais/${id}`, { method: "DELETE" });
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
    const response = await fetch(`/api/bonsais/${id}`, {
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
              {bonsai.nickname ? <p className="mt-1 text-base-content/70">{bonsai.nickname}</p> : null}
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
                Sub-Einträge
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
                    <InfoRow label="Alter" value={`${bonsai.age} Jahre`} />
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
            </div>

            <div className="space-y-6">
              <div className="surface-card card">
                <div className="card-body">
                  <h2 className="card-title">Herkunft und Anschaffung</h2>
                  <dl className="grid gap-4 md:grid-cols-2">
                    <InfoRow label="Besitz seit" value={new Date(bonsai.ownedSince).toLocaleDateString("de-DE")} />
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
                        <img key={image} src={image} alt={bonsai.name} className="h-48 w-full rounded-2xl object-cover" loading="lazy" />
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
                      <img src={slideshowImages[slideshowIndex]?.image} alt={bonsai.name} className="h-72 w-full rounded-2xl object-cover" />
                      <p className="text-sm text-base-content/60">
                        {slideshowIndex + 1} / {slideshowImages.length} · {new Date(slideshowImages[slideshowIndex]?.date).toLocaleDateString("de-DE")}
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
                          <p className="font-medium">{reminder.title ?? `Pflege für ${bonsai.name}`}</p>
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
                    <p className="text-base-content/60">Noch keine Sub-Einträge vorhanden.</p>
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
