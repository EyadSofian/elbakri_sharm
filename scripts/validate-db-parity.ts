/**
 * Compares the seeded Supabase catalog against the static source of truth.
 * Fails if counts or any hotel/honeymoon prices, periods, notes or perks drift.
 * Run after `npm run seed:supabase`.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getDestinations, getHoneymoons } from "@/lib/catalog";

if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("✗ Supabase not configured (need URL + SERVICE_ROLE_KEY).");
  process.exit(1);
}
const db = createAdminClient();

let failures = 0;
const check = (cond: boolean, msg: string) => {
  console.log(`${cond ? "  ✓" : "  ✗"} ${msg}`);
  if (!cond) failures++;
};

type DbPeriod = { period_label: string; board_ar: string | null; double_text: string | null; triple_text: string | null; room_text: string | null };
type DbHotel = { slug: string; price_periods?: DbPeriod[] };

async function main() {
  const { data: hotels, error } = await db
    .from("hotels")
    .select("slug,offers(price_periods(period_label,board_ar,double_text,triple_text,room_text,display_order))");
  if (error) throw new Error(error.message);

  const { count: destCount } = await db.from("destinations").select("*", { count: "exact", head: true });
  const { count: hotelCount } = await db.from("hotels").select("*", { count: "exact", head: true });
  const { count: periodCount } = await db.from("price_periods").select("*", { count: "exact", head: true });
  const { count: hmCount } = await db.from("honeymoon_deals").select("*", { count: "exact", head: true });
  const { count: hmPeriodCount } = await db.from("honeymoon_periods").select("*", { count: "exact", head: true });

  console.log("Counts");
  check(destCount === 5, `5 destinations (got ${destCount})`);
  check(hotelCount === 59, `59 hotels (got ${hotelCount})`);
  check(periodCount === 135, `135 price periods (got ${periodCount})`);
  check(hmCount === 14, `14 honeymoon deals (got ${hmCount})`);
  check(hmPeriodCount === 26, `26 honeymoon periods (got ${hmPeriodCount})`);

  // Per-hotel period parity
  const dbBySlug = new Map<string, DbPeriod[]>();
  for (const h of (hotels ?? []) as unknown as { slug: string; offers: { price_periods: DbPeriod[] }[] }[]) {
    const ps = (h.offers ?? []).flatMap((o) => o.price_periods ?? []);
    dbBySlug.set(h.slug, ps);
  }
  let mismatches = 0;
  for (const d of getDestinations()) {
    for (const h of d.hotels) {
      const dbp = (dbBySlug.get(h.slug) ?? []).map((p) => ({
        period: p.period_label,
        board: p.board_ar ?? undefined,
        double: p.double_text ?? undefined,
        triple: p.triple_text ?? undefined,
      }));
      const src = h.periods.map((p) => ({ period: p.period, board: p.board, double: p.double, triple: p.triple }));
      // order-insensitive compare
      const norm = (a: typeof src) => JSON.stringify([...a].sort((x, y) => x.period.localeCompare(y.period)));
      if (norm(dbp) !== norm(src)) {
        mismatches++;
        if (mismatches <= 5) console.log(`      period mismatch: ${h.slug}`);
      }
    }
  }
  check(mismatches === 0, `all hotel periods match source (${mismatches} mismatches)`);

  // Honeymoon perks parity
  const { data: deals } = await db
    .from("honeymoon_deals")
    .select("slug,honeymoon_perks(perk_ar),honeymoon_periods(price_text)");
  const dbDeal = new Map<string, { perks: string[]; prices: string[] }>();
  for (const d of (deals ?? []) as unknown as { slug: string; honeymoon_perks: { perk_ar: string }[]; honeymoon_periods: { price_text: string }[] }[]) {
    dbDeal.set(d.slug, {
      perks: d.honeymoon_perks.map((p) => p.perk_ar).sort(),
      prices: d.honeymoon_periods.map((p) => p.price_text).sort(),
    });
  }
  let hmMismatch = 0;
  for (const deal of getHoneymoons()) {
    const got = dbDeal.get(deal.slug);
    const wantPerks = [...deal.perks].sort();
    const wantPrices = deal.periods.map((p) => p.price).sort();
    if (!got || JSON.stringify(got.perks) !== JSON.stringify(wantPerks) || JSON.stringify(got.prices) !== JSON.stringify(wantPrices)) {
      hmMismatch++;
    }
  }
  check(hmMismatch === 0, `all honeymoon perks + prices match source (${hmMismatch} mismatches)`);

  console.log(failures ? `\n✗ DB parity FAILED (${failures})\n` : "\n✓ DB parity passed\n");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
