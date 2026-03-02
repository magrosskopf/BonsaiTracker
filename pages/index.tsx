import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const result = await signIn("email", {
      email,
      redirect: false,
      callbackUrl: "/dashboard",
    });

    setSubmitting(false);

    if (result?.error) {
      setError("Der Magic Link konnte nicht versendet werden.");
      return;
    }

    setMessage("Der Login-Link wurde versendet. Bitte prüfe dein Postfach.");
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-10 lg:flex-row lg:items-center">
      <section className="landing-copy max-w-xl space-y-6">
        <div className="badge badge-outline px-4 py-3 text-primary">Bonsai Tracker</div>
        <h1 className="text-5xl font-bold leading-tight">Pflegeverläufe, Bilder und Entwicklung deiner Bonsais an einem Ort.</h1>
        <p className="text-lg text-base-content/70">
          Verwalte deine Sammlung, dokumentiere Pflegehistorien und halte Repot-, Düngungs- und Foto-Updates sauber in UTC-normalisierten Datensätzen fest.
        </p>
        {status === "authenticated" && session ? (
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="btn btn-primary">
              Zum Dashboard
            </Link>
            <button className="btn btn-outline" onClick={() => signOut({ callbackUrl: "/" })}>
              Logout
            </button>
          </div>
        ) : null}
      </section>

      <section className="surface-card card w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl">Login per Magic Link</h2>
          <p className="text-base-content/70">Gib deine E-Mail-Adresse ein. Nach erfolgreichem Login landest du auf `/dashboard`.</p>
          {router.query.error ? <div className="alert alert-error">Der Login konnte nicht abgeschlossen werden.</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <form className="space-y-4" onSubmit={handleLogin}>
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">E-Mail</legend>
              <input
                className="input input-bordered"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="du@example.com"
                required
              />
            </fieldset>
            <button className="btn btn-primary w-full" disabled={submitting || !email}>
              {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
              Magic Link senden
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
