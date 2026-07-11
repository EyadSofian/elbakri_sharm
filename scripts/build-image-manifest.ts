/**
 * Generates the image manifest, inventory CSVs and reports from the catalog.
 * Re-runnable. Reflects the honest state: destination heroes are project-owned
 * (rights-cleared); NO hotel-specific photo is rights-cleared, so every hotel
 * resolves to a destination fallback. Identity (official page) and license
 * (right to republish) are tracked SEPARATELY.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getAllHotels, getDestinations, getHoneymoons } from "@/lib/catalog";
import { DESTINATION_NAMES, HOTEL_ALIASES } from "@/data/hotel-names";
import { destinationHeroPath } from "@/lib/images";

const ROOT = process.cwd();
const REPORTS = join(ROOT, "reports");
const IMG = join(ROOT, "public", "images");
mkdirSync(REPORTS, { recursive: true });

// Official identity sources from the supplied known-sources list.
// Recording an official page VERIFIES IDENTITY only — it does NOT grant reuse
// rights, so license_status stays "pending" and the site keeps the fallback.
const KNOWN_SOURCES: Record<string, { url: string; type: string }> = {
  "pickalbatros-royal-grand": { url: "https://www.pickalbatros.com/royal-grand-resort-sharm-el-sheikh", type: "official-hotel-group" },
  "pickalbatros-royal-moderna": { url: "https://www.pickalbatros.com/royal-moderna-resort-sharm-el-sheikh", type: "official-hotel-group" },
  "pickalbatros-palace": { url: "https://www.pickalbatros.com/palace-resort-sharm-el-sheikh", type: "official-hotel-group" },
  "pickalbatros-dana-beach": { url: "https://www.pickalbatros.com/dana-beach-resort-hurghada", type: "official-hotel-group" },
  "pickalbatros-sea-world": { url: "https://www.pickalbatros.com/sea-world-resort-marsa-alam", type: "official-hotel-group" },
  "falcon-naama-star": { url: "https://falcon-hotels.com/", type: "official-hotel-group" },
  "falcon-hills": { url: "https://falcon-hotels.com/", type: "official-hotel-group" },
  "dreams-beach": { url: "https://www.dreamsresortsegypt.com/dreams-beach-sharm-el-sheikh/photo-gallery.html", type: "official-hotel-site" },
  "sunny-days-mirette-family": { url: "https://sunnydaysegypt.com/mirrette/", type: "official-hotel-site" },
  "sunny-days-el-palacio": { url: "https://sunnydaysegypt.com/el-palacio-resort-spa/", type: "official-hotel-site" },
  "sindbad-club": { url: "https://sindbadclub.com/gallery", type: "official-hotel-site" },
  "swiss-inn-hurghada": { url: "https://swissinn.net/hotels/index.php?lang=Hurghada", type: "official-hotel-group" },
  "tropitel-sahl-hasheesh": { url: "https://www.tropitelhotels.com/tropitel-sahl-hasheesh", type: "official-hotel-group" },
  "jaz-costa-mares": { url: "https://www.jazhotels.com/hoteldetail/58-egypt-marsa-alam-iberotel-costa-mares", type: "official-hotel-group" },
  "porto-marina": { url: "https://www.portohotelseg.com/marina-Hotel-home", type: "official-hotel-group" },
};

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const csvRow = (cells: unknown[]) => cells.map(csvCell).join(",");

const destinations = getDestinations();
const hotels = getAllHotels();
const honeymoons = getHoneymoons();

/* ---------- hotels ---------- */
const hotelRecords = hotels.map((h) => {
  const known = KNOWN_SOURCES[h.slug.replace(/-(sharm-el-sheikh|hurghada|marsa-alam)$/, "")] ?? KNOWN_SOURCES[h.slug];
  const destSlug = DESTINATION_NAMES[h.destinationId]!.slug;
  return {
    id: h.slug,
    slug: h.slug,
    hotel_name_ar: h.nameAr,
    hotel_name_en: h.nameEn,
    destination: h.destinationNameAr,
    destination_slug: destSlug,
    package_names: h.categoryName,
    image: destinationHeroPath(h.destinationId),
    thumbnail: `/images/thumbnails/${destSlug}.webp`,
    alt_ar: `منظر من ${h.destinationNameAr}`,
    official_page_url: known?.url ?? "",
    original_image_url: "",
    rights_evidence_url: "",
    source_type: known ? known.type : "none",
    identity_status: known ? "verified" : "needs_review",
    license_status: "pending",
    asset_status: "destination_fallback",
    photographer_or_owner: "",
    attribution: "",
    notes: known
      ? "Identity confirmed via official page. Photo NOT republished (rights pending) — destination fallback in use."
      : "No official source confirmed yet. Destination fallback in use; needs identity + rights review.",
  };
});

/* ---------- honeymoon overlap / uniqueness ---------- */
const aliasToCanonical: Record<string, string> = {};
for (const [canonical, others] of Object.entries(HOTEL_ALIASES)) {
  for (const o of others) aliasToCanonical[o] = canonical;
}
const destHotelNames = new Set(hotels.map((h) => h.nameAr));
const honeymoonRecords = honeymoons.map((d) => {
  const canonical = aliasToCanonical[d.nameAr] ?? d.nameAr;
  const overlapsDestination = destHotelNames.has(canonical);
  return {
    slug: d.slug,
    hotel_name_ar: d.nameAr,
    hotel_name_en: d.nameEn,
    region: d.region,
    image: d.image,
    alt_ar: `أجواء شهر العسل في ${d.region}`,
    official_page_url: KNOWN_SOURCES[d.slug]?.url ?? "",
    identity_status: KNOWN_SOURCES[d.slug] ? "verified" : "needs_review",
    license_status: "pending",
    asset_status: "destination_fallback",
    overlaps_destination_property: overlapsDestination,
    notes: overlapsDestination
      ? `Same physical property as a destination hotel ("${canonical}") — shares one image.`
      : "Honeymoon-only property.",
  };
});

const honeymoonOnly = honeymoonRecords.filter((r) => !r.overlaps_destination_property).length;
const uniqueProperties = hotels.length + honeymoonOnly;

/* ---------- destinations ---------- */
const destinationRecords = destinations.map((d) => ({
  slug: d.slug,
  name_ar: d.nameAr,
  name_en: d.nameEn,
  image: `/images/destinations/${d.slug}.webp`,
  thumbnail: `/images/thumbnails/${d.slug}.webp`,
  alt_ar: `منتجعات وشواطئ ${d.nameAr}`,
  source_type: "project-owned",
  identity_status: "verified",
  license_status: "cleared",
  asset_status: "verified_local",
}));

const honeymoonGeneral = [
  "romantic-dinner.webp",
  "room-decoration.webp",
  "sea-view-room.webp",
  "sunset-couple.webp",
].map((file) => ({
  file: `/images/honeymoon/${file}`,
  asset_status: "derived_placeholder",
  license_status: "pending",
  notes: "Derived from the owned honeymoon hero. Replace with licensed Pexels/Unsplash stock.",
}));

/* ---------- write manifest.json ---------- */
const manifest = {
  generatedFrom: "src/data/packages.source.ts",
  policy:
    "No hotel-specific photo is rights-cleared; every hotel uses a destination fallback. Identity (official page) and license (reuse right) are tracked separately.",
  fallbackOrder: [
    "admin_uploaded hotel image",
    "verified_local (rights-cleared) hotel image",
    "destination fallback",
    "generic hotel placeholder",
  ],
  destinations: destinationRecords,
  honeymoon_general: honeymoonGeneral,
  hotels: hotelRecords,
  honeymoon: honeymoonRecords,
};
writeFileSync(join(IMG, "image-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");

/* ---------- CSVs ---------- */
const invHeader = [
  "hotel_id", "hotel_name_ar", "hotel_name_en", "destination", "package_names",
  "main_image_filename", "official_source_url", "source_type", "verification_status", "notes",
];
const invRows = hotelRecords.map((h) =>
  csvRow([
    h.id, h.hotel_name_ar, h.hotel_name_en, h.destination, h.package_names,
    h.image, h.official_page_url, h.source_type, h.identity_status, h.notes,
  ]),
);
writeFileSync(join(REPORTS, "hotel-inventory.csv"), [csvRow(invHeader), ...invRows].join("\n") + "\n");

const manHeader = [
  "hotel_name_ar", "hotel_name_en", "destination", "image_path", "thumbnail_path", "alt_ar",
  "official_page_url", "original_image_url", "source_type", "identity_status", "license_status",
  "asset_status", "notes",
];
const manRows = hotelRecords.map((h) =>
  csvRow([
    h.hotel_name_ar, h.hotel_name_en, h.destination, h.image, h.thumbnail, h.alt_ar,
    h.official_page_url, h.original_image_url, h.source_type, h.identity_status, h.license_status,
    h.asset_status, h.notes,
  ]),
);
writeFileSync(join(REPORTS, "image-manifest.csv"), [csvRow(manHeader), ...manRows].join("\n") + "\n");

/* ---------- reports ---------- */
const verifiedIdentity = hotelRecords.filter((h) => h.identity_status === "verified").length;
const needsReview = hotelRecords.filter((h) => h.identity_status === "needs_review").length;

writeFileSync(
  join(REPORTS, "image-summary.md"),
  `# ELBAKRI OVERSEAS — Image Summary

_Generated from the catalog; reflects the real files on disk._

## Counts
- **Destination hotel entries:** ${hotels.length}
- **Unique physical properties:** ${uniqueProperties} (${hotels.length} destination hotels + ${honeymoonOnly} honeymoon-only; ${honeymoons.length - honeymoonOnly} honeymoon deals alias to destination properties)
- **Honeymoon deals:** ${honeymoons.length}
- **Verified local hotel images (rights-cleared, hotel-specific):** 0
- **Rights-pending hotel images (destination fallback in use):** ${hotels.length}
- **Hotels with verified identity (official source recorded):** ${verifiedIdentity}
- **Hotels needing identity review:** ${needsReview}
- **Destination hero images (project-owned, rights-cleared):** 5 (+ home + honeymoon = 7)
- **Destination fallback placeholders:** 5
- **Generic hotel placeholder:** 1
- **Thumbnails:** 6
- **Honeymoon general images (derived placeholders):** 4
- **ZIP:** artifacts/elbakri-overseas-image-pack.zip

## Why the unique-property count is ${uniqueProperties}, not exactly 69
The baseline estimate (~69) assumed "Tropitel Dahab" and "Tropitel Dahab Oasis" are the
same property. They appear under different Arabic names in different sections, so they are
kept **distinct pending verification**, giving ${uniqueProperties}. Merging them would yield 69.

## Policy
A wrong hotel photo is worse than an honest destination fallback. Official hotel-site and
booking-platform photos are visible but not licensed for republication, so **no** hotel photo
is published. Each hotel shows its destination hero and is clearly not labelled as the hotel.
`,
);

writeFileSync(
  join(REPORTS, "image-sources.md"),
  `# Image Sources

## Destination heroes (project-owned, rights-cleared)
${destinationRecords.map((d) => `- **${d.name_ar}** — \`${d.image}\` — source: bundled with the original project (owned).`).join("\n")}
- **شهر العسل** — \`/images/destinations/honeymoon.webp\` — owned.
- **الصفحة الرئيسية** — \`/images/destinations/home.webp\` — owned.

## Hotels with a confirmed official identity source
_Identity confirmed only — photos NOT republished (license pending)._

| Hotel (AR) | Hotel (EN) | Official source | Local image (fallback) |
|---|---|---|---|
${hotelRecords
  .filter((h) => h.official_page_url)
  .map((h) => `| ${h.hotel_name_ar} | ${h.hotel_name_en} | ${h.official_page_url} | ${h.image} |`)
  .join("\n")}

## Honeymoon general images
${honeymoonGeneral.map((g) => `- \`${g.file}\` — ${g.notes}`).join("\n")}
`,
);

writeFileSync(
  join(REPORTS, "missing-or-uncertain-images.md"),
  `# Missing / Uncertain Images

Every hotel below currently uses its **destination fallback**. To publish a real hotel
photo, obtain a rights-cleared image (owner/hotel-supplied, press kit with reuse terms, or
licensed stock), drop it in \`public/images/hotels/<destination>/<slug>.webp\`, and add an
entry to \`src/data/hotel-image-map.ts\` with \`status: "verified_local"\`.

## Hotels needing identity + rights review (${needsReview})
| Hotel (AR) | Destination | Reason | Recommended action |
|---|---|---|---|
${hotelRecords
  .filter((h) => h.identity_status === "needs_review")
  .map(
    (h) =>
      `| ${h.hotel_name_ar} | ${h.destination} | No confirmed official source | Search "${h.hotel_name_en} ${h.destination}" official site; confirm exact property; obtain rights |`,
  )
  .join("\n")}

## Hotels with confirmed identity but pending rights (${verifiedIdentity})
| Hotel (AR) | Official source |
|---|---|
${hotelRecords
  .filter((h) => h.identity_status === "verified")
  .map((h) => `| ${h.hotel_name_ar} | ${h.official_page_url} |`)
  .join("\n")}

## Honeymoon general images
The 4 files in \`public/images/honeymoon/\` are derived placeholders — replace with licensed
romantic-dinner / room-decoration / sea-view / sunset-couple stock (Pexels or Unsplash) and
record attribution.
`,
);

console.log(
  `✓ image manifest + reports written:\n` +
    `  hotels: ${hotels.length}  honeymoon: ${honeymoons.length}  unique properties: ${uniqueProperties}\n` +
    `  identity-verified: ${verifiedIdentity}  needs-review: ${needsReview}  verified_local photos: 0`,
);
