/**
 * Public data-access layer (source of truth switch).
 *
 * Base catalog: Supabase when configured, else the static seed (`@/lib/catalog`).
 * When the elbakri-rate hub is configured (RATE_API_URL + RATE_API_PUBLIC_TOKEN),
 * live "Ready" prices are overlaid onto the base catalog by hotel name — the
 * structure, images and slugs stay curated; only the price periods refresh, via
 * ISR (~15 min). Pages import ONLY from here so an admin edit or a rate update
 * is reflected everywhere.
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
import { getRateHotels } from "@/lib/rates/client";
import { overlayDestinations } from "@/lib/rates/overlay";

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

/** Destinations with live rate prices overlaid when the rate hub is configured. */
export async function getDestinations(): Promise<Destination[]> {
  const base = await baseDestinations();
  const rateHotels = await getRateHotels();
  return rateHotels ? overlayDestinations(base, rateHotels) : base;
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
  return isSupabaseConfigured() ? supa.getHoneymoons() : staticCatalog.getHoneymoons();
}

export async function getHoneymoonBySlug(slug: string): Promise<Honeymoon | undefined> {
  return isSupabaseConfigured()
    ? supa.getHoneymoonBySlug(slug)
    : staticCatalog.getHoneymoonBySlug(slug);
}

export async function getHoneymoonRegions(): Promise<string[]> {
  return isSupabaseConfigured() ? supa.getHoneymoonRegions() : staticCatalog.getHoneymoonRegions();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return isSupabaseConfigured() ? supa.getSiteSettings(STATIC_SETTINGS) : STATIC_SETTINGS;
}
