import type { MetadataRoute } from "next";
import { getDestinations, getAllHotels, getHoneymoons } from "@/lib/catalog";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elbakri-overseas.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = ["", "/honeymoon", "/about", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  const destinations: MetadataRoute.Sitemap = getDestinations().map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const hotels: MetadataRoute.Sitemap = getAllHotels().map((h) => ({
    url: `${SITE_URL}/hotels/${h.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const honeymoon: MetadataRoute.Sitemap = getHoneymoons().map((d) => ({
    url: `${SITE_URL}/honeymoon/${d.slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...destinations, ...hotels, ...honeymoon];
}
