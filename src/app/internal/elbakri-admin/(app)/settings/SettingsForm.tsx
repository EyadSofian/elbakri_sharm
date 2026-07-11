"use client";

import { useActionState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { updateSettings, type ActionState } from "./actions";

export type Settings = {
  phone: string;
  whatsapp: string;
  email: string | null;
  location_ar: string | null;
  working_hours_ar: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  default_whatsapp_message: string;
};

function Field({
  name,
  label,
  defaultValue,
  hint,
  dir,
}: {
  name: string;
  label: string;
  defaultValue: string;
  hint?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-bold text-navy">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        dir={dir}
        className={`${dir === "ltr" ? "ltr " : ""}w-full rounded-lg border border-ice bg-white px-3 py-2 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20`}
      />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(updateSettings, {});
  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-ice bg-white p-5 md:grid-cols-2">
      <Field name="phone" label="الهاتف" defaultValue={settings.phone} dir="ltr" />
      <Field name="whatsapp" label="واتساب (أرقام فقط)" defaultValue={settings.whatsapp} dir="ltr" />
      <Field name="email" label="البريد الإلكتروني" defaultValue={settings.email ?? ""} dir="ltr" hint="يُترك فارغًا فلا يظهر للعامة" />
      <Field name="location_ar" label="المقر" defaultValue={settings.location_ar ?? ""} />
      <Field name="working_hours_ar" label="أوقات العمل" defaultValue={settings.working_hours_ar ?? ""} />
      <Field name="social_instagram" label="إنستغرام (رابط)" defaultValue={settings.social_instagram ?? ""} dir="ltr" />
      <Field name="social_facebook" label="فيسبوك (رابط)" defaultValue={settings.social_facebook ?? ""} dir="ltr" />
      <Field
        name="default_whatsapp_message"
        label="رسالة واتساب الافتراضية"
        defaultValue={settings.default_whatsapp_message}
      />
      <div className="md:col-span-2">
        <button
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-lg bg-navy px-4 py-2 text-sm font-bold text-white transition hover:bg-blue disabled:opacity-60"
        >
          {state.ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {pending ? "جارٍ الحفظ…" : state.ok ? "تم الحفظ" : "حفظ الإعدادات"}
        </button>
        {state.error && (
          <span role="alert" className="mr-3 text-sm text-error">
            {state.error}
          </span>
        )}
      </div>
    </form>
  );
}
