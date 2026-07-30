import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

type QueryValue = string | string[] | undefined;
type CallbackQuery = {
  code?: QueryValue;
  error?: QueryValue;
  error_code?: QueryValue;
  error_description?: QueryValue;
  type?: QueryValue;
};

export const AUTH_SUCCESS_REDIRECT = "/dashboard";
export const AUTH_RECOVERY_REDIRECT = "/auth/reset-password";
export const AUTH_CALLBACK_PATH = "/auth/callback";
export const AUTH_CALLBACK_ERROR_MESSAGE = "Der Login konnte nicht abgeschlossen werden.";

export function getFirstQueryValue(value: QueryValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function getCallbackCode(query: CallbackQuery): string | undefined {
  return getFirstQueryValue(query.code);
}

export function isRecoveryCallback(query: CallbackQuery): boolean {
  return getFirstQueryValue(query.type) === "recovery";
}

export function getCallbackSuccessRedirect(query: CallbackQuery): string {
  return isRecoveryCallback(query) ? AUTH_RECOVERY_REDIRECT : AUTH_SUCCESS_REDIRECT;
}

export function getCallbackStartPageError(query: CallbackQuery): string | null {
  const parts = [
    getFirstQueryValue(query.error),
    getFirstQueryValue(query.error_code),
    getFirstQueryValue(query.error_description),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!parts) {
    return null;
  }

  if (
    parts.includes("access_denied") ||
    parts.includes("access denied") ||
    parts.includes("not allowed") ||
    parts.includes("not approved") ||
    parts.includes("signup")
  ) {
    return "AccessDenied";
  }

  if (parts.includes("configuration") || parts.includes("provider")) {
    return "Configuration";
  }

  return "Callback";
}

export function shouldShowMissingCallbackCodeError(query: CallbackQuery): boolean {
  return !getCallbackStartPageError(query) && !getCallbackCode(query);
}

export function getStartPageAuthErrorUrl(errorCode: string): string {
  return `/?error=${encodeURIComponent(errorCode)}`;
}

export function getCallbackCleanPath(): string {
  return AUTH_CALLBACK_PATH;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const exchangedCodeRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const startPageError = getCallbackStartPageError(router.query);
    if (startPageError) {
      void router.replace(getStartPageAuthErrorUrl(startPageError));
      return;
    }

    const code = getCallbackCode(router.query);
    if (shouldShowMissingCallbackCodeError(router.query)) {
      setError(AUTH_CALLBACK_ERROR_MESSAGE);
      return;
    }
    if (!code) {
      return;
    }
    if (exchangedCodeRef.current === code) {
      return;
    }
    exchangedCodeRef.current = code;

    const successRedirect = getCallbackSuccessRedirect(router.query);
    window.history.replaceState(null, "", getCallbackCleanPath());

    void (async () => {
      const { error: exchangeError } = await getBrowserSupabaseClient().auth.exchangeCodeForSession(code);
      if (exchangeError) {
        console.error("Supabase auth code exchange failed", {
          code: exchangeError.code,
          message: exchangeError.message,
          status: exchangeError.status,
        });
        setError(AUTH_CALLBACK_ERROR_MESSAGE);
        return;
      }
      void router.replace(successRedirect);
    })();
  }, [router]);

  return (
    <main className="page-shell mx-auto flex min-h-screen max-w-xl items-center justify-center px-6">
      <section className="surface-card card w-full">
        <div className="card-body">
          <h1 className="card-title">Login wird abgeschlossen</h1>
          {error ? <div className="alert alert-error">{error}</div> : <span className="loading loading-spinner loading-lg" />}
        </div>
      </section>
    </main>
  );
}
