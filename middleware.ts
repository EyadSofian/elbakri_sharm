import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Only run on the hidden admin area — the public site is never touched.
export const config = {
  matcher: ["/internal/:path*"],
};
