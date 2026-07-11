import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getDestinations, getSiteSettings } from "@/lib/data";
import { telHref, whatsappHref } from "@/lib/whatsapp";
import { Logo } from "@/components/Logo";

export async function Footer() {
  const [destinations, settings] = await Promise.all([getDestinations(), getSiteSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 bg-midnight text-white/85 md:mt-24">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-5 gap-y-9 px-4 py-12 sm:px-6 md:grid-cols-4 md:gap-10 md:py-16">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-4 inline-flex items-center rounded-[16px] bg-white px-3 py-2 shadow-card">
            <Logo className="h-10 sm:h-11" />
          </div>
          <p className="max-w-sm text-sm leading-[1.8] text-white/68">
            خبرة سفر منذ 1982، وعروض فنادق ومنتجعات داخل مصر مع تواصل مباشر لتأكيد السعر والتوافر.
          </p>
          <a
            href={whatsappHref(settings.defaultWhatsappMessage, settings.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="tap-target mt-5 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-extrabold text-white transition hover:brightness-105"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            احجز عبر واتساب
          </a>
        </div>

        <nav aria-label="الوجهات">
          <h4 className="mb-3 text-sm font-extrabold text-white">الوجهات</h4>
          <ul className="text-sm">
            {destinations.map((destination) => (
              <li key={destination.slug}>
                <Link
                  href={"/destinations/" + destination.slug}
                  className="tap-target flex items-center transition hover:text-champagne"
                >
                  {destination.nameAr}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/honeymoon" className="tap-target flex items-center transition hover:text-champagne">
                باقات شهر العسل
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="روابط">
          <h4 className="mb-3 text-sm font-extrabold text-white">روابط</h4>
          <ul className="text-sm">
            <li>
              <Link href="/" className="tap-target flex items-center transition hover:text-champagne">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/about" className="tap-target flex items-center transition hover:text-champagne">
                من نحن
              </Link>
            </li>
            <li>
              <Link href="/contact" className="tap-target flex items-center transition hover:text-champagne">
                تواصل معنا
              </Link>
            </li>
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-1">
          <h4 className="mb-3 text-sm font-extrabold text-white">تواصل</h4>
          <ul className="grid gap-1 text-sm">
            <li className="flex min-h-11 items-center gap-2">
              <Phone className="h-4 w-4 text-champagne" aria-hidden />
              <a href={telHref(settings.phone)} dir="ltr" className="ltr transition hover:text-champagne">
                {settings.phone}
              </a>
            </li>
            <li className="flex min-h-11 items-center gap-2">
              <MessageCircle className="h-4 w-4 text-champagne" aria-hidden />
              <a
                href={whatsappHref(settings.defaultWhatsappMessage, settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-champagne"
              >
                واتساب مباشر
              </a>
            </li>
            {settings.email ? (
              <li className="flex min-h-11 items-center gap-2">
                <Mail className="h-4 w-4 text-champagne" aria-hidden />
                <a href={"mailto:" + settings.email} className="transition hover:text-champagne">
                  {settings.email}
                </a>
              </li>
            ) : null}
            {settings.locationAr ? (
              <li className="flex min-h-11 items-center gap-2">
                <MapPin className="h-4 w-4 text-champagne" aria-hidden />
                <span>{settings.locationAr}</span>
              </li>
            ) : null}
          </ul>

          {settings.socialInstagram || settings.socialFacebook ? (
            <div className="mt-4 flex gap-3">
              {settings.socialInstagram ? (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="إنستغرام"
                  className="tap-target grid place-items-center rounded-full bg-white/10 transition hover:bg-champagne hover:text-midnight"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
              {settings.socialFacebook ? (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="فيسبوك"
                  className="tap-target grid place-items-center rounded-full bg-white/10 transition hover:bg-champagne hover:text-midnight"
                >
                  <Facebook className="h-4 w-4" aria-hidden />
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-[11px] text-white/55 sm:px-6 sm:text-xs">
          © {year} البكري أوفرسيز للسفر — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
