import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import type { BonsaiSummary, ReminderDto } from "@/types/dto";
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

interface BonsaiListResponse {
  ok: boolean;
  data?: {
    items: BonsaiSummary[];
    nextCursor: string | null;
  };
  error?: {
    message: string;
  };
}

interface ReminderFormState {
  bonsaiId: string;
  title: string;
  reminderDate: string;
}

function emptyReminderForm(): ReminderFormState {
  return {
    bonsaiId: "",
    title: "",
    reminderDate: "",
  };
}

function sortReminders(reminders: ReminderDto[]): ReminderDto[] {
  return [...reminders].sort((left, right) => {
    const dateCompare = new Date(left.reminderDate).getTime() - new Date(right.reminderDate).getTime();
    return dateCompare || left.id - right.id;
  });
}

function dateInputValue(value: string): string {
  return value.slice(0, 10);
}

function formFromReminder(reminder: ReminderDto): ReminderFormState {
  return {
    bonsaiId: String(reminder.bonsaiId),
    title: reminder.title ?? "",
    reminderDate: dateInputValue(reminder.reminderDate),
  };
}

function isVisibleReminder(reminder: ReminderDto): boolean {
  return reminder.bonsaiDeletedAt === null && (reminder.status === "PENDING" || reminder.status === "SNOOZED");
}

function replaceReminder(reminders: ReminderDto[], nextReminder: ReminderDto): ReminderDto[] {
  return sortReminders(reminders.map((item) => (item.id === nextReminder.id ? nextReminder : item)).filter(isVisibleReminder));
}

export default function RemindersPage() {
  const { status } = useRequireAuth();
  const [items, setItems] = useState<ReminderDto[]>([]);
  const [bonsais, setBonsais] = useState<BonsaiSummary[]>([]);
  const [createForm, setCreateForm] = useState<ReminderFormState>(emptyReminderForm());
  const [editForms, setEditForms] = useState<Record<number, ReminderFormState>>({});
  const [itemErrors, setItemErrors] = useState<Record<number, string>>({});
  const [savingItems, setSavingItems] = useState<Record<number, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function loadReminders() {
    const response = await apiFetch("/api/reminders");
    const json = (await response.json()) as ReminderResponse;
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Die Reminder konnten nicht geladen werden.");
    }
    return json.data.items;
  }

  async function loadBonsais() {
    const response = await apiFetch("/api/bonsais?status=active&limit=50");
    const json = (await response.json()) as BonsaiListResponse;
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Die Bonsais konnten nicht geladen werden.");
    }
    return json.data.items;
  }

  async function createReminder() {
    if (!createForm.bonsaiId || !createForm.reminderDate) {
      setCreateError("Wähle einen Bonsai und ein Erinnerungsdatum aus.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const response = await apiFetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bonsaiId: Number(createForm.bonsaiId),
          subEntryId: null,
          title: createForm.title.trim() || null,
          reminderDate: createForm.reminderDate,
        }),
      });
      const json = (await response.json()) as { ok: boolean; data?: ReminderDto; error?: { message: string } };

      if (!response.ok || !json.ok || !json.data) {
        setCreateError(json.error?.message ?? "Der Reminder konnte nicht erstellt werden.");
        return;
      }

      setItems((current) => sortReminders([json.data!, ...current].filter(isVisibleReminder)));
      setCreateForm((current) => ({ bonsaiId: current.bonsaiId, title: "", reminderDate: "" }));
    } catch (createFailure) {
      setCreateError(createFailure instanceof Error ? createFailure.message : "Der Reminder konnte nicht erstellt werden.");
    } finally {
      setCreating(false);
    }
  }

  async function patchReminder(id: number, body: Record<string, unknown>): Promise<ReminderDto> {
    const response = await apiFetch(`/api/reminders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await response.json()) as { ok: boolean; data?: ReminderDto; error?: { message: string } };
    if (!response.ok || !json.ok || !json.data) {
      throw new Error(json.error?.message ?? "Der Reminder konnte nicht aktualisiert werden.");
    }
    return json.data;
  }

  function setItemSaving(id: number, saving: boolean) {
    setSavingItems((current) => ({ ...current, [id]: saving }));
  }

  function clearItemError(id: number) {
    setItemErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function updateReminder(id: number, body: Record<string, unknown>) {
    setItemSaving(id, true);
    clearItemError(id);

    try {
      const updated = await patchReminder(id, body);
      setItems((current) => replaceReminder(current, updated));
    } catch (updateFailure) {
      setItemErrors((current) => ({
        ...current,
        [id]: updateFailure instanceof Error ? updateFailure.message : "Der Reminder konnte nicht aktualisiert werden.",
      }));
    } finally {
      setItemSaving(id, false);
    }
  }

  function startEditingReminder(reminder: ReminderDto) {
    setEditForms((current) => ({ ...current, [reminder.id]: formFromReminder(reminder) }));
    clearItemError(reminder.id);
  }

  function cancelEditingReminder(id: number) {
    setEditForms((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    clearItemError(id);
  }

  async function saveReminder(id: number) {
    const form = editForms[id];
    if (!form) {
      return;
    }
    if (!form.bonsaiId || !form.reminderDate) {
      setItemErrors((current) => ({ ...current, [id]: "Wähle einen Bonsai und ein Erinnerungsdatum aus." }));
      return;
    }

    setItemSaving(id, true);
    clearItemError(id);

    try {
      const updated = await patchReminder(id, {
        bonsaiId: Number(form.bonsaiId),
        title: form.title.trim() || null,
        reminderDate: form.reminderDate,
      });
      setItems((current) => replaceReminder(current, updated));
      cancelEditingReminder(id);
    } catch (saveFailure) {
      setItemErrors((current) => ({
        ...current,
        [id]: saveFailure instanceof Error ? saveFailure.message : "Der Reminder konnte nicht gespeichert werden.",
      }));
    } finally {
      setItemSaving(id, false);
    }
  }

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void (async () => {
      try {
        const [loadedReminders, loadedBonsais] = await Promise.all([loadReminders(), loadBonsais()]);
        setItems(sortReminders(loadedReminders.filter(isVisibleReminder)));
        setBonsais(loadedBonsais);
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

      {!loading && !error ? (
        <section className="surface-card card mb-6">
          <form
            className="card-body gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              void createReminder();
            }}
          >
            <div>
              <h2 className="card-title">Neuen Reminder anlegen</h2>
              <p className="text-sm text-base-content/70">Plane eine Pflegeaufgabe für einen deiner Bonsais.</p>
            </div>

            {createError ? <div className="alert alert-error">{createError}</div> : null}

            {bonsais.length === 0 ? (
              <div className="alert">
                <span>Lege zuerst einen aktiven Bonsai an, bevor du Reminder erstellst.</span>
                <Link href="/create-bonsai" className="btn btn-primary btn-sm">Bonsai anlegen</Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <fieldset className="fieldset gap-2">
                  <legend className="fieldset-legend text-sm font-medium">Bonsai</legend>
                  <select
                    className="select select-bordered"
                    value={createForm.bonsaiId}
                    onChange={(event) => setCreateForm((current) => ({ ...current, bonsaiId: event.target.value }))}
                  >
                    <option value="">Bitte auswählen</option>
                    {bonsais.map((bonsai) => (
                      <option key={bonsai.id} value={bonsai.id}>{bonsai.name}</option>
                    ))}
                  </select>
                </fieldset>
                <fieldset className="fieldset gap-2">
                  <legend className="fieldset-legend text-sm font-medium">Erinnerungsdatum</legend>
                  <input
                    className="input input-bordered"
                    type="date"
                    value={createForm.reminderDate}
                    onChange={(event) => setCreateForm((current) => ({ ...current, reminderDate: event.target.value }))}
                  />
                </fieldset>
                <fieldset className="fieldset gap-2">
                  <legend className="fieldset-legend text-sm font-medium">Titel optional</legend>
                  <input
                    className="input input-bordered"
                    value={createForm.title}
                    maxLength={160}
                    onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </fieldset>
              </div>
            )}

            <div className="card-actions justify-end">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={creating || bonsais.length === 0 || !createForm.bonsaiId || !createForm.reminderDate}
              >
                {creating ? <span className="loading loading-spinner loading-sm" /> : null}
                Reminder anlegen
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <section className="surface-card card border-dashed">
          <div className="card-body">
            <h2 className="card-title">Keine offenen Reminder</h2>
            <p>Lege hier direkt einen Reminder an oder setze bei einem Pflegeeintrag ein Erinnerungsdatum.</p>
            <Link href="/dashboard" className="btn btn-primary w-fit">Zu deinen Bonsais</Link>
          </div>
        </section>
      ) : null}

      <div className="space-y-4">
        {items.map((item) => {
          const editForm = editForms[item.id];
          const itemError = itemErrors[item.id];
          const isSaving = Boolean(savingItems[item.id]);

          return (
            <article key={item.id} className="surface-card card">
              <div className="card-body gap-4">
                {editForm ? (
                  <form
                    className="grid gap-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void saveReminder(item.id);
                    }}
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="badge badge-outline mb-2">{REMINDER_STATUS_LABELS[item.status]}</div>
                        <h2 className="card-title">Reminder bearbeiten</h2>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn btn-primary btn-sm" type="submit" disabled={isSaving || !editForm.bonsaiId || !editForm.reminderDate}>
                          {isSaving ? <span className="loading loading-spinner loading-sm" /> : null}
                          Speichern
                        </button>
                        <button className="btn btn-outline btn-sm" type="button" disabled={isSaving} onClick={() => cancelEditingReminder(item.id)}>
                          Abbrechen
                        </button>
                      </div>
                    </div>

                    {itemError ? <div className="alert alert-error">{itemError}</div> : null}

                    <div className="grid gap-4 md:grid-cols-3">
                      <fieldset className="fieldset gap-2">
                        <legend className="fieldset-legend text-sm font-medium">Bonsai</legend>
                        <select
                          className="select select-bordered"
                          value={editForm.bonsaiId}
                          onChange={(event) => setEditForms((current) => ({ ...current, [item.id]: { ...editForm, bonsaiId: event.target.value } }))}
                        >
                          <option value="">Bitte auswählen</option>
                          {bonsais.map((bonsai) => (
                            <option key={bonsai.id} value={bonsai.id}>{bonsai.name}</option>
                          ))}
                        </select>
                      </fieldset>
                      <fieldset className="fieldset gap-2">
                        <legend className="fieldset-legend text-sm font-medium">Erinnerungsdatum</legend>
                        <input
                          className="input input-bordered"
                          type="date"
                          value={editForm.reminderDate}
                          onChange={(event) => setEditForms((current) => ({ ...current, [item.id]: { ...editForm, reminderDate: event.target.value } }))}
                        />
                      </fieldset>
                      <fieldset className="fieldset gap-2">
                        <legend className="fieldset-legend text-sm font-medium">Titel optional</legend>
                        <input
                          className="input input-bordered"
                          value={editForm.title}
                          maxLength={160}
                          onChange={(event) => setEditForms((current) => ({ ...current, [item.id]: { ...editForm, title: event.target.value } }))}
                        />
                      </fieldset>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="badge badge-outline mb-2">{REMINDER_STATUS_LABELS[item.status]}</div>
                        <h2 className="card-title">{item.title ?? `Pflege für ${item.bonsaiName}`}</h2>
                        <p className="text-sm text-base-content/70">Fällig am {new Date(item.reminderDate).toLocaleDateString("de-DE")}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button className="btn btn-outline btn-sm" disabled={isSaving} onClick={() => startEditingReminder(item)}>
                          Bearbeiten
                        </button>
                        <button className="btn btn-success btn-sm" disabled={isSaving} onClick={() => void updateReminder(item.id, { status: "DONE" })}>
                          {isSaving ? <span className="loading loading-spinner loading-sm" /> : null}
                          Done
                        </button>
                        <button className="btn btn-outline btn-sm" disabled={isSaving} onClick={() => void updateReminder(item.id, { snoozeDays: 14 })}>
                          +14 Tage
                        </button>
                        <Link href={`/bonsai/${item.bonsaiId}/subentries`} className="btn btn-primary btn-sm">
                          Jetzt dokumentieren
                        </Link>
                      </div>
                    </div>
                    {itemError ? <div className="alert alert-error">{itemError}</div> : null}
                    <div className="text-sm text-base-content/70">
                      <p>Bonsai: <Link href={`/bonsai/${item.bonsaiId}`} className="link link-hover">{item.bonsaiName}</Link></p>
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
