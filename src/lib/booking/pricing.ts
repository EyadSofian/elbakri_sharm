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
import type { ChildBedType, ChildPolicy } from "@/data/packages.source";
import { parsePrice } from "@/lib/slug";

export type Occupancy = "double" | "triple";

export type BookingSelection = {
  periodIndex: number;
  occupancy: Occupancy;
  adults: number;
  children: number;
  childAges?: number[];
  childBedTypes?: ChildBedType[];
  nights: number;
};

export type ChildPriceLine = {
  childNumber: number;
  age: number | null;
  bedType: ChildBedType;
  pricingType: "free" | "fixed" | "percent_adult" | "adult_rate" | "manual";
  unitPrice: number | null;
  total: number | null;
  notes?: string;
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
  childLines: ChildPriceLine[];
  total: number;
  childPolicyName?: string;
  requiresManualConfirmation: boolean;
  validationError?: string;
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
export function childPolicyForOccupancy(
  period: PricePeriod | undefined,
  occupancy: Occupancy,
): ChildPolicy | undefined {
  return period?.childPolicyByRoom?.[occupancy] ?? period?.childPolicy;
}

export function hasChildPricing(period: PricePeriod | undefined, occupancy: Occupancy = "double"): boolean {
  const policy = childPolicyForOccupancy(period, occupancy);
  return Boolean(policy || (period && period.childPrice != null));
}

export function maxChildrenForPeriod(
  period: PricePeriod | undefined,
  occupancy: Occupancy = "double",
): number {
  const policy = childPolicyForOccupancy(period, occupancy);
  return policy ? policy.maxChildren : hasChildPricing(period, occupancy) ? 1 : 0;
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
  const policy = childPolicyForOccupancy(period, sel.occupancy);
  const childLines: ChildPriceLine[] = [];
  let requiresManualConfirmation = false;
  let validationError: string | undefined;

  const adultsTotal = Math.round(perAdult * adults * nightsCharged);
  let childrenTotal = 0;

  if (children > 0 && policy) {
    if (adults < policy.minAdults) {
      requiresManualConfirmation = true;
      validationError = `تتطلب سياسة الأطفال وجود ${policy.minAdults} بالغ على الأقل.`;
    } else if (children > policy.maxChildren) {
      requiresManualConfirmation = true;
      validationError = `الحد الأقصى للأطفال في هذه الغرفة هو ${policy.maxChildren}.`;
    }

    for (let index = 0; index < children; index++) {
      const rawAge = sel.childAges?.[index];
      const age = Number.isFinite(rawAge) ? Number(rawAge) : null;
      const bedType = sel.childBedTypes?.[index] ?? "sharing";
      const childNumber = index + 1;
      const rule = age === null
        ? undefined
        : policy.rules.find(
            (candidate) =>
              childNumber >= candidate.childNumberFrom &&
              childNumber <= candidate.childNumberTo &&
              age >= candidate.ageFrom &&
              age <= candidate.ageTo &&
              (candidate.bedType === "any" || candidate.bedType === bedType),
          );

      if (!rule || rule.pricingType === "manual") {
        requiresManualConfirmation = true;
        validationError ??= age === null
          ? "أدخل عمر كل طفل لحساب السعر الصحيح."
          : "هذه الحالة تحتاج تأكيد السعر مع فريق البكري.";
        childLines.push({
          childNumber,
          age,
          bedType,
          pricingType: "manual",
          unitPrice: null,
          total: null,
          notes: rule?.notes,
        });
        continue;
      }

      const unitPrice = rule.pricingType === "free"
        ? 0
        : rule.pricingType === "fixed"
          ? (rule.value ?? 0)
          : rule.pricingType === "percent_adult"
            ? perAdult * ((rule.value ?? 0) / 100)
            : perAdult;
      const lineTotal = Math.round(unitPrice * nightsCharged);
      childrenTotal += lineTotal;
      childLines.push({
        childNumber,
        age,
        bedType,
        pricingType: rule.pricingType,
        unitPrice,
        total: lineTotal,
        notes: rule.notes,
      });
    }
  } else if (children > 0 && period?.childPrice != null) {
    const unitPrice = period.childPrice;
    for (let index = 0; index < children; index++) {
      const lineTotal = Math.round(unitPrice * nightsCharged);
      childrenTotal += lineTotal;
      childLines.push({
        childNumber: index + 1,
        age: sel.childAges?.[index] ?? null,
        bedType: sel.childBedTypes?.[index] ?? "sharing",
        pricingType: "fixed",
        unitPrice,
        total: lineTotal,
      });
    }
  } else if (children > 0) {
    requiresManualConfirmation = true;
    validationError = "سعر الأطفال يحتاج تأكيدًا من فريق البكري.";
  }

  const perChild = childLines.length && childLines.every((line) => line.unitPrice === childLines[0].unitPrice)
    ? (childLines[0].unitPrice ?? 0)
    : 0;

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
    childLines,
    total: adultsTotal + childrenTotal,
    childPolicyName: policy?.name,
    requiresManualConfirmation,
    validationError,
    computable: perAdult > 0 && !requiresManualConfirmation,
  };
}
