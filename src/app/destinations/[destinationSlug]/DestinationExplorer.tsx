"use client";

import { useMemo, useState } from "react";
import { Search, Info } from "lucide-react";
import type { Destination } from "@/lib/catalog";
import { PackageTabs } from "@/components/PackageTabs";
import { HotelCard } from "@/components/HotelCard";

export function DestinationExplorer({ destination }: { destination: Destination }) {
  const [active, setActive] = useState(destination.categories[0]?.id ?? "");
  const [query, setQuery] = useState("");

  const category =
    destination.categories.find((c) => c.id === active) ?? destination.categories[0];

  const hotels = useMemo(() => {
    const q = query.trim();
    const arr = destination.hotels.filter((h) => h.categoryId === category.id);
    return q ? arr.filter((h) => h.nameAr.includes(q)) : arr;
  }, [destination.hotels, category, query]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-8 md:py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="mb-1 text-2xl font-extrabold text-navy md:text-3xl">اختر الباقة</h2>
          <p className="text-sm text-muted">
            تصفح الباقات والفنادق المتاحة في {destination.nameAr}
          </p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <label htmlFor="hotel-search" className="sr-only">
            ابحث عن فندق
          </label>
          <input
            id="hotel-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن فندق..."
            className="w-full rounded-full border border-ice bg-white py-3 pl-4 pr-10 text-sm focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
      </div>

      <PackageTabs
        categories={destination.categories}
        active={category.id}
        onChange={(id) => {
          setActive(id);
          setQuery("");
        }}
      />

      {category.note && (
        <div className="mt-6 flex gap-2 rounded-xl border border-champagne/30 bg-champagne/10 p-4 text-sm text-navy">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-champagne" aria-hidden />
          <span className="leading-relaxed">{category.note}</span>
        </div>
      )}

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((h) => (
          <HotelCard key={h.slug} hotel={h} />
        ))}
      </div>

      {hotels.length === 0 && (
        <div className="py-16 text-center text-muted">لا توجد نتائج مطابقة.</div>
      )}
    </section>
  );
}
