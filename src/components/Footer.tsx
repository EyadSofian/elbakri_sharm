import Link from "next/link";
import { Phone, MessageCircle, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { getDestinations, getSiteSettings } from "@/lib/data";
import { telHref, whatsappHref } from "@/lib/whatsapp";
import { Logo } from "@/components/Logo";

export async function Footer() {
  const [destinations, settings] = await Promise.all([getDestinations(), getSiteSettings()]);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-midnight text-white/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-4">
        <div>
          <div className="mb-4 inline-flex items-center rounded-xl bg-white p-2.5">
            <Logo className="h-11" />
          </div>
          <p className="text-sm leading-relaxed text-white/70">
            وكيلك الموثوق للسفر داخل مصر — أفضل عروض الفنادق والمنتجعات وباقات شهر العسل لصيف 2026.
          </p>
        </div>

        <nav aria-label="الوجهات">
          <h4 className="mb-4 text-sm font-bold tracking-wider text-white">الوجهات</h4>
          <ul className="space-y-2 text-sm">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}`} className="hover:text-champagne">
                  {d.nameAr}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/honeymoon" className="hover:text-champagne">
                باقات شهر العسل
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="روابط">
          <h4 className="mb-4 text-sm font-bold tracking-wider text-white">روابط</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-champagne">
                الرئيسية
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-champagne">
                من نحن
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-champagne">
                تواصل معنا
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h4 className="mb-4 text-sm font-bold tracking-wider text-white">تواصل</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-champagne" aria-hidden />
              <a href={telHref(settings.phone)} dir="ltr" className="hover:text-champagne">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-champagne" aria-hidden />
              <a
                href={whatsappHref(settings.defaultWhatsappMessage, settings.whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-champagne"
              >
                واتساب مباشر
              </a>
            </li>
            {settings.email && (
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-champagne" aria-hidden />
                <a href={`mailto:${settings.email}`} className="hover:text-champagne">
                  {settings.email}
                </a>
              </li>
            )}
            {settings.locationAr && (
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-champagne" aria-hidden />
                <span>{settings.locationAr}</span>
              </li>
            )}
          </ul>
          {(settings.socialInstagram || settings.socialFacebook) && (
            <div className="mt-4 flex gap-3">
              {settings.socialInstagram && (
                <a
                  href={settings.socialInstagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="إنستغرام"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-champagne hover:text-midnight"
                >
                  <Instagram className="h-4 w-4" aria-hidden />
                </a>
              )}
              {settings.socialFacebook && (
                <a
                  href={settings.socialFacebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="فيسبوك"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-champagne hover:text-midnight"
                >
                  <Facebook className="h-4 w-4" aria-hidden />
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-4 text-center text-xs text-white/60">
          © {year} البكري أوفرسيز للسفر — جميع الحقوق محفوظة
        </div>
      </div>
    </footer>
  );
}
