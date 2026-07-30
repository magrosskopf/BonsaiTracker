import "@/lib/server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { getServerSupabaseConfig } from "@/lib/config/runtime";

let dataClient: SupabaseClient<Database> | null = null;

export function getServerDataClient(): SupabaseClient<Database> & any {
  if (dataClient) {
    return dataClient;
  }
  const { url, secretKey } = getServerSupabaseConfig();
  dataClient = createClient<Database>(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return dataClient;
}
