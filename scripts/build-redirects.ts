/**
 * Generates src/data/legacy-redirects.json from the catalog so next.config can
 * emit real 308 redirects for every legacy URL (routing-layer, not render-time).
 * Runs automatically via the "prebuild" npm script.
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getAllHotels, getHoneymoons, getDestinations } from "@/lib/catalog";

type Redirect = { source: string; destination: string; permanent: boolean };
const redirects: Redirect[] = [];

// Destinations: legacy id -> canonical slug (only where they differ)
for (const d of getDestinations()) {
  if (d.id !== d.slug) {
    redirects.push({
      source: `/destinations/${d.id}`,
      destination: `/destinations/${d.slug}`,
      permanent: true,
    });
  }
}

// Hotels: /hotel/:destination/:category/:idx -> /hotels/:slug
for (const h of getAllHotels()) {
  redirects.push({
    source: `/hotel/${h.legacy.destination}/${h.legacy.category}/${h.legacy.idx}`,
    destination: `/hotels/${h.slug}`,
    permanent: true,
  });
}

// Honeymoon: /honeymoon/:idx (numeric) -> /honeymoon/:slug
for (const d of getHoneymoons()) {
  redirects.push({
    source: `/honeymoon/${d.legacyIdx}`,
    destination: `/honeymoon/${d.slug}`,
    permanent: true,
  });
}

writeFileSync(
  join(process.cwd(), "src", "data", "legacy-redirects.json"),
  JSON.stringify(redirects, null, 2) + "\n",
);
console.log(`✓ wrote ${redirects.length} legacy redirects to src/data/legacy-redirects.json`);
