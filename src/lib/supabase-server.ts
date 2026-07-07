import "server-only";
import { createClient } from "@supabase/supabase-js";

// Server-only client using the service_role key. This key bypasses Row
// Level Security, so it must never be sent to the browser — only import
// this file from API routes / server components.
export function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
