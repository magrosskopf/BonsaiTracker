import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";
import { validatePasswordSignup } from "@/pages/index";

export const RESET_PASSWORD_SUBMIT_LABEL = "Passwort speichern";
export const RESET_PASSWORD_SUCCESS_REDIRECT = "/dashboard";

export function validatePasswordReset(password: string, confirmation: string): string | null {
  return validatePasswordSignup(password, confirmation);
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const passwordError = validatePasswordReset(password, passwordConfirmation);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setSubmitting(true);

    try {
      const { error: updateError } = await getBrowserSupabaseClient().auth.updateUser({ password });
      if (updateError) {
        setError("Das Passwort konnte nicht gespeichert werden. Bitte fordere eine neue Reset-E-Mail an.");
        return;
      }

      setMessage("Dein Passwort wurde gespeichert.");
      void router.replace(RESET_PASSWORD_SUCCESS_REDIRECT);
    } catch {
      setError("Das Passwort konnte nicht gespeichert werden. Bitte fordere eine neue Reset-E-Mail an.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
      <section className="surface-card card w-full">
        <div className="card-body">
          <h1 className="card-title text-2xl">Neues Passwort setzen</h1>
          {message ? <div className="alert alert-success">{message}</div> : null}
          {error ? <div className="alert alert-error">{error}</div> : null}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="form-control gap-2">
              <span className="label-text">Neues Passwort</span>
              <input
                className="input input-bordered"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <label className="form-control gap-2">
              <span className="label-text">Passwort bestätigen</span>
              <input
                className="input input-bordered"
                type="password"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <button className="btn btn-primary w-full" disabled={submitting || !password || !passwordConfirmation}>
              {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
              {RESET_PASSWORD_SUBMIT_LABEL}
            </button>
          </form>
          <Link className="btn btn-ghost" href="/">
            Neue Reset-E-Mail anfordern
          </Link>
        </div>
      </section>
    </main>
  );
}
