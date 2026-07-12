# Live rates from the elbakri-rate hub (overlay)

The storefront can overlay **live "Ready" prices** from the `elbakri-rate` hub
onto the curated catalog. Structure, images and slugs stay curated (region →
packages → hotels); only the price **periods** refresh, matched by hotel name,
via ISR (~15 min). It is dormant until the env vars below are set.

## 1. Deploy the public endpoint (in the `elbakri-rate` repo / cPanel)

`public_catalog.php` is a read-only, token-gated endpoint that returns only
`status='Ready'` rates in the shape the site consumes.

1. Upload `public_catalog.php` to `public_html/rates/api/routes/public_catalog.php`.
2. In `public_html/rates/api/index.php`, add to the `$routes` map:
   ```php
   'public-catalog' => 'route_public_catalog',
   ```
3. In `public_html/rates/api/config.php`, add a long random token:
   ```php
   'PUBLIC_CATALOG_TOKEN' => '<long-random-string>',
   ```
4. Test: `GET https://<your-domain>/rates/api/public-catalog?token=<token>`
   → `{ "data": { "hotels": [ { "hotel_name": "...", "periods": [ ... ] } ] } }`

## 2. Configure the site (Vercel env)

```
RATE_API_URL=https://<your-domain>/rates/api
RATE_API_PUBLIC_TOKEN=<same token as PUBLIC_CATALOG_TOKEN>
# optional: override the 900s (15 min) refresh
# RATE_API_REVALIDATE=900
```

Unset → the site serves the static/Supabase catalog exactly as before.

## Matching & overlay rules

- A rate hotel updates a catalog hotel when their **Arabic names match** (spelling
  variants like `نعمة`/`نعمه` are folded). Unmatched hotels are left untouched.
- `room_type` pivots into single/double/triple; `meal_plan` → Arabic board
  (BB → مبيت وإفطار، HB → نصف إقامة، AI → شامل كليًا، …).
- Starting price = cheapest **double** across periods (same rule as the base
  catalog). A rate-hub outage falls back to the base catalog — the store never
  goes down.

## Powers the checkout calculator

Each period also carries `nights`, `days`, `pricing_basis`, `child_price` and
`child_age_from/to`. The checkout price calculator uses them to charge
`(adults × adult_price + children × child_price)` — multiplied by `nights` when
`pricing_basis` contains `per_night`. These fields are additive: when the hub is
NOT connected the calculator falls back to the static per-person / trip prices
(nights are not multiplied and the children input is hidden).

See `src/lib/rates/client.ts` (fetch/parse), `src/lib/rates/overlay.ts`
(mapping) and `src/lib/booking/pricing.ts` (the shared price engine).
