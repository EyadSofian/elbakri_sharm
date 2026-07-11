import Link from "next/link";
import { ImageIcon, ImageOff, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type HotelRow = {
  slug: string;
  name_ar: string;
  is_published: boolean;
  is_archived: boolean;
  image_id: string | null;
  display_order: number;
  destinations: { name_ar: string; display_order: number } | null;
};

export default async function HotelsListPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hotels")
    .select("slug,name_ar,is_published,is_archived,image_id,display_order,destinations(name_ar,display_order)")
    .order("display_order");

  const hotels = (data ?? []) as unknown as HotelRow[];
  const groups = new Map<string, HotelRow[]>();
  for (const h of hotels) {
    const key = h.destinations?.name_ar ?? "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(h);
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-extrabold text-navy">الفنادق والأسعار</h1>
      <p className="mb-6 text-sm text-muted">اختر فندقًا لتعديل فتراته وأسعاره.</p>

      {hotels.length === 0 && (
        <p className="rounded-xl border border-ice bg-white p-4 text-sm text-muted">
          لا توجد بيانات — شغّل <code>npm run seed:supabase</code> أولاً.
        </p>
      )}

      <div className="space-y-6">
        {[...groups.entries()].map(([dest, list]) => (
          <section key={dest}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wider text-champagne-ink">{dest}</h2>
            <div className="overflow-hidden rounded-xl border border-ice bg-white">
              {list.map((h) => (
                <Link
                  key={h.slug}
                  href={`/internal/elbakri-admin/hotels/${h.slug}`}
                  className="flex items-center justify-between gap-3 border-b border-ice px-4 py-3 last:border-0 hover:bg-mist"
                >
                  <span className="flex items-center gap-2 font-semibold text-navy">
                    {h.image_id ? (
                      <ImageIcon className="h-4 w-4 text-success" aria-label="صورة حقيقية" />
                    ) : (
                      <ImageOff className="h-4 w-4 text-error" aria-label="صورة بديلة" />
                    )}
                    {h.name_ar}
                  </span>
                  <span className="flex items-center gap-2 text-xs">
                    {h.is_archived ? (
                      <span className="rounded-full bg-muted/20 px-2 py-0.5 text-muted">مؤرشف</span>
                    ) : h.is_published ? (
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-success">منشور</span>
                    ) : (
                      <span className="rounded-full bg-error/10 px-2 py-0.5 text-error">غير منشور</span>
                    )}
                    <ChevronLeft className="h-4 w-4 text-muted" aria-hidden />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
