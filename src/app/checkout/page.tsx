import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHotelBySlug, getSiteSettings } from "@/lib/data";
import { depositPercent, isEasyKashConfigured } from "@/lib/easykash";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "إتمام الحجز والدفع", robots: { index: false } };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ hotel?: string }>;
}) {
  const { hotel: slug } = await searchParams;
  if (!slug) notFound();
  const [hotel, settings] = await Promise.all([getHotelBySlug(slug), getSiteSettings()]);
  if (!hotel) notFound();

  const enabled = isEasyKashConfigured();

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mb-7 text-center">
        <div className="section-kicker">إتمام الحجز</div>
        <h1 className="text-2xl font-black text-navy sm:text-3xl">احسب سعر إقامتك وأكّد الحجز</h1>
        <p className="mt-2 text-sm text-muted">
          اختر الفترة وعدد الأفراد لتظهر لك التكلفة فورًا، ثم أكمل الدفع الآمن.
        </p>
      </div>

      <CheckoutForm
        hotelSlug={hotel.slug}
        hotelName={hotel.nameAr}
        contextLine={`${hotel.destinationNameAr} — باقة ${hotel.categoryName}`}
        unitLabel={hotel.unitLabel}
        periods={hotel.periods}
        depositPercent={depositPercent()}
        enabled={enabled}
        whatsapp={settings.whatsapp}
      />

      <div className="mt-6 text-center">
        <Link href={`/hotels/${hotel.slug}`} className="text-xs font-bold text-blue hover:underline">
          ← رجوع لتفاصيل الفندق
        </Link>
      </div>
    </section>
  );
}
