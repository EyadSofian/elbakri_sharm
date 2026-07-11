import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

/**
 * Cookie-free anon client for PUBLIC reads. Because it never touches cookies,
 * pages that use it can still be statically generated / ISR-cached. RLS limits
 * it to published, non-archived rows.
 */
export function createPublicClient() {
  return createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
