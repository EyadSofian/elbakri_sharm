"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin, audit, revalidatePublic } from "@/lib/admin/mutations";

export type ActionState = { ok?: boolean; error?: string };

const emptyToNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
};

const schema = z.object({
  phone: z.string().min(1, "الهاتف مطلوب"),
  whatsapp: z.string().min(1, "واتساب مطلوب"),
  email: z.string().email("بريد غير صالح").nullable(),
  location_ar: z.string().nullable(),
  working_hours_ar: z.string().nullable(),
  social_instagram: z.string().url("رابط غير صالح").nullable(),
  social_facebook: z.string().url("رابط غير صالح").nullable(),
  default_whatsapp_message: z.string().min(1, "الرسالة الافتراضية مطلوبة"),
});

export async function updateSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const parsed = schema.safeParse({
    phone: String(formData.get("phone") ?? "").trim(),
    whatsapp: String(formData.get("whatsapp") ?? "").trim(),
    email: emptyToNull(formData.get("email")),
    location_ar: emptyToNull(formData.get("location_ar")),
    working_hours_ar: emptyToNull(formData.get("working_hours_ar")),
    social_instagram: emptyToNull(formData.get("social_instagram")),
    social_facebook: emptyToNull(formData.get("social_facebook")),
    default_whatsapp_message: String(formData.get("default_whatsapp_message") ?? "").trim(),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };

  const supabase = await createClient();
  const { data: before } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const { error } = await supabase.from("site_settings").upsert({ id: 1, ...parsed.data });
  if (error) return { error: error.message };

  await audit("update", "site_settings", "1", before, parsed.data);
  revalidatePublic();
  return { ok: true };
}
