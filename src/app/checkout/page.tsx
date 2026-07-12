import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { getHotelBySlug, getSiteSettings } from "@/lib/data";
import { bookingAmountEGP, depositPercent, isEasyKashConfigured } from "@/lib/easykash";
import { whatsappHref } from "@/lib/whatsapp";
import { Price } from "@/components/Price";
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

  const enabled = isEasyKashConfigured() && hotel.minPrice != null && hotel.minPrice > 0;
  const amount = hotel.minPrice != null ? bookingAmountEGP(hotel.minPrice) : null;
  const pct = depositPercent();
  const wa = whatsappHref(
    `مرحباً، أرغب في حجز ${hotel.nameAr} — ${hotel.destinationNameAr}`,
    settings.whatsapp,
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
      <div className="mb-7 text-center">
        <div className="section-kicker">إتمام الحجز</div>
        <h1 className="text-2xl font-black text-navy sm:text-3xl">تأكيد الحجز والدفع الآمن</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="surface order-2 rounded-[22px] p-5 sm:p-6 md:order-1">
          {enabled ? (
            <>
              <h2 className="mb-4 text-lg font-extrabold text-navy">بياناتك لإتمام الدفع</h2>
              <CheckoutForm hotelSlug={hotel.slug} />
            </>
          ) : (
            <div className="py-2 text-center">
              <p className="mb-5 text-sm leading-relaxed text-navy/80">
                الدفع الأونلاين غير متاح حاليًا لهذا العرض. أكمل حجزك مباشرة مع فريقنا عبر واتساب
                لتأكيد السعر والتوافر.
              </p>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="tap-target inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-[15px] bg-whatsapp px-5 font-extrabold text-white transition hover:brightness-105 active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                الحجز عبر واتساب
              </a>
            </div>
          )}
        </div>

        <aside className="order-1 md:order-2">
          <div className="overflow-hidden rounded-[22px] border border-ice bg-white shadow-card">
            <div className="bg-navy px-5 py-4 text-white">
              <div className="text-xs font-extrabold text-champagne">ملخص الحجز</div>
              <div className="mt-1 text-lg font-black leading-tight">{hotel.nameAr}</div>
              <div className="text-xs text-white/70">
                {hotel.destinationNameAr} — باقة {hotel.categoryName}
              </div>
            </div>
            <dl className="space-y-2 p-5 text-sm">
              {hotel.periods[0]?.period ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">الفترة</dt>
                  <dd className="text-left font-semibold text-navy">{hotel.periods[0].period}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">السعر يبدأ من</dt>
                <dd className="font-semibold text-navy">
                  <Price value={hotel.minPrice} /> ج.م
                </dd>
              </div>
              {enabled && amount != null ? (
                <div className="mt-2 flex items-baseline justify-between gap-3 border-t border-ice pt-3">
                  <dt className="font-bold text-navy">
                    {pct < 100 ? `دفعة تأكيد (${pct}%)` : "المبلغ المطلوب"}
                  </dt>
                  <dd className="text-xl font-black text-navy">
                    <Price value={amount} /> <span className="text-xs font-semibold">ج.م</span>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <p className="mt-3 px-1 text-[11px] leading-relaxed text-muted">
            الأسعار والتوافر تُؤكَّد نهائيًا من فريقنا. الدفع يتم عبر بوابة EasyKash الآمنة.
          </p>
          <Link
            href={`/hotels/${hotel.slug}`}
            className="mt-2 block px-1 text-xs font-bold text-blue hover:underline"
          >
            ← رجوع لتفاصيل الفندق
          </Link>
        </aside>
      </div>
    </section>
  );
}
