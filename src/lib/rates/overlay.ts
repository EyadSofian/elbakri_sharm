import type { Destination, Hotel, PricePeriod } from "@/lib/catalog";
import { parsePrice } from "@/lib/slug";
import type { RateHotel } from "./client";

/**
 * Overlay live rate prices onto the curated catalog: the base catalog owns
 * structure/images/slugs (region → packages → hotels); the rate hub refreshes
 * only the price periods, matched by hotel name. Unmatched hotels are untouched.
 */

const BOARD_AR: Record<string, string> = {
  RO: "بدون وجبات",
  BB: "مبيت وإفطار",
  HB: "نصف إقامة",
  FB: "إقامة كاملة",
  AI: "شامل كليًا",
  UAI: "شامل فاخر",
};

/** Fold Arabic spelling variants so "فالكون نعمة ستار" matches across sources. */
export function normalizeName(s: string): string {
  return s
    .replace(/[ً-ٰٟ]/g, "") // diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ـ/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function fmtPrice(n: number | null | undefined): string | undefined {
  if (n == null) return undefined;
  return new Intl.NumberFormat("en-US").format(n);
}

function mapPeriods(rate: RateHotel): PricePeriod[] {
  return rate.periods.map((p) => {
    const period =
      p.season_name?.trim() ||
      [p.date_from, p.date_to].filter(Boolean).join(" - ") ||
      "فترة";
    const board = p.meal_plan ? (BOARD_AR[p.meal_plan] ?? p.meal_plan) : undefined;
    return {
      period,
      board,
      double: fmtPrice(p.double),
      triple: fmtPrice(p.triple),
      price: fmtPrice(p.single ?? p.adult_price),
      // Live numeric fields the checkout calculator consumes.
      dateFrom: p.date_from ?? undefined,
      dateTo: p.date_to ?? undefined,
      nights: p.nights ?? undefined,
      pricingBasis: p.pricing_basis ?? undefined,
      adultPrice: p.single ?? p.adult_price ?? undefined,
      childPrice: p.child_price ?? undefined,
      childAgeFrom: p.child_age_from ?? undefined,
      childAgeTo: p.child_age_to ?? undefined,
      currency: p.currency ?? undefined,
    } satisfies PricePeriod;
  });
}

function minOverPeriods(periods: PricePeriod[]): number | null {
  const nums: number[] = [];
  for (const p of periods) {
    const v = parsePrice(p.double) ?? parsePrice(p.triple) ?? parsePrice(p.price);
    if (v != null) nums.push(v);
  }
  return nums.length ? Math.min(...nums) : null;
}

function indexByName(rateHotels: RateHotel[]): Map<string, RateHotel> {
  const map = new Map<string, RateHotel>();
  for (const rh of rateHotels) {
    if (!rh.periods.length) continue;
    const key = normalizeName(rh.hotel_name);
    if (key && !map.has(key)) map.set(key, rh);
  }
  return map;
}

export function overlayDestinations(
  base: Destination[],
  rateHotels: RateHotel[],
): Destination[] {
  const byName = indexByName(rateHotels);
  if (!byName.size) return base;

  return base.map((d) => {
    let changed = false;
    const hotels: Hotel[] = d.hotels.map((h) => {
      const rh = byName.get(normalizeName(h.nameAr));
      if (!rh) return h;
      const periods = mapPeriods(rh);
      if (!periods.length) return h;
      changed = true;
      return { ...h, periods, minPrice: minOverPeriods(periods) };
    });
    if (!changed) return d;
    const prices = hotels.map((h) => h.minPrice).filter((n): n is number => n != null);
    return {
      ...d,
      hotels,
      minPrice: prices.length ? Math.min(...prices) : d.minPrice,
    };
  });
}
