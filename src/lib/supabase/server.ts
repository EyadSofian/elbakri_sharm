import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * RLS-scoped Supabase client bound to the request's auth cookies.
 * Use for ALL admin reads/writes so RLS (is_admin()) is enforced end-to-end.
 */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component render — safe to ignore; middleware
          // refreshes the session cookie.
        }
      },
    },
  });
}
