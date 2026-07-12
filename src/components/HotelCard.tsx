import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Utensils } from "lucide-react";
import type { Hotel } from "@/lib/catalog";
import { Price } from "@/components/Price";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const board = hotel.periods[0]?.board;
  const first = hotel.periods[0]?.period;
  const extra = hotel.periods.length - 1;
  const isRealPhoto = hotel.image.startsWith("/images/hotels/");

  return (
    <Link
      href={"/hotels/" + hotel.slug}
      className="tap-target group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-ice/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.995]"
    >
      <div className="grid grid-cols-[8.5rem_minmax(0,1fr)] sm:block">
        <div className="relative min-h-[170px] overflow-hidden bg-ice sm:aspect-[10/7] sm:min-h-0">
          <Image
            src={hotel.image}
            alt={isRealPhoto ? "فندق " + hotel.nameAr + " في " + hotel.destinationNameAr : ""}
            fill
            sizes="(max-width: 640px) 136px, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <span className="absolute right-2 top-2 rounded-full border border-white/35 bg-white/90 px-2 py-1 text-[10px] font-extrabold text-navy shadow-sm backdrop-blur sm:right-3 sm:top-3 sm:px-2.5 sm:text-[11px]">
            {hotel.categoryName}
          </span>
        </div>

        <div className="flex min-w-0 flex-col p-4 sm:p-5 sm:pb-4">
          <div className="mb-2 flex items-center gap-1 text-[11px] font-bold text-muted">
            <MapPin className="h-3.5 w-3.5 text-champagne-ink" aria-hidden />
            {hotel.destinationNameAr}
          </div>
          <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-navy sm:min-h-[3.2rem] sm:text-[19px]">
            {hotel.nameAr}
          </h3>

          {board ? (
            <div className="mt-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-extrabold text-success sm:text-[11px]">
                <Utensils className="h-3 w-3" aria-hidden />
                {board}
              </span>
            </div>
          ) : null}

          <div className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] text-muted sm:text-xs">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-blue" aria-hidden />
            <span dir="ltr" className="ltr line-clamp-1">
              {first ?? "السعر عند الطلب"}
            </span>
            {extra > 0 ? <span className="font-extrabold text-navy">+{extra}</span> : null}
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-ice px-4 py-3.5 sm:mx-5 sm:px-0 sm:py-4">
        <div className="min-w-0">
          <div className="text-[10px] font-semibold text-muted">
            {hotel.minPrice == null ? "تواصل لمعرفة السعر" : "يبدأ من"}
          </div>
          <div className="text-[23px] font-black leading-none text-navy">
            <Price value={hotel.minPrice} />
            <span className="mr-1 text-[10px] font-bold text-muted">ج.م</span>
          </div>
          <div className="mt-1 line-clamp-1 text-[9px] text-muted sm:text-[10px]">{hotel.unitLabel}</div>
        </div>
        <span className="tap-target inline-flex shrink-0 items-center gap-2 rounded-full bg-navy px-4 text-xs font-extrabold text-white transition group-hover:bg-blue sm:text-sm">
          عرض التفاصيل
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
