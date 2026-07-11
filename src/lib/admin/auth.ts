import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ADMIN_LOGIN } from "@/lib/supabase/middleware";

export type AdminProfile = {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  full_name: string | null;
};

/** Returns the profile ONLY if the user is an active admin — else null. */
export async function getAdminProfile(): Promise<AdminProfile | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id,email,role,is_active,full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!data || data.is_active !== true || data.role !== "admin") return null;
  return data as AdminProfile;
}

/** Server-side gate for every authenticated admin page/action. */
export async function requireAdmin(): Promise<AdminProfile> {
  const profile = await getAdminProfile();
  if (!profile) redirect(ADMIN_LOGIN);
  return profile;
}
