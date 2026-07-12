"use client";

import { useMemo, useState } from "react";
import { Search, Info } from "lucide-react";
import type { Destination } from "@/lib/catalog";
import { PackageTabs } from "@/components/PackageTabs";
import { HotelCard } from "@/components/HotelCard";
import { MotionReveal } from "@/components/MotionReveal";

export function DestinationExplorer({ destination }: { destination: Destination }) {
  const [active, setActive] = useState(destination.categories[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const category =
    destination.categories.find((c) => c.id === active) ?? destination.categories[0];

  const hotels = useMemo(() => {
    const q = query.trim();
    // A physical hotel may belong to multiple rate-hub packages. Membership
    // lives on the category, so unlinking it from one package does not remove
    // it from another package that still contains it.
    const arr = destination.hotels.filter((h) => category.hotelSlugs.includes(h.slug));
    return q ? arr.filter((h) => h.nameAr.includes(q)) : arr;
  }, [destination.hotels, category, query]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <div className="mb-7 grid gap-5 lg:grid-cols-[1fr_360px] lg:items-end">
        <div>
          <div className="section-kicker">العروض المتاحة</div>
          <h2 className="mt-2 text-2xl font-extrabold text-navy md:text-3xl">اختر الباقة المناسبة</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            تصفح الباقات والفنادق المتاحة في {destination.nameAr}
          </p>
        </div>
        <div>
          <label htmlFor="hotel-search" className="mb-2 block text-xs font-extrabold text-navy">
            ابحث باسم الفندق
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              id="hotel-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن فندق..."
              className="h-[52px] w-full rounded-[16px] border border-ice bg-white pl-4 pr-11 text-base shadow-sm transition focus:border-navy focus:outline-none focus:ring-4 focus:ring-navy/10"
            />
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 -mx-4 border-y border-ice/80 bg-mist/95 px-4 py-3 backdrop-blur-lg sm:static sm:mx-0 sm:rounded-[20px] sm:border sm:bg-white sm:p-2">
        <PackageTabs
          categories={destination.categories}
          active={category.id}
          onChange={(id) => {
            setActive(id);
            setQuery("");
          }}
        />
      </div>

      {category.note && (
        <div className="mt-6 flex gap-3 rounded-[18px] border border-champagne/35 bg-champagne/10 p-4 text-sm text-navy">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-champagne-ink" aria-hidden />
          <span className="leading-relaxed">{category.note}</span>
        </div>
      )}

      <div className="mt-7 flex items-center justify-between">
        <h3 className="font-extrabold text-navy">{category.name}</h3>
        <div aria-live="polite" className="rounded-full bg-navy/8 px-3 py-1 text-xs font-bold text-muted">
          {hotels.length} فندق
        </div>
      </div>

      <MotionReveal className="mt-4 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {hotels.map((h) => (
          <HotelCard
            key={h.slug}
            hotel={{
              ...h,
              categoryId: category.id,
              categoryName: category.name,
              categoryNote: category.note,
              priceUnit: category.priceUnit,
              unitLabel: category.unitLabel,
            }}
          />
        ))}
      </MotionReveal>

      {hotels.length === 0 && (
        <div className="py-16 text-center text-muted">لا توجد نتائج مطابقة.</div>
      )}
    </section>
  );
}
