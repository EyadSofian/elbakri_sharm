import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gift, CalendarDays, ChevronLeft, Heart } from "lucide-react";
import { getHoneymoons, getHoneymoonBySlug } from "@/lib/catalog";
import { PageHero } from "@/components/PageHero";
import { BookingCard } from "@/components/BookingCard";
import { Price } from "@/components/Price";
import { parsePrice } from "@/lib/slug";

type Params = Promise<{ identifier: string }>;

// Numeric legacy indices are redirected by next.config; unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getHoneymoons().map((d) => ({ identifier: d.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { identifier } = await params;
  const d = getHoneymoonBySlug(identifier);
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
  const deal = getHoneymoonBySlug(identifier);
  if (!deal) notFound();

  return (
    <>
      <PageHero image={deal.image} eyebrow="شهر عسل" title={deal.nameAr} subtitle={deal.region} priority />

      <nav
        aria-label="مسار التنقل"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-5 pt-6 text-sm text-muted"
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

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-champagne/20 px-3 py-1.5 text-xs font-bold text-navy">
            <Heart className="h-3.5 w-3.5 fill-navy" aria-hidden /> باقة رومانسية حصرية
          </div>

          <p className="mb-8 leading-loose text-navy/80">
            استمتعا ببداية استثنائية لحياتكما في <strong>{deal.nameAr}</strong> بـ{deal.region}. تشمل
            الباقة مزايا مجانية للعروسين وفترات متعددة. تواصلا معنا لتأكيد التوافر والسعر النهائي.
          </p>

          {/* Price periods */}
          <div className="mb-10">
            <h2 className="mb-4 text-2xl font-extrabold text-navy">فترات الأسعار</h2>
            <div className="overflow-x-auto rounded-2xl border border-ice">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                <caption className="sr-only">جدول أسعار وفترات باقة شهر العسل في {deal.nameAr}</caption>
                <thead>
                  <tr className="bg-navy text-white">
                    <th scope="col" className="p-3 text-right font-bold">
                      الفترة
                    </th>
                    <th scope="col" className="p-3 text-right font-bold">
                      الإقامة
                    </th>
                    <th scope="col" className="p-3 text-center font-bold">
                      السعر
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deal.periods.map((p, i) => (
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
                        <Price value={parsePrice(p.price)} />
                        <span className="mr-1 text-[10px] font-normal text-muted">{p.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Perks (verbatim from source) */}
          <div>
            <h2 className="mb-4 text-2xl font-extrabold text-navy">مزايا الباقة</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {deal.perks.map((perk) => (
                <div
                  key={perk}
                  className="flex items-center gap-2 rounded-lg border border-champagne/20 bg-champagne/10 p-3"
                >
                  <Gift className="h-5 w-5 shrink-0 text-champagne" aria-hidden />
                  <span className="text-sm font-semibold text-navy">{perk}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <BookingCard
            hotelName={deal.nameAr}
            minPrice={deal.minPrice}
            contextLine={`${deal.region} — شهر عسل`}
          />
        </div>
      </section>
    </>
  );
}
