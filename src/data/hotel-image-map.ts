/**
 * hotel slug -> resolved image override.
 *
 * This is the ONLY place to promote a hotel from a destination fallback to a
 * verified/admin image. Populated by the image pipeline (Phase C). Because the
 * project ships zero rights-cleared hotel photos, this map is currently empty
 * and every hotel resolves to its destination hero via `lib/images.ts`.
 *
 * A DB was intentionally NOT invented (the app is static & typed). If a real
 * schema is later supplied, generate SQL from this map.
 */

export type HotelImageStatus =
  | "admin_uploaded"
  | "verified_local"
  | "destination_fallback"
  | "placeholder";

export type HotelImageMapEntry = {
  image: string;
  thumbnail?: string;
  status: HotelImageStatus;
  sourceUrl?: string;
};

const hotelImageMap: Record<string, HotelImageMapEntry> = {
  // e.g. "falcon-naama-star": { image: "/images/hotels/sharm-el-sheikh/falcon-naama-star.webp",
  //        thumbnail: "/images/thumbnails/falcon-naama-star.webp", status: "verified_local",
  //        sourceUrl: "https://..." },
};

export default hotelImageMap;
