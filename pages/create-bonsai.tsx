import { useState } from "react";
import { useRouter } from "next/router";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import BonsaiForm from "@/components/BonsaiForm";
import { apiFetch } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { getFirstValidationMessage, type ValidationErrorDetails } from "@/lib/api/validation";
import { bonsaiFormValuesToPayload, emptyBonsaiFormValues } from "@/lib/forms";
import type { BonsaiFormValues } from "@/types/forms";

interface ApiErrorPayload {
  message: string;
  details?: ValidationErrorDetails;
}

function getCreateBonsaiErrorMessage(error: ApiErrorPayload | undefined): string {
  if (!error) {
    return "Der Bonsai konnte nicht erstellt werden.";
  }

  return getFirstValidationMessage(error.details, error.message);
}

export default function CreateBonsaiPage() {
  const router = useRouter();
  const { status } = useRequireAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);

          const response = await apiFetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const json = (await response.json()) as { ok: boolean; data?: { filePath: string }; error?: { message: string } };
          if (!response.ok || !json.ok || !json.data) {
            throw new Error(json.error?.message ?? "Ein Bild konnte nicht hochgeladen werden.");
          }
          return json.data.filePath;
        }),
      );
      setImages((current) => [...current, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Die Bilder konnten nicht hochgeladen werden.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(values: BonsaiFormValues) {
    setSubmitting(true);
    setError(null);

    const response = await apiFetch("/api/bonsais", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bonsaiFormValuesToPayload(values),
        images,
      }),
    });

    const json = (await response.json()) as { ok: boolean; data?: { id: number }; error?: ApiErrorPayload };
    setSubmitting(false);

    if (!response.ok || !json.ok || !json.data) {
      setError(getCreateBonsaiErrorMessage(json.error));
      return;
    }

    await router.push(`/bonsai/${json.data.id}`);
  }

  if (status !== "authenticated") {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-5xl px-4 py-6">
      <div className="hero-panel mb-6 space-y-2 rounded-[2rem] p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Neuer Bonsai</p>
        <h1 className="text-3xl font-bold">Bonsai anlegen</h1>
        <p className="max-w-2xl text-sm text-base-content/75">
          Starte mit dem Namen und speichere sofort. Bilder und weitere Details kannst du direkt optional ergänzen oder nach dem Anlegen pflegen.
        </p>
      </div>
      <BonsaiForm
        mode="create"
        initialValues={emptyBonsaiFormValues}
        submitLabel="Bonsai speichern"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
      <section className="surface-card mt-6 card">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="card-title">Optionale Bilder</h2>
              <p className="text-sm text-base-content/70">
                Bilder bleiben freiwillig. Wenn du jetzt hochlädst, werden sie beim Speichern direkt diesem neuen Bonsai zugeordnet.
              </p>
            </div>
            <label className="btn btn-secondary">
              {uploading ? "Lädt..." : "Bilder hochladen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => void uploadFiles(event.target.files)}
              />
            </label>
          </div>
          {images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {images.map((image) => (
                <div key={image} className="relative">
                  <AuthenticatedImage src={image} alt="Upload" className="h-40 w-full rounded-2xl object-cover" />
                  <button type="button" className="btn btn-error btn-xs absolute right-2 top-2" onClick={() => setImages((current) => current.filter((item) => item !== image))}>
                    Aus Auswahl entfernen
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-base-content/70">Ohne Bilder ist der Schnellstart sofort speicherbar.</p>
          )}
        </div>
      </section>
    </main>
  );
}
