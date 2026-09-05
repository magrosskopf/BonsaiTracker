import Link from "next/link";
import { useRouter } from "next/router";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export const GOOGLE_LOGIN_LABELS = {
  login: "Mit Google anmelden",
  signup: "Mit Google registrieren",
} as const;
export const EMAIL_PASSWORD_LOGIN_LABEL = "Mit E-Mail anmelden";
export const EMAIL_PASSWORD_SIGNUP_LABEL = "Mit E-Mail registrieren";
export const MAGIC_LINK_FALLBACK_LABEL = "Login-Link per E-Mail senden";
export const EMAIL_FALLBACK_LOGIN_LABEL = MAGIC_LINK_FALLBACK_LABEL;
export const PASSWORD_RESET_LABEL = "Passwort vergessen?";
export const AUTH_CALLBACK_PATH = "/auth/callback";

const isEmailFallbackEnabled = process.env.NEXT_PUBLIC_AUTH_EMAIL_FALLBACK_ENABLED === "true";
export type AuthMode = "login" | "signup" | "reset";
type SubmitAction = "google" | "login" | "signup" | "reset" | "magic-link";
const AUTH_INPUT_CLASS = "input input-bordered input-lg w-full bg-base-100 text-base";

export function getAuthCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}${AUTH_CALLBACK_PATH}`;
}

export function normalizeAuthEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function validatePasswordSignup(password: string, confirmation: string): string | null {
  if (password.length < 8) {
    return "Das Passwort muss mindestens 8 Zeichen lang sein.";
  }

  if (password !== confirmation) {
    return "Passwort und Bestätigung stimmen nicht überein.";
  }

  return null;
}

export function getAuthModeTitle(mode: AuthMode): string {
  if (mode === "signup") {
    return EMAIL_PASSWORD_SIGNUP_LABEL;
  }

  if (mode === "reset") {
    return "Passwort zurücksetzen";
  }

  return EMAIL_PASSWORD_LOGIN_LABEL;
}

export function getGoogleLoginLabel(mode: AuthMode): string {
  return mode === "signup" ? GOOGLE_LOGIN_LABELS.signup : GOOGLE_LOGIN_LABELS.login;
}

export function getAuthErrorMessage(error: string | string[] | undefined): string | null {
  const code = Array.isArray(error) ? error[0] : error;
  if (!code) {
    return null;
  }

  if (code === "AccessDenied") {
    return "Der Zugriff wurde abgelehnt. Bitte melde dich erneut an oder kontaktiere den Support.";
  }

  if (code === "OAuthAccountNotLinked") {
    return "Für diese E-Mail existiert bereits ein Zugang. Bitte melde dich mit der ursprünglich genutzten Methode an oder kontaktiere den Support.";
  }

  if (code === "Configuration") {
    return "Der Google-Login ist aktuell nicht vollständig konfiguriert.";
  }

  return "Der Login konnte nicht abgeschlossen werden.";
}

function AuthField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="fieldset w-full gap-2 p-0">
      <legend className="fieldset-legend flex w-full items-center justify-between p-0 text-sm font-semibold text-base-content">
        {label}
      </legend>
      {children}
      {hint ? <p className="label-text-alt leading-relaxed text-base-content/60">{hint}</p> : null}
    </fieldset>
  );
}

export default function Home() {
  const router = useRouter();
  const { session, status, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittingAction, setSubmittingAction] = useState<SubmitAction | null>(null);
  const submitting = submittingAction !== null;

  function clearFeedback() {
    setError(null);
    setMessage(null);
  }

  function switchAuthMode(nextMode: AuthMode) {
    setAuthMode(nextMode);
    setPassword("");
    setPasswordConfirmation("");
    clearFeedback();
  }

  async function handleEmailPasswordLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail || !password) {
      setError("Bitte gib E-Mail und Passwort ein.");
      return;
    }

    setSubmittingAction("login");

    try {
      const { error: signInError } = await getBrowserSupabaseClient().auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (signInError) {
        setError("E-Mail oder Passwort stimmen nicht.");
        return;
      }

      void router.push("/dashboard");
    } catch {
      setError("E-Mail oder Passwort stimmen nicht.");
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handleEmailPasswordSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail) {
      setError("Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    const passwordError = validatePasswordSignup(password, passwordConfirmation);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setSubmittingAction("signup");

    try {
      const { data, error: signUpError } = await getBrowserSupabaseClient().auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: getAuthCallbackUrl(window.location.origin),
        },
      });

      if (signUpError) {
        setError("Die Registrierung konnte nicht abgeschlossen werden.");
        return;
      }

      if (data.session) {
        void router.push("/dashboard");
        return;
      }

      setMessage("Bitte prüfe dein Postfach, um deine Registrierung abzuschliessen.");
    } catch {
      setError("Die Registrierung konnte nicht abgeschlossen werden.");
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handlePasswordReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail) {
      setError("Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    setSubmittingAction("reset");

    try {
      const { error: resetError } = await getBrowserSupabaseClient().auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: getAuthCallbackUrl(window.location.origin),
      });

      if (resetError) {
        setError("Die Reset-E-Mail konnte nicht versendet werden.");
        return;
      }

      setMessage("Wenn ein Konto existiert, senden wir dir eine E-Mail zum Zurücksetzen.");
    } catch {
      setError("Die Reset-E-Mail konnte nicht versendet werden.");
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handleMagicLinkFallback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const normalizedEmail = normalizeAuthEmail(email);
    if (!normalizedEmail) {
      setError("Bitte gib eine E-Mail-Adresse ein.");
      return;
    }

    setSubmittingAction("magic-link");

    try {
      const result = await getBrowserSupabaseClient().auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: getAuthCallbackUrl(window.location.origin),
          shouldCreateUser: false,
        },
      });

      if (result?.error) {
        setError("Der Login-Link konnte nicht versendet werden.");
        return;
      }

      setMessage("Der Login-Link wurde versendet. Bitte prüfe dein Postfach.");
    } catch {
      setError("Der Login-Link konnte nicht gestartet werden.");
    } finally {
      setSubmittingAction(null);
    }
  }

  async function handleGoogleLogin() {
    clearFeedback();
    setSubmittingAction("google");

    try {
      const { error: signInError } = await getBrowserSupabaseClient().auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl(window.location.origin),
        },
      });
      if (signInError) {
        throw signInError;
      }
    } catch {
      setError("Der Google-Login konnte nicht gestartet werden.");
      setSubmittingAction(null);
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
            <button className="btn btn-outline" onClick={() => void signOut()}>
              Logout
            </button>
          </div>
        ) : null}
      </section>

      <section className="surface-card card w-full max-w-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl">Anmelden oder Konto erstellen</h2>
          <p className="text-base-content/70">
            Wähle Anmeldung oder Registrierung und nutze danach Google oder E-Mail und Passwort.
          </p>
          {authError ? <div className="alert alert-error">{authError}</div> : null}
          {message ? <div className="alert alert-success">{message}</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <div className="space-y-4 border-b border-base-300 pb-6">
            <div className="join grid grid-cols-2">
              <button
                className={`btn join-item ${authMode === "login" ? "btn-active" : "btn-outline"}`}
                disabled={submitting}
                onClick={() => switchAuthMode("login")}
                type="button"
              >
                Anmelden
              </button>
              <button
                className={`btn join-item ${authMode === "signup" ? "btn-active" : "btn-outline"}`}
                disabled={submitting}
                onClick={() => switchAuthMode("signup")}
                type="button"
              >
                Registrieren
              </button>
            </div>
            <button className="btn btn-primary w-full" disabled={submitting} onClick={handleGoogleLogin} type="button">
              {submittingAction === "google" ? <span className="loading loading-spinner loading-sm" /> : <span aria-hidden="true">G</span>}
              {getGoogleLoginLabel(authMode)}
            </button>
            {authMode === "reset" ? (
              <form className="space-y-5 pt-2" onSubmit={handlePasswordReset}>
                <h3 className="text-lg font-semibold">{getAuthModeTitle(authMode)}</h3>
                <p className="text-sm text-base-content/60">Erhalte eine E-Mail, um dein Passwort fuer ein bestehendes Konto zu erneuern.</p>
                <AuthField label="E-Mail-Adresse">
                  <input
                    className={AUTH_INPUT_CLASS}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="du@example.com"
                    autoComplete="email"
                    required
                  />
                </AuthField>
                <button className="btn btn-primary w-full" disabled={submitting || !email}>
                  {submittingAction === "reset" ? <span className="loading loading-spinner loading-sm" /> : null}
                  Reset-E-Mail senden
                </button>
                <button className="btn btn-ghost w-full" disabled={submitting} onClick={() => switchAuthMode("login")} type="button">
                  Zur Anmeldung
                </button>
              </form>
            ) : (
              <form className="space-y-5 pt-2" onSubmit={authMode === "signup" ? handleEmailPasswordSignup : handleEmailPasswordLogin}>
                <h3 className="text-lg font-semibold">{getAuthModeTitle(authMode)}</h3>
                <p className="text-sm text-base-content/60">
                  {authMode === "signup" ? "Erstelle ein neues Konto mit E-Mail und Passwort." : "Melde dich mit den Zugangsdaten deines bestehenden Kontos an."}
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <AuthField label="E-Mail-Adresse">
                      <input
                        className={AUTH_INPUT_CLASS}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="du@example.com"
                        autoComplete="email"
                        required
                      />
                    </AuthField>
                  </div>
                  <div className={authMode === "signup" ? undefined : "md:col-span-2"}>
                    <AuthField label="Passwort" hint={authMode === "signup" ? "Mindestens 8 Zeichen." : undefined}>
                      <input
                        className={AUTH_INPUT_CLASS}
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete={authMode === "signup" ? "new-password" : "current-password"}
                        minLength={authMode === "signup" ? 8 : undefined}
                        required
                      />
                    </AuthField>
                  </div>
                  {authMode === "signup" ? (
                    <AuthField label="Passwort bestätigen">
                      <input
                        className={AUTH_INPUT_CLASS}
                        type="password"
                        value={passwordConfirmation}
                        onChange={(event) => setPasswordConfirmation(event.target.value)}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </AuthField>
                  ) : null}
                </div>
                <button className="btn btn-primary w-full" disabled={submitting || !email || !password || (authMode === "signup" && !passwordConfirmation)}>
                  {submittingAction === authMode ? <span className="loading loading-spinner loading-sm" /> : null}
                  {authMode === "signup" ? EMAIL_PASSWORD_SIGNUP_LABEL : EMAIL_PASSWORD_LOGIN_LABEL}
                </button>
                {authMode === "login" ? (
                  <button className="btn btn-ghost w-full" disabled={submitting} onClick={() => switchAuthMode("reset")} type="button">
                    {PASSWORD_RESET_LABEL}
                  </button>
                ) : null}
              </form>
            )}
            {isEmailFallbackEnabled ? (
              <form className="space-y-4 border-t border-base-300 pt-5" onSubmit={handleMagicLinkFallback}>
                <AuthField label="Probleme beim Einloggen?">
                  <input
                    className={AUTH_INPUT_CLASS}
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="du@example.com"
                    autoComplete="email"
                    required
                  />
                </AuthField>
                <button className="btn btn-outline w-full" disabled={submitting || !email}>
                  {submittingAction === "magic-link" ? <span className="loading loading-spinner loading-sm" /> : null}
                  {MAGIC_LINK_FALLBACK_LABEL}
                </button>
              </form>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
