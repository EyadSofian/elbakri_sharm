-- Online booking orders created via the EasyKash Direct Pay checkout.
-- Written only by the server (service-role key); no public/anon access.

create table if not exists public.orders (
  id              bigint generated always as identity primary key,
  reference       bigint       not null unique,   -- customerReference sent to EasyKash
  hotel_slug      text         not null,
  hotel_name      text,
  period_label    text,
  amount          numeric(12,2) not null,
  currency        text         not null default 'EGP',
  customer_name   text         not null,
  customer_email  text         not null,
  customer_mobile text         not null,
  status          text         not null default 'pending',  -- pending | paid
  easykash_ref    text,
  payment_method  text,
  product_code    text,
  -- Booking selection captured by the checkout calculator.
  occupancy       text,                        -- double | triple
  adults          integer,
  children        integer,
  nights          integer,
  total_amount    numeric(12,2),               -- full booking value before deposit%
  created_at      timestamptz  not null default now(),
  paid_at         timestamptz
);

-- Idempotent add for environments where the table predates these columns.
alter table public.orders add column if not exists occupancy    text;
alter table public.orders add column if not exists adults       integer;
alter table public.orders add column if not exists children     integer;
alter table public.orders add column if not exists nights       integer;
alter table public.orders add column if not exists total_amount numeric(12,2);

create index if not exists idx_orders_reference on public.orders (reference);
create index if not exists idx_orders_status    on public.orders (status);

-- RLS on with NO policies -> only the service-role key (server) can read/write.
alter table public.orders enable row level security;
