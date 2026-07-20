import { describe, expect, it } from "vitest";
import type { Destination, Honeymoon } from "@/lib/catalog";
import type { RateHotel, RateHoneymoon, RatePackage } from "@/lib/rates/client";
import {
  syncDestinationsFromRatePackages,
  syncHoneymoonsFromRateCatalog,
} from "@/lib/rates/sync";

const base: Destination[] = [
  {
    id: "sharm",
    slug: "sharm-el-sheikh",
    nameAr: "شرم الشيخ",
    nameEn: "Sharm El Sheikh",
    tagline: "شرم",
    image: "/images/destinations/sharm-el-sheikh.webp",
    hotelCount: 1,
    minPrice: 9999,
    categories: [
      {
        id: "old",
        name: "قديمة",
        priceUnit: "per_person_trip",
        unitLabel: "للفرد",
        hotelSlugs: ["falcon"],
      },
    ],
    hotels: [
      {
        id: "falcon",
        slug: "falcon",
        nameAr: "فالكون نعمة ستار",
        nameEn: "Falcon Naama Star",
        destinationId: "sharm",
        destinationSlug: "sharm-el-sheikh",
        destinationNameAr: "شرم الشيخ",
        categoryId: "old",
        categoryName: "قديمة",
        priceUnit: "per_person_trip",
        unitLabel: "للفرد",
        periods: [{ period: "قديم", double: "9,999" }],
        minPrice: 9999,
        image: "/images/hotels/sharm-el-sheikh/falcon.webp",
        legacy: { destination: "sharm", category: "old", idx: 0 },
      },
    ],
  },
];

function rateHotel(overrides: Partial<RateHotel> = {}): RateHotel {
  return {
    id: 10,
    hotel_name: "Falcon Naama Star",
    region: "شرم الشيخ",
    sub_region: null,
    star_rating: 4,
    description: null,
    facilities: null,
    child_policy_default: null,
    transfer_notes_default: null,
    periods: [
      {
        season_name: "صيف 2026",
        date_from: "2026-07-01",
        date_to: "2026-09-30",
        meal_plan: "HB",
        currency: "EGP",
        single: null,
        double: 5900,
        triple: 5600,
        adult_price: 5900,
        child_price: 2500,
        child_age_from: 6,
        child_age_to: 11.99,
        nights: 3,
        days: 4,
        pricing_basis: "per_person_package",
      },
    ],
    ...overrides,
  };
}

function ratePackage(
  id: number,
  name: string,
  hotels: RateHotel[],
  overrides: Partial<RatePackage> = {},
): RatePackage {
  return {
    id,
    package_name: name,
    package_type: "Select",
    region: "شرم الشيخ",
    description: `${name} description`,
    default_meal_plan: "HB",
    default_pricing_basis: "per_person_package",
    hotels,
    ...overrides,
  };
}

describe("authoritative rate catalog sync", () => {
  it("uses API packages and memberships while preserving curated presentation", () => {
    const out = syncDestinationsFromRatePackages(base, [
      ratePackage(1, "باقة سيليكت", [rateHotel()]),
    ]);

    expect(out).toHaveLength(1);
    expect(out[0].categories).toEqual([
      expect.objectContaining({
        id: "rate-package-1",
        name: "باقة سيليكت",
        hotelSlugs: ["falcon"],
      }),
    ]);
    expect(out[0].hotels[0]).toMatchObject({
      slug: "falcon",
      nameAr: "فالكون نعمة ستار",
      image: "/images/hotels/sharm-el-sheikh/falcon.webp",
      minPrice: 5900,
    });
    expect(out[0].hotels[0].periods[0]).toMatchObject({
      board: "نصف إقامة",
      double: "5,900",
      childPrice: 2500,
      nights: 3,
    });
  });

  it("keeps one physical hotel in every package that contains it", () => {
    const hotel = rateHotel();
    const out = syncDestinationsFromRatePackages(base, [
      ratePackage(1, "سيليكت", [hotel]),
      ratePackage(2, "بريميوم", [hotel]),
    ]);

    expect(out[0].hotels).toHaveLength(1);
    expect(out[0].categories).toHaveLength(2);
    expect(out[0].categories[0].hotelSlugs).toEqual(["falcon"]);
    expect(out[0].categories[1].hotelSlugs).toEqual(["falcon"]);
  });

  it("removes unlinked hotels and deleted packages from the public structure", () => {
    const linked = syncDestinationsFromRatePackages(base, [
      ratePackage(1, "سيليكت", [rateHotel()]),
      ratePackage(2, "فارغة", []),
    ]);
    expect(linked[0].categories.map((category) => category.name)).toEqual(["سيليكت"]);

    const unlinked = syncDestinationsFromRatePackages(base, [ratePackage(1, "سيليكت", [])]);
    expect(unlinked).toEqual([]);

    const deleted = syncDestinationsFromRatePackages(base, []);
    expect(deleted).toEqual([]);
  });

  it("reflects Ready price updates and keeps assigned hotels with no Ready prices", () => {
    const updatedHotel = rateHotel({
      periods: [{ ...rateHotel().periods[0], double: 7200, adult_price: 7200 }],
    });
    const updated = syncDestinationsFromRatePackages(base, [
      ratePackage(1, "سيليكت", [updatedHotel]),
    ]);
    expect(updated[0].hotels[0].minPrice).toBe(7200);

    const noReadyRates = syncDestinationsFromRatePackages(base, [
      ratePackage(1, "سيليكت", [rateHotel({ periods: [] })]),
    ]);
    expect(noReadyRates[0].hotels[0]).toMatchObject({ periods: [], minPrice: null });
  });

  it("creates a destination for a new region instead of dropping the package", () => {
    const out = syncDestinationsFromRatePackages(base, [
      ratePackage(8, "سيوة", [rateHotel({ id: 88, hotel_name: "New Hotel", region: "سيوة" })], {
        region: "سيوة",
      }),
    ]);
    expect(out[0]).toMatchObject({
      slug: "region-سيوة",
      nameAr: "سيوة",
      hotelCount: 1,
    });
    expect(out[0].hotels[0].slug).toBe("hotel-88");
  });

  it("keeps Sahl Hasheesh, Makadi, El Gouna and Ain Sokhna as separate destinations", () => {
    const hotels = [
      rateHotel({ id: 201, hotel_name: "Sahl Hotel", region: "الغردقة", sub_region: "سهل حشيش" }),
      rateHotel({ id: 202, hotel_name: "Makadi Hotel", region: "الغردقة", sub_region: "مكادى باى" }),
      rateHotel({ id: 203, hotel_name: "Gouna Hotel", region: "الجونة", sub_region: "الجونة" }),
      rateHotel({ id: 204, hotel_name: "Sokhna Hotel", region: "العين السخنة", sub_region: null }),
    ];
    const out = syncDestinationsFromRatePackages(base, [
      ratePackage(22, "مجموعة البحر الأحمر", hotels, { region: "الغردقة" }),
    ]);
    expect(out.map((destination) => destination.slug).sort()).toEqual([
      "ain-sokhna",
      "el-gouna",
      "makadi-bay",
      "sahl-hasheesh",
    ]);
  });

  it("gives each sub-region its own hero instead of borrowing Hurghada's", () => {
    const hotels = [
      rateHotel({ id: 201, hotel_name: "Sahl Hotel", region: "الغردقة", sub_region: "سهل حشيش" }),
      rateHotel({ id: 202, hotel_name: "Makadi Hotel", region: "الغردقة", sub_region: "مكادى باى" }),
      rateHotel({ id: 203, hotel_name: "Gouna Hotel", region: "الجونة", sub_region: "الجونة" }),
      rateHotel({ id: 204, hotel_name: "Sokhna Hotel", region: "العين السخنة", sub_region: null }),
    ];
    const out = syncDestinationsFromRatePackages(base, [
      ratePackage(23, "مجموعة البحر الأحمر", hotels, { region: "الغردقة" }),
    ]);
    const heroBySlug = Object.fromEntries(out.map((d) => [d.slug, d.image]));
    expect(heroBySlug).toEqual({
      "sahl-hasheesh": "/images/destinations/sahl-hasheesh.webp",
      "makadi-bay": "/images/destinations/makadi-bay.webp",
      "el-gouna": "/images/destinations/el-gouna.webp",
      "ain-sokhna": "/images/destinations/ain-sokhna.webp",
    });
  });

  it("never surfaces Marsa Matruh, which has no bookable inventory", () => {
    const onlyMatruh = syncDestinationsFromRatePackages(base, [
      ratePackage(41, "مطروح", [rateHotel({ id: 301, hotel_name: "Matruh Hotel", region: "مرسى مطروح" })], {
        region: "مرسى مطروح",
      }),
    ]);
    expect(onlyMatruh).toEqual([]);

    const mixed = syncDestinationsFromRatePackages(base, [
      ratePackage(42, "متعدد", [
        rateHotel(),
        rateHotel({ id: 302, hotel_name: "Matruh Hotel", region: "مطروح" }),
        rateHotel({ id: 303, hotel_name: "Matruh Two", region: "Marsa Matrouh" }),
      ]),
    ]);
    expect(mixed.map((destination) => destination.slug)).toEqual(["sharm-el-sheikh"]);
    expect(mixed[0].categories[0].hotelSlugs).toEqual(["falcon"]);
  });

  it("labels Albatros packages as a visible hotel group", () => {
    const out = syncDestinationsFromRatePackages(base, [
      ratePackage(31, "البـاتروس شرم الشيخ ( الأسعار للفرد في الغرفة ليلة واحدة )", [rateHotel()]),
    ]);
    expect(out[0].categories[0]).toMatchObject({
      name: "البـاتروس شرم الشيخ",
      groupName: "مجموعة الباتروس",
      groupBrandName: "Albatros",
    });
  });
});

describe("honeymoon catalog sync", () => {
  it("maps Ready API offers and removes missing curated offers", () => {
    const curated: Honeymoon[] = [
      {
        id: "lido",
        slug: "lido-sharm",
        nameAr: "ليدو شرم",
        nameEn: "Lido Sharm",
        region: "شرم الشيخ",
        periods: [{ period: "قديم", price: "9,000", unit: "للباقة" }],
        perks: ["قديم"],
        image: "/images/hotels/honeymoon/lido-sharm.webp",
        minPrice: 9000,
        legacyIdx: 0,
      },
    ];
    const api: RateHoneymoon[] = [
      {
        id: 3,
        hotel_name: "Lido Sharm",
        offer_name: "عرض رومانسي",
        region: "شرم الشيخ",
        features: "عشاء رومانسي\nتزيين الغرفة",
        periods: [
          {
            date_from: "2026-08-01",
            date_to: "2026-08-31",
            price_label: null,
            price: 12500,
            currency: "EGP",
            notes: null,
          },
        ],
      },
    ];

    const out = syncHoneymoonsFromRateCatalog(curated, api);
    expect(out).toHaveLength(1);
    expect(out[0]).toMatchObject({
      slug: "lido-sharm",
      nameAr: "ليدو شرم",
      minPrice: 12500,
      image: "/images/hotels/honeymoon/lido-sharm.webp",
    });
    expect(out[0].perks).toEqual(["عرض رومانسي", "عشاء رومانسي", "تزيين الغرفة"]);
  });
});
