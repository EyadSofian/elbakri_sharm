"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const schema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const ADMIN_HOME = "/internal/elbakri-admin";

export type SignInState = { error?: string };

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  if (!isSupabaseConfigured()) {
    return { error: "لم يتم إعداد Supabase بعد. أضف مفاتيح البيئة أولاً." };
  }
  const parsed = schema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return { error: "فشل تسجيل الدخول. تحقق من البريد وكلمة المرور." };
  }

  // Server-side allowlist check — hidden URL is not authorization.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!profile || profile.role !== "admin" || profile.is_active !== true) {
    await supabase.auth.signOut();
    return { error: "هذا الحساب غير مُصرّح له بالدخول إلى لوحة التحكم." };
  }

  // Open-redirect guard: only same-area paths are allowed.
  const requested = String(formData.get("redirect") ?? "");
  const target = requested.startsWith(ADMIN_HOME) ? requested : ADMIN_HOME;
  redirect(target);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/internal/elbakri-admin/login");
}
