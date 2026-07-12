import "server-only";
import { z } from "zod";

/**
 * Client for the elbakri-rate public catalog endpoint (public_catalog.php).
 * Returns only status='Ready' rates. Pulled with ISR (revalidate) so the site
 * reflects rate updates within ~15 minutes without a redeploy.
 *
 * Dormant unless RATE_API_URL + RATE_API_PUBLIC_TOKEN are set.
 */

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
  // Needed by the checkout calculator (period × adults × children × nights).
  child_price: z.number().nullish(),
  child_age_from: z.number().nullish(),
  child_age_to: z.number().nullish(),
  nights: z.number().nullish(),
  days: z.number().nullish(),
  pricing_basis: z.string().nullish(),
});

const hotelSchema = z.object({
  hotel_name: z.string(),
  region: z.string().nullish(),
  category: z.string().nullish(),
  star_rating: z.number().nullish(),
  periods: z.array(periodSchema),
});

const catalogSchema = z.object({ hotels: z.array(hotelSchema) });

export type RateHotel = z.infer<typeof hotelSchema>;

const REVALIDATE_SECONDS = Number(process.env.RATE_API_REVALIDATE) || 900; // 15 min

export function isRateApiConfigured(): boolean {
  return Boolean(process.env.RATE_API_URL && process.env.RATE_API_PUBLIC_TOKEN);
}

/**
 * Fetch the live "Ready" rate hotels. Returns null on any failure (missing
 * config, network error, bad shape) so callers fall back to the base catalog —
 * a rate-hub outage must never take the storefront down.
 */
export async function getRateHotels(): Promise<RateHotel[] | null> {
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
    // The PHP endpoint wraps payloads in { data: ... }.
    const body =
      json && typeof json === "object" && "data" in json
        ? (json as { data: unknown }).data
        : json;
    const parsed = catalogSchema.safeParse(body);
    return parsed.success ? parsed.data.hotels : null;
  } catch {
    return null;
  }
}
