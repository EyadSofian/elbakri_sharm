# ELBAKRI OVERSEAS — Image Assets

How imagery works in this project and how to add rights-cleared hotel photos later.

## 1. Folder structure

```
public/
  brand/
    elbakri-logo.png          ← official logo, COPIED UNCHANGED (1920×1920, opaque)
    elbakri-logo-lockup.png   ← margin-trimmed DISPLAY copy (reversible; used in the UI)
  images/
    destinations/             ← 5 destination heroes + home.webp + honeymoon.webp (1920×1080)
                                 + 4 sub-region heroes (see §2b, below spec resolution)
    placeholders/             ← 5 destination fallbacks + hotel-placeholder.webp (1200×840)
    thumbnails/               ← 600×420 thumbnails
    honeymoon/                ← 4 general honeymoon images (derived placeholders)
    image-manifest.json       ← machine-readable manifest
reports/
  hotel-inventory.csv
  image-manifest.csv
  image-summary.md
  image-sources.md
  missing-or-uncertain-images.md
```

## 2. How images were sourced

- **Destination heroes** shipped with the original project. Re-encoded by `scripts/optimize_images.py`.
- **Hotel photos: 59 of 59** hotels use real, identity-verified hero photos from each hotel's
  **official page** (JSON-LD / og:image, or the official image CDN via Chrome for JS/403 sites)
  — ELBAKRI OVERSEAS holds full usage rights (`rights_basis: user_confirmed_full_rights`).
  Pipeline: `scripts/fetch_hotel_images*.py` → `scripts/apply-fetched-images.ts` →
  `hotel-image-map.ts`. Perceptual-hash dedup ensures no photo is reused across hotels.
  **Assigned fallback count is zero** (runtime fallback remains only to prevent broken icons).
- **Honeymoon: 14 of 14** deals resolve to a real hotel image (deals that are the same physical
  property as a destination hotel reuse its file; the rest have their own).
- **Honeymoon general images: 4 of 4** are real licensed Unsplash stock (romantic-dinner,
  room-decoration, sea-view-room, sunset-couple).
- **Identity notes:** بلاس → Pickalbatros **Palace** (Hurghada = Palace Resort Hurghada; Marsa
  Alam = Palace Hotel Port Ghalib). جيوان → **Gewan** (New Alamein). سان جورج → **Xperience
  St. George**. نعمه باي → Naama Bay Hotel & Resort. بروميناد → Naama Bay Promenade (Accor).

## 2b. Sub-region heroes (rate-hub destinations)

`SPECIAL_DESTINATIONS` in `src/lib/rates/sync.ts` promotes four rate-hub regions to real
destinations. Each now has its **own** owner-supplied hero — previously El Gouna, Sahl Hasheesh
and Makadi all borrowed `hurghada.webp`, and Ain Sokhna fell through to the grey placeholder.

| File | Destination | Size |
|---|---|---|
| `el-gouna.webp` | الجونة | 700×393 |
| `sahl-hasheesh.webp` | سهل حشيش | 500×281 |
| `makadi-bay.webp` | مكادي | 1080×607 |
| `ain-sokhna.webp` | العين السخنة | 600×337 |

**These are below the 1920×1080 hero spec.** The sources were owner-supplied at these sizes and
were cover-cropped to 16:9 **without upscaling** — upscaling would fabricate detail and inflate
file size for no gain. They are sharp at their native size but soften on large screens, and they
sit under the 1200×630 that link-preview (OG) cards prefer. Replace with higher-resolution
originals when available; drop them in at the same paths and no code changes are needed.

These files are referenced only from `sync.ts`, never from the static catalog, so they are
pinned explicitly in `scripts/validate-images.ts` to keep `validate:images` honest.

## 3. Fallback behaviour (`src/lib/images.ts`)

1. Admin/user-supplied approved hotel image (`status: "admin_uploaded"`)
2. Rights-cleared verified local hotel image (`status: "verified_local"`)
3. Destination fallback (current state for every hotel)
4. Generic hotel placeholder

A broken image can never appear, and a fallback is never labelled as the hotel itself
(hotel card images use empty `alt`; the heading names the property).

## 4. How to add a verified hotel image

1. Obtain a **rights-cleared** photo (owner/hotel-supplied with permission, press kit with
   reuse terms, or licensed stock with attribution). Confirm it is the **exact** property.
2. Optimise to 1200×840 WebP (≤350 KB) and 600×420 thumbnail (≤140 KB) — add it to the
   `HERO`/tasks in `scripts/optimize_images.py` or run Pillow manually.
3. Save to `public/images/hotels/<destination>/<slug>.webp`.
4. Add an entry to `src/data/hotel-image-map.ts`:
   ```ts
   "falcon-naama-star": {
     image: "/images/hotels/sharm-el-sheikh/falcon-naama-star.webp",
     thumbnail: "/images/thumbnails/falcon-naama-star.webp",
     status: "verified_local",
     sourceUrl: "https://…",
   },
   ```
5. Run `npm run validate:images`. No code changes are needed anywhere else — pages resolve
   through `hotelImagePath()` automatically.

There is **no database** (the catalog is static & typed), so there is no SQL to run. If a real
DB is added later, generate SQL from `hotel-image-map.ts`.

## 5. Image dimensions & budgets

| Asset | Size | Budget |
|---|---|---|
| Destination hero | 1920×1080 WebP | ≤600 KB |
| Hotel main (future) | 1200×840 WebP | ≤350 KB |
| Thumbnail | 600×420 WebP | ≤140 KB |
| Destination placeholder | 1200×840 WebP | ≤300 KB |

## 6. Copyright & usage warnings

- Do **not** hotlink remote images or publish hotel-site/booking photos without written rights.
- Do **not** recolour, redraw, crop into, or background-remove the logo. The trimmed lockup
  only removes uniform empty canvas and is reversible; the original is preserved unchanged.
- The **transparent** master logo (`elbakri-logo-transparent.png`) was not in the export and
  is still needed for production — see the blockers list.

## 7. Still needs manual approval

See `reports/missing-or-uncertain-images.md` — 47 hotels need identity confirmation, all 59
need rights-cleared photos to move off fallbacks, and the 4 honeymoon general images need
licensed replacements.
