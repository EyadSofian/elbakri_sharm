import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Utensils, ChevronLeft, MapPin, Info } from "lucide-react";
import { getAllHotels, getHotelBySlug, getSiteSettings } from "@/lib/data";
import { isEasyKashConfigured } from "@/lib/easykash";
import { PageHero } from "@/components/PageHero";
import { BookingCard } from "@/components/BookingCard";
import { HotelPricePeriods } from "@/components/HotelPricePeriods";
import { MotionReveal } from "@/components/MotionReveal";

type Params = Promise<{ hotelSlug: string }>;

// Legacy /hotel/:dest/:cat/:idx URLs are redirected by next.config; unknown slugs 404.
export const dynamicParams = false;
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getAllHotels()).map((h) => ({ hotelSlug: h.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hotelSlug } = await params;
  const h = await getHotelBySlug(hotelSlug);
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
  const [hotel, settings] = await Promise.all([getHotelBySlug(hotelSlug), getSiteSettings()]);
  if (!hotel) notFound();

  const board = hotel.periods[0]?.board;
  const payHref = isEasyKashConfigured()
    ? `/checkout?hotel=${encodeURIComponent(hotel.slug)}`
    : undefined;

  return (
    <>
      <PageHero image={hotel.image} eyebrow={hotel.destinationNameAr} title={hotel.nameAr} priority />

      <nav
        aria-label="مسار التنقل"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 pt-5 text-xs text-muted sm:px-6 sm:text-sm"
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_370px]">
        <MotionReveal>
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
          <p className="surface mb-8 max-w-3xl rounded-[20px] p-5 text-sm leading-[1.9] text-navy/80 sm:p-6 sm:text-base">
            استمتع بإقامة مميزة في <strong>{hotel.nameAr}</strong> بـ{hotel.destinationNameAr} ضمن
            باقة {hotel.categoryName}، بفترات متعددة تناسب برنامج سفرك. تواصل معنا لتأكيد التوافر
            والحصول على السعر النهائي.
          </p>

          {/* Price periods */}
          <div className="mb-10">
            <div className="mb-1 text-xs font-extrabold text-champagne-ink">تفاصيل العرض</div>
            <h2 className="mb-4 text-2xl font-extrabold text-navy sm:text-3xl">الأسعار والفترات</h2>
            <HotelPricePeriods
              hotelName={hotel.nameAr}
              periods={hotel.periods}
              unitLabel={hotel.unitLabel}
            />
          </div>

          {/* Category note (verbatim from source) */}
          {hotel.categoryNote && (
            <div className="rounded-[20px] border border-champagne/35 bg-champagne/10 p-5 sm:p-6">
              <h3 className="mb-2 flex items-center gap-2 font-bold text-navy">
                <Info className="h-4 w-4 text-champagne" aria-hidden /> ملاحظات مهمة
              </h3>
              <p className="text-sm leading-relaxed text-navy/80">{hotel.categoryNote}</p>
            </div>
          )}
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <BookingCard
            hotelName={hotel.nameAr}
            minPrice={hotel.minPrice}
            unitLabel={hotel.unitLabel}
            contextLine={`${hotel.destinationNameAr} — ${hotel.categoryName}`}
            whatsapp={settings.whatsapp}
            phone={settings.phone}
            payHref={payHref}
          />
        </MotionReveal>
      </section>
    </>
  );
}
