import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseConfigured } from "./env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export const ADMIN_BASE = "/internal/elbakri-admin";
export const ADMIN_LOGIN = `${ADMIN_BASE}/login`;

/**
 * Refreshes the Supabase auth session and gates the hidden admin area.
 * Full authorization (active admin allowlist) is re-checked server-side in the
 * admin layout/actions — this is the first, coarse gate only.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;

  if (!isSupabaseConfigured()) {
    // Admin unavailable without Supabase; the login page renders a notice.
    return response;
  }

  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLogin = path === ADMIN_LOGIN;
  if (path.startsWith(ADMIN_BASE) && !isLogin && !user) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN;
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return response;
}
