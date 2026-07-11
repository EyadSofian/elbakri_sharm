import type { Metadata } from "next";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { PHONE_DISPLAY, TEL_HREF, whatsappHref, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع فريق البكري أوفرسيز عبر الهاتف أو واتساب للاستفسار عن باقات الفنادق وشهر العسل.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        image="/images/destinations/home.webp"
        eyebrow="تواصل"
        title="نحن هنا لخدمتك"
        subtitle="اختر طريقة التواصل المفضلة لديك للاستفسار عن العروض."
        priority
      />
      <section className="mx-auto grid max-w-4xl gap-6 px-5 py-16 md:grid-cols-2">
        <a
          href={TEL_HREF}
          className="flex items-start gap-4 rounded-2xl border border-ice bg-white p-6 shadow-card transition hover:shadow-glass"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
            <Phone className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="text-lg font-black text-navy">اتصل بنا</div>
            <div dir="ltr" className="ltr font-bold text-navy/90">
              {PHONE_DISPLAY}
            </div>
          </div>
        </a>

        <a
          href={whatsappHref(DEFAULT_WHATSAPP_MESSAGE)}
          target="_blank"
          rel="noreferrer"
          className="flex items-start gap-4 rounded-2xl border border-ice bg-white p-6 shadow-card transition hover:shadow-glass"
        >
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#25D366]/10 text-[#25D366]">
            <MessageCircle className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="text-lg font-black text-navy">واتساب</div>
            <div dir="ltr" className="ltr font-bold text-navy/90">
              {PHONE_DISPLAY}
            </div>
          </div>
        </a>

        <div className="flex items-start gap-4 rounded-2xl border border-ice bg-white p-6 shadow-card">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
            <Mail className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="text-lg font-black text-navy">بريد إلكتروني</div>
            <a href="mailto:info@elbakri.travel" className="font-bold text-navy/90">
              info@elbakri.travel
            </a>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-ice bg-white p-6 shadow-card">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
            <MapPin className="h-5 w-5" aria-hidden />
          </div>
          <div>
            <div className="text-lg font-black text-navy">مقرنا</div>
            <div className="font-bold text-navy/90">القاهرة، مصر</div>
          </div>
        </div>
      </section>
    </>
  );
}
