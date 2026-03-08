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
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistMessage, setWaitlistMessage] = useState<string | null>(null);
  const [waitlistError, setWaitlistError] = useState<string | null>(null);
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      const precheckResponse = await fetch("/api/auth/precheck", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const precheckPayload = await precheckResponse.json();
      if (!precheckResponse.ok || !precheckPayload?.ok) {
        setError("Die Anmeldung konnte nicht gestartet werden.");
        return;
      }

      if (!precheckPayload.data?.allowed) {
        setError(precheckPayload.data?.message ?? "Registrierungen sind aktuell nur mit Freigabe möglich.");
        return;
      }

      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Der Magic Link konnte nicht versendet werden.");
        return;
      }

      setMessage("Der Login-Link wurde versendet. Bitte prüfe dein Postfach.");
    } catch {
      setError("Die Anmeldung konnte nicht gestartet werden.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleWaitlistRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWaitlistError(null);
    setWaitlistMessage(null);
    setWaitlistSubmitting(true);

    try {
      const response = await fetch("/api/access-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: waitlistEmail }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        setWaitlistError(payload?.error?.message ?? "Die Wartelisten-Anfrage konnte nicht gesendet werden.");
        return;
      }

      setWaitlistMessage(payload.data?.message ?? "Danke. Wir melden uns, sobald ein Platz frei wird.");
      setWaitlistEmail("");
    } catch {
      setWaitlistError("Die Wartelisten-Anfrage konnte nicht gesendet werden.");
    } finally {
      setWaitlistSubmitting(false);
    }
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-10 lg:flex-row lg:items-center">
      <section className="landing-copy max-w-xl space-y-6">
        <div className="badge badge-outline px-4 py-3 text-primary">Bonsai Tracker</div>
        <h1 className="text-5xl font-bold leading-tight">Behalte Pflege, Entwicklung und Fotos deiner Bonsai uebersichtlich an einem Ort.</h1>
        <p className="text-lg text-base-content/70">
          Verwalte deine Sammlung und halte fest, wann du gegossen, geduengt, umgetopft oder geschnitten hast. So bleibt die Entwicklung jedes Baums nachvollziehbar, mit Notizen und Bildern direkt dabei.
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
          <h2 className="card-title text-2xl">Login und Beta-Zugang</h2>
          <p className="text-base-content/70">Du hast schon einen Zugang? Dann fordere hier deinen Login-Link an. Wenn du neu bist, kannst du dich fuer die Warteliste eintragen.</p>
          {router.query.error ? <div className="alert alert-error">Der Login konnte nicht abgeschlossen werden.</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <form className="space-y-4 border-b border-base-300 pb-6" onSubmit={handleLogin}>
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">Bestehender Account</legend>
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
          {waitlistMessage ? <div className="alert alert-success">{waitlistMessage}</div> : null}
          {waitlistError ? <div className="alert alert-error">{waitlistError}</div> : null}
          <form className="space-y-4 pt-2" onSubmit={handleWaitlistRequest}>
            <fieldset className="fieldset gap-2">
              <legend className="fieldset-legend text-sm font-medium">Neu hier? Zugang anfragen</legend>
              <input
                className="input input-bordered"
                type="email"
                value={waitlistEmail}
                onChange={(event) => setWaitlistEmail(event.target.value)}
                placeholder="du@example.com"
                required
              />
            </fieldset>
            <button className="btn btn-outline w-full" disabled={waitlistSubmitting || !waitlistEmail}>
              {waitlistSubmitting ? <span className="loading loading-spinner loading-sm" /> : null}
              Warteliste anfragen
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
