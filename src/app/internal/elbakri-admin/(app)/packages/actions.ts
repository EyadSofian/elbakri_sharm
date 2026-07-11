"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin, audit, revalidatePublic } from "@/lib/admin/mutations";

export type ActionState = { ok?: boolean; error?: string };

const PRICE_UNITS = ["per_person_trip", "per_person_night", "per_room_night", "per_room_trip"] as const;

const createSchema = z.object({
  destination_id: z.string().uuid("اختر وجهة"),
  name_ar: z.string().min(1, "اسم الباقة مطلوب"),
  price_unit: z.enum(PRICE_UNITS),
  note_ar: z.string().optional(),
});

export async function createPackage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const parsed = createSchema.safeParse({
    destination_id: formData.get("destination_id"),
    name_ar: formData.get("name_ar"),
    price_unit: formData.get("price_unit"),
    note_ar: formData.get("note_ar") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const supabase = await createClient();
  const { count } = await supabase
    .from("package_categories")
    .select("*", { count: "exact", head: true })
    .eq("destination_id", parsed.data.destination_id);

  const { data, error } = await supabase
    .from("package_categories")
    .insert({
      destination_id: parsed.data.destination_id,
      code: `pkg-${randomUUID().slice(0, 8)}`,
      name_ar: parsed.data.name_ar,
      price_unit: parsed.data.price_unit,
      note_ar: parsed.data.note_ar || null,
      display_order: count ?? 0,
      is_published: true,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  await audit("create", "package_category", data?.id ?? null, null, parsed.data);
  revalidatePublic();
  revalidatePath("/internal/elbakri-admin/packages");
  return { ok: true };
}

export async function setPackagePublished(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id"));
  const publish = String(formData.get("publish")) === "true";
  const supabase = await createClient();
  await supabase.from("package_categories").update({ is_published: publish }).eq("id", id);
  await audit(publish ? "publish" : "unpublish", "package_category", id, null, { is_published: publish });
  revalidatePublic();
  revalidatePath("/internal/elbakri-admin/packages");
}

export async function archivePackage(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id"));
  const supabase = await createClient();
  // Soft archive (never hard-delete — legacy URLs/history are preserved).
  await supabase.from("package_categories").update({ is_archived: true, is_published: false }).eq("id", id);
  await audit("archive", "package_category", id, null, { is_archived: true });
  revalidatePublic();
  revalidatePath("/internal/elbakri-admin/packages");
}
