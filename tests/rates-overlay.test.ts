import { describe, it, expect } from "vitest";
import { overlayDestinations, normalizeName } from "@/lib/rates/overlay";
import type { Destination } from "@/lib/catalog";
import type { RateHotel } from "@/lib/rates/client";

function baseDest(): Destination[] {
  return [
    {
      id: "sharm",
      slug: "sharm-el-sheikh",
      nameAr: "شرم الشيخ",
      nameEn: "Sharm",
      tagline: "",
      image: "/x.webp",
      hotelCount: 1,
      minPrice: 9999,
      categories: [
        { id: "select", name: "Select", priceUnit: "perNight", unitLabel: "", hotelSlugs: ["falcon"] },
      ],
      hotels: [
        {
          id: "falcon",
          slug: "falcon",
          nameAr: "فالكون نعمة ستار",
          nameEn: "Falcon",
          destinationId: "sharm",
          destinationSlug: "sharm-el-sheikh",
          destinationNameAr: "شرم الشيخ",
          categoryId: "select",
          categoryName: "Select",
          priceUnit: "perNight",
          unitLabel: "",
          periods: [{ period: "old", double: "9,999" }],
          minPrice: 9999,
          image: "/x.webp",
          legacy: { destination: "sharm", category: "select", idx: 0 },
        },
      ],
    },
  ] as unknown as Destination[];
}

const rate: RateHotel[] = [
  {
    hotel_name: "فالكون نعمه ستار", // spelling variant: نعمه vs نعمة
    region: "Sharm El Sheikh",
    category: "Select",
    star_rating: 4,
    periods: [
      { season_name: "صيف 2026", meal_plan: "HB", double: 5900, triple: 5750, adult_price: 5900 },
      { season_name: "خريف 2026", meal_plan: "AI", double: 6200, triple: 6000 },
    ],
  },
];

describe("rate overlay", () => {
  it("folds Arabic spelling variants when matching", () => {
    expect(normalizeName("فالكون نعمة ستار")).toBe(normalizeName("فالكون نعمه ستار"));
  });

  it("overlays live periods and recomputes minPrice, matched by name", () => {
    const out = overlayDestinations(baseDest(), rate);
    const h = out[0].hotels[0];
    expect(h.periods).toHaveLength(2);
    expect(h.periods[0]).toMatchObject({
      period: "صيف 2026",
      board: "نصف إقامة",
      double: "5,900",
      triple: "5,750",
    });
    // Starting price = cheapest DOUBLE across periods (double-first, like the
    // base catalog): min(5900, 6200) = 5900.
    expect(h.minPrice).toBe(5900);
    expect(out[0].minPrice).toBe(5900); // destination min refreshed
    // Curated fields untouched — overlay refreshes prices only.
    expect(h.slug).toBe("falcon");
    expect(h.image).toBe("/x.webp");
  });

  it("leaves unmatched hotels untouched", () => {
    const out = overlayDestinations(baseDest(), [{ ...rate[0], hotel_name: "فندق مختلف تمامًا" }]);
    expect(out[0].hotels[0].periods).toEqual([{ period: "old", double: "9,999" }]);
    expect(out[0].hotels[0].minPrice).toBe(9999);
  });
});
