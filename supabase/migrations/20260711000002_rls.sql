-- ELBAKRI OVERSEAS — Row Level Security
-- Public (anon + authenticated): read PUBLISHED, non-archived catalog only.
-- Admins (is_admin()): full read/write. Writes are always RLS-guarded — the
-- admin UI uses the user's authenticated session, never the service role.

alter table profiles            enable row level security;
alter table image_assets        enable row level security;
alter table destinations        enable row level security;
alter table package_categories  enable row level security;
alter table hotels              enable row level security;
alter table hotel_aliases       enable row level security;
alter table offers              enable row level security;
alter table price_periods       enable row level security;
alter table honeymoon_deals     enable row level security;
alter table honeymoon_periods   enable row level security;
alter table honeymoon_perks     enable row level security;
alter table site_settings       enable row level security;
alter table audit_logs          enable row level security;

-- ---------- profiles ----------
create policy profiles_read on profiles for select
  using (id = auth.uid() or is_admin());
create policy profiles_admin_write on profiles for all
  using (is_admin()) with check (is_admin());

-- ---------- image_assets (public assets) ----------
create policy image_read on image_assets for select using (true);
create policy image_admin_write on image_assets for all
  using (is_admin()) with check (is_admin());

-- ---------- site_settings ----------
create policy settings_read on site_settings for select using (true);
create policy settings_admin_write on site_settings for all
  using (is_admin()) with check (is_admin());

-- ---------- destinations ----------
create policy dest_read on destinations for select
  using ((is_published and not is_archived) or is_admin());
create policy dest_admin_write on destinations for all
  using (is_admin()) with check (is_admin());

-- ---------- package_categories ----------
create policy pkgcat_read on package_categories for select
  using (
    ((is_published and not is_archived) and exists (
      select 1 from destinations d
      where d.id = destination_id and d.is_published and not d.is_archived
    ))
    or is_admin()
  );
create policy pkgcat_admin_write on package_categories for all
  using (is_admin()) with check (is_admin());

-- ---------- hotels ----------
create policy hotels_read on hotels for select
  using (
    ((is_published and not is_archived) and exists (
      select 1 from destinations d
      where d.id = destination_id and d.is_published and not d.is_archived
    ))
    or is_admin()
  );
create policy hotels_admin_write on hotels for all
  using (is_admin()) with check (is_admin());

-- ---------- hotel_aliases ----------
create policy aliases_read on hotel_aliases for select
  using (exists (select 1 from hotels h where h.id = hotel_id and h.is_published) or is_admin());
create policy aliases_admin_write on hotel_aliases for all
  using (is_admin()) with check (is_admin());

-- ---------- offers ----------
create policy offers_read on offers for select
  using (
    (is_published and exists (
      select 1 from package_categories c
      where c.id = package_category_id and c.is_published and not c.is_archived
    ) and exists (
      select 1 from hotels h where h.id = hotel_id and h.is_published and not h.is_archived
    ))
    or is_admin()
  );
create policy offers_admin_write on offers for all
  using (is_admin()) with check (is_admin());

-- ---------- price_periods ----------
create policy periods_read on price_periods for select
  using (
    exists (select 1 from offers o where o.id = offer_id and o.is_published)
    or is_admin()
  );
create policy periods_admin_write on price_periods for all
  using (is_admin()) with check (is_admin());

-- ---------- honeymoon_deals ----------
create policy hm_deal_read on honeymoon_deals for select
  using ((is_published and not is_archived) or is_admin());
create policy hm_deal_admin_write on honeymoon_deals for all
  using (is_admin()) with check (is_admin());

-- ---------- honeymoon_periods ----------
create policy hm_period_read on honeymoon_periods for select
  using (
    exists (select 1 from honeymoon_deals d where d.id = deal_id and d.is_published and not d.is_archived)
    or is_admin()
  );
create policy hm_period_admin_write on honeymoon_periods for all
  using (is_admin()) with check (is_admin());

-- ---------- honeymoon_perks ----------
create policy hm_perk_read on honeymoon_perks for select
  using (
    exists (select 1 from honeymoon_deals d where d.id = deal_id and d.is_published and not d.is_archived)
    or is_admin()
  );
create policy hm_perk_admin_write on honeymoon_perks for all
  using (is_admin()) with check (is_admin());

-- ---------- audit_logs (admins read; inserts by admins/service role) ----------
create policy audit_read on audit_logs for select using (is_admin());
create policy audit_insert on audit_logs for insert with check (is_admin());
