import type { Metadata } from "next";
import { Phone, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { MotionReveal } from "@/components/MotionReveal";
import { getSiteSettings } from "@/lib/data";
import { telHref, whatsappHref } from "@/lib/whatsapp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "تواصل مع فريق البكري أوفرسيز عبر الهاتف أو واتساب للاستفسار عن باقات الفنادق وشهر العسل.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <PageHero
        image="/images/destinations/home.webp"
        eyebrow="تواصل"
        title="نحن هنا لخدمتك"
        subtitle="اختر طريقة التواصل المفضلة لديك للاستفسار عن العروض."
        priority
      />
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 md:py-20">
        <MotionReveal className="mb-8">
          <div className="section-kicker">اختر أسهل طريقة لك</div>
          <h2 className="section-title mt-2">فريقنا قريب منك</h2>
          <p className="section-copy mt-3">للاستفسار عن الأسعار والتوافر، واتساب هو الطريق الأسرع.</p>
        </MotionReveal>
        <MotionReveal className="grid gap-4 md:grid-cols-2" delay={0.08}>
          <a
            href={telHref(settings.phone)}
            className="tap-target group flex min-h-[132px] items-start gap-4 rounded-[22px] border border-ice bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover sm:p-6"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy text-white">
              <Phone className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-black text-navy">اتصل بنا</div>
              <div dir="ltr" className="ltr font-bold text-navy/90">
                {settings.phone}
              </div>
            </div>
          </a>
          <a
            href={whatsappHref(settings.defaultWhatsappMessage, settings.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="tap-target group flex min-h-[132px] items-start gap-4 rounded-[22px] border border-whatsapp/25 bg-whatsapp/5 p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover sm:p-6"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-whatsapp text-white">
              <MessageCircle className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-black text-navy">واتساب</div>
              <div dir="ltr" className="ltr font-bold text-navy/90">
                {settings.phone}
              </div>
            </div>
          </a>

        {settings.email && (
          <a href={`mailto:${settings.email}`} className="tap-target flex min-h-[132px] items-start gap-4 rounded-[22px] border border-ice bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-card-hover sm:p-6">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
              <Mail className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-black text-navy">بريد إلكتروني</div>
              <div className="font-bold text-navy/90">{settings.email}</div>
            </div>
          </a>
        )}

        {settings.locationAr && (
          <div className="flex min-h-[132px] items-start gap-4 rounded-[22px] border border-ice bg-white p-5 shadow-card sm:p-6">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
              <MapPin className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="text-lg font-black text-navy">مقرنا</div>
              <div className="font-bold text-navy/90">{settings.locationAr}</div>
              {settings.workingHoursAr && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Clock className="h-3 w-3" aria-hidden /> {settings.workingHoursAr}
                </div>
              )}
            </div>
          </div>
        )}
        </MotionReveal>
      </section>
    </>
  );
}
