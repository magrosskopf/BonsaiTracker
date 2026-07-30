import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import { apiFetch } from "@/lib/api/client";
import { formatBonsaiDisplayText } from "@/lib/bonsai-display";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import type { BonsaiSummary } from "@/types/dto";
import { HEALTH_STATUS_LABELS, INDOOR_OUTDOOR_LABELS } from "@/types/domain";

interface ApiResponse {
  ok: boolean;
  data?: {
    items: BonsaiSummary[];
    nextCursor: string | null;
  };
  error?: {
    message: string;
  };
}

export default function Dashboard() {
  const { status } = useRequireAuth();
  const [items, setItems] = useState<BonsaiSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"active" | "archived">("active");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  async function loadPage(cursor?: string, currentView: "active" | "archived" = view) {
    const params = new URLSearchParams({ limit: "12", status: currentView });
    if (cursor) {
      params.set("cursor", cursor);
    }

    const response = await apiFetch(`/api/bonsais?${params.toString()}`);
    const json = (await response.json()) as ApiResponse;

    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Das Dashboard konnte nicht geladen werden.");
    }

    return json.data;
  }

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void (async () => {
      try {
        const data = await loadPage();
        setItems(data.items);
        setNextCursor(data.nextCursor);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Das Dashboard konnte nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status, view]);

  useEffect(() => {
    if (!sentinelRef.current || !nextCursor || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return;
        }

        setLoadingMore(true);
        void (async () => {
          try {
            const data = await loadPage(nextCursor);
            setItems((current) => [...current, ...data.items]);
            setNextCursor(data.nextCursor);
          } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Weitere Bonsais konnten nicht geladen werden.");
          } finally {
            setLoadingMore(false);
          }
        })();
      },
      { rootMargin: "300px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore, view]);

  return (
    <main className="page-shell mx-auto max-w-6xl px-4 py-6">
      <div className="hero-panel mb-6 flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Dashboard</p>
          <h1 className="text-3xl font-bold">Deine Bonsais</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="join">
            <button className={`btn join-item ${view === "active" ? "btn-primary" : "btn-outline"}`} onClick={() => setView("active")}>
              Aktiv
            </button>
            <button className={`btn join-item ${view === "archived" ? "btn-primary" : "btn-outline"}`} onClick={() => setView("archived")}>
              Archiv
            </button>
          </div>
          <Link href="/create-bonsai" className="btn btn-primary">
            Bonsai anlegen
          </Link>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg" /></div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}
      {!loading && !error && items.length === 0 ? (
        <section className="surface-card card border-dashed">
          <div className="card-body items-start">
            <h2 className="card-title">Noch keine Bonsais</h2>
            <p>{view === "active" ? "Lege deinen ersten Bonsai an, um Bilder, Pflegenotizen und Pflegehistorien zu dokumentieren." : "Du hast aktuell keine archivierten Bonsais."}</p>
            <Link href={view === "active" ? "/create-bonsai" : "/dashboard"} className="btn btn-primary">
              {view === "active" ? "Jetzt anlegen" : "Aktive Bonsais ansehen"}
            </Link>
          </div>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((bonsai) => (
          <article key={bonsai.id} className="surface-card bonsai-card card overflow-hidden">
            <figure className="h-52">
              {bonsai.coverImage ? (
                <AuthenticatedImage src={bonsai.coverImage} alt={bonsai.name} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-base-content/50">Kein Bild</div>
              )}
            </figure>
            <div className="card-body">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="card-title">{bonsai.name}</h2>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="badge badge-outline">{formatBonsaiDisplayText(bonsai.style, "-")}</span>
                  {bonsai.deletedAt ? <span className="badge badge-warning">Archiviert</span> : null}
                </div>
              </div>
              <div className="space-y-1 text-sm text-base-content/75">
                <p>Art: {formatBonsaiDisplayText(bonsai.species)}</p>
                <p>Standort: {formatBonsaiDisplayText(bonsai.location)}</p>
                <p>Status: {formatBonsaiDisplayText(HEALTH_STATUS_LABELS[bonsai.healthStatus])}</p>
                <p>Haltung: {INDOOR_OUTDOOR_LABELS[bonsai.indoorOutdoor]}</p>
                <p>Letztes Update: {new Date(bonsai.updatedAt).toLocaleDateString("de-DE")}</p>
              </div>
              <div className="card-actions justify-end">
                <Link href={`/bonsai/${bonsai.id}`} className="btn btn-primary btn-sm">
                  Details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="py-6 text-center">
        {loadingMore ? <span className="loading loading-dots loading-md" /> : null}
      </div>
    </main>
  );
}
