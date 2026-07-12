import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Heart,
  MapPinned,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { getDestinations, getFeaturedHotels, getSiteSettings } from "@/lib/data";
import { isEasyKashConfigured } from "@/lib/easykash";
import { DestinationCard } from "@/components/DestinationCard";
import { HotelCard } from "@/components/HotelCard";
import { MotionReveal } from "@/components/MotionReveal";
import { OrganizationJsonLd } from "@/components/JsonLd";
import { Price } from "@/components/Price";
import { whatsappHref } from "@/lib/whatsapp";

export const revalidate = 300;

const HOME_HERO = "/images/destinations/home.webp";
const HONEYMOON_HERO = "/images/destinations/honeymoon.webp";

const TRUST = [
  { icon: CalendarClock, title: "منذ 1982", sub: "خبرة ممتدة في السفر" },
  { icon: MessageCircle, title: "دعم مباشر", sub: "تواصل واضح عبر واتساب" },
  { icon: BadgeCheck, title: "صور حقيقية", sub: "كل فندق بصورته" },
  { icon: MapPinned, title: "٥ وجهات", sub: "عروض داخل مصر" },
];

const STEPS = [
  { n: "١", title: "اختار وجهتك", text: "قارن الفنادق والباقات والأسعار بسهولة." },
  { n: "٢", title: "أرسل اختيارك", text: "زر واتساب يجهّز لك رسالة الحجز مباشرة." },
  { n: "٣", title: "أكّد الحجز", text: "فريقنا يؤكد التوافر والسعر النهائي معك." },
];

export default async function HomePage() {
  const [destinations, featured, settings] = await Promise.all([
    getDestinations(),
    getFeaturedHotels(6),
    getSiteSettings(),
  ]);

  const adviceMessage = "مرحباً، أحتاج مساعدة في اختيار أفضل عرض مناسب لرحلتي";
  const bookingHref = whatsappHref(adviceMessage, settings.whatsapp);
  const payEnabled = isEasyKashConfigured();

  return (
    <>
      <OrganizationJsonLd />

      <section className="relative isolate flex min-h-[calc(100svh-64px)] w-full items-center overflow-hidden md:min-h-[84vh]">
        <Image src={HOME_HERO} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-l from-midnight/95 via-navy/72 to-midnight/25" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(200,155,60,0.16),transparent_34%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_390px]">
          <MotionReveal className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-extrabold backdrop-blur-md sm:text-sm">
              <Sparkles className="h-4 w-4 text-champagne" aria-hidden />
              عروض صيف 2026 — أسعار واضحة وصور حقيقية
            </div>

            <h1 className="max-w-2xl text-[clamp(2.55rem,7vw,5.4rem)] font-extrabold leading-[1.08] text-white">
              اكتشف مصر
              <span className="mt-1 block text-champagne">واختار رحلتك بثقة</span>
            </h1>
            <p className="mt-6 max-w-[62ch] text-base leading-[1.8] text-white/88 sm:text-lg md:text-xl">
              قارن الباقات والفنادق والأسعار في شرم الشيخ ودهب والغردقة ومرسى علم والساحل
              الشمالي، ثم أكّد اختيارك مباشرة مع فريق البكري أوفرسيز.
            </p>

            <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
              <Link
                href="#destinations"
                className="tap-target inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-champagne px-7 text-sm font-extrabold text-midnight shadow-lg transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] sm:text-base"
              >
                شاهد العروض والأسعار
                <ArrowLeft className="h-5 w-5" aria-hidden />
              </Link>
              <a
                href={bookingHref}
                target="_blank"
                rel="noreferrer"
                className="tap-target inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-[0.98] sm:text-base"
              >
                <MessageCircle className="h-5 w-5 text-champagne" aria-hidden />
                ساعدني أختار
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/78 sm:text-sm">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-champagne" aria-hidden />
                {payEnabled ? "دفع أونلاين آمن" : "تأكيد فوري عبر واتساب"}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-champagne" aria-hidden />
                تأكيد السعر قبل الحجز
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-champagne" aria-hidden />
                تواصل مباشر
              </span>
            </div>

            <div className="mobile-snap -mx-4 mt-7 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden">
              {destinations.map((destination) => (
                <Link
                  key={destination.slug}
                  href={"/destinations/" + destination.slug}
                  className="tap-target flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-midnight/45 px-4 text-sm font-bold text-white backdrop-blur"
                >
                  {destination.nameAr}
                  <ArrowLeft className="h-3.5 w-3.5 text-champagne" aria-hidden />
                </Link>
              ))}
            </div>
          </MotionReveal>

          <MotionReveal className="hidden lg:block" delay={0.12}>
            <div className="glass-dark overflow-hidden p-3">
              <div className="px-3 pb-3 pt-2">
                <div className="text-xs font-extrabold text-champagne">ابدأ من الوجهة</div>
                <h2 className="mt-1 text-xl font-extrabold text-white">اختيارات سريعة</h2>
              </div>
              <div className="space-y-1">
                {destinations.map((destination) => (
                  <Link
                    key={destination.slug}
                    href={"/destinations/" + destination.slug}
                    className="tap-target group flex items-center justify-between rounded-2xl px-4 text-white transition hover:bg-white/10"
                  >
                    <div>
                      <div className="font-extrabold">{destination.nameAr}</div>
                      <div className="text-[11px] text-white/60">{destination.hotelCount} عرضًا</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-[10px] text-white/55">من</div>
                        <div className="font-black text-champagne">
                          <Price value={destination.minPrice} />
                          <span className="mr-1 text-[9px]">ج.م</span>
                        </div>
                      </div>
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section aria-label="مميزات الخدمة" className="relative z-10 -mt-5 px-4 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-2 rounded-[24px] border border-ice bg-white p-2 shadow-glass md:grid-cols-4 md:gap-3 md:p-3">
          {TRUST.map((item) => (
            <div key={item.title} className="flex min-h-[78px] items-center gap-3 rounded-[18px] bg-mist px-3 py-3 sm:px-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-white">
                <item.icon className="h-4.5 w-4.5" aria-hidden />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-navy sm:text-sm">{item.title}</div>
                <div className="mt-0.5 text-[10px] leading-snug text-muted sm:text-xs">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="destinations" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24">
        <MotionReveal className="mb-9 max-w-3xl md:mb-12">
          <div className="section-kicker">وجهاتنا</div>
          <h2 className="section-title mt-2">كل رحلة تبدأ باختيار صح</h2>
          <p className="section-copy mt-3">
            اختار الوجهة، شوف عدد العروض والسعر الابتدائي، وادخل مباشرة على الباقات المتاحة.
          </p>
        </MotionReveal>
        <MotionReveal className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3" delay={0.08}>
          {destinations.map((destination, index) => (
            <DestinationCard key={destination.slug} destination={destination} featured={index === 0} />
          ))}
        </MotionReveal>
      </section>

      <section className="border-y border-ice/80 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <MotionReveal className="mb-9 flex items-end justify-between gap-4">
            <div>
              <div className="section-kicker">عروض مختارة</div>
              <h2 className="section-title mt-2">أفضل نقطة بداية لكل وجهة</h2>
              <p className="section-copy mt-3">عروض مختارة تلقائيًا حسب أقل سعر متاح في كل وجهة.</p>
            </div>
            <Link
              href="#destinations"
              className="tap-target hidden items-center gap-2 rounded-full border border-navy px-5 text-sm font-extrabold text-navy transition hover:bg-navy hover:text-white sm:inline-flex"
            >
              كل الوجهات
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </MotionReveal>

          <MotionReveal
            className="mobile-snap -mx-4 grid grid-flow-col auto-cols-[86%] gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3"
            delay={0.08}
          >
            {featured.map((hotel) => (
              <HotelCard key={hotel.slug} hotel={hotel} />
            ))}
          </MotionReveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
        <MotionReveal>
          <Link
            href="/honeymoon"
            className="tap-target group relative block overflow-hidden rounded-[28px] shadow-glass"
          >
            <div className="relative min-h-[430px] md:min-h-[460px]">
              <Image
                src={HONEYMOON_HERO}
                alt="باقات شهر العسل"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-midnight/95 via-navy/55 to-transparent md:bg-gradient-to-l" />
            <div className="absolute inset-0 flex items-end md:items-center">
              <div className="max-w-2xl p-6 text-white sm:p-9 md:p-14">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-champagne backdrop-blur">
                  <Heart className="h-4 w-4 fill-champagne" aria-hidden />
                  باقات ومزايا للعروسين
                </div>
                <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
                  شهر عسل يليق ببداية العمر
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/84 sm:text-lg">
                  فنادق مختارة، صور حقيقية، فترات أسعار واضحة، ومزايا الباقة في مكان واحد.
                </p>
                <span className="tap-target mt-6 inline-flex items-center gap-2 rounded-full bg-champagne px-6 text-sm font-extrabold text-midnight transition group-hover:gap-3 sm:text-base">
                  استعرض باقات شهر العسل
                  <ArrowLeft className="h-5 w-5" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        </MotionReveal>
      </section>

      <section className="border-y border-ice bg-mist">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <MotionReveal className="text-center">
            <div className="section-kicker">خطوات بسيطة</div>
            <h2 className="section-title mt-2">من الاختيار للتأكيد في 3 خطوات</h2>
          </MotionReveal>
          <MotionReveal className="mt-10 grid gap-3 md:grid-cols-3 md:gap-5" delay={0.08}>
            {STEPS.map((step) => (
              <div key={step.n} className="surface flex items-start gap-4 rounded-[22px] p-5 md:block md:p-7 md:text-center">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-lg font-black text-white md:mx-auto md:mb-4 md:h-12 md:w-12">
                  {step.n}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-navy">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </div>
            ))}
          </MotionReveal>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <MotionReveal className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-navy p-7 text-white shadow-glass sm:p-10 md:flex md:items-center md:justify-between md:gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-champagne">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              محتار بين أكثر من عرض؟
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
              خلّي فريقنا يساعدك تختار الأنسب
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/72 sm:text-base">
              ابعت لنا عدد الأفراد والوجهة والموعد، ونراجع معك الاختيارات المتاحة.
            </p>
          </div>
          <a
            href={bookingHref}
            target="_blank"
            rel="noreferrer"
            className="tap-target mt-6 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full bg-whatsapp px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] sm:w-auto md:mt-0"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            كلّمنا على واتساب
          </a>
        </MotionReveal>
      </section>
    </>
  );
}
