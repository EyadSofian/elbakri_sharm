import type { Metadata } from "next";
import { Tajawal, Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { MobileActionDock } from "@/components/MobileActionDock";
import { getDestinations, getSiteSettings } from "@/lib/data";

const arabic = Tajawal({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "700", "800", "900"],
});

const latin = Outfit({
  subsets: ["latin"],
  variable: "--font-latin",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elbakri-overseas.example";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "البكري أوفرسيز | عروض السفر والفنادق في مصر",
    template: "%s | البكري أوفرسيز",
  },
  description:
    "البكري أوفرسيز — عروض فنادق ومنتجعات شرم الشيخ ودهب والغردقة ومرسى علم والساحل الشمالي وباقات شهر العسل. تأكيد الحجز عبر واتساب.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    siteName: "البكري أوفرسيز",
    title: "البكري أوفرسيز | عروض السفر والفنادق في مصر",
    description:
      "عروض فنادق ومنتجعات مصر وباقات شهر العسل من البكري أوفرسيز. تأسست 1982.",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [destinations, settings] = await Promise.all([getDestinations(), getSiteSettings()]);
  const navDestinations = destinations.map((d) => ({ slug: d.slug, name: d.nameAr }));
  return (
    <html lang="ar" dir="rtl" className={`${arabic.variable} ${latin.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
        >
          تخطَّ إلى المحتوى
        </a>
        <Navbar
          destinations={navDestinations}
          whatsapp={settings.whatsapp}
          whatsappMessage={settings.defaultWhatsappMessage}
        />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <FloatingWhatsApp whatsapp={settings.whatsapp} message={settings.defaultWhatsappMessage} />
        <MobileActionDock
          whatsapp={settings.whatsapp}
          phone={settings.phone}
          message={settings.defaultWhatsappMessage}
        />
      </body>
    </html>
  );
}
