# البكري أوفرسيز — ELBAKRI OVERSEAS

A clean, **Lovable-independent** rebuild of the ELBAKRI OVERSEAS travel website: an
Arabic-first (RTL) Next.js App Router site presenting hotel offers across five Egyptian
destinations plus honeymoon packages, with WhatsApp/phone booking CTAs. There is no booking
engine, database, CMS, or auth — the catalog is static and typed for speed and reliability.

## Tech stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript** (strict)
- **Tailwind CSS v4** (semantic design tokens, restrained aviation-glass)
- **next/font** (Noto Sans Arabic + Outfit) · **next/image** (all imagery local)
- **framer-motion**, **lucide-react**, **zod**
- **Vitest** (parity tests) · **Pillow** (image pipeline — Node 25 has no Sharp prebuilt)
- Node **≥ 20.9**, npm (committed `package-lock.json`)

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (regenerates legacy redirects first) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest catalog-parity suite |
| `npm run validate:catalog` | Asserts business data is unchanged (59/135/14/26, slugs, prices) |
| `npm run validate:images` | Every referenced image exists & is a valid WebP/PNG |
| `npm run check:no-lovable` | Fails on any Lovable coupling, remote image, or `href="#"` |
| `npm run images:optimize` | Rebuild WebP assets from `.image-work/source` (Pillow) |

## Project structure

```
src/
  app/                     App Router pages, metadata, robots.ts, sitemap.ts
    destinations/[destinationSlug]/
    hotels/[hotelSlug]/
    honeymoon/ , honeymoon/[identifier]/
    about/ , contact/ , not-found.tsx , error.tsx , loading.tsx
  components/              Navbar, Footer, cards, PageHero, BookingCard, …
  data/
    packages.source.ts     ← canonical business data (copied verbatim; DO NOT edit values)
    hotel-names.ts          Arabic → English name/slug map (validated for coverage)
    catalog.ts wrappers via lib/catalog.ts
    hotel-image-map.ts      Verified/admin image overrides (empty today)
    legacy-redirects.json   Generated from the catalog (prebuild)
  lib/                     catalog, catalog-schema (zod), images, slug, whatsapp
scripts/                   validate-catalog, validate-images, check-no-lovable,
                           optimize_images.py, build-image-manifest, build-redirects
public/
  brand/                   logo (unchanged) + trimmed display lockup
  images/                  destination heroes, placeholders, thumbnails, manifest
reports/                   image inventory, manifest CSVs, summaries
```

## Data integrity

`src/data/packages.source.ts` is the source of truth and is **never** edited (only the 5
placeholder destination image URLs were repointed to local paths). `npm run validate:catalog`
and the Vitest suite assert exact parity: 5 destinations, 59 hotel entries, 135 pricing
periods, 14 honeymoon deals, 26 honeymoon periods, unique slugs, preserved prices/notes/perks
and contact numbers.

## URLs & legacy compatibility

Canonical: `/destinations/:slug`, `/hotels/:slug`, `/honeymoon/:slug`. Old TanStack routes
(`/destinations/:id`, `/hotel/:destination/:category/:idx`, `/honeymoon/:idx`) issue **308**
redirects to the canonical URLs (generated into `src/data/legacy-redirects.json`).

## Images

Destination heroes are project-owned and rights-cleared. **No hotel-specific photo is
published** — a wrong photo is worse than an honest destination fallback — so every hotel
uses its destination hero. See **[README-IMAGES.md](README-IMAGES.md)** and `reports/` for the
manifest, sources, and the list of images that need rights clearance.

## Deployment (Vercel)

1. Import the repository into Vercel (framework preset: **Next.js**, root = this directory).
2. Set env var **`NEXT_PUBLIC_SITE_URL`** to the production domain (see `.env.example`).
3. Build command `npm run build`, output handled by the Next.js preset.
4. After the preview deploys, smoke-test `/`, a destination, a hotel, `/honeymoon`, a legacy
   redirect, and an invalid URL (should show the Arabic 404).

## Known blockers (require input)

- **Transparent logo** — the approved `elbakri-logo-transparent.png` was not in the export;
  the site uses a margin-trimmed copy of the opaque logo as interim.
- **Git remote / Vercel** — no verified push target or Vercel project was available locally.
- **Contact details** — phone & WhatsApp come from the data; email/location/hours need
  confirmation before production sign-off.
