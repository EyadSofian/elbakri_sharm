"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Package, Search } from "lucide-react";

export type CatalogSearchItem = {
  id: string;
  type: "hotel" | "package" | "destination";
  label: string;
  description: string;
  href: string;
  keywords: string;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TYPE_LABEL = {
  hotel: "فندق",
  package: "باقة / مجموعة",
  destination: "وجهة",
} as const;

const TYPE_ICON = {
  hotel: Building2,
  package: Package,
  destination: MapPin,
} as const;

export function CatalogSearch({ items }: { items: CatalogSearchItem[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);
  const results = useMemo(() => {
    if (!normalizedQuery) return [];
    return items
      .map((item) => ({ item, haystack: normalize(`${item.label} ${item.description} ${item.keywords}`) }))
      .filter(({ haystack }) => haystack.includes(normalizedQuery))
      .sort((a, b) => {
        const aStarts = normalize(a.item.label).startsWith(normalizedQuery) ? 0 : 1;
        const bStarts = normalize(b.item.label).startsWith(normalizedQuery) ? 0 : 1;
        return aStarts - bStarts || a.item.label.localeCompare(b.item.label, "ar");
      })
      .slice(0, 10)
      .map(({ item }) => item);
  }, [items, normalizedQuery]);

  return (
    <div className="relative mx-auto max-w-4xl">
      <label htmlFor="catalog-search" className="mb-2 block text-sm font-extrabold text-navy">
        ابحث باسم الفندق أو الباقة أو المجموعة
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue" aria-hidden />
        <input
          id="catalog-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="مثال: الباتروس، بيتش الباتروس، شرم الشيخ..."
          autoComplete="off"
          className="h-16 w-full rounded-[20px] border border-ice bg-white pl-5 pr-12 text-base font-semibold text-navy shadow-card outline-none transition placeholder:font-normal placeholder:text-muted focus:border-navy focus:ring-4 focus:ring-navy/10"
          role="combobox"
          aria-expanded={Boolean(normalizedQuery)}
          aria-controls="catalog-search-results"
        />
      </div>

      {normalizedQuery ? (
        <div
          id="catalog-search-results"
          role="listbox"
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[430px] overflow-y-auto rounded-[20px] border border-ice bg-white p-2 shadow-glass"
        >
          {results.length ? results.map((item) => {
            const Icon = TYPE_ICON[item.type];
            return (
              <Link
                key={item.id}
                href={item.href}
                role="option"
                className="group flex min-h-16 items-center gap-3 rounded-[15px] px-3 py-2 transition hover:bg-mist"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/8 text-navy">
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-extrabold text-navy">{item.label}</span>
                  <span className="block truncate text-xs text-muted">{TYPE_LABEL[item.type]} — {item.description}</span>
                </span>
                <ArrowLeft className="h-4 w-4 shrink-0 text-muted transition group-hover:-translate-x-1 group-hover:text-navy" aria-hidden />
              </Link>
            );
          }) : (
            <div className="px-4 py-8 text-center text-sm text-muted">
              لا توجد نتائج مطابقة. جرّب اسم الفندق أو الوجهة أو كلمة «الباتروس».
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
