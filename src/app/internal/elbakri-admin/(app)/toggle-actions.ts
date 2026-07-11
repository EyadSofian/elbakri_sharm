"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin, audit, revalidatePublic } from "@/lib/admin/mutations";

export async function setDestinationPublished(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id"));
  const publish = String(formData.get("publish")) === "true";
  const supabase = await createClient();
  await supabase.from("destinations").update({ is_published: publish }).eq("id", id);
  await audit(publish ? "publish" : "unpublish", "destination", id, null, { is_published: publish });
  revalidatePublic();
  revalidatePath("/internal/elbakri-admin/destinations");
}

export async function setHoneymoonPublished(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id"));
  const publish = String(formData.get("publish")) === "true";
  const supabase = await createClient();
  await supabase.from("honeymoon_deals").update({ is_published: publish }).eq("id", id);
  await audit(publish ? "publish" : "unpublish", "honeymoon_deal", id, null, { is_published: publish });
  revalidatePublic();
  revalidatePath("/internal/elbakri-admin/honeymoon");
}

export async function archiveHoneymoon(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("honeymoon_deals").update({ is_archived: true, is_published: false }).eq("id", id);
  await audit("archive", "honeymoon_deal", id, null, { is_archived: true });
  revalidatePublic();
  revalidatePath("/internal/elbakri-admin/honeymoon");
}
