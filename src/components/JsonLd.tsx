/**
 * TravelAgency structured data — VERIFIED organization fields only.
 * No ratings, no hotel ownership claims, no unverified socials (sameAs omitted).
 */
import { PHONE_DISPLAY } from "@/lib/whatsapp";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elbakri-overseas.example";

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: "البكري أوفرسيز للسفر",
    alternateName: "ELBAKRI OVERSEAS FOR TRAVEL",
    url: SITE_URL,
    telephone: PHONE_DISPLAY,
    areaServed: { "@type": "Country", name: "Egypt" },
    knowsLanguage: ["ar", "en"],
    foundingDate: "1982",
  };
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
