import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { setHoneymoonPublished } from "../toggle-actions";

type Deal = {
  id: string;
  slug: string;
  hotel_name_ar: string;
  region: string;
  is_published: boolean;
  is_archived: boolean;
  display_order: number;
};

export default async function HoneymoonAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("honeymoon_deals")
    .select("id,slug,hotel_name_ar,region,is_published,is_archived,display_order")
    .order("display_order");
  const deals = (data ?? []) as Deal[];

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy">عروض شهر العسل</h1>
      <p className="mb-6 text-sm text-muted">تحكّم في نشر العروض ومعاينتها.</p>

      <div className="overflow-hidden rounded-xl border border-ice bg-white">
        {deals.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-3 border-b border-ice px-4 py-3 last:border-0">
            <span className="font-semibold text-navy">
              {d.hotel_name_ar}
              <span className="mr-2 text-xs font-normal text-muted">{d.region}</span>
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={`/honeymoon/${d.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-ice px-2.5 py-1.5 text-xs font-semibold text-navy hover:bg-mist"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden /> معاينة
              </Link>
              {!d.is_archived && (
                <form action={setHoneymoonPublished}>
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
              )}
            </div>
          </div>
        ))}
        {deals.length === 0 && <div className="px-4 py-3 text-sm text-muted">لا توجد بيانات.</div>}
      </div>
    </div>
  );
}
