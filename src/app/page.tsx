import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarClock,
  Heart,
  MapPinned,
  MessageCircle,
  Package,
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
import { CatalogSearch, type CatalogSearchItem } from "@/components/CatalogSearch";

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
  const searchItems: CatalogSearchItem[] = [];
  for (const destination of destinations) {
    searchItems.push({
      id: `destination-${destination.slug}`,
      type: "destination",
      label: destination.nameAr,
      description: `${destination.hotelCount} فندق وباقة`,
      href: `/destinations/${destination.slug}`,
      keywords: `${destination.nameEn} ${destination.tagline}`,
    });
    for (const category of destination.categories) {
      searchItems.push({
        id: `package-${destination.slug}-${category.id}`,
        type: "package",
        label: category.name,
        description: `${category.groupName ? `${category.groupName} — ` : ""}${destination.nameAr}`,
        href: `/destinations/${destination.slug}#package-${category.id}`,
        keywords: `${category.groupName ?? ""} ${category.groupBrandName ?? ""} ${category.note ?? ""}`,
      });
    }
    for (const hotel of destination.hotels) {
      const memberships = destination.categories.filter((category) => category.hotelSlugs.includes(hotel.slug));
      searchItems.push({
        id: `hotel-${hotel.slug}`,
        type: "hotel",
        label: hotel.nameAr,
        description: destination.nameAr,
        href: `/hotels/${hotel.slug}`,
        keywords: `${hotel.nameEn} ${memberships.map((category) => `${category.name} ${category.groupName ?? ""}`).join(" ")}`,
      });
    }
  }
  const packageCards = destinations.flatMap((destination) =>
    destination.categories.map((category) => ({ destination, category })),
  ).sort((a, b) => {
    const aAlbatros = /الب[ـ\s]*اتروس|albatros/i.test(`${a.category.groupName ?? ""} ${a.category.name}`) ? 0 : 1;
    const bAlbatros = /الب[ـ\s]*اتروس|albatros/i.test(`${b.category.groupName ?? ""} ${b.category.name}`) ? 0 : 1;
    return aAlbatros - bAlbatros || a.destination.nameAr.localeCompare(b.destination.nameAr, "ar");
  });

  return (
    <>
      <OrganizationJsonLd />

      <section className="relative isolate flex min-h-[calc(100svh-64px)] w-full items-start overflow-hidden md:min-h-[84vh] md:items-center">
        <Image
          src={HOME_HERO}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[54%_center] sm:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-midnight/72 via-navy/82 to-midnight/98 md:bg-gradient-to-l md:from-midnight/95 md:via-navy/76 md:to-midnight/35" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(200,155,60,0.13),transparent_30%)]" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-28 pt-12 sm:px-6 sm:py-20 lg:grid-cols-[minmax(0,1fr)_390px]">
          <MotionReveal className="max-w-[700px] text-white">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-midnight/35 px-3.5 py-2 text-[11px] font-extrabold text-white/90 backdrop-blur-md sm:text-sm">
              <Sparkles className="h-4 w-4 text-champagne" aria-hidden />
              خبرة سفر موثوقة منذ <span className="ltr">1982</span>
            </div>

            <h1 className="max-w-2xl text-[clamp(2.2rem,9.5vw,5rem)] font-extrabold leading-[1.12] text-white">
              اختار فندقك بثقة
              <span className="mt-1 block text-champagne">واحجز بسعر واضح</span>
            </h1>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.75] text-white/88 sm:mt-5 sm:text-lg md:text-xl">
              قارن أحدث عروض شرم الشيخ والغردقة ودهب ومرسى علم، واعرف تفاصيل الإقامة والسعر
              قبل ما تتواصل معنا لتأكيد الحجز.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="#destinations"
                className="tap-target inline-flex min-h-[54px] w-full items-center justify-between gap-4 rounded-2xl bg-champagne px-5 text-sm font-extrabold text-midnight shadow-lg shadow-midnight/25 transition hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] sm:w-auto sm:min-w-[230px] sm:text-base"
              >
                استعرض أحدث العروض
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-midnight/10">
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                </span>
              </Link>
              <a
                href={bookingHref}
                target="_blank"
                rel="noreferrer"
                className="tap-target hidden min-h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 text-sm font-extrabold text-white backdrop-blur-md transition hover:bg-white/20 active:scale-[0.98] sm:inline-flex sm:text-base"
              >
                <MessageCircle className="h-5 w-5 text-champagne" aria-hidden />
                كلّم مستشار سفر
              </a>
            </div>

            <div className="mt-5 grid max-w-xl grid-cols-2 gap-2 text-[11px] font-bold text-white/85 sm:text-sm">
              <div className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-midnight/32 px-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-champagne" aria-hidden />
                {payEnabled ? "دفع أونلاين آمن" : "حجز مباشر وآمن"}
              </div>
              <div className="flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-midnight/32 px-3">
                <BadgeCheck className="h-4 w-4 shrink-0 text-champagne" aria-hidden />
                السعر يتأكد قبل الحجز
              </div>
            </div>
          </MotionReveal>

          <MotionReveal className="hidden lg:block" delay={0.12}>
            <div className="glass-dark overflow-hidden p-3">
              <div className="px-3 pb-3 pt-2">
                <div className="text-xs font-extrabold text-champagne-ink">ابدأ من الوجهة</div>
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
                        <div className="font-black text-champagne-ink">
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
                <div className="text-xs font-extrabold text-navy sm:text-sm">
                  {item.icon === MapPinned ? `${destinations.length} وجهات` : item.title}
                </div>
                <div className="mt-0.5 text-[10px] leading-snug text-muted sm:text-xs">{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="البحث في الفنادق والباقات" className="relative z-20 px-4 pt-10 sm:px-6 md:pt-14">
        <div className="mx-auto max-w-6xl rounded-[26px] border border-ice bg-mist p-4 shadow-card sm:p-6">
          <CatalogSearch items={searchItems} />
        </div>
      </section>

      <section id="packages" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-5 pt-14 sm:px-6 md:pt-20">
        <MotionReveal className="mb-7 max-w-3xl">
          <div className="section-kicker">الباقات ومجموعات الفنادق</div>
          <h2 className="section-title mt-2">كل المجموعات والباقات في مكان واحد</h2>
          <p className="section-copy mt-3">
            اختر مجموعة الباتروس أو أي باقة أخرى، ثم شاهد فنادقها وأسعارها داخل الوجهة.
          </p>
        </MotionReveal>
        <MotionReveal
          className="mobile-snap -mx-4 grid grid-flow-col auto-cols-[86%] gap-3 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3"
          delay={0.06}
        >
          {packageCards.map(({ destination, category }) => (
            <Link
              key={`${destination.slug}-${category.id}`}
              href={`/destinations/${destination.slug}#package-${category.id}`}
              className="tap-target group flex min-h-32 flex-col justify-between rounded-[20px] border border-ice bg-white p-5 shadow-card transition hover:-translate-y-1 hover:border-navy/20 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy text-white">
                  <Package className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className="rounded-full bg-mist px-3 py-1 text-[11px] font-bold text-muted">
                  {destination.nameAr}
                </span>
              </div>
              <div className="mt-4">
                {category.groupName ? (
                  <div className="mb-1 text-xs font-extrabold text-champagne-ink">{category.groupName}</div>
                ) : null}
                <h3 className="line-clamp-2 font-extrabold leading-snug text-navy">{category.name}</h3>
                <div className="mt-2 flex items-center justify-between text-xs text-muted">
                  <span>{category.hotelSlugs.length} فندق</span>
                  <span className="inline-flex items-center gap-1 font-bold text-navy">
                    شاهد الباقة <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" aria-hidden />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </MotionReveal>
      </section>

      <section id="destinations" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-24">
        <MotionReveal className="mb-9 max-w-3xl md:mb-12">
          <div className="section-kicker">وجهاتنا</div>
          <h2 className="section-title mt-2">اختار الوجهة المناسبة لميزانيتك</h2>
          <p className="section-copy mt-3">
            كل وجهة بتعرض لك عدد الفنادق وأقل سعر منشور، عشان تبدأ المقارنة من معلومة واضحة.
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
              <h2 className="section-title mt-2">ابدأ بأفضل سعر متاح</h2>
              <p className="section-copy mt-3">
                اختيارات محدثة تلقائيًا من أقل سعر منشور في كل وجهة—والسعر النهائي يتأكد قبل الحجز.
              </p>
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
            <h2 className="section-title mt-2">من المقارنة لتأكيد الحجز في 3 خطوات</h2>
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
