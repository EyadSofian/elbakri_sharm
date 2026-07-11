import Image from "next/image";
import Link from "next/link";
import { Utensils, CalendarDays, ArrowLeft } from "lucide-react";
import type { Hotel } from "@/lib/catalog";
import { Price } from "@/components/Price";

export function HotelCard({ hotel }: { hotel: Hotel }) {
  const board = hotel.periods[0]?.board;
  const first = hotel.periods[0]?.period;
  const extra = hotel.periods.length - 1;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-glass">
      <div className="relative overflow-hidden bg-ice" style={{ aspectRatio: "10 / 7" }}>
        <Image
          src={hotel.image}
          // Decorative: the image is a destination scene (fallback), not a verified
          // photo of this hotel. The heading below names the property.
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-ice px-2.5 py-1 text-[11px] font-bold text-navy">
          {hotel.categoryName}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 min-h-[3.2rem] text-[19px] font-bold leading-snug text-navy">
          {hotel.nameAr}
        </h3>
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          {board && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF8F5] px-2 py-0.5 text-[11px] font-bold text-success">
              <Utensils className="h-3 w-3" aria-hidden /> {board}
            </span>
          )}
        </div>
        <div className="mb-4 flex items-center gap-1.5 text-xs text-muted">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span dir="ltr" className="ltr line-clamp-1">
            {first}
          </span>
          {extra > 0 && <span className="font-bold text-navy">+{extra}</span>}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-ice pt-4">
          <div className="min-w-0">
            <div className="text-[11px] text-muted">تبدأ من</div>
            <div className="text-[24px] font-extrabold leading-none text-navy">
              <Price value={hotel.minPrice} />
              <span className="mr-1 text-xs font-semibold text-muted">ج.م</span>
            </div>
            <div className="mt-1 text-[10px] text-muted">{hotel.unitLabel}</div>
          </div>
          <Link
            href={`/hotels/${hotel.slug}`}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-navy px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue group-hover:gap-2"
          >
            عرض التفاصيل <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
