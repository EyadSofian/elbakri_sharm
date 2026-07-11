import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Utensils, CalendarDays, ChevronLeft, MapPin, Info } from "lucide-react";
import { getAllHotels, getHotelBySlug } from "@/lib/catalog";
import { PageHero } from "@/components/PageHero";
import { BookingCard } from "@/components/BookingCard";
import { Price } from "@/components/Price";
import { parsePrice } from "@/lib/slug";

type Params = Promise<{ hotelSlug: string }>;

// Legacy /hotel/:dest/:cat/:idx URLs are redirected by next.config; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllHotels().map((h) => ({ hotelSlug: h.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hotelSlug } = await params;
  const h = getHotelBySlug(hotelSlug);
  if (!h) return { title: "الفندق غير موجود", robots: { index: false } };
  return {
    title: `${h.nameAr} — ${h.destinationNameAr}`,
    description: `تفاصيل ${h.nameAr} في ${h.destinationNameAr} — الأسعار والفترات وباقة ${h.categoryName}. احجز عبر واتساب.`,
    alternates: { canonical: `/hotels/${h.slug}` },
    openGraph: {
      title: `${h.nameAr} — ${h.destinationNameAr}`,
      description: `باقة ${h.categoryName} — احجز عبر البكري أوفرسيز.`,
      images: [{ url: h.image }],
    },
  };
}

export default async function HotelPage({ params }: { params: Params }) {
  const { hotelSlug } = await params;
  const hotel = getHotelBySlug(hotelSlug);
  if (!hotel) notFound();

  const board = hotel.periods[0]?.board;

  return (
    <>
      <PageHero image={hotel.image} eyebrow={hotel.destinationNameAr} title={hotel.nameAr} priority />

      <nav
        aria-label="مسار التنقل"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-5 pt-6 text-sm text-muted"
      >
        <Link href="/" className="hover:text-navy">
          الرئيسية
        </Link>
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <Link href={`/destinations/${hotel.destinationSlug}`} className="hover:text-navy">
          {hotel.destinationNameAr}
        </Link>
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="font-semibold text-navy">{hotel.nameAr}</span>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Meta chips */}
          <div className="mb-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-navy/10 px-3 py-1.5 text-xs font-bold text-navy">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {hotel.destinationNameAr}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-3 py-1.5 text-xs font-bold text-blue">
              {hotel.categoryName}
            </span>
            {board && (
              <span className="inline-flex items-center gap-1 rounded-full bg-champagne/20 px-3 py-1.5 text-xs font-bold text-navy">
                <Utensils className="h-3.5 w-3.5" aria-hidden /> {board}
              </span>
            )}
          </div>

          {/* Description (marketing copy, no fabricated facilities) */}
          <p className="mb-8 text-base leading-loose text-navy/80">
            استمتع بإقامة مميزة في <strong>{hotel.nameAr}</strong> بـ{hotel.destinationNameAr} ضمن
            باقة {hotel.categoryName}، بفترات متعددة تناسب برنامج سفرك. تواصل معنا لتأكيد التوافر
            والحصول على السعر النهائي.
          </p>

          {/* Price periods */}
          <div className="mb-10">
            <h2 className="mb-4 text-2xl font-extrabold text-navy">الأسعار والفترات</h2>
            <div className="overflow-x-auto rounded-2xl border border-ice">
              <table className="w-full min-w-[520px] border-collapse text-sm">
                <caption className="sr-only">
                  جدول أسعار وفترات {hotel.nameAr} — الأسعار {hotel.unitLabel}
                </caption>
                <thead>
                  <tr className="bg-navy text-white">
                    <th scope="col" className="p-3 text-right font-bold">
                      الفترة
                    </th>
                    <th scope="col" className="p-3 text-right font-bold">
                      الإقامة
                    </th>
                    <th scope="col" className="p-3 text-center font-bold">
                      مزدوجة
                    </th>
                    <th scope="col" className="p-3 text-center font-bold">
                      ثلاثية
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {hotel.periods.map((p, i) => (
                    <tr key={i} className={i % 2 ? "bg-mist" : "bg-white"}>
                      <td className="p-3 text-navy">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4 shrink-0 text-blue" aria-hidden />
                          <span dir="ltr" className="ltr">
                            {p.period}
                          </span>
                        </span>
                      </td>
                      <td className="p-3 text-muted">{p.board ?? "—"}</td>
                      <td className="p-3 text-center font-bold text-navy">
                        <Price value={parsePrice(p.double)} />
                      </td>
                      <td className="p-3 text-center font-bold text-navy">
                        <Price value={parsePrice(p.triple)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted">الأسعار {hotel.unitLabel}.</p>
          </div>

          {/* Category note (verbatim from source) */}
          {hotel.categoryNote && (
            <div className="rounded-xl border border-champagne/30 bg-champagne/10 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-navy">
                <Info className="h-4 w-4 text-champagne" aria-hidden /> ملاحظات مهمة
              </h3>
              <p className="text-sm leading-relaxed text-navy/80">{hotel.categoryNote}</p>
            </div>
          )}
        </div>

        <div>
          <BookingCard
            hotelName={hotel.nameAr}
            minPrice={hotel.minPrice}
            unitLabel={hotel.unitLabel}
            contextLine={`${hotel.destinationNameAr} — ${hotel.categoryName}`}
          />
        </div>
      </section>
    </>
  );
}
