import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Award, Users, Sparkles } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { MotionReveal } from "@/components/MotionReveal";

export const metadata: Metadata = {
  title: "من نحن",
  description:
    "البكري أوفرسيز — وكيلك الموثوق للسفر الداخلي في مصر منذ 1982، بشبكة فنادق ومنتجعات واسعة.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldCheck, title: "موثوقية", sub: "دعم مباشر عبر واتساب" },
  { icon: Award, title: "خبرة منذ 1982", sub: "عقود في السوق المصري" },
  { icon: Users, title: "خدمة شخصية", sub: "استشارة مجانية" },
  { icon: Sparkles, title: "عروض موسمية", sub: "باقات مختارة بعناية" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        image="/images/destinations/home.webp"
        eyebrow="البكري أوفرسيز"
        title="شغفنا هو رحلتك"
        subtitle="نصنع تجارب سفر لا تُنسى في مصر منذ 1982."
        priority
      />
      <section className="mx-auto grid max-w-7xl items-start gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <MotionReveal>
          <div className="section-kicker">قصتنا</div>
          <h2 className="section-title mt-2">خبرة طويلة، واختيار أسهل</h2>
          <p className="mt-5 max-w-[65ch] leading-[1.9] text-navy/80">
            البكري أوفرسيز للسفر (ELBAKRI OVERSEAS FOR TRAVEL) وكالة سفر مصرية متخصصة في الحجوزات
            الفندقية داخل مصر — من شرم الشيخ إلى الساحل الشمالي. نعمل مع مجموعات فندقية رائدة لنقدم
            لعملائنا أسعارًا تنافسية مع خدمة شخصية عبر واتساب.
          </p>
          <div className="mt-7 flex items-end gap-4 rounded-[22px] border border-ice bg-white p-5 shadow-card">
            <div dir="ltr" className="ltr text-5xl font-black leading-none text-champagne-ink">1982</div>
            <div className="pb-1 text-sm font-bold leading-relaxed text-muted">بداية اسم البكري أوفرسيز في عالم السفر</div>
          </div>
          <Link
            href="/#destinations"
            className="tap-target mt-6 inline-flex items-center gap-2 rounded-full bg-navy px-6 text-sm font-extrabold text-white transition hover:bg-blue"
          >
            استكشف عروضنا
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </MotionReveal>
        <MotionReveal className="grid grid-cols-2 gap-3 sm:gap-4" delay={0.08}>
          {VALUES.map((v) => (
            <div key={v.title} className="surface rounded-[20px] p-4 sm:p-5">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-navy text-white">
                <v.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="text-sm font-extrabold text-navy sm:text-base">{v.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted sm:text-sm">{v.sub}</div>
            </div>
          ))}
        </MotionReveal>
      </section>
    </>
  );
}
