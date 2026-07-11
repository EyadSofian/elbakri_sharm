import type { Metadata } from "next";
import { ShieldCheck, Award, Users, Sparkles } from "lucide-react";
import { PageHero } from "@/components/PageHero";

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
      <section className="mx-auto grid max-w-6xl items-start gap-10 px-5 py-16 md:grid-cols-2">
        <div>
          <h2 className="mb-4 text-3xl font-extrabold text-navy">من نحن</h2>
          <p className="leading-loose text-navy/80">
            البكري أوفرسيز للسفر (ELBAKRI OVERSEAS FOR TRAVEL) وكالة سفر مصرية متخصصة في الحجوزات
            الفندقية داخل مصر — من شرم الشيخ إلى الساحل الشمالي. نعمل مع مجموعات فندقية رائدة لنقدم
            لعملائنا أسعارًا تنافسية مع خدمة شخصية عبر واتساب.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-ice bg-white p-5 shadow-card">
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-navy/10 text-navy">
                <v.icon className="h-5 w-5" aria-hidden />
              </div>
              <div className="font-bold text-navy">{v.title}</div>
              <div className="text-sm text-muted">{v.sub}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
