import "server-only";
import { z } from "zod";

/** Server-only client for the token-gated elbakri-rate public catalog. */

const childPolicyRuleSchema = z.object({
  child_number_from: z.number().int().min(1),
  child_number_to: z.number().int().min(1),
  age_from: z.number().min(0),
  age_to: z.number().max(17.99),
  pricing_type: z.enum(["free", "fixed", "percent_adult", "adult_rate", "manual"]),
  value: z.number().nullish(),
  bed_type: z.enum(["sharing", "extra_bed", "any"]),
  notes: z.string().nullish().optional(),
});

const childPolicySchema = z.object({
  code: z.string().nullish().optional(),
  name: z.string().default("سياسة الأطفال"),
  description: z.string().nullish().optional(),
  min_adults: z.number().int().min(1).default(1),
  max_children: z.number().int().min(0).default(0),
  rules: z.array(childPolicyRuleSchema).default([]),
  requires_manual_confirmation: z.boolean().default(false),
  legacy: z.boolean().optional(),
});

const periodSchema = z.object({
  season_name: z.string().nullish(),
  date_from: z.string().nullish(),
  date_to: z.string().nullish(),
  meal_plan: z.string().nullish(),
  currency: z.string().nullish(),
  single: z.number().nullish(),
  double: z.number().nullish(),
  triple: z.number().nullish(),
  adult_price: z.number().nullish(),
  child_price: z.number().nullish(),
  child_age_from: z.number().nullish(),
  child_age_to: z.number().nullish(),
  nights: z.number().nullish(),
  days: z.number().nullish(),
  pricing_basis: z.string().nullish(),
  child_policy: childPolicySchema.nullish().optional(),
  child_policy_by_room: z.object({
    single: childPolicySchema.optional(),
    double: childPolicySchema.optional(),
    triple: childPolicySchema.optional(),
  }).nullish().optional(),
});

const hotelSchema = z.object({
  id: z.number().optional(),
  hotel_name: z.string(),
  region: z.string().nullish(),
  sub_region: z.string().nullish(),
  category: z.string().nullish().optional(),
  package_name: z.string().nullish().optional(),
  star_rating: z.number().nullish(),
  description: z.string().nullish().optional(),
  facilities: z.string().nullish().optional(),
  child_policy_default: z.string().nullish().optional(),
  transfer_notes_default: z.string().nullish().optional(),
  periods: z.array(periodSchema),
});

const packageSchema = z.object({
  id: z.number(),
  package_name: z.string(),
  package_type: z.string().nullish(),
  region: z.string().nullish(),
  description: z.string().nullish(),
  default_meal_plan: z.string().nullish(),
  default_pricing_basis: z.string().nullish(),
  hotel_group_id: z.number().int().nullish().optional(),
  group_name: z.string().nullish().optional(),
  group_brand_name: z.string().nullish().optional(),
  hotels: z.array(hotelSchema),
});

const honeymoonPeriodSchema = z.object({
  date_from: z.string().nullish(),
  date_to: z.string().nullish(),
  price_label: z.string().nullish(),
  price: z.number().nullish(),
  currency: z.string().nullish(),
  notes: z.string().nullish(),
});

const honeymoonSchema = z.object({
  id: z.number(),
  hotel_name: z.string(),
  offer_name: z.string(),
  region: z.string().nullish(),
  features: z.string().nullish(),
  periods: z.array(honeymoonPeriodSchema),
});

const catalogSchema = z.object({
  version: z.number().optional(),
  // Missing packages means an older price-overlay-only endpoint.
  packages: z.array(packageSchema).optional(),
  hotels: z.array(hotelSchema).default([]),
  honeymoon: z.array(honeymoonSchema).optional().default([]),
});

export type RatePeriod = z.infer<typeof periodSchema>;
export type RateHotel = z.infer<typeof hotelSchema>;
export type RatePackage = z.infer<typeof packageSchema>;
export type RateHoneymoon = z.infer<typeof honeymoonSchema>;
export type RateCatalog = {
  authoritative: boolean;
  packages: RatePackage[];
  hotels: RateHotel[];
  honeymoon: RateHoneymoon[];
};

const REVALIDATE_SECONDS = Number(process.env.RATE_API_REVALIDATE) || 300;

export function isRateApiConfigured(): boolean {
  return Boolean(process.env.RATE_API_URL && process.env.RATE_API_PUBLIC_TOKEN);
}

/**
 * Returns null on configuration/network/schema failure so the storefront can
 * keep serving its curated catalog during a rate-hub outage.
 */
export async function getRateCatalog(): Promise<RateCatalog | null> {
  if (!isRateApiConfigured()) return null;
  const base = process.env.RATE_API_URL!.replace(/\/$/, "");
  const token = process.env.RATE_API_PUBLIC_TOKEN!;
  const url = `${base}/public-catalog?token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["rate-catalog"] },
    });
    if (!res.ok) return null;
    const json: unknown = await res.json();
    const body =
      json && typeof json === "object" && "data" in json
        ? (json as { data: unknown }).data
        : json;
    const parsed = catalogSchema.safeParse(body);
    if (!parsed.success) return null;
    return {
      authoritative: parsed.data.packages !== undefined,
      packages: parsed.data.packages ?? [],
      hotels: parsed.data.hotels,
      honeymoon: parsed.data.honeymoon,
    };
  } catch {
    return null;
  }
}

/** Backward-compatible helper used by focused overlay tests/callers. */
export async function getRateHotels(): Promise<RateHotel[] | null> {
  const catalog = await getRateCatalog();
  return catalog?.hotels ?? null;
}
