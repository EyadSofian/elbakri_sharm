import { createClient } from "@/lib/supabase/server";

type Log = {
  action: string;
  entity_type: string;
  entity_id: string | null;
  actor_email: string | null;
  created_at: string;
};

export default async function AuditPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("action,entity_type,entity_id,actor_email,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const logs = (data ?? []) as Log[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy">سجل التعديلات</h1>
      <p className="mb-6 text-sm text-muted">آخر 100 عملية على المحتوى.</p>

      <div className="overflow-x-auto rounded-xl border border-ice bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-navy text-white">
              <th scope="col" className="p-3 text-right font-bold">الإجراء</th>
              <th scope="col" className="p-3 text-right font-bold">النوع</th>
              <th scope="col" className="p-3 text-right font-bold">المستخدم</th>
              <th scope="col" className="p-3 text-right font-bold">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={i} className={i % 2 ? "bg-mist" : "bg-white"}>
                <td className="p-3 font-semibold text-navy">{l.action}</td>
                <td className="p-3 text-navy/80">{l.entity_type}</td>
                <td className="p-3 text-muted" dir="ltr">{l.actor_email ?? "—"}</td>
                <td className="p-3 text-muted" dir="ltr">{l.created_at?.replace("T", " ").slice(0, 16)}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted">
                  لا توجد تعديلات بعد.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
