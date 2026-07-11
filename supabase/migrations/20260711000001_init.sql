-- ELBAKRI OVERSEAS — initial schema
-- Normalized catalog + CMS model. All catalog values are seeded verbatim from
-- src/data/packages.source.ts (see scripts/seed-supabase.ts) — never altered here.

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type price_unit as enum (
    'per_person_trip', 'per_person_night', 'per_room_night', 'per_room_trip'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('admin', 'editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type image_kind as enum (
    'destination_hero', 'hotel', 'thumbnail', 'placeholder', 'honeymoon', 'brand'
  );
exception when duplicate_object then null; end $$;

-- ---------- updated_at helper ----------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================
-- profiles (mirrors auth.users; carries admin role + allowlist)
-- ============================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        admin_role not null default 'editor',
  is_active   boolean not null default false,  -- allowlist gate; must be true to act
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- is_admin(): server-side authorization source of truth
create or replace function is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and is_active = true
  );
$$;

-- new auth user -> profile row (inactive by default; an admin must activate)
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- image_assets
-- ============================================================
create table if not exists image_assets (
  id                uuid primary key default gen_random_uuid(),
  path              text not null,              -- /images/... or Supabase Storage URL
  kind              image_kind not null default 'hotel',
  alt_ar            text,
  source_url        text,                       -- page where identity/photo was found
  original_url      text,                       -- direct image URL downloaded
  photographer      text,
  attribution       text,
  identity_status   text not null default 'needs_review',   -- verified | needs_review
  license_status    text not null default 'pending',        -- cleared | attribution_required | pending
  asset_status      text not null default 'destination_fallback', -- verified_local | admin_uploaded | destination_fallback | placeholder
  perceptual_hash   text,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create trigger trg_image_assets_updated before update on image_assets
  for each row execute function set_updated_at();
create index if not exists idx_image_assets_kind on image_assets(kind);

-- ============================================================
-- destinations
-- ============================================================
create table if not exists destinations (
  id             uuid primary key default gen_random_uuid(),
  legacy_id      text unique,                 -- sharm, dahab, hurghada, marsaalam, northcoast
  slug           text not null unique,
  name_ar        text not null,
  name_en        text not null,
  tagline        text not null default '',
  hero_image_id  uuid references image_assets(id) on delete set null,
  display_order  int not null default 0,
  is_published   boolean not null default true,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_destinations_updated before update on destinations
  for each row execute function set_updated_at();

-- ============================================================
-- package_categories (belong to a destination)
-- ============================================================
create table if not exists package_categories (
  id             uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  code           text not null,               -- select, premium, elite, albatros...
  name_ar        text not null,
  price_unit     price_unit not null,
  note_ar        text,
  display_order  int not null default 0,
  is_published   boolean not null default true,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (destination_id, code)
);
create trigger trg_package_categories_updated before update on package_categories
  for each row execute function set_updated_at();
create index if not exists idx_pkgcat_destination on package_categories(destination_id);

-- ============================================================
-- hotels (physical property; unique per destination)
-- ============================================================
create table if not exists hotels (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name_ar        text not null,
  name_en        text not null,
  destination_id uuid not null references destinations(id) on delete restrict,
  image_id       uuid references image_assets(id) on delete set null,
  notes          text,
  display_order  int not null default 0,
  is_published   boolean not null default true,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_hotels_updated before update on hotels
  for each row execute function set_updated_at();
create index if not exists idx_hotels_destination on hotels(destination_id);

create table if not exists hotel_aliases (
  id         uuid primary key default gen_random_uuid(),
  hotel_id   uuid not null references hotels(id) on delete cascade,
  alias_ar   text not null,
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists idx_hotel_aliases_hotel on hotel_aliases(hotel_id);

-- ============================================================
-- offers (hotel assigned to a package_category — many-to-many capable)
-- price periods hang off the offer.
-- ============================================================
create table if not exists offers (
  id                   uuid primary key default gen_random_uuid(),
  package_category_id  uuid not null references package_categories(id) on delete cascade,
  hotel_id             uuid not null references hotels(id) on delete cascade,
  legacy_idx           int,                    -- original index within the category (for /hotel/:d/:c/:idx)
  display_order        int not null default 0,
  is_published         boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (package_category_id, hotel_id)
);
create trigger trg_offers_updated before update on offers
  for each row execute function set_updated_at();
create index if not exists idx_offers_category on offers(package_category_id);
create index if not exists idx_offers_hotel on offers(hotel_id);

-- ============================================================
-- price_periods (verbatim text values preserve exact source formatting;
-- numeric mirror columns support sorting + the bulk-adjust tool)
-- ============================================================
create table if not exists price_periods (
  id             uuid primary key default gen_random_uuid(),
  offer_id       uuid not null references offers(id) on delete cascade,
  period_label   text not null,               -- e.g. "01/07 – 31/10/2026" (verbatim)
  board_ar       text,                        -- e.g. "نصف إقامة", "SAI"
  double_text    text,                        -- "5,900" (verbatim)
  triple_text    text,
  room_text      text,                        -- honeymoon-style per-room (unused for hotels)
  double_amount  numeric,
  triple_amount  numeric,
  room_amount    numeric,
  data_quality_note text,
  display_order  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_price_periods_updated before update on price_periods
  for each row execute function set_updated_at();
create index if not exists idx_price_periods_offer on price_periods(offer_id);

-- ============================================================
-- honeymoon
-- ============================================================
create table if not exists honeymoon_deals (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  legacy_idx     int,
  hotel_name_ar  text not null,
  hotel_name_en  text not null,
  region         text not null,
  image_id       uuid references image_assets(id) on delete set null,
  display_order  int not null default 0,
  is_published   boolean not null default true,
  is_archived    boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger trg_honeymoon_deals_updated before update on honeymoon_deals
  for each row execute function set_updated_at();

create table if not exists honeymoon_periods (
  id             uuid primary key default gen_random_uuid(),
  deal_id        uuid not null references honeymoon_deals(id) on delete cascade,
  period_label   text not null,
  board_ar       text,
  price_text     text not null,
  price_amount   numeric,
  unit           text not null,
  display_order  int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists idx_hm_periods_deal on honeymoon_periods(deal_id);

create table if not exists honeymoon_perks (
  id            uuid primary key default gen_random_uuid(),
  deal_id       uuid not null references honeymoon_deals(id) on delete cascade,
  perk_ar       text not null,
  display_order int not null default 0
);
create index if not exists idx_hm_perks_deal on honeymoon_perks(deal_id);

-- ============================================================
-- site_settings (singleton) — unconfirmed fields stay null (hidden publicly)
-- ============================================================
create table if not exists site_settings (
  id                        smallint primary key default 1 check (id = 1),
  phone                     text,
  whatsapp                  text,
  email                     text,
  location_ar               text,
  working_hours_ar          text,
  social_instagram          text,
  social_facebook           text,
  default_whatsapp_message  text,
  updated_at                timestamptz not null default now()
);
create trigger trg_site_settings_updated before update on site_settings
  for each row execute function set_updated_at();

-- ============================================================
-- audit_logs
-- ============================================================
create table if not exists audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_id     uuid references profiles(id) on delete set null,
  actor_email  text,
  action       text not null,                 -- create|update|publish|archive|delete|bulk_price
  entity_type  text not null,
  entity_id    text,
  before       jsonb,
  after        jsonb,
  created_at   timestamptz not null default now()
);
create index if not exists idx_audit_created on audit_logs(created_at desc);
create index if not exists idx_audit_entity on audit_logs(entity_type, entity_id);
