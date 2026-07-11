import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getHoneymoons, getHoneymoonRegions } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { HoneymoonExplorer } from "./HoneymoonExplorer";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "باقات شهر العسل 2026",
  description:
    "عروض شهر عسل رومانسية في أفخم فنادق مصر — شرم الشيخ، الغردقة، سهل حشيش، مرسى علم ودهب. مزايا مجانية للعروسين.",
  alternates: { canonical: "/honeymoon" },
  openGraph: {
    title: "باقات شهر العسل 2026 | البكري أوفرسيز",
    description: "عروض رومانسية حصرية مع مزايا مجانية.",
    images: [{ url: "/images/destinations/honeymoon.webp" }],
  },
};

export default async function HoneymoonPage() {
  const [deals, regions] = await Promise.all([getHoneymoons(), getHoneymoonRegions()]);

  return (
    <>
      <PageHero
        image="/images/destinations/honeymoon.webp"
        eyebrow="باقات حصرية"
        title="شهر عسل لا يُنسى"
        subtitle="عروض رومانسية في أفخم منتجعات مصر مع مزايا مجانية للعروسين."
        priority
      />
      <nav
        aria-label="مسار التنقل"
        className="mx-auto flex max-w-6xl items-center gap-1 px-5 pt-6 text-sm text-muted"
      >
        <Link href="/" className="hover:text-navy">
          الرئيسية
        </Link>
        <ChevronLeft className="h-4 w-4" aria-hidden />
        <span className="font-semibold text-navy">شهر العسل</span>
      </nav>

      <HoneymoonExplorer deals={deals} regions={regions} />
    </>
  );
}
