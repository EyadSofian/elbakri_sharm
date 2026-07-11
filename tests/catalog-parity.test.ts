import { describe, it, expect } from "vitest";
import {
  destinations,
  honeymoonDeals,
  CONTACT_PHONE,
  CONTACT_WHATSAPP,
} from "@/data/packages.source";
import { destinationsSchema, honeymoonDealsSchema } from "@/lib/catalog-schema";
import { HOTEL_NAMES } from "@/data/hotel-names";
import { getAllHotels, getDestinations, getHoneymoons } from "@/lib/catalog";

const srcHotelEntries = destinations.flatMap((d) => d.categories.flatMap((c) => c.hotels));
const srcPeriodCount = srcHotelEntries.reduce((n, h) => n + h.periods.length, 0);
const srcHoneymoonPeriodCount = honeymoonDeals.reduce((n, d) => n + d.periods.length, 0);

describe("source data shape", () => {
  it("validates against the zod schema", () => {
    expect(destinationsSchema.safeParse(destinations).success).toBe(true);
    expect(honeymoonDealsSchema.safeParse(honeymoonDeals).success).toBe(true);
  });
});

describe("inventory baseline (must stay exact)", () => {
  it("has 5 destinations", () => expect(destinations.length).toBe(5));
  it("has 59 destination hotel entries", () => expect(srcHotelEntries.length).toBe(59));
  it("has 135 destination pricing periods", () => expect(srcPeriodCount).toBe(135));
  it("has 14 honeymoon deals", () => expect(honeymoonDeals.length).toBe(14));
  it("has 26 honeymoon pricing periods", () => expect(srcHoneymoonPeriodCount).toBe(26));
  it("matches per-destination entry counts", () => {
    const counts = Object.fromEntries(
      destinations.map((d) => [d.id, d.categories.reduce((n, c) => n + c.hotels.length, 0)]),
    );
    expect(counts).toEqual({ sharm: 22, dahab: 5, hurghada: 22, marsaalam: 6, northcoast: 4 });
  });
});

describe("enrichment preserves business data verbatim", () => {
  it("keeps the same hotel-entry count", () => {
    expect(getAllHotels().length).toBe(srcHotelEntries.length);
  });

  it("keeps the same total period count", () => {
    const n = getAllHotels().reduce((a, h) => a + h.periods.length, 0);
    expect(n).toBe(srcPeriodCount);
  });

  it("covers every hotel/deal name in HOTEL_NAMES", () => {
    for (const h of srcHotelEntries) {
      expect(HOTEL_NAMES[h.name], `missing HOTEL_NAMES: ${h.name}`).toBeDefined();
    }
    for (const d of honeymoonDeals) {
      expect(HOTEL_NAMES[d.hotel], `missing HOTEL_NAMES: ${d.hotel}`).toBeDefined();
    }
  });

  it("preserves each hotel's name + periods exactly", () => {
    for (const h of getAllHotels()) {
      const d = destinations.find((x) => x.id === h.destinationId)!;
      const c = d.categories.find((x) => x.id === h.categoryId)!;
      const src = c.hotels[h.legacy.idx];
      expect(src.name).toBe(h.nameAr);
      expect(src.periods).toEqual(h.periods);
    }
  });

  it("keeps category notes intact", () => {
    for (const d of getDestinations()) {
      const raw = destinations.find((x) => x.id === d.id)!;
      for (const c of d.categories) {
        const rawCat = raw.categories.find((x) => x.id === c.id)!;
        expect(c.note).toBe(rawCat.note);
      }
    }
  });

  it("gives every hotel a unique slug", () => {
    const slugs = getAllHotels().map((h) => h.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("gives every honeymoon deal a unique slug", () => {
    const slugs = getHoneymoons().map((h) => h.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("preserves honeymoon perks, periods and order", () => {
    const hm = getHoneymoons();
    expect(hm.length).toBe(honeymoonDeals.length);
    hm.forEach((h, i) => {
      expect(h.nameAr).toBe(honeymoonDeals[i].hotel);
      expect(h.region).toBe(honeymoonDeals[i].region);
      expect(h.perks).toEqual(honeymoonDeals[i].perks);
      expect(h.periods).toEqual(honeymoonDeals[i].periods);
    });
  });

  it("preserves contact values", () => {
    expect(CONTACT_PHONE).toBe("+20 12 25279820");
    expect(CONTACT_WHATSAPP).toBe("201225279820");
  });

  it("uses only local image paths (no remote src)", () => {
    for (const d of getDestinations()) expect(d.image.startsWith("/")).toBe(true);
    for (const h of getAllHotels()) expect(h.image.startsWith("/")).toBe(true);
    for (const h of getHoneymoons()) expect(h.image.startsWith("/")).toBe(true);
  });
});
