import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Heart,
  MessageCircle,
  MapPinned,
  BadgeCheck,
  CalendarClock,
} from "lucide-react";
import { getDestinations, getFeaturedHotels } from "@/lib/data";
import { DestinationCard } from "@/components/DestinationCard";
import { HotelCard } from "@/components/HotelCard";
import { OrganizationJsonLd } from "@/components/JsonLd";

export const revalidate = 300;

const HOME_HERO = "/images/destinations/home.webp";
const HONEYMOON_HERO = "/images/destinations/honeymoon.webp";

const TRUST = [
  { icon: CalendarClock, title: "خبرة منذ 1982", sub: "تأسست عام 1982" },
  { icon: MessageCircle, title: "دعم عبر واتساب", sub: "تواصل مباشر" },
  { icon: BadgeCheck, title: "فنادق مختارة", sub: "منتجعات موثوقة" },
  { icon: MapPinned, title: "٥ وجهات مصرية", sub: "من الأحمر للمتوسط" },
];

const STEPS = [
  { n: "١", title: "اختر العرض", text: "تصفح الوجهات والباقات واختر الفندق المناسب." },
  { n: "٢", title: "تواصل عبر واتساب", text: "أرسل لنا اختيارك برسالة واحدة جاهزة." },
  { n: "٣", title: "أكّد مع فريقنا", text: "نؤكد التوافر والسعر النهائي ونكمل الحجز." },
];

export default async function HomePage() {
  const [destinations, featured] = await Promise.all([getDestinations(), getFeaturedHotels(6)]);

  return (
    <>
      <OrganizationJsonLd />

      {/* Hero */}
      <section className="relative flex min-h-[86vh] w-full items-center overflow-hidden">
        <Image src={HOME_HERO} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-midnight/90 via-navy/65 to-navy/30" />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-24">
          <div className="max-w-2xl text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
              <Sparkles className="h-4 w-4 text-champagne" aria-hidden />
              عروض صيف 2026 — احجز الآن
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] md:text-6xl">
              اكتشف مصر
              <span className="block text-champagne">بأفضل الأسعار</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/90">
              باقات فندقية مختارة بعناية في أرقى وجهات مصر — رحلات عائلية، شهر عسل، ومنتجعات فاخرة.
              احجز مباشرة عبر واتساب.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="#destinations"
                className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3.5 font-bold text-midnight transition hover:brightness-95"
              >
                استكشف الوجهات <ArrowLeft className="h-5 w-5" aria-hidden />
              </Link>
              <Link
                href="/honeymoon"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                <Heart className="h-5 w-5 text-champagne" aria-hidden />
                باقات شهر العسل
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip (defensible statements only) */}
      <section className="border-b border-ice bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 md:grid-cols-4">
          {TRUST.map((f) => (
            <div key={f.title} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy/10 text-navy">
                <f.icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <div className="text-sm font-bold text-navy">{f.title}</div>
                <div className="text-xs text-muted">{f.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section id="destinations" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 md:py-28">
        <div className="mb-12 max-w-2xl">
          <div className="mb-3 text-sm font-bold uppercase tracking-wider text-champagne-ink">وجهاتنا</div>
          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-navy md:text-5xl">
            اختر وجهتك المثالية
          </h2>
          <p className="text-lg leading-relaxed text-muted">
            من شواطئ البحر الأحمر الفيروزية إلى نسائم المتوسط — لدينا الباقة المناسبة لكل رحلة.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <DestinationCard key={d.slug} destination={d} />
          ))}
        </div>
      </section>

      {/* Featured offers (deterministic: lowest starting price per destination) */}
      <section className="bg-mist">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 text-sm font-bold uppercase tracking-wider text-champagne-ink">
                عروض مختارة
              </div>
              <h2 className="text-3xl font-extrabold text-navy md:text-4xl">أقل الأسعار لكل وجهة</h2>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((h) => (
              <HotelCard key={h.slug} hotel={h} />
            ))}
          </div>
        </div>
      </section>

      {/* Honeymoon banner */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Link
          href="/honeymoon"
          className="group relative block overflow-hidden rounded-[28px] shadow-glass"
        >
          <div className="relative h-[360px] md:h-[420px]">
            <Image
              src={HONEYMOON_HERO}
              alt="باقات شهر العسل"
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-midnight/90 via-navy/55 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-xl p-8 text-white md:p-14">
              <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-champagne">
                <Heart className="h-4 w-4 fill-champagne" aria-hidden /> باقات حصرية
              </div>
              <h3 className="mb-4 text-3xl font-extrabold leading-tight md:text-5xl">
                شهر عسل لا يُنسى
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-white/90">
                عروض رومانسية في أفخم فنادق شرم الشيخ، الغردقة، ومرسى علم مع مزايا مجانية للعروسين.
              </p>
              <span className="inline-flex items-center gap-2 rounded-full bg-champagne px-6 py-3 font-bold text-midnight transition-all group-hover:gap-3">
                استعرض الباقات <ArrowLeft className="h-5 w-5" aria-hidden />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* How booking works */}
      <section className="border-t border-ice bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="mb-12 text-center text-3xl font-extrabold text-navy md:text-4xl">
            كيف يتم الحجز؟
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[22px] border border-ice bg-mist p-7 text-center">
                <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-navy text-xl font-bold text-white">
                  {s.n}
                </div>
                <h3 className="mb-2 text-lg font-bold text-navy">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="#destinations"
              className="inline-flex items-center gap-2 rounded-full bg-navy px-7 py-3.5 font-bold text-white transition hover:bg-blue"
            >
              ابدأ رحلتك الآن <ArrowLeft className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
