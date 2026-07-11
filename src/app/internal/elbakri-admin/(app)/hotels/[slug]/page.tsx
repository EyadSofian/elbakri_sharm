import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { unitLabel } from "@/lib/catalog";
import { HotelEditor, type Period } from "../HotelEditor";

type Row = {
  id: string;
  slug: string;
  name_ar: string;
  is_published: boolean;
  offers: {
    price_periods: (Period & { display_order: number })[];
    package_categories: { price_unit: string } | null;
  }[];
};

export default async function HotelEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("hotels")
    .select(
      "id,slug,name_ar,is_published,offers(package_categories(price_unit),price_periods(id,period_label,board_ar,double_text,triple_text,display_order))",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!data) notFound();
  const hotel = data as unknown as Row;
  const periods: Period[] = hotel.offers
    .flatMap((o) => o.price_periods ?? [])
    .sort((a, b) => a.display_order - b.display_order)
    .map(({ id, period_label, board_ar, double_text, triple_text }) => ({
      id,
      period_label,
      board_ar,
      double_text,
      triple_text,
    }));
  const priceUnit = (hotel.offers[0]?.package_categories?.price_unit ??
    "per_person_trip") as Parameters<typeof unitLabel>[0];

  return (
    <div>
      <Link
        href="/internal/elbakri-admin/hotels"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-navy"
      >
        <ChevronRight className="h-4 w-4" aria-hidden /> الفنادق
      </Link>
      <HotelEditor
        hotel={{
          id: hotel.id,
          slug: hotel.slug,
          name_ar: hotel.name_ar,
          is_published: hotel.is_published,
          unit_label: unitLabel(priceUnit),
        }}
        periods={periods}
      />
    </div>
  );
}
