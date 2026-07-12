import type { MetadataRoute } from "next";
import { getDestinations, getAllHotels, getHoneymoons } from "@/lib/data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://elbakri-overseas.example";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dests, hotels, honeymoons] = await Promise.all([
    getDestinations(),
    getAllHotels(),
    getHoneymoons(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = ["", "/honeymoon", "/about", "/contact"].map((p) => ({
    url: `${SITE_URL}${p}`,
    changeFrequency: "weekly",
    priority: p === "" ? 1 : 0.7,
  }));

  return [
    ...staticRoutes,
    ...dests.map((d) => ({
      url: `${SITE_URL}/destinations/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...hotels.map((h) => ({
      url: `${SITE_URL}/hotels/${h.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...honeymoons.map((d) => ({
      url: `${SITE_URL}/honeymoon/${d.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
