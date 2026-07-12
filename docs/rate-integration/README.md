# elbakri-rate storefront synchronization

The public website consumes the token-gated `GET /api/public-catalog` endpoint
from [`EyadSofian/elbakri-rate`](https://github.com/EyadSofian/elbakri-rate).

## Source-of-truth rules

Catalog v2 makes the rate hub authoritative for public inventory:

- `packages.status = Active` controls which packages are exported.
- `package_hotels` controls the hotels inside every package.
- `hotels.status = Active` controls whether an assigned hotel is exported.
- only `hotel_rates.status = Ready` prices are exported.
- `Draft` and `Archived` prices, internal notes, costs, users and quotes are never exported.
- `honeymoon_offers.status = Ready` controls the dedicated honeymoon catalog.

This gives the operations team the expected behavior without editing or
redeploying the storefront:

| Rate-hub action | Storefront result after revalidation |
| --- | --- |
| Create/activate a package and assign hotels | Package tab and hotels appear |
| Unlink a hotel from a package | Hotel disappears from that package only |
| Delete/deactivate a package | Package disappears |
| Add/update a Ready rate | Price periods and starting price update |
| Delete/archive/change a rate to Draft | That price disappears |
| Assign a hotel with no Ready rate | Hotel remains visible as “price on request” |

Existing curated data is still used for matching Arabic names, stable URLs and
verified local images. A new hotel or region that has no curated match is still
shown with a stable API-derived URL and an honest fallback image.

## Configuration

In the rate-hub deployment configuration:

```php
'PUBLIC_CATALOG_TOKEN' => '<long-random-string>',
```

In the storefront/Vercel environment:

```text
RATE_API_URL=https://<domain>/<rate-hub-path>/api
RATE_API_PUBLIC_TOKEN=<same token>
# Optional. Default: 300 seconds.
RATE_API_REVALIDATE=300
```

When these variables are absent, malformed, or the rate hub is temporarily
unreachable, the storefront serves its curated static/Supabase catalog. An
older v1 public endpoint also remains compatible through the original
price-only overlay until the backend deployment is upgraded.

## Route behavior

New destinations, hotels and honeymoon offers use on-demand ISR routes, so they
can appear after the five-minute catalog refresh without a new frontend build.
The backend response retains the legacy top-level `hotels` array for older
deployed storefront builds while catalog v2 clients consume `packages` and
`honeymoon`.
