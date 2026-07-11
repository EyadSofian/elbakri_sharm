/**
 * Public data-access layer (source of truth switch).
 *
 * Production source is Supabase; when Supabase env is absent the static seed
 * catalog (`@/lib/catalog`) is used verbatim so the site still builds and runs.
 * Pages import ONLY from here (never from @/lib/catalog directly) so an admin
 * edit is reflected everywhere.
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

export async function getDestinations(): Promise<Destination[]> {
  return isSupabaseConfigured() ? supa.getDestinations() : staticCatalog.getDestinations();
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  return isSupabaseConfigured()
    ? supa.getDestinationBySlug(slug)
    : staticCatalog.getDestinationBySlug(slug);
}

export async function getAllHotels(): Promise<Hotel[]> {
  return isSupabaseConfigured() ? supa.getAllHotels() : staticCatalog.getAllHotels();
}

export async function getHotelBySlug(slug: string): Promise<Hotel | undefined> {
  return isSupabaseConfigured() ? supa.getHotelBySlug(slug) : staticCatalog.getHotelBySlug(slug);
}

export async function getFeaturedHotels(count = 6): Promise<Hotel[]> {
  return isSupabaseConfigured()
    ? supa.getFeaturedHotels(count)
    : staticCatalog.getFeaturedHotels(count);
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
  return isSupabaseConfigured()
    ? supa.getHoneymoonRegions()
    : staticCatalog.getHoneymoonRegions();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  return isSupabaseConfigured() ? supa.getSiteSettings(STATIC_SETTINGS) : STATIC_SETTINGS;
}
