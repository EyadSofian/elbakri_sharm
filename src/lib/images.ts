import { DESTINATION_NAMES } from "@/data/hotel-names";
import hotelImageMap from "@/data/hotel-image-map";

/**
 * Image resolution with the required fallback order:
 *   1. Admin/user-supplied approved hotel image  (asset_status: admin_uploaded)
 *   2. Rights-cleared verified local hotel image  (asset_status: verified_local)
 *   3. Correct destination fallback
 *   4. General hotel placeholder
 *
 * The source project ships ZERO verified hotel photos by policy (a wrong hotel
 * photo is worse than an honest destination fallback), so today every hotel
 * resolves to (3). `hotel-image-map.ts` is the single place to promote a hotel
 * to a verified/admin image later without touching pages.
 */

const PLACEHOLDER = "/images/placeholders/hotel-placeholder.webp";
const HONEYMOON_HERO = "/images/destinations/honeymoon.webp";

export function destinationHeroPath(destinationId: string): string {
  const d = DESTINATION_NAMES[destinationId];
  return d ? `/images/destinations/${d.slug}.webp` : PLACEHOLDER;
}

export function destinationFallbackPath(destinationId: string): string {
  const d = DESTINATION_NAMES[destinationId];
  return d ? `/images/placeholders/${d.slug}-placeholder.webp` : PLACEHOLDER;
}

/** Resolve a hotel image by its stable slug, honouring the fallback order. */
export function hotelImagePath(hotelSlug: string, destinationId: string): string {
  const entry = hotelImageMap[hotelSlug];
  if (entry && (entry.status === "admin_uploaded" || entry.status === "verified_local")) {
    return entry.image;
  }
  return destinationHeroPath(destinationId);
}

/** Map a (possibly sub-)region label to a destination hero for honeymoon cards. */
export function regionHeroPath(region: string): string {
  if (region.includes("شرم") || region.includes("سهل حشيش"))
    return "/images/destinations/sharm-el-sheikh.webp";
  if (region.includes("دهب")) return "/images/destinations/dahab.webp";
  if (region.includes("الغردقة") || region.includes("سوما"))
    return "/images/destinations/hurghada.webp";
  if (region.includes("مرسى")) return "/images/destinations/marsa-alam.webp";
  if (region.includes("الساحل")) return "/images/destinations/north-coast.webp";
  return HONEYMOON_HERO;
}

export { PLACEHOLDER, HONEYMOON_HERO };
