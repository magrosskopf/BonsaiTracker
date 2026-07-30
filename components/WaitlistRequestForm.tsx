import { useState } from "react";
import { apiFetch } from "@/lib/api/client";

type WaitlistRequestFormVariant = "embedded" | "feature";

export interface WaitlistRequestFormProps {
  title: string;
  description?: string;
  submitLabel?: string;
  successFallbackMessage?: string;
  fieldLabel?: string;
  placeholder?: string;
  variant?: WaitlistRequestFormVariant;
}

interface AccessRequestResponse {
  ok: boolean;
  data?: {
    message?: string;
  };
  error?: {
    message?: string;
  };
}

export function getWaitlistFormContainerClasses(variant: WaitlistRequestFormVariant): string {
  if (variant === "feature") {
    return "waitlist-form waitlist-form--feature space-y-4";
  }

  return "waitlist-form space-y-4";
}

export default function WaitlistRequestForm({
  title,
  description,
  submitLabel = "Warteliste anfragen",
  successFallbackMessage = "Danke. Wir melden uns, sobald ein Platz frei wird.",
  fieldLabel = "E-Mail-Adresse",
  placeholder = "du@example.com",
  variant = "embedded",
}: WaitlistRequestFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitting(true);

    try {
      const response = await apiFetch("/api/access-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }, { auth: "none" });

      const payload = (await response.json()) as AccessRequestResponse;

      if (!response.ok || !payload.ok) {
        setError(payload.error?.message ?? "Die Wartelisten-Anfrage konnte nicht gesendet werden.");
        return;
      }

      setMessage(payload.data?.message ?? successFallbackMessage);
      setEmail("");
    } catch {
      setError("Die Wartelisten-Anfrage konnte nicht gesendet werden.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={getWaitlistFormContainerClasses(variant)}>
      <div className="space-y-2">
        {variant === "feature" ? (
          <div className="waitlist-form__meta" aria-label="Formularhinweise">
            <span className="waitlist-form__meta-item">Dauert unter 10 Sekunden</span>
            <span className="waitlist-form__meta-item">Nur deine E-Mail</span>
          </div>
        ) : null}
        <h2 className={variant === "feature" ? "text-[1.9rem] font-semibold leading-tight md:text-3xl" : "text-xl font-semibold"}>{title}</h2>
        {description ? <p className="text-base-content/72">{description}</p> : null}
      </div>
      {message ? <div className="alert alert-success waitlist-form__message">{message}</div> : null}
      {error ? <div className="alert alert-error waitlist-form__message">{error}</div> : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <fieldset className="fieldset gap-2">
          <legend className="fieldset-legend text-sm font-medium">{fieldLabel}</legend>
          <input
            className={`input input-bordered w-full ${variant === "feature" ? "waitlist-form__input" : ""}`}
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={placeholder}
            autoComplete="email"
            required
          />
        </fieldset>
        <button
          className={`btn w-full ${variant === "feature" ? "btn-primary waitlist-form__submit" : "btn-outline"}`}
          disabled={submitting || !email}
        >
          {submitting ? <span className="loading loading-spinner loading-sm" /> : null}
          {submitLabel}
        </button>
      </form>
    </div>
  );
}
