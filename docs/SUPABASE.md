# Supabase + Admin CMS — setup

The public site runs on the static seed catalog with **no** Supabase. Configuring
Supabase switches the source of truth to the database and enables the hidden admin
CMS at `/internal/elbakri-admin`.

## 1. Create the project & apply the schema

1. Create a Supabase project.
2. Apply the migrations in order (SQL editor or `supabase db push`):
   - `supabase/migrations/20260711000001_init.sql` — tables, enums, triggers, `is_admin()`
   - `supabase/migrations/20260711000002_rls.sql` — Row Level Security policies
3. (Optional) Create a **public** Storage bucket named `hotel-images` for future
   admin photo uploads. Its host is already whitelisted in `next.config.mjs`.

## 2. Environment variables

Copy `.env.example` → `.env.local` and set:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server only — never commit
```

## 3. Seed the catalog (verbatim from the parity-verified source)

```bash
npm run seed:supabase     # resets catalog tables and inserts the exact catalog
npm run validate:db       # asserts DB == source (59/135/14/26, prices, perks)
```

`seed:supabase` never alters a hotel name, date, price, unit, note, perk, phone or
WhatsApp value. It resets only catalog tables — `auth`, `profiles` and `audit_logs`
are untouched.

## 4. Create the first admin (allowlist)

A hidden URL is not authorization — every admin must be an **active `admin`** row in
`profiles` (RLS is enforced server-side).

1. In Supabase → Authentication, create the user (email + password), or have them
   sign up once (a trigger creates an inactive `profiles` row).
2. Promote them (SQL editor, service role):

```sql
update profiles set role = 'admin', is_active = true where email = 'you@example.com';
```

## 5. Run

```bash
npm run build && npm run start
# admin: /internal/elbakri-admin  (absent from nav/footer/sitemap/search, noindex)
```

Edits made in the admin call `revalidatePath`, so public pages reflect changes
immediately (ISR fallback: 5 min). Adding a brand-new destination/hotel **slug**
needs a redeploy (it must enter `generateStaticParams`); editing prices, notes,
publishing/archiving packages, and settings reflect without a redeploy.

## 6. Tests against Supabase

```bash
npm run test:rls          # anon cannot read admin data or mutate
# authenticated admin e2e:
E2E_ADMIN_EMAIL=... E2E_ADMIN_PASSWORD=... npm run test:e2e
```

## Deploy (Vercel)

Set the same env vars in the Vercel project (service role key as a *secret*),
`NEXT_PUBLIC_SITE_URL` to the domain, then deploy. Apply migrations + seed against
the production project once before the first deploy.
