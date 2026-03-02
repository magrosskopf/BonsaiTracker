import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import type { BonsaiDetail, SubEntryDto } from "@/types/dto";
import { ENTRY_TYPE_LABELS, ENTRY_TYPE_OPTIONS, HEALTH_STATUS_LABELS, HEALTH_STATUS_OPTIONS } from "@/types/domain";

interface EntryFormState {
  date: string;
  entryType: string;
  healthObservation: string;
  performedActions: string;
  nextAction: string;
  reminderDate: string;
  notes: string;
  newImages: File[];
  keepImages: string[];
}

function emptyEntryForm(): EntryFormState {
  return {
    date: "",
    entryType: "KONTROLLE",
    healthObservation: "",
    performedActions: "",
    nextAction: "",
    reminderDate: "",
    notes: "",
    newImages: [],
    keepImages: [],
  };
}

function toFormData(bonsaiId: string, state: EntryFormState) {
  const formData = new FormData();
  formData.append("bonsaiId", bonsaiId);
  formData.append("date", state.date);
  formData.append("entryType", state.entryType);
  if (state.healthObservation) {
    formData.append("healthObservation", state.healthObservation);
  }
  state.performedActions
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => formData.append("performedActions[]", entry));
  if (state.nextAction) {
    formData.append("nextAction", state.nextAction);
  }
  if (state.reminderDate) {
    formData.append("reminderDate", state.reminderDate);
  }
  formData.append("notes", state.notes);
  state.newImages.forEach((file) => formData.append("images", file));
  return formData;
}

function toPatchFormData(state: EntryFormState) {
  const formData = new FormData();
  if (state.date) {
    formData.append("date", state.date);
  }
  formData.append("entryType", state.entryType);
  if (state.healthObservation) {
    formData.append("healthObservation", state.healthObservation);
  }
  state.performedActions
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => formData.append("performedActions[]", entry));
  if (state.nextAction) {
    formData.append("nextAction", state.nextAction);
  }
  if (state.reminderDate) {
    formData.append("reminderDate", state.reminderDate);
  }
  formData.append("notes", state.notes);
  state.keepImages.forEach((image) => formData.append("keepImages[]", image));
  state.newImages.forEach((file) => formData.append("newImages", file));
  return formData;
}

export default function BonsaiSubEntriesPage() {
  const router = useRouter();
  const bonsaiId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.replace("/");
    },
  });
  const [bonsai, setBonsai] = useState<BonsaiDetail | null>(null);
  const [entries, setEntries] = useState<SubEntryDto[]>([]);
  const [createForm, setCreateForm] = useState<EntryFormState>(emptyEntryForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EntryFormState>(emptyEntryForm());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bonsaiId || status !== "authenticated") {
      return;
    }

    void (async () => {
      const detailResponse = await fetch(`/api/bonsais/${bonsaiId}`);
      const detailJson = (await detailResponse.json()) as { ok: boolean; data?: BonsaiDetail; error?: { message: string } };
      if (!detailResponse.ok || !detailJson.ok || !detailJson.data) {
        setError(detailJson.error?.message ?? "Die Bonsai-Daten konnten nicht geladen werden.");
        return;
      }
      const detail = detailJson.data;

      const entriesResponse = await fetch(`/api/subentries?bonsaiId=${bonsaiId}`);
      const entriesJson = (await entriesResponse.json()) as { ok: boolean; data?: { items: SubEntryDto[] }; error?: { message: string } };
      if (!entriesResponse.ok || !entriesJson.ok || !entriesJson.data) {
        setError(entriesJson.error?.message ?? "Die Sub-Einträge konnten nicht geladen werden.");
        return;
      }

      setBonsai(detail);
      setEntries(entriesJson.data.items);
      setCreateForm((current) => ({ ...current, date: detail.ownedSince.slice(0, 10) }));
    })();
  }, [bonsaiId, status]);

  const editingEntry = useMemo(
    () => entries.find((entry) => entry.id === editingId) ?? null,
    [editingId, entries],
  );

  async function createEntry() {
    if (!bonsaiId) {
      return;
    }
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/subentries", {
      method: "POST",
      body: toFormData(bonsaiId, createForm),
    });
    const json = (await response.json()) as { ok: boolean; data?: SubEntryDto; error?: { message: string } };
    setSubmitting(false);

    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Der Sub-Eintrag konnte nicht erstellt werden.");
      return;
    }

    setEntries((current) => [json.data!, ...current]);
    setCreateForm(emptyEntryForm());
  }

  async function saveEdit() {
    if (!editingId) {
      return;
    }
    setSubmitting(true);
    setError(null);
    const response = await fetch(`/api/subentries/${editingId}`, {
      method: "PATCH",
      body: toPatchFormData(editForm),
    });
    const json = (await response.json()) as { ok: boolean; data?: SubEntryDto; error?: { message: string } };
    setSubmitting(false);

    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Der Sub-Eintrag konnte nicht gespeichert werden.");
      return;
    }

    setEntries((current) => current.map((entry) => (entry.id === editingId ? json.data! : entry)));
    setEditingId(null);
    setEditForm(emptyEntryForm());
  }

  async function deleteEntry(entryId: number) {
    const response = await fetch(`/api/subentries/${entryId}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Der Sub-Eintrag konnte nicht gelöscht werden.");
      return;
    }
    setEntries((current) => current.filter((entry) => entry.id !== entryId));
  }

  if (status !== "authenticated" || !bonsai) {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="hero-panel flex flex-col gap-4 rounded-[2rem] p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Pflegehistorie</p>
          <h1 className="text-3xl font-bold">{bonsai.name}</h1>
        </div>
        <button className="btn btn-outline" onClick={() => router.push(`/bonsai/${bonsai.id}`)}>
          Zurück zum Bonsai
        </button>
      </div>

      {error ? <div className="alert alert-error">{error}</div> : null}

      <section className="surface-card card">
        <div className="card-body space-y-4">
          <h2 className="card-title">Neuen Sub-Eintrag hinzufügen</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">Datum</legend>
              <input className="input input-bordered" type="date" value={createForm.date} onChange={(event) => setCreateForm((current) => ({ ...current, date: event.target.value }))} />
            </fieldset>
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">Typ</legend>
              <select className="select select-bordered" value={createForm.entryType} onChange={(event) => setCreateForm((current) => ({ ...current, entryType: event.target.value }))}>
                {ENTRY_TYPE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{ENTRY_TYPE_LABELS[option]}</option>
                ))}
              </select>
            </fieldset>
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">Gesundheitsbeobachtung</legend>
              <select className="select select-bordered" value={createForm.healthObservation} onChange={(event) => setCreateForm((current) => ({ ...current, healthObservation: event.target.value }))}>
                <option value="">Keine</option>
                {HEALTH_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>{HEALTH_STATUS_LABELS[option]}</option>
                ))}
              </select>
            </fieldset>
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">Erinnerungsdatum</legend>
              <input className="input input-bordered" type="date" value={createForm.reminderDate} onChange={(event) => setCreateForm((current) => ({ ...current, reminderDate: event.target.value }))} />
            </fieldset>
            <fieldset className="fieldset gap-2 md:col-span-2">
              <legend className="fieldset-legend text-sm font-medium">Ausgeführte Maßnahmen (kommagetrennt)</legend>
              <input className="input input-bordered" value={createForm.performedActions} onChange={(event) => setCreateForm((current) => ({ ...current, performedActions: event.target.value }))} />
            </fieldset>
            <fieldset className="fieldset gap-2 md:col-span-2">
              <legend className="fieldset-legend text-sm font-medium">Nächste Aktion</legend>
              <input className="input input-bordered" value={createForm.nextAction} onChange={(event) => setCreateForm((current) => ({ ...current, nextAction: event.target.value }))} />
            </fieldset>
            <fieldset className="fieldset gap-2 md:col-span-2">
              <legend className="fieldset-legend text-sm font-medium">Notizen</legend>
              <textarea className="textarea textarea-bordered h-28" value={createForm.notes} onChange={(event) => setCreateForm((current) => ({ ...current, notes: event.target.value }))} />
            </fieldset>
            <fieldset className="fieldset gap-2 md:col-span-2">
              <legend className="fieldset-legend text-sm font-medium">Bilder</legend>
              <input className="file-input file-input-bordered" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setCreateForm((current) => ({ ...current, newImages: Array.from(event.target.files ?? []) }))} />
            </fieldset>
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={createEntry} disabled={submitting || !createForm.date}>
              {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
              Sub-Eintrag anlegen
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {entries.map((entry) => (
          <article key={entry.id} className="surface-card card">
            <div className="card-body space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="card-title">{ENTRY_TYPE_LABELS[entry.entryType]}</h2>
                  <p className="text-sm text-base-content/60">{new Date(entry.date).toLocaleDateString("de-DE")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setEditingId(entry.id);
                      setEditForm({
                        date: entry.date.slice(0, 10),
                        entryType: entry.entryType,
                        healthObservation: entry.healthObservation ?? "",
                        performedActions: entry.performedActions.join(", "),
                        nextAction: entry.nextAction ?? "",
                        reminderDate: entry.reminderDate?.slice(0, 10) ?? "",
                        notes: entry.notes ?? "",
                        newImages: [],
                        keepImages: entry.images,
                      });
                    }}
                  >
                    Bearbeiten
                  </button>
                  <button className="btn btn-error btn-sm" onClick={() => void deleteEntry(entry.id)}>
                    Löschen
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p>Gesundheitsbeobachtung: {entry.healthObservation ? HEALTH_STATUS_LABELS[entry.healthObservation] : "-"}</p>
                <p>Maßnahmen: {entry.performedActions.length > 0 ? entry.performedActions.join(", ") : "-"}</p>
                <p>Nächste Aktion: {entry.nextAction ?? "-"}</p>
                <p>Erinnerung: {entry.reminderDate ? new Date(entry.reminderDate).toLocaleDateString("de-DE") : "-"}</p>
                <p>Notizen: {entry.notes ?? "-"}</p>
              </div>
              {entry.images.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {entry.images.map((image) => (
                    <img key={image} src={image} alt={entry.entryType} className="h-36 w-full rounded-2xl object-cover" loading="lazy" />
                  ))}
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <dialog className={`modal ${editingEntry ? "modal-open" : ""}`}>
        <div className="modal-box max-w-3xl">
          <h3 className="text-lg font-bold">Sub-Eintrag bearbeiten</h3>
          {editingEntry ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <fieldset className="fieldset gap-2">
                <legend className="fieldset-legend text-sm font-medium">Datum</legend>
                <input className="input input-bordered" type="date" value={editForm.date} onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))} />
              </fieldset>
              <fieldset className="fieldset gap-2">
                <legend className="fieldset-legend text-sm font-medium">Typ</legend>
                <select className="select select-bordered" value={editForm.entryType} onChange={(event) => setEditForm((current) => ({ ...current, entryType: event.target.value }))}>
                  {ENTRY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>{ENTRY_TYPE_LABELS[option]}</option>
                  ))}
                </select>
              </fieldset>
              <fieldset className="fieldset gap-2">
                <legend className="fieldset-legend text-sm font-medium">Gesundheitsbeobachtung</legend>
                <select className="select select-bordered" value={editForm.healthObservation} onChange={(event) => setEditForm((current) => ({ ...current, healthObservation: event.target.value }))}>
                  <option value="">Keine</option>
                  {HEALTH_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{HEALTH_STATUS_LABELS[option]}</option>
                  ))}
                </select>
              </fieldset>
              <fieldset className="fieldset gap-2">
                <legend className="fieldset-legend text-sm font-medium">Erinnerungsdatum</legend>
                <input className="input input-bordered" type="date" value={editForm.reminderDate} onChange={(event) => setEditForm((current) => ({ ...current, reminderDate: event.target.value }))} />
              </fieldset>
              <fieldset className="fieldset gap-2 md:col-span-2">
                <legend className="fieldset-legend text-sm font-medium">Ausgeführte Maßnahmen (kommagetrennt)</legend>
                <input className="input input-bordered" value={editForm.performedActions} onChange={(event) => setEditForm((current) => ({ ...current, performedActions: event.target.value }))} />
              </fieldset>
              <fieldset className="fieldset gap-2 md:col-span-2">
                <legend className="fieldset-legend text-sm font-medium">Nächste Aktion</legend>
                <input className="input input-bordered" value={editForm.nextAction} onChange={(event) => setEditForm((current) => ({ ...current, nextAction: event.target.value }))} />
              </fieldset>
              <fieldset className="fieldset gap-2 md:col-span-2">
                <legend className="fieldset-legend text-sm font-medium">Notizen</legend>
                <textarea className="textarea textarea-bordered h-28" value={editForm.notes} onChange={(event) => setEditForm((current) => ({ ...current, notes: event.target.value }))} />
              </fieldset>
              <div className="md:col-span-2">
                <p className="mb-2 text-sm font-medium">Bestehende Bilder behalten</p>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {editForm.keepImages.map((image) => (
                    <div key={image} className="relative">
                      <img src={image} alt="Bestehendes Bild" className="h-32 w-full rounded-2xl object-cover" loading="lazy" />
                      <button className="btn btn-error btn-xs absolute right-2 top-2" onClick={() => setEditForm((current) => ({ ...current, keepImages: current.keepImages.filter((entry) => entry !== image) }))}>
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <fieldset className="fieldset gap-2 md:col-span-2">
                <legend className="fieldset-legend text-sm font-medium">Neue Bilder</legend>
                <input className="file-input file-input-bordered" type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setEditForm((current) => ({ ...current, newImages: Array.from(event.target.files ?? []) }))} />
              </fieldset>
            </div>
          ) : null}
          <div className="modal-action">
            <button className="btn" onClick={() => setEditingId(null)}>Abbrechen</button>
            <button className="btn btn-primary" onClick={saveEdit} disabled={submitting}>
              {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
              Speichern
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
