import Image from "next/image";
import Link from "next/link";
import type { Destination } from "@/lib/catalog";
import { Price } from "@/components/Price";

export function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group flex flex-col overflow-hidden rounded-[22px] bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-glass"
    >
      <div className="relative aspect-[16/11] overflow-hidden">
        <Image
          src={destination.image}
          alt={`منتجعات وفنادق ${destination.nameAr}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/85 via-midnight/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <h3 className="text-2xl font-bold">{destination.nameAr}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-white/85">{destination.tagline}</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-5">
        <div className="text-sm text-muted">
          <span className="font-bold text-navy">{destination.hotelCount}</span> عرض فندقي
        </div>
        <div className="text-left">
          <div className="text-[11px] text-muted">تبدأ من</div>
          <div className="text-lg font-extrabold text-navy">
            <Price value={destination.minPrice} />
            <span className="mr-1 text-xs font-semibold text-muted">ج.م</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
