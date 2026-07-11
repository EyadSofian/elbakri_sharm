import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminProfile, type AdminProfile } from "./auth";

/** Throws if the caller is not an active admin. Use at the top of every action. */
export async function assertAdmin(): Promise<AdminProfile> {
  const profile = await getAdminProfile();
  if (!profile) throw new Error("غير مصرح لك بهذا الإجراء");
  return profile;
}

export async function audit(
  action: string,
  entityType: string,
  entityId: string | null,
  before: unknown,
  after: unknown,
) {
  const profile = await getAdminProfile();
  const supabase = await createClient();
  await supabase.from("audit_logs").insert({
    actor_id: profile?.id ?? null,
    actor_email: profile?.email ?? null,
    action,
    entity_type: entityType,
    entity_id: entityId,
    before: (before as object) ?? null,
    after: (after as object) ?? null,
  });
}

/** Revalidate every public surface affected by a catalog change. */
export function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/honeymoon");
  revalidatePath("/destinations/[destinationSlug]", "page");
  revalidatePath("/hotels/[hotelSlug]", "page");
  revalidatePath("/honeymoon/[identifier]", "page");
  revalidatePath("/sitemap.xml");
}
