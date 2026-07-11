import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import clsx from "clsx";
import type { Destination } from "@/lib/catalog";
import { Price } from "@/components/Price";

export function DestinationCard({
  destination,
  featured = false,
}: {
  destination: Destination;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      aria-label={`استكشف عروض ${destination.nameAr}، تبدأ من ${destination.minPrice ?? ""} جنيه`}
      className={clsx(
        "tap-target group flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-ice/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover active:scale-[0.99]",
        featured && "col-span-2 sm:col-span-1",
      )}
    >
      <div
        className={clsx(
          "relative overflow-hidden",
          featured ? "aspect-[16/9] sm:aspect-[16/11]" : "aspect-[4/5] sm:aspect-[16/11]",
        )}
      >
        <Image
          src={destination.image}
          alt={`منتجعات وفنادق ${destination.nameAr}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight/95 via-midnight/20 to-transparent" />
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/25 bg-midnight/55 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
          <MapPin className="h-3.5 w-3.5 text-champagne" aria-hidden />
          مصر
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
          <h3 className="text-xl font-extrabold sm:text-2xl">{destination.nameAr}</h3>
          <p className={clsx("mt-1 line-clamp-1 text-xs text-white/80 sm:text-sm", !featured && "hidden sm:block")}>
            {destination.tagline}
          </p>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 p-4 sm:p-5">
        <div>
          <div className="text-[11px] font-semibold text-muted">
            <span className="font-extrabold text-navy">{destination.hotelCount}</span> عرضًا فندقيًا
          </div>
          <div className="mt-1 text-[10px] text-muted">تبدأ من</div>
          <div className="text-lg font-black leading-none text-navy">
            <Price value={destination.minPrice} />
            <span className="mr-1 text-[10px] font-bold text-muted">ج.م</span>
          </div>
        </div>
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-white transition group-hover:bg-champagne group-hover:text-midnight">
          <ArrowLeft className="h-4 w-4" aria-hidden />
        </div>
      </div>
    </Link>
  );
}
