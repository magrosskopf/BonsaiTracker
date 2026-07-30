import { getBrowserSupabaseClient } from "@/lib/supabase/browser";

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
  options: { auth?: "required" | "none" } = {},
): Promise<Response> {
  const auth = options.auth ?? "required";
  if (auth === "none") {
    return fetch(input, init);
  }

  const supabase = getBrowserSupabaseClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: { code: "UNAUTHENTICATED", message: "Du musst angemeldet sein." } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const first = await fetch(input, { ...init, headers });
  if (first.status !== 401) {
    return first;
  }

  const refreshed = await supabase.auth.refreshSession();
  const refreshedToken = refreshed.data.session?.access_token;
  if (refreshed.error || !refreshedToken) {
    return first;
  }

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set("Authorization", `Bearer ${refreshedToken}`);
  return fetch(input, { ...init, headers: retryHeaders });
}
