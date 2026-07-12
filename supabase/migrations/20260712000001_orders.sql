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
  created_at      timestamptz  not null default now(),
  paid_at         timestamptz
);

create index if not exists idx_orders_reference on public.orders (reference);
create index if not exists idx_orders_status    on public.orders (status);

-- RLS on with NO policies -> only the service-role key (server) can read/write.
alter table public.orders enable row level security;
