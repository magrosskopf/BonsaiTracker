import "@/lib/server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getBrowserSupabaseConfig } from "@/lib/config/runtime";

let authClient: SupabaseClient<Database> | null = null;

export function getServerAuthClient(): SupabaseClient<Database> {
  if (authClient) {
    return authClient;
  }
  const { url, publishableKey } = getBrowserSupabaseConfig();
  authClient = createClient<Database>(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return authClient;
}
