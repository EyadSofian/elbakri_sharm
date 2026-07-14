import { describe, it, expect } from "vitest";
import type { PricePeriod } from "@/lib/catalog";
import {
  availableOccupancies,
  computeBreakdown,
  defaultNightsForPeriod,
  hasChildPricing,
  isPerNight,
  isPerRoom,
  maxChildrenForPeriod,
  perAdultPrice,
} from "@/lib/booking/pricing";

// Static-seed style period: per-person / whole trip, no child price, no nights.
const trip: PricePeriod[] = [
  { period: "صيف", board: "نصف إقامة", double: "5,900", triple: "5,750" },
];

// Hub style period: per-person / night, with child price + nights.
const perNightHub: PricePeriod[] = [
  {
    period: "صيف 2026",
    board: "شامل كليًا",
    double: "1,000",
    triple: "900",
    adultPrice: 1000,
    childPrice: 400,
    childAgeFrom: 6,
    childAgeTo: 11.99,
    nights: 5,
    pricingBasis: "per_person_per_night",
    currency: "EGP",
  },
];

describe("per-trip catalog pricing (nights NOT multiplied)", () => {
  it("charges per-person price × adults, ignoring nights", () => {
    const b = computeBreakdown(trip, {
      periodIndex: 0,
      occupancy: "double",
      adults: 2,
      children: 0,
      nights: 7, // must be ignored for per-trip
    });
    expect(b.isPerNight).toBe(false);
    expect(b.perAdult).toBe(5900);
    expect(b.adultsTotal).toBe(11800);
    expect(b.total).toBe(11800);
    expect(b.computable).toBe(true);
  });

  it("uses the triple per-person price when occupancy = triple", () => {
    const b = computeBreakdown(trip, {
      periodIndex: 0,
      occupancy: "triple",
      adults: 3,
      children: 0,
      nights: 1,
    });
    expect(b.perAdult).toBe(5750);
    expect(b.total).toBe(17250);
  });

  it("has no child pricing and exposes both occupancies", () => {
    expect(hasChildPricing(trip[0])).toBe(false);
    expect(availableOccupancies(trip[0])).toEqual(["double", "triple"]);
    expect(isPerNight(trip[0])).toBe(false);
  });
});

describe("per-night hub pricing (adults + children × nights)", () => {
  it("multiplies per-person AND per-child prices by nights", () => {
    const b = computeBreakdown(perNightHub, {
      periodIndex: 0,
      occupancy: "double",
      adults: 2,
      children: 1,
      nights: 5,
    });
    expect(b.isPerNight).toBe(true);
    expect(b.nightsCharged).toBe(5);
    // adults: 1000 × 2 × 5 = 10,000 ; children: 400 × 1 × 5 = 2,000
    expect(b.adultsTotal).toBe(10000);
    expect(b.childrenTotal).toBe(2000);
    expect(b.total).toBe(12000);
  });

  it("detects child pricing and the child age band", () => {
    expect(hasChildPricing(perNightHub[0])).toBe(true);
    expect(perAdultPrice(perNightHub[0], "triple")).toBe(900);
  });
});

describe("structured child policies", () => {
  const structured: PricePeriod[] = [{
    period: "صيف 2026",
    double: "1,000",
    pricingBasis: "per_person_per_night",
    childPolicy: {
      code: "FAMILY",
      name: "سياسة الأسرة",
      minAdults: 2,
      maxChildren: 2,
      requiresManualConfirmation: true,
      rules: [
        {
          childNumberFrom: 1,
          childNumberTo: 1,
          ageFrom: 0,
          ageTo: 5.99,
          pricingType: "free",
          bedType: "sharing",
        },
        {
          childNumberFrom: 2,
          childNumberTo: 2,
          ageFrom: 0,
          ageTo: 11.99,
          pricingType: "percent_adult",
          value: 50,
          bedType: "any",
        },
      ],
    },
  }];

  it("prices each child by order, age and bed rule", () => {
    const result = computeBreakdown(structured, {
      periodIndex: 0,
      occupancy: "double",
      adults: 2,
      children: 2,
      childAges: [5, 9],
      childBedTypes: ["sharing", "sharing"],
      nights: 3,
    });
    expect(result.adultsTotal).toBe(6000);
    expect(result.childrenTotal).toBe(1500);
    expect(result.total).toBe(7500);
    expect(result.childLines.map((line) => line.pricingType)).toEqual(["free", "percent_adult"]);
    expect(result.computable).toBe(true);
  });

  it("blocks online calculation when a child has no matching rule", () => {
    const result = computeBreakdown(structured, {
      periodIndex: 0,
      occupancy: "double",
      adults: 2,
      children: 1,
      childAges: [8],
      childBedTypes: ["sharing"],
      nights: 3,
    });
    expect(result.requiresManualConfirmation).toBe(true);
    expect(result.computable).toBe(false);
  });
});

describe("guards", () => {
  it("clamps adults to at least 1 and children to at least 0", () => {
    const b = computeBreakdown(trip, {
      periodIndex: 0,
      occupancy: "double",
      adults: 0,
      children: -3,
      nights: 1,
    });
    expect(b.adults).toBe(1);
    expect(b.children).toBe(0);
  });

  it("marks a period with no resolvable price as non-computable", () => {
    const noPrice: PricePeriod[] = [{ period: "بدون سعر" }];
    const b = computeBreakdown(noPrice, {
      periodIndex: 0,
      occupancy: "double",
      adults: 2,
      children: 0,
      nights: 1,
    });
    expect(b.computable).toBe(false);
    expect(b.total).toBe(0);
  });
});

describe("occupancy and pricing-basis behavior", () => {
  it("defaults an unspecified per-night stay to one night", () => {
    expect(defaultNightsForPeriod({ period: "ليلة", pricingBasis: "per person per night" })).toBe(1);
    expect(isPerNight({ period: "ليلة", pricingBasis: "per person per night" })).toBe(true);
  });

  it("charges a per-room rate once, regardless of adult count", () => {
    const period: PricePeriod = {
      period: "غرفة",
      double: "5,000",
      triple: "6,000",
      pricingBasis: "per_room_per_night",
    };
    const result = computeBreakdown([period], {
      periodIndex: 0,
      occupancy: "triple",
      adults: 3,
      children: 0,
      nights: 4,
    });
    expect(isPerRoom(period)).toBe(true);
    expect(result.isPerRoom).toBe(true);
    expect(result.accommodationTotal).toBe(24000);
    expect(result.total).toBe(24000);
  });

  it("allows entering children for an unconfigured manual policy", () => {
    const period: PricePeriod = {
      period: "يدوي",
      double: "1,000",
      childPolicy: {
        name: "تأكيد يدوي",
        minAdults: 1,
        maxChildren: 0,
        rules: [],
        requiresManualConfirmation: true,
      },
    };
    expect(hasChildPricing(period)).toBe(true);
    expect(maxChildrenForPeriod(period)).toBe(4);
  });
});
