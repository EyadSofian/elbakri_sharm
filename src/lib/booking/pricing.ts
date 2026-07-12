/**
 * Booking price calculator — the SINGLE source of pricing truth, shared by the
 * client checkout UI (live preview) and the server route (authoritative charge).
 *
 * Pure & dependency-light on purpose (no `server-only`, no I/O) so the exact
 * same maths runs in the browser and in the API route — the browser only
 * *previews*; the server *recomputes* before charging and never trusts the
 * client's number.
 *
 * Pricing basis:
 *  - Static seed catalog periods are per-person / trip → nights are NOT
 *    multiplied (a package price already covers its stay).
 *  - elbakri-rate hub periods carry `pricingBasis`; when it contains
 *    "per_night" the per-person price is multiplied by the number of nights.
 */
import type { PricePeriod } from "@/lib/catalog";
import { parsePrice } from "@/lib/slug";

export type Occupancy = "double" | "triple";

export type BookingSelection = {
  periodIndex: number;
  occupancy: Occupancy;
  adults: number;
  children: number;
  nights: number;
};

export type PriceBreakdown = {
  currency: string;
  /** Per-adult unit price for the chosen occupancy (per night when isPerNight). */
  perAdult: number;
  /** Per-child unit price (0 when the period has no child pricing). */
  perChild: number;
  /** Whether the unit prices are multiplied by nights. */
  isPerNight: boolean;
  /** Nights actually used in the maths (1 when the basis is per-trip). */
  nightsCharged: number;
  adults: number;
  children: number;
  adultsTotal: number;
  childrenTotal: number;
  total: number;
  /** True only when we could resolve a real per-adult price to charge. */
  computable: boolean;
};

const clampInt = (n: number, min: number) => {
  const v = Math.floor(Number(n));
  return Number.isFinite(v) && v > min ? v : min;
};

/** Does this period charge per night (hub data) rather than per whole trip? */
export function isPerNight(period: PricePeriod | undefined): boolean {
  return Boolean(period?.pricingBasis && /per_night/i.test(period.pricingBasis));
}

/** Per-adult price for the requested room occupancy, or null if none resolves. */
export function perAdultPrice(
  period: PricePeriod | undefined,
  occupancy: Occupancy,
): number | null {
  if (!period) return null;
  const byRoom = occupancy === "triple" ? period.triple : period.double;
  return (
    parsePrice(byRoom) ??
    period.adultPrice ??
    parsePrice(period.price) ??
    parsePrice(period.double) ??
    parsePrice(period.triple) ??
    null
  );
}

/** A period supports a children input only when it carries a positive child price. */
export function hasChildPricing(period: PricePeriod | undefined): boolean {
  return Boolean(period && period.childPrice != null && period.childPrice > 0);
}

/** Which occupancies the period actually has prices for (for the room toggle). */
export function availableOccupancies(period: PricePeriod | undefined): Occupancy[] {
  const out: Occupancy[] = [];
  if (parsePrice(period?.double) != null) out.push("double");
  if (parsePrice(period?.triple) != null) out.push("triple");
  return out.length ? out : ["double"];
}

export function computeBreakdown(
  periods: PricePeriod[],
  sel: BookingSelection,
): PriceBreakdown {
  const period = periods[sel.periodIndex];
  const currency = period?.currency ?? "EGP";
  const perNight = isPerNight(period);
  const adults = clampInt(sel.adults, 1);
  const children = clampInt(sel.children, 0);
  const nightsChosen = clampInt(sel.nights, 1);
  const nightsCharged = perNight ? nightsChosen : 1;

  const perAdult = perAdultPrice(period, sel.occupancy) ?? 0;
  const perChild = hasChildPricing(period) ? (period!.childPrice as number) : 0;

  const adultsTotal = Math.round(perAdult * adults * nightsCharged);
  const childrenTotal = Math.round(perChild * children * nightsCharged);

  return {
    currency,
    perAdult,
    perChild,
    isPerNight: perNight,
    nightsCharged,
    adults,
    children,
    adultsTotal,
    childrenTotal,
    total: adultsTotal + childrenTotal,
    computable: perAdult > 0,
  };
}
