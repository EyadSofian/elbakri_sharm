"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Gift, ArrowLeft } from "lucide-react";
import type { Honeymoon } from "@/lib/catalog";
import { Price } from "@/components/Price";

function FilterBtn({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full px-4 py-2 text-sm font-bold transition ${
        on ? "bg-navy text-white" : "bg-mist text-navy hover:bg-navy/10"
      }`}
    >
      {children}
    </button>
  );
}

export function HoneymoonExplorer({
  deals,
  regions,
}: {
  deals: Honeymoon[];
  regions: string[];
}) {
  const [region, setRegion] = useState("all");
  const filtered = region === "all" ? deals : deals.filter((d) => d.region === region);

  return (
    <section className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="تصفية حسب المنطقة">
        <FilterBtn on={region === "all"} onClick={() => setRegion("all")}>
          كل المناطق
        </FilterBtn>
        {regions.map((r) => (
          <FilterBtn key={r} on={region === r} onClick={() => setRegion(r)}>
            {r}
          </FilterBtn>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((d) => (
          <Link
            key={d.slug}
            href={`/honeymoon/${d.slug}`}
            className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-glass"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={d.image}
                alt={d.image.startsWith("/images/hotels/") ? `${d.nameAr} — ${d.region}` : ""}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-midnight/75 to-transparent" />
              <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-champagne px-3 py-1 text-xs font-bold text-midnight">
                <Heart className="h-3.5 w-3.5 fill-midnight" aria-hidden /> شهر عسل
              </span>
              <span className="absolute bottom-3 right-3 text-xs font-bold text-white">
                {d.region}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-2 line-clamp-2 min-h-[3rem] text-lg font-bold text-navy">
                {d.nameAr}
              </h3>
              <div className="mb-4 flex items-center gap-1 text-xs text-muted">
                <Gift className="h-3.5 w-3.5 text-champagne" aria-hidden />
                <span>{d.perks.length} مزايا مجانية</span>
              </div>
              <div className="mt-auto flex items-end justify-between border-t border-ice pt-4">
                <div>
                  <div className="text-[11px] text-muted">تبدأ من</div>
                  <div className="text-2xl font-black leading-none text-navy">
                    <Price value={d.minPrice} />
                    <span className="mr-1 text-xs font-semibold text-muted">ج.م</span>
                  </div>
                  <div className="mt-1 text-[10px] text-muted">{d.periods[0]?.unit}</div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white transition-all group-hover:gap-2">
                  التفاصيل <ArrowLeft className="h-4 w-4" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
