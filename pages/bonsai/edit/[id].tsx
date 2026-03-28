import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import BonsaiForm from "@/components/BonsaiForm";
import { bonsaiDetailToFormValues, bonsaiFormValuesToPayload } from "@/lib/forms";
import type { BonsaiDetail } from "@/types/dto";
import type { BonsaiFormValues } from "@/types/forms";

export default function EditBonsaiPage() {
  const router = useRouter();
  const { id } = router.query;
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.replace("/");
    },
  });
  const [bonsai, setBonsai] = useState<BonsaiDetail | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [imagePendingDeletion, setImagePendingDeletion] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id || status !== "authenticated") {
      return;
    }

    void (async () => {
      const response = await fetch(`/api/bonsais/${id}`);
      const json = (await response.json()) as { ok: boolean; data?: BonsaiDetail; error?: { message: string } };

      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Der Bonsai konnte nicht geladen werden.");
        return;
      }

      setBonsai(json.data);
      setImages(json.data.images);
    })();
  }, [id, status]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0 || !id) {
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("bonsaiId", String(id));

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });
          const json = (await response.json()) as { ok: boolean; data?: { filePath: string }; error?: { message: string } };
          if (!response.ok || !json.ok || !json.data) {
            throw new Error(json.error?.message ?? "Das Bild konnte nicht hochgeladen werden.");
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
    if (!id) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const response = await fetch(`/api/bonsais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...bonsaiFormValuesToPayload(values),
        images,
      }),
    });
    const json = (await response.json()) as { ok: boolean; data?: BonsaiDetail; error?: { message: string } };
    setSubmitting(false);

    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Der Bonsai konnte nicht gespeichert werden.");
      return;
    }

    setBonsai(json.data);
    setImages(json.data.images);
    setSuccess("Änderungen gespeichert.");
  }

  async function confirmImageDeletion() {
    if (!id || !imagePendingDeletion) {
      return;
    }

    setDeletingImage(true);
    setError(null);
    setSuccess(null);

    const nextImages = images.filter((image) => image !== imagePendingDeletion);
    const response = await fetch(`/api/bonsais/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: nextImages,
      }),
    });

    const json = (await response.json()) as { ok: boolean; data?: BonsaiDetail; error?: { message: string } };
    setDeletingImage(false);

    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Das Bild konnte nicht entfernt werden.");
      return;
    }

    setBonsai(json.data);
    setImages(json.data.images);
    setImagePendingDeletion(null);
    setSuccess("Bild entfernt.");
  }

  if (status !== "authenticated" || !bonsai) {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-5xl px-4 py-6">
      <div className="hero-panel mb-6 flex items-center justify-between gap-4 rounded-[2rem] p-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Bearbeiten</p>
          <h1 className="text-3xl font-bold">{bonsai.name}</h1>
        </div>
        <Link href={`/bonsai/${bonsai.id}`} className="btn btn-outline">
          Zurück
        </Link>
      </div>

      <section className="surface-card mb-6 card">
        <div className="card-body gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="card-title">Bilder</h2>
            <label className="btn btn-secondary">
              {uploading ? "Lädt..." : "Bild hinzufügen"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleUpload} />
            </label>
          </div>
          <p className="text-sm text-base-content/70">
            Neue Uploads werden sofort mit diesem Bonsai verknüpft. Das Entfernen eines Bilds wird nach Bestätigung
            direkt gespeichert.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {images.map((image) => (
              <div key={image} className="relative">
                <img src={image} alt="Bonsai" className="h-40 w-full rounded-2xl object-cover" loading="lazy" />
                <button
                  type="button"
                  className="btn btn-error btn-xs absolute right-2 top-2"
                  onClick={() => {
                    setError(null);
                    setSuccess(null);
                    setImagePendingDeletion(image);
                  }}
                >
                  Direkt entfernen
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BonsaiForm
        initialValues={bonsaiDetailToFormValues(bonsai)}
        submitLabel="Änderungen speichern"
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        success={success}
      />

      <dialog className={`modal ${imagePendingDeletion ? "modal-open" : ""}`}>
        <div className="modal-box max-w-lg">
          <h3 className="text-lg font-bold">Bild entfernen?</h3>
          <p className="mt-3 text-sm text-base-content/70">
            Das Bild wird nach der Bestätigung sofort aus diesem Bonsai entfernt und muss nicht zusätzlich über das
            Formular gespeichert werden.
          </p>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={() => setImagePendingDeletion(null)}
              disabled={deletingImage}
            >
              Abbrechen
            </button>
            <button
              type="button"
              className="btn btn-error"
              onClick={() => void confirmImageDeletion()}
              disabled={deletingImage}
            >
              {deletingImage ? <span className="loading loading-spinner loading-sm" /> : null}
              Jetzt entfernen
            </button>
          </div>
        </div>
      </dialog>
    </main>
  );
}
