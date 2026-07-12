import { describe, it, expect } from "vitest";
import type { PricePeriod } from "@/lib/catalog";
import {
  availableOccupancies,
  computeBreakdown,
  hasChildPricing,
  isPerNight,
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
