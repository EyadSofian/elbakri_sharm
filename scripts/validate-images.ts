/**
 * Validates that every image the app/manifest references exists on disk, is
 * non-empty, and has a valid WebP/PNG signature (npm run validate:images).
 * Exits non-zero on any missing/invalid/remote asset.
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getAllHotels, getDestinations, getHoneymoons } from "@/lib/catalog";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

let failures = 0;
const fail = (m: string) => {
  console.error(`  ✗ ${m}`);
  failures++;
};

function checkAsset(publicPath: string) {
  if (!publicPath.startsWith("/")) return fail(`non-local path referenced: ${publicPath}`);
  const abs = join(PUBLIC, publicPath);
  if (!existsSync(abs)) return fail(`missing file: ${publicPath}`);
  const size = statSync(abs).size;
  if (size === 0) return fail(`empty file: ${publicPath}`);

  const buf = readFileSync(abs);
  if (publicPath.endsWith(".webp")) {
    const ok = buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP";
    if (!ok) return fail(`invalid WebP signature: ${publicPath}`);
  } else if (publicPath.endsWith(".png")) {
    const ok = buf.slice(0, 8).toString("hex") === "89504e470d0a1a0a";
    if (!ok) return fail(`invalid PNG signature: ${publicPath}`);
  }
}

// 1) Everything the catalog resolves to
const referenced = new Set<string>();
for (const d of getDestinations()) referenced.add(d.image);
for (const h of getAllHotels()) referenced.add(h.image);
for (const h of getHoneymoons()) referenced.add(h.image);

// 2) Fixed brand + fallback + honeymoon-general assets
const fixed = [
  "/brand/elbakri-logo.png",
  "/brand/elbakri-logo-wordmark.png",
  "/brand/elbakri-logo-lockup.png",
  "/images/destinations/home.webp",
  "/images/destinations/honeymoon.webp",
  "/images/placeholders/hotel-placeholder.webp",
  ...["sharm-el-sheikh", "dahab", "hurghada", "marsa-alam", "north-coast"].flatMap((s) => [
    `/images/placeholders/${s}-placeholder.webp`,
    `/images/thumbnails/${s}.webp`,
  ]),
  "/images/thumbnails/honeymoon.webp",
  ...["romantic-dinner", "room-decoration", "sea-view-room", "sunset-couple"].map(
    (f) => `/images/honeymoon/${f}.webp`,
  ),
];

console.log("\nValidating referenced catalog images");
for (const p of referenced) checkAsset(p);
console.log("Validating brand + fallback + honeymoon assets");
for (const p of fixed) checkAsset(p);

// 3) Manifest file present
if (!existsSync(join(PUBLIC, "images", "image-manifest.json"))) fail("missing image-manifest.json");

console.log(
  failures === 0
    ? `\n✓ validate:images passed (${referenced.size} referenced + ${fixed.length} fixed assets OK)\n`
    : `\n✗ validate:images failed with ${failures} error(s)\n`,
);
process.exit(failures ? 1 : 0);
