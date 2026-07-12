/**
 * Public data-access layer (source of truth switch).
 *
 * Base catalog: Supabase when configured, else the static seed (`@/lib/catalog`).
 * When the elbakri-rate hub exposes catalog v2, its active packages, assigned
 * hotels and Ready prices become authoritative. Curated data only enriches
 * matching records with stable slugs, Arabic names and verified images. Older
 * v1 endpoints still receive the price-only overlay for safe rollout.
 */
import { isSupabaseConfigured } from "@/lib/supabase/env";
import * as staticCatalog from "@/lib/catalog";
import {
  CONTACT_PHONE,
  CONTACT_WHATSAPP,
  type Destination,
  type Hotel,
  type Honeymoon,
} from "@/lib/catalog";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import * as supa from "./supabase-source";
import { getRateCatalog } from "@/lib/rates/client";
import { overlayDestinations } from "@/lib/rates/overlay";
import {
  syncDestinationsFromRatePackages,
  syncHoneymoonsFromRateCatalog,
} from "@/lib/rates/sync";

export type { Destination, Hotel, Honeymoon };

export type SiteSettings = {
  phone: string;
  whatsapp: string;
  email: string | null;
  locationAr: string | null;
  workingHoursAr: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  defaultWhatsappMessage: string;
};

const STATIC_SETTINGS: SiteSettings = {
  phone: CONTACT_PHONE,
  whatsapp: CONTACT_WHATSAPP,
  email: "info@elbakri.travel",
  locationAr: "القاهرة، مصر",
  workingHoursAr: null,
  socialInstagram: null,
  socialFacebook: null,
  defaultWhatsappMessage: DEFAULT_WHATSAPP_MESSAGE,
};

function baseDestinations(): Promise<Destination[]> {
  return isSupabaseConfigured()
    ? supa.getDestinations()
    : Promise.resolve(staticCatalog.getDestinations());
}

/** Destinations synchronized from the rate hub, with a curated/offline fallback. */
export async function getDestinations(): Promise<Destination[]> {
  const base = await baseDestinations();
  const rateCatalog = await getRateCatalog();
  if (!rateCatalog) return base;
  return rateCatalog.authoritative
    ? syncDestinationsFromRatePackages(base, rateCatalog.packages)
    : overlayDestinations(base, rateCatalog.hotels);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  return (await getDestinations()).find((d) => d.slug === slug);
}

export async function getAllHotels(): Promise<Hotel[]> {
  return (await getDestinations()).flatMap((d) => d.hotels);
}

export async function getHotelBySlug(slug: string): Promise<Hotel | undefined> {
  return (await getAllHotels()).find((h) => h.slug === slug);
}

export async function getFeaturedHotels(count = 6): Promise<Hotel[]> {
  return (await getDestinations())
    .map(
      (d) =>
        [...d.hotels]
          .filter((h) => h.minPrice != null)
          .sort((a, b) => (a.minPrice ?? Infinity) - (b.minPrice ?? Infinity))[0],
    )
    .filter((h): h is Hotel => Boolean(h))
    .slice(0, count);
}

export async function getHoneymoons(): Promise<Honeymoon[]> {
  const base = isSupabaseConfigured()
    ? await supa.getHoneymoons()
    : staticCatalog.getHoneymoons();
  const rateCatalog = await getRateCatalog();
  return rateCatalog?.authoritative
    ? syncHoneymoonsFromRateCatalog(base, rateCatalog.honeymoon)
    : base;
}

export async function getHoneymoonBySlug(slug: string): Promise<Honeymoon | undefined> {
  return (await getHoneymoons()).find((deal) => deal.slug === slug);
}

export async function getHoneymoonRegions(): Promise<string[]> {
  return Array.from(new Set((await getHoneymoons()).map((deal) => deal.region)));
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return isSupabaseConfigured() ? supa.getSiteSettings(STATIC_SETTINGS) : STATIC_SETTINGS;
}
