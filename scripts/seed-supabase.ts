/**
 * Seeds Supabase from the parity-verified static catalog — VERBATIM (no hotel
 * name, date, price, unit, note, perk, phone or WhatsApp value is altered).
 * Idempotent full reset of catalog tables (never touches auth/profiles/audit).
 *
 * Run: SUPABASE creds in env, then `npm run seed:supabase`.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getDestinations,
  getHoneymoons,
  CONTACT_PHONE,
  CONTACT_WHATSAPP,
} from "@/lib/catalog";
import { DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { DESTINATION_NAMES } from "@/data/hotel-names";
import hotelImageMap from "@/data/hotel-image-map";
import { parsePrice } from "@/lib/slug";

if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    "✗ Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY.",
  );
  process.exit(1);
}

const db = createAdminClient();

async function reset() {
  // child -> parent order (RLS bypassed by service role)
  for (const t of [
    "price_periods",
    "offers",
    "hotels",
    "package_categories",
    "honeymoon_perks",
    "honeymoon_periods",
    "honeymoon_deals",
    "destinations",
    "image_assets",
  ]) {
    const { error } = await db.from(t).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(`clear ${t}: ${error.message}`);
  }
}

async function seedImages() {
  const rows: { path: string; kind: string; alt_ar: string; source_url: string | null; asset_status: string; identity_status: string; license_status: string }[] = [];
  for (const d of getDestinations()) {
    rows.push({
      path: `/images/destinations/${d.slug}.webp`,
      kind: "destination_hero",
      alt_ar: `منتجعات وشواطئ ${d.nameAr}`,
      source_url: null,
      asset_status: "verified_local",
      identity_status: "verified",
      license_status: "cleared",
    });
  }
  for (const [slug, entry] of Object.entries(hotelImageMap)) {
    rows.push({
      path: entry.image,
      kind: "hotel",
      alt_ar: slug,
      source_url: entry.sourceUrl ?? null,
      asset_status: "verified_local",
      identity_status: "verified",
      license_status: "cleared",
    });
  }
  const { data, error } = await db.from("image_assets").insert(rows).select("id,path");
  if (error) throw new Error(`image_assets: ${error.message}`);
  const byPath = new Map<string, string>();
  (data ?? []).forEach((r) => byPath.set(r.path, r.id));
  return byPath;
}

async function main() {
  console.log("Resetting catalog tables…");
  await reset();

  console.log("Seeding image assets…");
  const imgByPath = await seedImages();

  const destinations = getDestinations();

  for (const [di, d] of destinations.entries()) {
    const heroId = imgByPath.get(`/images/destinations/${d.slug}.webp`) ?? null;
    const { data: destRow, error: destErr } = await db
      .from("destinations")
      .insert({
        legacy_id: d.id,
        slug: d.slug,
        name_ar: d.nameAr,
        name_en: d.nameEn,
        tagline: d.tagline,
        hero_image_id: heroId,
        display_order: di,
      })
      .select("id")
      .single();
    if (destErr || !destRow) throw new Error(`destination ${d.slug}: ${destErr?.message}`);
    const destId = destRow.id;

    for (const [ci, c] of d.categories.entries()) {
      const { data: catRow, error: catErr } = await db
        .from("package_categories")
        .insert({
          destination_id: destId,
          code: c.id,
          name_ar: c.name,
          price_unit: c.priceUnit,
          note_ar: c.note ?? null,
          display_order: ci,
        })
        .select("id")
        .single();
      if (catErr || !catRow) throw new Error(`category ${d.slug}/${c.id}: ${catErr?.message}`);
      const catId = catRow.id;

      const catHotels = d.hotels.filter((h) => h.categoryId === c.id);
      for (const [hi, h] of catHotels.entries()) {
        const imgId = hotelImageMap[h.slug] ? (imgByPath.get(hotelImageMap[h.slug]!.image) ?? null) : null;
        const { data: hotelRow, error: hotelErr } = await db
          .from("hotels")
          .insert({
            slug: h.slug,
            name_ar: h.nameAr,
            name_en: h.nameEn,
            destination_id: destId,
            image_id: imgId,
            display_order: hi,
          })
          .select("id")
          .single();
        if (hotelErr || !hotelRow) throw new Error(`hotel ${h.slug}: ${hotelErr?.message}`);

        const { data: offerRow, error: offerErr } = await db
          .from("offers")
          .insert({
            package_category_id: catId,
            hotel_id: hotelRow.id,
            legacy_idx: h.legacy.idx,
            display_order: hi,
          })
          .select("id")
          .single();
        if (offerErr || !offerRow) throw new Error(`offer ${h.slug}: ${offerErr?.message}`);

        const periods = h.periods.map((p, pi) => ({
          offer_id: offerRow.id,
          period_label: p.period,
          board_ar: p.board ?? null,
          double_text: p.double ?? null,
          triple_text: p.triple ?? null,
          room_text: p.price ?? null,
          double_amount: parsePrice(p.double),
          triple_amount: parsePrice(p.triple),
          room_amount: parsePrice(p.price),
          display_order: pi,
        }));
        if (periods.length) {
          const { error } = await db.from("price_periods").insert(periods);
          if (error) throw new Error(`periods ${h.slug}: ${error.message}`);
        }
      }
    }
    console.log(`  ✓ ${d.nameAr} (${d.hotels.length} hotels)`);
  }

  console.log("Seeding honeymoon…");
  for (const [i, deal] of getHoneymoons().entries()) {
    const { data: dealRow, error: dealErr } = await db
      .from("honeymoon_deals")
      .insert({
        slug: deal.slug,
        legacy_idx: deal.legacyIdx,
        hotel_name_ar: deal.nameAr,
        hotel_name_en: deal.nameEn,
        region: deal.region,
        display_order: i,
      })
      .select("id")
      .single();
    if (dealErr || !dealRow) throw new Error(`honeymoon ${deal.slug}: ${dealErr?.message}`);
    const periods = deal.periods.map((p, pi) => ({
      deal_id: dealRow.id,
      period_label: p.period,
      board_ar: p.board ?? null,
      price_text: p.price,
      price_amount: parsePrice(p.price),
      unit: p.unit,
      display_order: pi,
    }));
    const perks = deal.perks.map((perk, pi) => ({ deal_id: dealRow.id, perk_ar: perk, display_order: pi }));
    const e1 = (await db.from("honeymoon_periods").insert(periods)).error;
    if (e1) throw new Error(`hm periods ${deal.slug}: ${e1.message}`);
    const e2 = (await db.from("honeymoon_perks").insert(perks)).error;
    if (e2) throw new Error(`hm perks ${deal.slug}: ${e2.message}`);
  }

  console.log("Seeding site settings…");
  const { error: setErr } = await db.from("site_settings").upsert({
    id: 1,
    phone: CONTACT_PHONE,
    whatsapp: CONTACT_WHATSAPP,
    email: "info@elbakri.travel",
    location_ar: "القاهرة، مصر",
    working_hours_ar: null,
    default_whatsapp_message: DEFAULT_WHATSAPP_MESSAGE,
  });
  if (setErr) throw new Error(`site_settings: ${setErr.message}`);

  console.log("\n✓ Seed complete. Run `npm run validate:db` to confirm parity.");
}

main().catch((e) => {
  console.error("✗ Seed failed:", e.message);
  process.exit(1);
});
