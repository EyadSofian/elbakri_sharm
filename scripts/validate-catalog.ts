/**
 * Standalone catalog parity/integrity check (npm run validate:catalog).
 * Exits non-zero on any failure so it can gate CI / the build.
 */
import {
  destinations,
  honeymoonDeals,
  CONTACT_PHONE,
  CONTACT_WHATSAPP,
} from "@/data/packages.source";
import { destinationsSchema, honeymoonDealsSchema } from "@/lib/catalog-schema";
import { HOTEL_NAMES } from "@/data/hotel-names";
import { getAllHotels, getDestinations, getHoneymoons } from "@/lib/catalog";

let failures = 0;
function check(cond: boolean, msg: string) {
  if (cond) {
    console.log(`  ✓ ${msg}`);
  } else {
    console.error(`  ✗ ${msg}`);
    failures++;
  }
}

const srcEntries = destinations.flatMap((d) => d.categories.flatMap((c) => c.hotels));
const srcPeriods = srcEntries.reduce((n, h) => n + h.periods.length, 0);
const srcHmPeriods = honeymoonDeals.reduce((n, d) => n + d.periods.length, 0);

console.log("\nSchema");
check(destinationsSchema.safeParse(destinations).success, "destinations match schema");
check(honeymoonDealsSchema.safeParse(honeymoonDeals).success, "honeymoon deals match schema");

console.log("\nInventory baseline");
check(destinations.length === 5, "5 destinations");
check(srcEntries.length === 59, `59 destination hotel entries (got ${srcEntries.length})`);
check(srcPeriods === 135, `135 destination pricing periods (got ${srcPeriods})`);
check(honeymoonDeals.length === 14, `14 honeymoon deals (got ${honeymoonDeals.length})`);
check(srcHmPeriods === 26, `26 honeymoon pricing periods (got ${srcHmPeriods})`);

const perDest = Object.fromEntries(
  destinations.map((d) => [d.id, d.categories.reduce((n, c) => n + c.hotels.length, 0)]),
);
check(
  JSON.stringify(perDest) ===
    JSON.stringify({ sharm: 22, dahab: 5, hurghada: 22, marsaalam: 6, northcoast: 4 }),
  `per-destination counts ${JSON.stringify(perDest)}`,
);

console.log("\nName coverage");
const missing = [
  ...srcEntries.map((h) => h.name),
  ...honeymoonDeals.map((d) => d.hotel),
].filter((n) => !HOTEL_NAMES[n]);
check(missing.length === 0, `all names mapped in HOTEL_NAMES${missing.length ? `: ${missing.join(", ")}` : ""}`);

console.log("\nEnrichment parity");
const hotels = getAllHotels();
check(hotels.length === srcEntries.length, `enriched hotel count = ${hotels.length}`);
check(
  hotels.reduce((n, h) => n + h.periods.length, 0) === srcPeriods,
  "enriched period count preserved",
);
let periodsExact = true;
for (const h of hotels) {
  const d = destinations.find((x) => x.id === h.destinationId)!;
  const c = d.categories.find((x) => x.id === h.categoryId)!;
  const src = c.hotels[h.legacy.idx];
  if (src.name !== h.nameAr || JSON.stringify(src.periods) !== JSON.stringify(h.periods)) {
    periodsExact = false;
    console.error(`      mismatch at ${h.slug}`);
  }
}
check(periodsExact, "each hotel's name + periods preserved verbatim");

console.log("\nSlug uniqueness");
const hotelSlugs = hotels.map((h) => h.slug);
check(new Set(hotelSlugs).size === hotelSlugs.length, "hotel slugs unique");
const hmSlugs = getHoneymoons().map((h) => h.slug);
check(new Set(hmSlugs).size === hmSlugs.length, "honeymoon slugs unique");

console.log("\nImage locality");
const remote = [
  ...getDestinations().map((d) => d.image),
  ...hotels.map((h) => h.image),
  ...getHoneymoons().map((h) => h.image),
].filter((p) => !p.startsWith("/"));
check(remote.length === 0, `no remote image src${remote.length ? `: ${remote.join(", ")}` : ""}`);

console.log("\nContacts");
check(CONTACT_PHONE === "+20 12 25279820", "contact phone preserved");
check(CONTACT_WHATSAPP === "201225279820", "contact whatsapp preserved");

console.log(
  failures === 0
    ? `\n✓ validate:catalog passed (${hotels.length} hotels, ${getHoneymoons().length} honeymoon deals)\n`
    : `\n✗ validate:catalog failed with ${failures} error(s)\n`,
);
process.exit(failures ? 1 : 0);
