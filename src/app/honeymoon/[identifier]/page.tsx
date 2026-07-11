import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gift, ChevronLeft, Heart } from "lucide-react";
import { getHoneymoons, getHoneymoonBySlug, getSiteSettings } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { BookingCard } from "@/components/BookingCard";
import { HoneymoonPricePeriods } from "@/components/HoneymoonPricePeriods";
import { MotionReveal } from "@/components/MotionReveal";

type Params = Promise<{ identifier: string }>;

// Numeric legacy indices are redirected by next.config; unknown slugs 404.
export const dynamicParams = false;
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getHoneymoons()).map((d) => ({ identifier: d.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { identifier } = await params;
  const d = await getHoneymoonBySlug(identifier);
  if (!d) return { title: "الباقة غير موجودة", robots: { index: false } };
  return {
    title: `${d.nameAr} — شهر عسل`,
    description: `باقة شهر عسل في ${d.nameAr} — ${d.region}. مزايا مجانية للعروسين.`,
    alternates: { canonical: `/honeymoon/${d.slug}` },
    openGraph: {
      title: `${d.nameAr} — شهر عسل`,
      description: d.region,
      images: [{ url: d.image }],
    },
  };
}

export default async function HoneymoonDetailPage({ params }: { params: Params }) {
  const { identifier } = await params;
  const [deal, settings] = await Promise.all([getHoneymoonBySlug(identifier), getSiteSettings()]);
  if (!deal) notFound();

  return (
    <>
      <PageHero image={deal.image} eyebrow="شهر عسل" title={deal.nameAr} subtitle={deal.region} priority />

      <nav
        aria-label="مسار التنقل"
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-1 px-4 pt-5 text-xs text-muted sm:px-6 sm:text-sm"
      >
        <Link href="/" className="hover:text-navy">
          الرئيسية
        </Link>
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <Link href="/honeymoon" className="hover:text-navy">
          شهر العسل
        </Link>
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="line-clamp-1 font-semibold text-navy">{deal.nameAr}</span>
      </nav>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 md:py-12 lg:grid-cols-[minmax(0,1fr)_370px]">
        <MotionReveal>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-champagne/20 px-3 py-1.5 text-xs font-bold text-navy">
            <Heart className="h-3.5 w-3.5 fill-navy" aria-hidden /> باقة رومانسية حصرية
          </div>

          <p className="surface mb-8 rounded-[20px] p-5 text-sm leading-[1.9] text-navy/80 sm:p-6 sm:text-base">
            استمتعا ببداية استثنائية لحياتكما في <strong>{deal.nameAr}</strong> بـ{deal.region}. تشمل
            الباقة مزايا مجانية للعروسين وفترات متعددة. تواصلا معنا لتأكيد التوافر والسعر النهائي.
          </p>

          {/* Price periods */}
          <div className="mb-10">
            <div className="mb-1 text-xs font-extrabold text-champagne-ink">تفاصيل العرض</div>
            <h2 className="mb-4 text-2xl font-extrabold text-navy sm:text-3xl">فترات الأسعار</h2>
            <HoneymoonPricePeriods dealName={deal.nameAr} periods={deal.periods} />
          </div>

          {/* Perks (verbatim from source) */}
          <div>
            <h2 className="mb-4 text-2xl font-extrabold text-navy sm:text-3xl">مزايا الباقة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {deal.perks.map((perk) => (
                <div
                  key={perk}
                  className="flex min-h-[52px] items-center gap-3 rounded-[16px] border border-champagne/25 bg-champagne/10 p-3.5"
                >
                  <Gift className="h-5 w-5 shrink-0 text-champagne" aria-hidden />
                  <span className="text-sm font-semibold text-navy">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </MotionReveal>

        <MotionReveal delay={0.08}>
          <BookingCard
            hotelName={deal.nameAr}
            minPrice={deal.minPrice}
            contextLine={`${deal.region} — شهر عسل`}
            whatsapp={settings.whatsapp}
            phone={settings.phone}
          />
        </MotionReveal>
      </section>
    </>
  );
}
