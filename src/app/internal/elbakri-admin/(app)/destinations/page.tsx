import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { setDestinationPublished } from "../toggle-actions";

type Dest = { id: string; name_ar: string; slug: string; is_published: boolean; display_order: number };

export default async function DestinationsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("destinations")
    .select("id,name_ar,slug,is_published,display_order")
    .order("display_order");
  const dests = (data ?? []) as Dest[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy">الوجهات</h1>
      <p className="mb-6 text-sm text-muted">تحكّم في نشر الوجهات ومعاينتها.</p>

      <div className="overflow-hidden rounded-xl border border-ice bg-white">
        {dests.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 border-b border-ice px-4 py-3 last:border-0">
            <span className="font-semibold text-navy">{d.name_ar}</span>
            <div className="flex items-center gap-2">
              <Link
                href={`/destinations/${d.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-ice px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-mist"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden /> معاينة
              </Link>
              <form action={setDestinationPublished}>
                <input type="hidden" name="id" value={d.id} />
                <input type="hidden" name="publish" value={(!d.is_published).toString()} />
                <button
                  className={`rounded px-2.5 py-1.5 text-xs font-bold ${
                    d.is_published ? "bg-muted/20 text-navy" : "bg-success text-white"
                  }`}
                >
                  {d.is_published ? "إلغاء النشر" : "نشر"}
                </button>
              </form>
            </div>
          </div>
        ))}
        {dests.length === 0 && <div className="px-4 py-3 text-sm text-muted">لا توجد بيانات.</div>}
      </div>
    </div>
  );
}
