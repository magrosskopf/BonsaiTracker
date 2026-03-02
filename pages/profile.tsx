import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import type { ProfileDto } from "@/types/dto";
import { POST_TYPE_LABELS } from "@/types/domain";

export default function Profile() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      void router.replace("/");
    },
  });
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    void (async () => {
      const response = await fetch("/api/profile/me");
      const json = (await response.json()) as { ok: boolean; data?: ProfileDto; error?: { message: string } };
      if (!response.ok || !json.ok || !json.data) {
        setError(json.error?.message ?? "Das Profil konnte nicht geladen werden.");
        return;
      }

      setProfile(json.data);
      setName(json.data.name ?? "");
      setBio(json.data.bio ?? "");
      setProfileImageUrl(json.data.profileImageUrl ?? "");
    })();
  }, [status]);

  async function saveProfile() {
    setError(null);
    setSuccess(null);
    const response = await fetch("/api/profile/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        bio,
        profileImageUrl,
      }),
    });
    const json = (await response.json()) as { ok: boolean; data?: ProfileDto; error?: { message: string } };
    if (!response.ok || !json.ok || !json.data) {
      setError(json.error?.message ?? "Das Profil konnte nicht gespeichert werden.");
      return;
    }
    setProfile(json.data);
    setSuccess("Profil gespeichert.");
  }

  if (status !== "authenticated" || !session) {
    return null;
  }

  return (
    <main className="page-shell mx-auto max-w-4xl px-4 py-6">
      <div className="space-y-6">
        <div className="hero-panel rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-primary">Profil</p>
          <h1 className="text-3xl font-bold">Dein Konto</h1>
          <p className="mt-2 text-base-content/70">Dieses Profil ist fuer andere eingeloggte Nutzer im Community-Bereich sichtbar.</p>
        </div>

        {error ? <div className="alert alert-error">{error}</div> : null}
        {success ? <div className="alert alert-success">{success}</div> : null}

        <section className="surface-card card">
          <div className="card-body gap-4">
            <h2 className="card-title">Profildaten</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <fieldset className="fieldset gap-2">
                <legend className="fieldset-legend text-sm font-medium">Name</legend>
                <input className="input input-bordered" value={name} onChange={(event) => setName(event.target.value)} />
              </fieldset>
              <fieldset className="fieldset gap-2">
                <legend className="fieldset-legend text-sm font-medium">E-Mail</legend>
                <input className="input input-bordered" value={profile?.email ?? session.user.email ?? ""} disabled />
              </fieldset>
              <fieldset className="fieldset gap-2 md:col-span-2">
                <legend className="fieldset-legend text-sm font-medium">Profilbild-URL</legend>
                <input className="input input-bordered" value={profileImageUrl} onChange={(event) => setProfileImageUrl(event.target.value)} />
              </fieldset>
              <fieldset className="fieldset gap-2 md:col-span-2">
                <legend className="fieldset-legend text-sm font-medium">Bio</legend>
                <textarea className="textarea textarea-bordered h-28" value={bio} onChange={(event) => setBio(event.target.value)} />
              </fieldset>
            </div>
            <div className="card-actions justify-between">
              <Link href={`/profile/${session.user.id}`} className="btn btn-outline">Oeffentliches Profil</Link>
              <div className="flex gap-2">
                <button className="btn btn-primary" onClick={() => void saveProfile()}>
                  Speichern
                </button>
                <button className="btn btn-error" onClick={() => signOut({ callbackUrl: "/" })}>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card card">
          <div className="card-body">
            <h2 className="card-title">Deine Posts</h2>
            {profile?.posts.length ? (
              <div className="space-y-4">
                {profile.posts.map((post) => (
                  <article key={post.id} className="rounded-2xl border border-base-300 p-4">
                    <div className="badge badge-outline mb-2">{POST_TYPE_LABELS[post.postType]}</div>
                    <h3 className="font-semibold">{post.snapshotName}</h3>
                    <p className="mt-2 text-sm text-base-content/70">{post.text}</p>
                    <p className="mt-2 text-xs text-base-content/60">{post.likeCount} Likes · {post.commentCount} Kommentare</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-base-content/70">Du hast noch keine Posts veroeffentlicht.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
