import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import WaitlistRequestForm from "@/components/WaitlistRequestForm";

export const GOOGLE_LOGIN_LABEL = "Mit Google anmelden";
export const EMAIL_FALLBACK_LOGIN_LABEL = "Login-Link senden";

const isEmailFallbackEnabled = process.env.NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED === "true";

export function getAuthErrorMessage(error: string | string[] | undefined): string | null {
  const code = Array.isArray(error) ? error[0] : error;
  if (!code) {
    return null;
  }

  if (code === "AccessDenied") {
    return "Dieser Account ist noch nicht für die geschlossene Beta freigeschaltet. Nutze bitte die Warteliste.";
  }

  if (code === "OAuthAccountNotLinked") {
    return "Für diese E-Mail existiert bereits ein Zugang. Bitte melde dich mit der ursprünglich genutzten Methode an oder kontaktiere den Support.";
  }

  if (code === "Configuration") {
    return "Der Google-Login ist aktuell nicht vollständig konfiguriert.";
  }

  return "Der Login konnte nicht abgeschlossen werden.";
}

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

  async function handleGoogleLogin() {
    setError(null);
    setMessage(null);
    setSubmitting(true);

    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
      });
    } catch {
      setError("Der Google-Login konnte nicht gestartet werden.");
      setSubmitting(false);
    }
  }

  const authError = getAuthErrorMessage(router.query.error);

  return (
    <main className="page-shell mx-auto flex min-h-screen max-w-6xl flex-col justify-center gap-8 px-6 py-10 lg:flex-row lg:items-center">
      <section className="landing-copy max-w-xl space-y-6">
        <div className="badge badge-outline px-4 py-3 text-primary">Bonsai Tracker</div>
        <h1 className="text-5xl font-bold leading-tight">Behalte Pflege, Entwicklung und Fotos deiner Bonsai übersichtlich an einem Ort.</h1>
        <p className="text-lg text-base-content/70">
          Verwalte deine Sammlung und halte fest, wann du gegossen, gedüngt, umgetopft oder geschnitten hast. So bleibt die Entwicklung jedes Baums nachvollziehbar, mit Notizen und Bildern direkt dabei.
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
        {status !== "authenticated" ? (
          <div className="flex flex-wrap gap-3 text-sm text-base-content/70">
            <Link href="/waitlist" className="btn btn-outline">
              Zur öffentlichen Warteliste
            </Link>
            <p className="max-w-sm self-center">Du willst Bonsai Tracker schon jetzt teilen? Nutze die neue Landingpage für die Voranmeldung.</p>
          </div>
        ) : null}
      </section>

      <section className="surface-card card w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl">Login und Beta-Zugang</h2>
          <p className="text-base-content/70">Du hast schon einen Zugang? Dann melde dich mit deinem Google-Konto an. Wenn du neu bist, kannst du dich für die Warteliste eintragen.</p>
          {authError ? <div className="alert alert-error">{authError}</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <div className="space-y-4 border-b border-base-300 pb-6">
            <button className="btn btn-primary w-full" disabled={submitting} onClick={handleGoogleLogin} type="button">
              {submitting ? <span className="loading loading-spinner loading-sm" /> : <span aria-hidden="true">G</span>}
              {GOOGLE_LOGIN_LABEL}
            </button>
            {isEmailFallbackEnabled ? (
              <form className="space-y-4 pt-2" onSubmit={handleLogin}>
                <fieldset className="fieldset gap-2">
                  <legend className="fieldset-legend text-sm font-medium">Fallback per E-Mail</legend>
                  <input
                    className="input input-bordered"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="du@example.com"
                    required
                  />
                </fieldset>
                <button className="btn btn-outline w-full" disabled={submitting || !email}>
                  {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
                  {EMAIL_FALLBACK_LOGIN_LABEL}
                </button>
              </form>
            ) : null}
          </div>
          <div className="border-t border-base-300 pt-6">
            <WaitlistRequestForm
              title="Neu hier? Zugang anfragen"
              description="Wenn du vor dem offiziellen Start informiert werden willst, kannst du dich hier direkt auf die Warteliste setzen."
              submitLabel="Warteliste anfragen"
              variant="embedded"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
