"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { assertAdmin, audit, revalidatePublic } from "@/lib/admin/mutations";
import { parsePrice } from "@/lib/slug";

export type ActionState = { ok?: boolean; error?: string };

const priceSchema = z.object({
  id: z.string().uuid(),
  hotelSlug: z.string().min(1),
  period_label: z.string().min(1, "الفترة مطلوبة"),
  board_ar: z.string().optional(),
  double_text: z.string().optional(),
  triple_text: z.string().optional(),
});

const priceText = /^[\d.,]*$/;

export async function updatePricePeriod(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await assertAdmin();
  const parsed = priceSchema.safeParse({
    id: formData.get("id"),
    hotelSlug: formData.get("hotelSlug"),
    period_label: formData.get("period_label"),
    board_ar: formData.get("board_ar") ?? undefined,
    double_text: formData.get("double_text") ?? undefined,
    triple_text: formData.get("triple_text") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  const d = parsed.data;
  if ((d.double_text && !priceText.test(d.double_text)) || (d.triple_text && !priceText.test(d.triple_text))) {
    return { error: "الأسعار يجب أن تحتوي أرقامًا وفواصل فقط" };
  }

  const supabase = await createClient();
  const { data: before } = await supabase.from("price_periods").select("*").eq("id", d.id).single();
  const { error } = await supabase
    .from("price_periods")
    .update({
      period_label: d.period_label,
      board_ar: d.board_ar || null,
      double_text: d.double_text || null,
      triple_text: d.triple_text || null,
      double_amount: parsePrice(d.double_text),
      triple_amount: parsePrice(d.triple_text),
    })
    .eq("id", d.id);
  if (error) return { error: error.message };

  await audit("update", "price_period", d.id, before, d);
  revalidatePublic();
  revalidatePath(`/internal/elbakri-admin/hotels/${d.hotelSlug}`);
  return { ok: true };
}

export async function setHotelPublished(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id"));
  const slug = String(formData.get("hotelSlug"));
  const publish = String(formData.get("publish")) === "true";
  const supabase = await createClient();
  await supabase.from("hotels").update({ is_published: publish }).eq("id", id);
  await audit(publish ? "publish" : "unpublish", "hotel", id, null, { is_published: publish });
  revalidatePublic();
  revalidatePath(`/internal/elbakri-admin/hotels/${slug}`);
  revalidatePath(`/internal/elbakri-admin/hotels`);
}
