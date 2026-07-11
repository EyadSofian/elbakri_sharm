import { MapPin, Package, Building2, Heart, CalendarClock, ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function count(table: string) {
  const supabase = await createClient();
  const { count: c } = await supabase.from(table).select("*", { count: "exact", head: true });
  return c ?? 0;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [destinations, packages, hotels, periods, honeymoon] = await Promise.all([
    count("destinations"),
    count("package_categories"),
    count("hotels"),
    count("price_periods"),
    count("honeymoon_deals"),
  ]);

  const publishedHotels =
    (await supabase.from("hotels").select("*", { count: "exact", head: true }).eq("is_published", true).eq("is_archived", false)).count ?? 0;
  const archivedHotels =
    (await supabase.from("hotels").select("*", { count: "exact", head: true }).eq("is_archived", true)).count ?? 0;
  const withImage =
    (await supabase.from("hotels").select("*", { count: "exact", head: true }).not("image_id", "is", null)).count ?? 0;

  const { data: recent } = await supabase
    .from("audit_logs")
    .select("action,entity_type,actor_email,created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = [
    { label: "الوجهات", value: destinations, icon: MapPin },
    { label: "الباقات", value: packages, icon: Package },
    { label: "الفنادق", value: hotels, icon: Building2 },
    { label: "فترات الأسعار", value: periods, icon: CalendarClock },
    { label: "عروض شهر العسل", value: honeymoon, icon: Heart },
    { label: "فنادق بصور حقيقية", value: `${withImage}/${hotels}`, icon: ImageIcon },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold text-navy">لوحة المعلومات</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-ice bg-white p-5">
            <div className="mb-2 grid h-9 w-9 place-items-center rounded-lg bg-navy/10 text-navy">
              <s.icon className="h-4 w-4" aria-hidden />
            </div>
            <div className="text-2xl font-black text-navy">{s.value}</div>
            <div className="text-sm text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-ice bg-white p-5">
          <h2 className="mb-3 font-bold text-navy">حالة النشر</h2>
          <ul className="space-y-2 text-sm text-navy/80">
            <li>منشور: <strong className="text-success">{publishedHotels}</strong></li>
            <li>مؤرشف: <strong className="text-muted">{archivedHotels}</strong></li>
            <li>بحاجة لصورة حقيقية: <strong className="text-error">{hotels - withImage}</strong></li>
          </ul>
        </div>

        <div className="rounded-2xl border border-ice bg-white p-5">
          <h2 className="mb-3 font-bold text-navy">آخر التعديلات</h2>
          {recent && recent.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-2 border-b border-ice pb-1 last:border-0">
                  <span className="text-navy/80">
                    <strong>{r.action}</strong> · {r.entity_type}
                  </span>
                  <span className="truncate text-xs text-muted" dir="ltr">
                    {r.actor_email}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">لا توجد تعديلات بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
