import {
  destinations as rawDestinations,
  honeymoonDeals as rawHoneymoon,
  unitLabel,
  CONTACT_PHONE,
  CONTACT_WHATSAPP,
  type PricePeriod,
  type PackageCategory,
} from "@/data/packages.source";
import { DESTINATION_NAMES, HOTEL_NAMES } from "@/data/hotel-names";
import { parsePrice } from "@/lib/slug";
import { destinationHeroPath, hotelImagePath, honeymoonImagePath } from "@/lib/images";

export { unitLabel, CONTACT_PHONE, CONTACT_WHATSAPP };
export type { PricePeriod };

/* ============================================================
   Enriched, slug-addressable view over the canonical data.
   No business value is altered — only ids/slugs/derived stats
   are added on top of `packages.source.ts`.
   ============================================================ */

type PriceUnit = PackageCategory["priceUnit"];

export type Hotel = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  destinationId: string;
  destinationSlug: string;
  destinationNameAr: string;
  categoryId: string;
  categoryName: string;
  categoryNote?: string;
  priceUnit: PriceUnit;
  unitLabel: string;
  periods: PricePeriod[];
  minPrice: number | null;
  image: string;
  /** Legacy TanStack route params: /hotel/:destination/:category/:idx */
  legacy: { destination: string; category: string; idx: number };
};

export type CategoryView = {
  id: string;
  name: string;
  note?: string;
  priceUnit: PriceUnit;
  unitLabel: string;
  hotelSlugs: string[];
};

export type Destination = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  tagline: string;
  image: string;
  hotels: Hotel[];
  categories: CategoryView[];
  hotelCount: number;
  minPrice: number | null;
};

export type HoneymoonPeriod = { period: string; board?: string; price: string; unit: string };
export type Honeymoon = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  region: string;
  periods: HoneymoonPeriod[];
  perks: string[];
  image: string;
  minPrice: number | null;
  legacyIdx: number;
};

function nameEntry(nameAr: string) {
  const e = HOTEL_NAMES[nameAr];
  if (!e) throw new Error(`[catalog] Missing HOTEL_NAMES entry for "${nameAr}"`);
  return e;
}

function minOverPeriods(periods: PricePeriod[]): number | null {
  const nums: number[] = [];
  for (const p of periods) {
    const v = parsePrice(p.double) ?? parsePrice(p.triple) ?? parsePrice(p.price);
    if (v != null) nums.push(v);
  }
  return nums.length ? Math.min(...nums) : null;
}

/* ---------- Build destination hotels with collision-aware slugs ---------- */

type RawHotelRef = {
  destId: string;
  destSlug: string;
  destNameAr: string;
  catId: string;
  catName: string;
  catNote?: string;
  priceUnit: PriceUnit;
  idx: number;
  nameAr: string;
  nameEn: string;
  baseSlug: string;
  periods: PricePeriod[];
};

function collectRawHotels(): RawHotelRef[] {
  const refs: RawHotelRef[] = [];
  for (const d of rawDestinations) {
    const dInfo = DESTINATION_NAMES[d.id];
    if (!dInfo) throw new Error(`[catalog] Missing DESTINATION_NAMES for "${d.id}"`);
    for (const c of d.categories) {
      c.hotels.forEach((h, idx) => {
        const ne = nameEntry(h.name);
        refs.push({
          destId: d.id,
          destSlug: dInfo.slug,
          destNameAr: d.name,
          catId: c.id,
          catName: c.name,
          catNote: c.note,
          priceUnit: c.priceUnit,
          idx,
          nameAr: h.name,
          nameEn: ne.en,
          baseSlug: ne.slug,
          periods: h.periods,
        });
      });
    }
  }
  return refs;
}

function buildHotels(): Hotel[] {
  const refs = collectRawHotels();
  // Count base-slug frequency to decide which need destination qualification.
  const baseCount = new Map<string, number>();
  for (const r of refs) baseCount.set(r.baseSlug, (baseCount.get(r.baseSlug) ?? 0) + 1);

  const used = new Set<string>();
  return refs.map((r) => {
    let slug = (baseCount.get(r.baseSlug) ?? 0) > 1 ? `${r.baseSlug}-${r.destSlug}` : r.baseSlug;
    // Final safety: guarantee global uniqueness.
    if (used.has(slug)) {
      let n = 2;
      while (used.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    used.add(slug);
    return {
      id: slug,
      slug,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      destinationId: r.destId,
      destinationSlug: r.destSlug,
      destinationNameAr: r.destNameAr,
      categoryId: r.catId,
      categoryName: r.catName,
      categoryNote: r.catNote,
      priceUnit: r.priceUnit,
      unitLabel: unitLabel(r.priceUnit),
      periods: r.periods,
      minPrice: minOverPeriods(r.periods),
      image: hotelImagePath(slug, r.destId),
      legacy: { destination: r.destId, category: r.catId, idx: r.idx },
    } satisfies Hotel;
  });
}

const ALL_HOTELS: Hotel[] = buildHotels();

function buildDestinations(): Destination[] {
  return rawDestinations.map((d) => {
    const dInfo = DESTINATION_NAMES[d.id]!;
    const hotels = ALL_HOTELS.filter((h) => h.destinationId === d.id);
    const categories: CategoryView[] = d.categories.map((c) => ({
      id: c.id,
      name: c.name,
      note: c.note,
      priceUnit: c.priceUnit,
      unitLabel: unitLabel(c.priceUnit),
      hotelSlugs: hotels.filter((h) => h.categoryId === c.id).map((h) => h.slug),
    }));
    const prices = hotels.map((h) => h.minPrice).filter((n): n is number => n != null);
    return {
      id: d.id,
      slug: dInfo.slug,
      nameAr: d.name,
      nameEn: dInfo.en,
      tagline: d.tagline,
      image: destinationHeroPath(d.id),
      hotels,
      categories,
      hotelCount: hotels.length,
      minPrice: prices.length ? Math.min(...prices) : null,
    } satisfies Destination;
  });
}

const ALL_DESTINATIONS: Destination[] = buildDestinations();

function buildHoneymoons(): Honeymoon[] {
  const used = new Set<string>();
  return rawHoneymoon.map((deal, legacyIdx) => {
    const ne = nameEntry(deal.hotel);
    let slug = ne.slug;
    if (used.has(slug)) {
      let n = 2;
      while (used.has(`${slug}-${n}`)) n++;
      slug = `${slug}-${n}`;
    }
    used.add(slug);
    const prices = deal.periods
      .map((p) => parsePrice(p.price))
      .filter((n): n is number => n != null);
    return {
      id: slug,
      slug,
      nameAr: deal.hotel,
      nameEn: ne.en,
      region: deal.region,
      periods: deal.periods,
      perks: deal.perks,
      image: honeymoonImagePath(slug, deal.region),
      minPrice: prices.length ? Math.min(...prices) : null,
      legacyIdx,
    } satisfies Honeymoon;
  });
}

const ALL_HONEYMOONS: Honeymoon[] = buildHoneymoons();

/* ============================================================
   Public accessors
   ============================================================ */

export function getDestinations(): Destination[] {
  return ALL_DESTINATIONS;
}

export function getDestinationBySlug(slug: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.slug === slug);
}

/** Resolve legacy destination id (e.g. "sharm") -> canonical destination. */
export function getDestinationByLegacyId(id: string): Destination | undefined {
  return ALL_DESTINATIONS.find((d) => d.id === id);
}

export function getAllHotels(): Hotel[] {
  return ALL_HOTELS;
}

export function getHotelBySlug(slug: string): Hotel | undefined {
  return ALL_HOTELS.find((h) => h.slug === slug);
}

/** Resolve legacy /hotel/:destination/:category/:idx -> canonical hotel. */
export function getHotelByLegacy(
  destination: string,
  category: string,
  idx: number,
): Hotel | undefined {
  return ALL_HOTELS.find(
    (h) =>
      h.legacy.destination === destination &&
      h.legacy.category === category &&
      h.legacy.idx === idx,
  );
}

export function getHoneymoons(): Honeymoon[] {
  return ALL_HONEYMOONS;
}

export function getHoneymoonBySlug(slug: string): Honeymoon | undefined {
  return ALL_HONEYMOONS.find((d) => d.slug === slug);
}

/** Resolve legacy /honeymoon/:idx (numeric) -> canonical deal. */
export function getHoneymoonByIndex(idx: number): Honeymoon | undefined {
  return ALL_HONEYMOONS.find((d) => d.legacyIdx === idx);
}

export function getHoneymoonRegions(): string[] {
  return Array.from(new Set(ALL_HONEYMOONS.map((d) => d.region)));
}

/** Deterministic featured offers: lowest starting price per destination. */
export function getFeaturedHotels(count = 6): Hotel[] {
  const perDest = ALL_DESTINATIONS.map((d) =>
    [...d.hotels]
      .filter((h) => h.minPrice != null)
      .sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity))[0],
  ).filter((h): h is Hotel => Boolean(h));
  return perDest.slice(0, count);
}
