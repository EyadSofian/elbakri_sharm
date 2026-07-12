import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getDestinations, getDestinationBySlug } from "@/lib/data";
import { PageHero } from "@/components/PageHero";
import { DestinationExplorer } from "./DestinationExplorer";

type Params = Promise<{ destinationSlug: string }>;

// Only canonical slugs are valid; legacy ids are handled by next.config redirects,
// and any other param returns a real 404.
// New rate-hub destinations must be routable after an ISR refresh, without a redeploy.
export const dynamicParams = true;
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getDestinations()).map((d) => ({ destinationSlug: d.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { destinationSlug } = await params;
  const d = await getDestinationBySlug(destinationSlug);
  if (!d) return { title: "الوجهة غير موجودة" };
  return {
    title: `${d.nameAr} — عروض 2026`,
    description: `أفضل عروض فنادق ${d.nameAr} — ${d.tagline}. احجز عبر واتساب مع البكري أوفرسيز.`,
    alternates: { canonical: `/destinations/${d.slug}` },
    openGraph: {
      title: `${d.nameAr} — عروض 2026`,
      description: d.tagline,
      images: [{ url: d.image }],
    },
  };
}

export default async function DestinationPage({ params }: { params: Params }) {
  const { destinationSlug } = await params;
  const destination = await getDestinationBySlug(destinationSlug);
  if (!destination) notFound();

  return (
    <>
      <PageHero
        image={destination.image}
        eyebrow="وجهة سياحية"
        title={destination.nameAr}
        subtitle={destination.tagline}
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
        <span className="font-semibold text-navy">{destination.nameAr}</span>
      </nav>

      <DestinationExplorer destination={destination} />
    </>
  );
}
