import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AuthenticatedImage from "@/components/AuthenticatedImage";
import { apiFetch } from "@/lib/api/client";
import { useRequireAuth } from "@/lib/auth/use-require-auth";
import { formatPostSnapshotMeta } from "@/lib/posts";
import type { PublicProfileDto } from "@/types/dto";
import { POST_TYPE_LABELS } from "@/types/domain";

export default function PublicProfilePage() {
  const router = useRouter();
  const profileId = Array.isArray(router.query.id) ? router.query.id[0] : router.query.id;
  const { status } = useRequireAuth();
  const [profile, setProfile] = useState<PublicProfileDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId || status !== "authenticated") {
      return;
    }

    void (async () => {
      const response = await apiFetch(`/api/profiles/${profileId}`);
      const json = (await response.json()) as { ok: boolean; data?: PublicProfileDto; error?: { message: string } };
      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Das Profil konnte nicht geladen werden.");
        return;
      }
      setProfile(json.data);
    })();
  }, [profileId, status]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-5xl px-4 py-6">
      {error ? <div className="alert alert-error">{error}</div> : null}
      {profile ? (
        <div className="space-y-6">
          <div className="hero-panel rounded-[2rem] p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Profil</p>
            <h1 className="text-3xl font-bold">{profile.name ?? "Unbekannt"}</h1>
            <p className="mt-2 text-base-content/70">{profile.bio ?? "Keine Bio hinterlegt."}</p>
            <p className="mt-3 text-sm text-base-content/60">Sichtbar sind nur Community-Daten eingeloggter Nutzer. Private Kontodaten wie die E-Mail-Adresse werden hier nicht angezeigt.</p>
          </div>

          {profile.posts.length === 0 ? (
            <section className="surface-card card border-dashed">
              <div className="card-body">
                <h2 className="card-title">Noch keine Posts</h2>
                <p>Dieses Profil hat noch nichts veröffentlicht.</p>
              </div>
            </section>
          ) : (
            <div className="space-y-4">
              {profile.posts.map((post) => (
                <article key={post.id} className="surface-card card">
                  <div className="card-body">
                    <div className="badge badge-outline w-fit">{POST_TYPE_LABELS[post.postType]}</div>
                    <h2 className="card-title">{post.snapshotName}</h2>
                    <p className="text-sm text-base-content/70">{formatPostSnapshotMeta(post.snapshotSpecies, post.createdAt)}</p>
                    <p>{post.text}</p>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {post.images.map((image) => (
                        <AuthenticatedImage key={image} src={image} alt={post.snapshotName} className="h-40 w-full rounded-2xl object-cover" />
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <Link href="/feed" className="btn btn-outline w-fit">Zurück zum Feed</Link>
        </div>
      ) : null}
    </main>
  );
}
