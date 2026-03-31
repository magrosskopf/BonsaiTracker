import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import type { ReminderDto } from "@/types/dto";
import { REMINDER_STATUS_LABELS } from "@/types/domain";

interface ReminderResponse {
  ok: boolean;
  data?: {
    items: ReminderDto[];
  };
  error?: {
    message: string;
  };
}

export default function RemindersPage() {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.replace("/");
    },
  });
  const [items, setItems] = useState<ReminderDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadReminders() {
    const response = await fetch("/api/reminders");
    const json = (await response.json()) as ReminderResponse;
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Die Reminder konnten nicht geladen werden.");
    }
    return json.data.items;
  }

  async function updateReminder(id: number, body: Record<string, unknown>) {
    const response = await fetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as { ok: boolean; data?: ReminderDto; error?: { message: string } };
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Der Reminder konnte nicht aktualisiert werden.");
    }
    setItems((current) => current.map((item) => (item.id === id ? json.data! : item)).filter((item) => item.bonsaiDeletedAt === null));
  }

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void (async () => {
      try {
        setItems(await loadReminders());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Die Reminder konnten nicht geladen werden.");
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-5xl px-4 py-6">
      <div className="hero-panel mb-6 rounded-[2rem] p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Reminder</p>
        <h1 className="text-3xl font-bold">Deine offenen Erinnerungen</h1>
      </div>

      {loading ? <div className="flex justify-center py-12"><span className="loading loading-spinner loading-lg" /></div> : null}
      {error ? <div className="alert alert-error">{error}</div> : null}

      {!loading && !error && items.length === 0 ? (
        <section className="surface-card card border-dashed">
          <div className="card-body">
            <h2 className="card-title">Keine offenen Reminder</h2>
            <p>Lege bei einem Pflegeeintrag ein Erinnerungsdatum fest, damit hier automatisch Aufgaben erscheinen.</p>
            <Link href="/dashboard" className="btn btn-primary w-fit">Zu deinen Bonsais</Link>
          </div>
        </section>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => (
          <article key={item.id} className="surface-card card">
            <div className="card-body gap-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="badge badge-outline mb-2">{REMINDER_STATUS_LABELS[item.status]}</div>
                  <h2 className="card-title">{item.title ?? `Pflege für ${item.bonsaiName}`}</h2>
                  <p className="text-sm text-base-content/70">Fällig am {new Date(item.reminderDate).toLocaleDateString("de-DE")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-success btn-sm" onClick={() => void updateReminder(item.id, { status: "DONE" })}>
                    Done
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => void updateReminder(item.id, { snoozeDays: 14 })}>
                    +14 Tage
                  </button>
                  <Link href={`/bonsai/${item.bonsaiId}/subentries`} className="btn btn-primary btn-sm">
                    Jetzt dokumentieren
                  </Link>
                </div>
              </div>
              <div className="text-sm text-base-content/70">
                <p>Bonsai: <Link href={`/bonsai/${item.bonsaiId}`} className="link link-hover">{item.bonsaiName}</Link></p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
