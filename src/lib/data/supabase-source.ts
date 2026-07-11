/**
 * Supabase -> enriched catalog shapes. Reconstructs the exact Destination /
 * Hotel / Honeymoon objects the pages expect, using stored slugs/names (an
 * admin rename is authoritative). Reads via the cookie-free anon client so
 * public pages stay statically generatable.
 */
import { createPublicClient } from "@/lib/supabase/public";
import { unitLabel } from "@/lib/catalog";
import type {
  Destination,
  Hotel,
  Honeymoon,
  CategoryView,
  PricePeriod,
} from "@/lib/catalog";
import { parsePrice } from "@/lib/slug";
import { regionHeroPath, PLACEHOLDER } from "@/lib/images";
import type { SiteSettings } from "./index";

type PriceUnit = CategoryView["priceUnit"];

type RawImage = { path: string | null } | null;
type RawPeriod = {
  period_label: string;
  board_ar: string | null;
  double_text: string | null;
  triple_text: string | null;
  room_text: string | null;
  display_order: number;
};
type RawHotel = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  is_published: boolean;
  is_archived: boolean;
  image: RawImage;
};
type RawOffer = {
  legacy_idx: number | null;
  display_order: number;
  is_published: boolean;
  hotel: RawHotel | null;
  price_periods: RawPeriod[];
};
type RawCategory = {
  code: string;
  name_ar: string;
  price_unit: PriceUnit;
  note_ar: string | null;
  display_order: number;
  is_published: boolean;
  is_archived: boolean;
  offers: RawOffer[];
};
type RawDestination = {
  legacy_id: string | null;
  slug: string;
  name_ar: string;
  name_en: string;
  tagline: string;
  display_order: number;
  hero: RawImage;
  package_categories: RawCategory[];
};

const DEST_SELECT =
  "legacy_id,slug,name_ar,name_en,tagline,display_order," +
  "hero:image_assets!destinations_hero_image_id_fkey(path)," +
  "package_categories(code,name_ar,price_unit,note_ar,display_order,is_published,is_archived," +
  "offers(legacy_idx,display_order,is_published," +
  "hotel:hotels(id,slug,name_ar,name_en,is_published,is_archived,image:image_assets!hotels_image_id_fkey(path))," +
  "price_periods(period_label,board_ar,double_text,triple_text,room_text,display_order)))";

function byOrder<T extends { display_order: number }>(a: T, b: T) {
  return a.display_order - b.display_order;
}

function periodMin(periods: PricePeriod[]): number | null {
  const nums: number[] = [];
  for (const p of periods) {
    const v = parsePrice(p.double) ?? parsePrice(p.triple) ?? parsePrice(p.price);
    if (v != null) nums.push(v);
  }
  return nums.length ? Math.min(...nums) : null;
}

function heroPath(dest: RawDestination): string {
  return dest.hero?.path ?? `/images/destinations/${dest.slug}.webp`;
}

function mapPeriods(raw: RawPeriod[]): PricePeriod[] {
  return [...raw].sort(byOrder).map((p) => ({
    period: p.period_label,
    board: p.board_ar ?? undefined,
    double: p.double_text ?? undefined,
    triple: p.triple_text ?? undefined,
    price: p.room_text ?? undefined,
  }));
}

function buildDestinations(rows: RawDestination[]): Destination[] {
  return [...rows].sort(byOrder).map((d) => {
    const hero = heroPath(d);
    const hotels: Hotel[] = [];
    const categories: CategoryView[] = [];

    for (const c of [...d.package_categories].filter((c) => c.is_published && !c.is_archived).sort(byOrder)) {
      const catHotelSlugs: string[] = [];
      for (const o of [...c.offers].filter((o) => o.is_published && o.hotel).sort(byOrder)) {
        const h = o.hotel!;
        if (!h.is_published || h.is_archived) continue;
        const periods = mapPeriods(o.price_periods);
        const hotel: Hotel = {
          id: h.slug,
          slug: h.slug,
          nameAr: h.name_ar,
          nameEn: h.name_en,
          destinationId: d.legacy_id ?? d.slug,
          destinationSlug: d.slug,
          destinationNameAr: d.name_ar,
          categoryId: c.code,
          categoryName: c.name_ar,
          categoryNote: c.note_ar ?? undefined,
          priceUnit: c.price_unit,
          unitLabel: unitLabel(c.price_unit),
          periods,
          minPrice: periodMin(periods),
          image: h.image?.path ?? hero ?? PLACEHOLDER,
          legacy: {
            destination: d.legacy_id ?? d.slug,
            category: c.code,
            idx: o.legacy_idx ?? 0,
          },
        };
        hotels.push(hotel);
        catHotelSlugs.push(hotel.slug);
      }
      categories.push({
        id: c.code,
        name: c.name_ar,
        note: c.note_ar ?? undefined,
        priceUnit: c.price_unit,
        unitLabel: unitLabel(c.price_unit),
        hotelSlugs: catHotelSlugs,
      });
    }

    const prices = hotels.map((h) => h.minPrice).filter((n): n is number => n != null);
    return {
      id: d.legacy_id ?? d.slug,
      slug: d.slug,
      nameAr: d.name_ar,
      nameEn: d.name_en,
      tagline: d.tagline,
      image: hero,
      hotels,
      categories,
      hotelCount: hotels.length,
      minPrice: prices.length ? Math.min(...prices) : null,
    };
  });
}

async function fetchDestinations(): Promise<Destination[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("destinations")
    .select(DEST_SELECT)
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("display_order");
  if (error) throw new Error(`Supabase destinations query failed: ${error.message}`);
  return buildDestinations((data ?? []) as unknown as RawDestination[]);
}

export async function getDestinations(): Promise<Destination[]> {
  return fetchDestinations();
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  return (await fetchDestinations()).find((d) => d.slug === slug);
}

export async function getAllHotels(): Promise<Hotel[]> {
  return (await fetchDestinations()).flatMap((d) => d.hotels);
}

export async function getHotelBySlug(slug: string): Promise<Hotel | undefined> {
  return (await getAllHotels()).find((h) => h.slug === slug);
}

export async function getFeaturedHotels(count = 6): Promise<Hotel[]> {
  const dests = await fetchDestinations();
  return dests
    .map((d) =>
      [...d.hotels]
        .filter((h) => h.minPrice != null)
        .sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity))[0],
    )
    .filter((h): h is Hotel => Boolean(h))
    .slice(0, count);
}

/* ---------- honeymoon ---------- */

type RawHmPeriod = {
  period_label: string;
  board_ar: string | null;
  price_text: string;
  unit: string;
  display_order: number;
};
type RawHmPerk = { perk_ar: string; display_order: number };
type RawHoneymoon = {
  slug: string;
  legacy_idx: number | null;
  hotel_name_ar: string;
  hotel_name_en: string;
  region: string;
  display_order: number;
  image: RawImage;
  honeymoon_periods: RawHmPeriod[];
  honeymoon_perks: RawHmPerk[];
};

const HM_SELECT =
  "slug,legacy_idx,hotel_name_ar,hotel_name_en,region,display_order," +
  "image:image_assets!honeymoon_deals_image_id_fkey(path)," +
  "honeymoon_periods(period_label,board_ar,price_text,unit,display_order)," +
  "honeymoon_perks(perk_ar,display_order)";

function buildHoneymoons(rows: RawHoneymoon[]): Honeymoon[] {
  return [...rows].sort(byOrder).map((d) => {
    const periods = [...d.honeymoon_periods].sort(byOrder).map((p) => ({
      period: p.period_label,
      board: p.board_ar ?? undefined,
      price: p.price_text,
      unit: p.unit,
    }));
    const perks = [...d.honeymoon_perks].sort(byOrder).map((p) => p.perk_ar);
    const prices = periods.map((p) => parsePrice(p.price)).filter((n): n is number => n != null);
    return {
      id: d.slug,
      slug: d.slug,
      nameAr: d.hotel_name_ar,
      nameEn: d.hotel_name_en,
      region: d.region,
      periods,
      perks,
      image: d.image?.path ?? regionHeroPath(d.region),
      minPrice: prices.length ? Math.min(...prices) : null,
      legacyIdx: d.legacy_idx ?? 0,
    };
  });
}

async function fetchHoneymoons(): Promise<Honeymoon[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("honeymoon_deals")
    .select(HM_SELECT)
    .eq("is_published", true)
    .eq("is_archived", false)
    .order("display_order");
  if (error) throw new Error(`Supabase honeymoon query failed: ${error.message}`);
  return buildHoneymoons((data ?? []) as unknown as RawHoneymoon[]);
}

export async function getHoneymoons(): Promise<Honeymoon[]> {
  return fetchHoneymoons();
}

export async function getHoneymoonBySlug(slug: string): Promise<Honeymoon | undefined> {
  return (await fetchHoneymoons()).find((d) => d.slug === slug);
}

export async function getHoneymoonRegions(): Promise<string[]> {
  return Array.from(new Set((await fetchHoneymoons()).map((d) => d.region)));
}

/* ---------- site settings ---------- */

export async function getSiteSettings(fallback: SiteSettings): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(
      "phone,whatsapp,email,location_ar,working_hours_ar,social_instagram,social_facebook,default_whatsapp_message",
    )
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return fallback;
  return {
    phone: data.phone ?? fallback.phone,
    whatsapp: data.whatsapp ?? fallback.whatsapp,
    email: data.email ?? null,
    locationAr: data.location_ar ?? null,
    workingHoursAr: data.working_hours_ar ?? null,
    socialInstagram: data.social_instagram ?? null,
    socialFacebook: data.social_facebook ?? null,
    defaultWhatsappMessage: data.default_whatsapp_message ?? fallback.defaultWhatsappMessage,
  };
}
