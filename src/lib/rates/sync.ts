import type {
  CategoryView,
  Destination,
  Hotel,
  Honeymoon,
} from "@/lib/catalog";
import { unitLabel } from "@/lib/catalog";
import { PLACEHOLDER, honeymoonImagePath } from "@/lib/images";
import { slugify } from "@/lib/slug";
import type { RateHoneymoon, RateHotel, RatePackage } from "./client";
import { mapRatePeriods, minOverRatePeriods, normalizeName } from "./overlay";

type PriceUnit = CategoryView["priceUnit"];

const REGION_HINTS: Array<{ destinationSlug: string; hints: string[] }> = [
  {
    destinationSlug: "sharm-el-sheikh",
    hints: ["sharm", "شرم"],
  },
  {
    destinationSlug: "dahab",
    hints: ["dahab", "taba", "دهب", "طابا"],
  },
  {
    destinationSlug: "sahl-hasheesh",
    hints: ["sahl hasheesh", "سهل حشيش"],
  },
  {
    destinationSlug: "makadi-bay",
    hints: ["makadi", "مكادي", "مكادى", "مكادي باي", "مكادى باى"],
  },
  {
    destinationSlug: "el-gouna",
    hints: ["el gouna", "gouna", "الجونه", "الجونة"],
  },
  {
    destinationSlug: "hurghada",
    hints: ["hurghada", "الغردقه", "الغردقة", "سوما", "soma"],
  },
  {
    destinationSlug: "marsa-alam",
    hints: ["marsa alam", "مرسي علم", "مرسى علم"],
  },
  {
    destinationSlug: "north-coast",
    hints: ["north coast", "alamein", "الساحل", "العلمين"],
  },
];

const SPECIAL_DESTINATIONS: Record<string, Omit<Destination, "hotels" | "categories" | "hotelCount" | "minPrice">> = {
  "sahl-hasheesh": {
    id: "sahl-hasheesh",
    slug: "sahl-hasheesh",
    nameAr: "سهل حشيش",
    nameEn: "Sahl Hasheesh",
    tagline: "منتجعات هادئة وشواطئ مميزة جنوب الغردقة",
    image: "/images/destinations/hurghada.webp",
  },
  "makadi-bay": {
    id: "makadi-bay",
    slug: "makadi-bay",
    nameAr: "مكادي",
    nameEn: "Makadi Bay",
    tagline: "خليج هادئ ومنتجعات متكاملة تناسب العائلات",
    image: "/images/destinations/hurghada.webp",
  },
  "el-gouna": {
    id: "el-gouna",
    slug: "el-gouna",
    nameAr: "الجونة",
    nameEn: "El Gouna",
    tagline: "لاجونات وشواطئ وتجربة إقامة راقية على البحر الأحمر",
    image: "/images/destinations/hurghada.webp",
  },
};

function priceUnitFromBasis(basis?: string | null): PriceUnit {
  const value = (basis ?? "").toLowerCase();
  const perRoom = value.includes("room");
  const perNight = value.includes("night");
  if (perRoom && perNight) return "per_room_night";
  if (perRoom) return "per_room_trip";
  if (perNight) return "per_person_night";
  return "per_person_trip";
}

function regionForPackageHotel(pkg: RatePackage, hotel: RateHotel): string {
  const packageRegion = pkg.region?.trim();
  const hotelRegion = hotel.region?.trim();
  const subRegion = hotel.sub_region?.trim();
  for (const candidate of [subRegion, hotelRegion]) {
    if (!candidate) continue;
    const slug = REGION_HINTS.find(({ hints }) =>
      hints.some((hint) => normalizeName(candidate).includes(normalizeName(hint))),
    )?.destinationSlug;
    if (slug && SPECIAL_DESTINATIONS[slug]) return candidate;
  }
  if (packageRegion && normalizeName(packageRegion) !== normalizeName("متعدد")) {
    return hotelRegion || packageRegion;
  }
  return hotelRegion || packageRegion || "وجهات أخرى";
}

function baseDestinationForRegion(base: Destination[], region: string): Destination | undefined {
  const key = normalizeName(region);
  const exact = base.find((destination) =>
    [destination.id, destination.slug, destination.nameAr, destination.nameEn]
      .map(normalizeName)
      .includes(key),
  );
  if (exact) return exact;

  const hintedSlug = REGION_HINTS.find(({ hints }) =>
    hints.some((hint) => key.includes(normalizeName(hint))),
  )?.destinationSlug;
  return hintedSlug ? base.find((destination) => destination.slug === hintedSlug) : undefined;
}

function dynamicDestination(region: string): Destination {
  const slug = `region-${slugify(region) || "other"}`;
  return {
    id: slug,
    slug,
    nameAr: region,
    nameEn: region,
    tagline: `عروض الفنادق والباقات المتاحة في ${region}`,
    image: PLACEHOLDER,
    hotels: [],
    categories: [],
    hotelCount: 0,
    minPrice: null,
  };
}

function destinationShell(base: Destination[], region: string): Destination {
  const known = baseDestinationForRegion(base, region);
  const hintedSlug = REGION_HINTS.find(({ hints }) =>
    hints.some((hint) => normalizeName(region).includes(normalizeName(hint))),
  )?.destinationSlug;
  const special = hintedSlug ? SPECIAL_DESTINATIONS[hintedSlug] : undefined;
  return known
    ? { ...known, hotels: [], categories: [], hotelCount: 0, minPrice: null }
    : special
      ? { ...special, hotels: [], categories: [], hotelCount: 0, minPrice: null }
    : dynamicDestination(region);
}

function findBaseHotel(destination: Destination, rateHotel: RateHotel): Hotel | undefined {
  const name = normalizeName(rateHotel.hotel_name);
  return destination.hotels.find(
    (hotel) => normalizeName(hotel.nameAr) === name || normalizeName(hotel.nameEn) === name,
  );
}

function rateHotelKey(hotel: RateHotel): string {
  return hotel.id != null ? String(hotel.id) : normalizeName(hotel.hotel_name);
}

function ensureUniqueSlug(candidate: string, used: Map<string, string>, hotelKey: string): string {
  const owner = used.get(candidate);
  if (!owner || owner === hotelKey) {
    used.set(candidate, hotelKey);
    return candidate;
  }
  const suffix = hotelKey.replace(/[^\p{L}\p{N}]+/gu, "-");
  const unique = `${candidate}-${suffix}`;
  used.set(unique, hotelKey);
  return unique;
}

/**
 * Build the storefront structure from active rate-hub packages. Package/hotel
 * membership is authoritative; curated data contributes only presentation
 * metadata (Arabic names, verified images and stable existing slugs).
 */
export function syncDestinationsFromRatePackages(
  base: Destination[],
  packages: RatePackage[],
): Destination[] {
  const destinations = new Map<string, Destination>();
  const hotelMaps = new Map<string, Map<string, Hotel>>();
  const usedSlugs = new Map<string, string>();

  for (const pkg of packages) {
    const packageNote = [pkg.group_name, pkg.description]
      .filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)
      .join(" — ") || undefined;
    const hotelsByDestination = new Map<string, string[]>();
    const firstPublishedBasis = pkg.hotels
      .flatMap((hotel) => hotel.periods)
      .find((period) => period.pricing_basis)?.pricing_basis;
    const unit = priceUnitFromBasis(pkg.default_pricing_basis ?? firstPublishedBasis);

    for (const rateHotel of pkg.hotels) {
      const region = regionForPackageHotel(pkg, rateHotel);
      const knownDestination = baseDestinationForRegion(base, region);
      const shell = destinationShell(base, region);
      const destinationKey = shell.slug;
      if (!destinations.has(destinationKey)) destinations.set(destinationKey, shell);
      if (!hotelMaps.has(destinationKey)) hotelMaps.set(destinationKey, new Map());

      const destination = destinations.get(destinationKey)!;
      const baseForMatching = knownDestination ?? destination;
      const curatedHotel = findBaseHotel(baseForMatching, rateHotel);
      const hotelKey = rateHotelKey(rateHotel);
      const map = hotelMaps.get(destinationKey)!;

      let hotel = map.get(hotelKey);
      if (!hotel) {
        const fallbackSlug = rateHotel.id != null ? `hotel-${rateHotel.id}` : slugify(rateHotel.hotel_name);
        const slug = ensureUniqueSlug(curatedHotel?.slug ?? fallbackSlug, usedSlugs, hotelKey);
        const periods = mapRatePeriods(rateHotel);
        hotel = {
          id: rateHotel.id != null ? `rate-hotel-${rateHotel.id}` : slug,
          slug,
          nameAr: curatedHotel?.nameAr ?? rateHotel.hotel_name,
          nameEn: curatedHotel?.nameEn ?? rateHotel.hotel_name,
          destinationId: destination.id,
          destinationSlug: destination.slug,
          destinationNameAr: destination.nameAr,
          categoryId: `rate-package-${pkg.id}`,
          categoryName: pkg.package_name,
          categoryNote: packageNote,
          priceUnit: unit,
          unitLabel: unitLabel(unit),
          periods,
          minPrice: minOverRatePeriods(periods),
          image: curatedHotel?.image ?? destination.image,
          legacy: {
            destination: destination.id,
            category: `rate-package-${pkg.id}`,
            idx: map.size,
          },
        };
        map.set(hotelKey, hotel);
        destination.hotels.push(hotel);
      }

      const slugs = hotelsByDestination.get(destinationKey) ?? [];
      if (!slugs.includes(hotel.slug)) slugs.push(hotel.slug);
      hotelsByDestination.set(destinationKey, slugs);
    }

    for (const [destinationKey, hotelSlugs] of hotelsByDestination) {
      const destination = destinations.get(destinationKey)!;
      destination.categories.push({
        id: `rate-package-${pkg.id}`,
        name: pkg.package_name,
        note: packageNote,
        priceUnit: unit,
        unitLabel: unitLabel(unit),
        hotelSlugs,
      });
    }
  }

  const baseOrder = new Map(base.map((destination, index) => [destination.slug, index]));
  return [...destinations.values()]
    .map((destination) => {
      const prices = destination.hotels
        .map((hotel) => hotel.minPrice)
        .filter((price): price is number => price != null);
      return {
        ...destination,
        hotelCount: destination.hotels.length,
        minPrice: prices.length ? Math.min(...prices) : null,
      };
    })
    .sort(
      (a, b) =>
        (baseOrder.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
          (baseOrder.get(b.slug) ?? Number.MAX_SAFE_INTEGER) ||
        a.nameAr.localeCompare(b.nameAr, "ar"),
    );
}

function splitFeatures(features?: string | null): string[] {
  return (features ?? "")
    .split(/\r?\n|[•;]+/)
    .map((feature) => feature.trim().replace(/^[-–—]+\s*/, ""))
    .filter(Boolean);
}

function formatRatePrice(price: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(price);
}

export function syncHoneymoonsFromRateCatalog(
  base: Honeymoon[],
  offers: RateHoneymoon[],
): Honeymoon[] {
  return offers.map((offer) => {
    const normalized = normalizeName(offer.hotel_name);
    const curated = base.find(
      (deal) =>
        normalizeName(deal.nameAr) === normalized || normalizeName(deal.nameEn) === normalized,
    );
    const slug = curated?.slug ?? `honeymoon-${offer.id}`;
    const numericPrices = offer.periods
      .map((period) => period.price)
      .filter((price): price is number => price != null);
    const perks = [offer.offer_name, ...splitFeatures(offer.features)].filter(
      (value, index, values) => values.indexOf(value) === index,
    );

    return {
      id: `rate-honeymoon-${offer.id}`,
      slug,
      nameAr: curated?.nameAr ?? offer.hotel_name,
      nameEn: curated?.nameEn ?? offer.hotel_name,
      region: offer.region ?? "",
      periods: offer.periods.map((period) => ({
        period:
          [period.date_from, period.date_to].filter(Boolean).join(" – ") ||
          period.price_label ||
          "فترة العرض",
        board: period.notes ?? undefined,
        price: period.price != null ? formatRatePrice(period.price) : "—",
        unit: period.currency === "EGP" || !period.currency ? "للباقة" : period.currency,
      })),
      perks: perks.length ? perks : ["عرض شهر عسل من البكري أوفرسيز"],
      image: curated?.image ?? honeymoonImagePath(slug, offer.region ?? ""),
      minPrice: numericPrices.length ? Math.min(...numericPrices) : null,
      legacyIdx: offer.id,
    };
  });
}
