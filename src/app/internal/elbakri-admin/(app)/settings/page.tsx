import { createClient } from "@/lib/supabase/server";
import { SettingsForm, type Settings } from "./SettingsForm";

const EMPTY: Settings = {
  phone: "",
  whatsapp: "",
  email: null,
  location_ar: null,
  working_hours_ar: null,
  social_instagram: null,
  social_facebook: null,
  default_whatsapp_message: "",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy">إعدادات الموقع</h1>
      <p className="mb-6 text-sm text-muted">
        الحقول الفارغة لا تظهر للعامة. تُحدَّث صفحات التواصل والفوتر فور الحفظ.
      </p>
      <SettingsForm settings={(data as Settings | null) ?? EMPTY} />
    </div>
  );
}
