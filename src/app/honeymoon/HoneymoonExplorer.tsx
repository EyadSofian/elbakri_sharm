"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gift, Heart, MapPin } from "lucide-react";
import type { Honeymoon } from "@/lib/catalog";
import { Price } from "@/components/Price";
import { MotionReveal } from "@/components/MotionReveal";

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "tap-target shrink-0 rounded-full border px-4 text-sm font-extrabold transition active:scale-[0.98] " +
        (active
          ? "border-navy bg-navy text-white shadow-card"
          : "border-ice bg-white text-navy hover:border-navy/25 hover:bg-mist")
      }
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
  const filtered = region === "all" ? deals : deals.filter((deal) => deal.region === region);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="section-kicker">اختار المنطقة</div>
          <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">باقات مناسبة لبداية مميزة</h2>
        </div>
        <div aria-live="polite" className="hidden rounded-full bg-navy/10 px-3 py-1 text-xs font-bold text-navy sm:block">
          {filtered.length} باقة
        </div>
      </div>

      <div className="sticky top-16 z-30 -mx-4 border-y border-ice/80 bg-mist/95 px-4 py-3 backdrop-blur-lg sm:static sm:mx-0 sm:rounded-[20px] sm:border sm:bg-white sm:p-2">
        <div
          className="mobile-snap flex gap-2 overflow-x-auto"
          role="group"
          aria-label="تصفية حسب المنطقة"
        >
          <FilterButton active={region === "all"} onClick={() => setRegion("all")}>
            كل المناطق
          </FilterButton>
          {regions.map((item) => (
            <FilterButton key={item} active={region === item} onClick={() => setRegion(item)}>
              {item}
            </FilterButton>
          ))}
        </div>
      </div>

      <MotionReveal className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {filtered.map((deal) => (
          <Link
            key={deal.slug}
            href={"/honeymoon/" + deal.slug}
            className="tap-target group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-ice/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.995]"
          >
            <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] sm:block">
              <div className="relative min-h-[178px] overflow-hidden bg-ice sm:aspect-[16/10] sm:min-h-0">
                <Image
                  src={deal.image}
                  alt={deal.image.startsWith("/images/hotels/") ? deal.nameAr + " — " + deal.region : ""}
                  fill
                  sizes="(max-width: 640px) 136px, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full border border-white/30 bg-champagne px-2 py-1 text-[10px] font-extrabold text-midnight shadow-sm sm:right-3 sm:top-3 sm:px-3 sm:text-xs">
                  <Heart className="h-3.5 w-3.5 fill-midnight" aria-hidden />
                  شهر عسل
                </span>
              </div>

              <div className="flex min-w-0 flex-col p-4 sm:p-5 sm:pb-4">
                <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-muted">
                  <MapPin className="h-3.5 w-3.5 text-champagne-ink" aria-hidden />
                  {deal.region}
                </div>
                <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-navy sm:min-h-[3rem]">
                  {deal.nameAr}
                </h3>
                <div className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] font-semibold text-muted">
                  <Gift className="h-3.5 w-3.5 text-champagne-ink" aria-hidden />
                  {deal.perks.length} مزايا ضمن الباقة
                </div>
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-ice px-4 py-3.5 sm:mx-5 sm:px-0 sm:py-4">
              <div>
                <div className="text-[10px] font-semibold text-muted">يبدأ من</div>
                <div className="text-[23px] font-black leading-none text-navy">
                  <Price value={deal.minPrice} />
                  <span className="mr-1 text-[10px] font-bold text-muted">ج.م</span>
                </div>
                <div className="mt-1 text-[9px] text-muted">{deal.periods[0]?.unit}</div>
              </div>
              <span className="tap-target inline-flex items-center gap-2 rounded-full bg-navy px-4 text-xs font-extrabold text-white transition group-hover:bg-blue sm:text-sm">
                التفاصيل
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </span>
            </div>
          </Link>
        ))}
      </MotionReveal>
    </section>
  );
}
