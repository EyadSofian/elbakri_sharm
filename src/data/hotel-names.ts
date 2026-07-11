/**
 * Authoritative Arabic display-name -> English name + base slug map.
 *
 * Keys are the EXACT Arabic strings as they appear in `packages.source.ts`
 * (business data is never edited; this is a lookup layer only).
 *
 * `validate:catalog` fails if any name in the data is missing here, so a typo
 * or a new hotel cannot silently ship without an English name / slug.
 *
 * NOTE: base slugs may collide across destinations for Pickalbatros properties
 * that share an Arabic name (e.g. "الباتروس اكوا بارك" exists in both Sharm and
 * Hurghada). Those are DISTINCT physical properties and are destination-qualified
 * at derivation time in `catalog.ts` — do not merge them here.
 */

export type NameEntry = { en: string; slug: string };

export const DESTINATION_NAMES: Record<
  string,
  { ar: string; en: string; slug: string }
> = {
  sharm: { ar: "شرم الشيخ", en: "Sharm El Sheikh", slug: "sharm-el-sheikh" },
  dahab: { ar: "دهب", en: "Dahab", slug: "dahab" },
  hurghada: { ar: "الغردقة", en: "Hurghada", slug: "hurghada" },
  marsaalam: { ar: "مرسى علم", en: "Marsa Alam", slug: "marsa-alam" },
  northcoast: { ar: "الساحل الشمالي", en: "North Coast", slug: "north-coast" },
};

export const HOTEL_NAMES: Record<string, NameEntry> = {
  /* ---------- Sharm El Sheikh ---------- */
  "فالكون نعمة ستار": { en: "Falcon Naama Star", slug: "falcon-naama-star" },
  "فالكون هيلز": { en: "Falcon Hills", slug: "falcon-hills" },
  "شرم هوليداي": { en: "Sharm Holiday", slug: "sharm-holiday" },
  "سان جورج": { en: "San George", slug: "san-george" },
  "دريمز فاكيشن": { en: "Dreams Vacation", slug: "dreams-vacation" },
  "الجافي": { en: "Gafy Resort", slug: "gafy-resort" },
  "ريجنسي بلازا اكوا بارك": {
    en: "Regency Plaza Aqua Park",
    slug: "regency-plaza-aqua-park",
  },
  "شيراتون شرم": { en: "Sheraton Sharm", slug: "sheraton-sharm" },
  "دريمز بيتش": { en: "Dreams Beach", slug: "dreams-beach" },
  "بروميناد ماونتن": { en: "Promenade Mountain", slug: "promenade-mountain" },
  "نعمه باي": { en: "Naama Bay", slug: "naama-bay" },
  "شارمليون كلوب اكوا بارك": {
    en: "Sharmillion Club Aqua Park",
    slug: "sharmillion-club-aqua-park",
  },
  "كيروسيز بارك لاند": { en: "Kiroseiz Parkland", slug: "kiroseiz-parkland" },
  "تمره بيتش": { en: "Tamra Beach", slug: "tamra-beach" },
  "الباتروس رويال جراند (كبار فقط)": {
    en: "Pickalbatros Royal Grand (Adults Only)",
    slug: "pickalbatros-royal-grand",
  },
  "الباتروس شرم": { en: "Pickalbatros Sharm", slug: "pickalbatros-sharm" },
  "الباتروس لاجونا كلوب": {
    en: "Pickalbatros Laguna Club",
    slug: "pickalbatros-laguna-club",
  },
  "الباتروس بالاس": { en: "Pickalbatros Palace", slug: "pickalbatros-palace" },
  "الباتروس لاجونا فيستا": {
    en: "Pickalbatros Laguna Vista",
    slug: "pickalbatros-laguna-vista",
  },
  "الباتروس رويال موديرنا": {
    en: "Pickalbatros Royal Moderna",
    slug: "pickalbatros-royal-moderna",
  },

  /* ---------- Shared Pickalbatros names (destination-qualified in catalog.ts) ---------- */
  "الباتروس اكوا بارك": {
    en: "Pickalbatros Aqua Park",
    slug: "pickalbatros-aqua-park",
  },
  "الباتروس اكوا بلو": {
    en: "Pickalbatros Aqua Blu",
    slug: "pickalbatros-aqua-blu",
  },
  // "بلاس" resolves to Pickalbatros PALACE (destination-specific): Hurghada =
  // Palace Resort Hurghada, Marsa Alam = Palace Hotel Port Ghalib. Slug kept for
  // URL/parity stability; the destination-qualified slug distinguishes the two.
  "الباتروس بلاس": { en: "Pickalbatros Palace", slug: "pickalbatros-plus" },

  /* ---------- Dahab ---------- */
  "داون تاون": { en: "Downtown Dahab", slug: "downtown-dahab" },
  "نسيمة دهب": { en: "Nesima Dahab", slug: "nesima-dahab" },
  "دهب لاجون": { en: "Dahab Lagoon", slug: "dahab-lagoon" },
  "سويس ان دهب": { en: "Swiss Inn Dahab", slug: "swiss-inn-dahab" },
  "تروبيتال دهب": { en: "Tropitel Dahab", slug: "tropitel-dahab" },

  /* ---------- Hurghada / Sahl Hasheesh / Soma Bay ---------- */
  "مينا مارك": { en: "Minamark Beach Resort", slug: "minamark" },
  "مارلين ان": { en: "Marlin Inn Azur", slug: "marlin-inn" },
  "صنى دايز ميريت فاميلى": {
    en: "Sunny Days Mirette Family",
    slug: "sunny-days-mirette-family",
  },
  "الجفتون ازور": { en: "El Giftun Azur", slug: "giftun-azur" },
  "فارو ازور": { en: "Pharaoh Azur Resort", slug: "pharaoh-azur" },
  "صنى دايز البلاسيو": {
    en: "Sunny Days El Palacio",
    slug: "sunny-days-el-palacio",
  },
  "سندباد": { en: "Sindbad Club", slug: "sindbad-club" },
  "سيجال": { en: "Seagull Beach Resort", slug: "seagull" },
  "ثرى كورنرز صنى بيتش": {
    en: "Three Corners Sunny Beach",
    slug: "three-corners-sunny-beach",
  },
  "جرافيتى اكوا بارك": {
    en: "Gravity Hotel & Aqua Park",
    slug: "gravity-aqua-park",
  },
  "ديزرت روز": { en: "Desert Rose Resort", slug: "desert-rose" },
  "شيراتون سوما باى": { en: "Sheraton Soma Bay", slug: "sheraton-soma-bay" },
  "الباتروس وايت بيتش": {
    en: "Pickalbatros White Beach",
    slug: "pickalbatros-white-beach",
  },
  "الباتروس دانا بيتش": {
    en: "Pickalbatros Dana Beach",
    slug: "pickalbatros-dana-beach",
  },
  "بيتش الباتروس": { en: "Beach Albatros Resort", slug: "beach-albatros" },
  "الباتروس اكوا فيستا": {
    en: "Pickalbatros Aqua Vista",
    slug: "pickalbatros-aqua-vista",
  },
  "الباتروس واتر فالى": {
    en: "Pickalbatros Water Valley",
    slug: "pickalbatros-water-valley",
  },
  "الباتروس جانجل اكوا بارك": {
    en: "Pickalbatros Jungle Aqua Park",
    slug: "pickalbatros-jungle-aqua-park",
  },
  "الباتروس ألف ليلة وليلة": {
    en: "Pickalbatros Alf Leila Wa Leila",
    slug: "pickalbatros-alf-leila-wa-leila",
  },

  /* ---------- Marsa Alam ---------- */
  "الباتروس سي ورلد": {
    en: "Pickalbatros Sea World",
    slug: "pickalbatros-sea-world",
  },
  "الباتروس أوازيس": { en: "Pickalbatros Oasis", slug: "pickalbatros-oasis" },
  "الباتروس ساندس": { en: "Pickalbatros Sands", slug: "pickalbatros-sands" },
  "الباتروس بورتو فينو": {
    en: "Pickalbatros Porto Fino",
    slug: "pickalbatros-porto-fino",
  },
  "الباتروس فيتا": { en: "Pickalbatros Vita", slug: "pickalbatros-vita" },

  /* ---------- North Coast ---------- */
  "جيوان ريزورت": { en: "Jiwan Resort", slug: "jiwan-resort" },
  "جيوان بيتش": { en: "Jiwan Beach", slug: "jiwan-beach" },
  "ازور وان": { en: "Azur One", slug: "azur-one" },
  "بورتو مارينا": { en: "Porto Marina", slug: "porto-marina" },

  /* ---------- Honeymoon-only properties ---------- */
  "ليدو شرم": { en: "Lido Sharm", slug: "lido-sharm" },
  "الباتروس رويال جراند": {
    en: "Pickalbatros Royal Grand",
    slug: "pickalbatros-royal-grand",
  },
  "تروبيتال سهل حشيش": {
    en: "Tropitel Sahl Hasheesh",
    slug: "tropitel-sahl-hasheesh",
  },
  "سويس ان الغردقة": { en: "Swiss Inn Hurghada", slug: "swiss-inn-hurghada" },
  "الباتروس سي وورلد": {
    en: "Pickalbatros Sea World",
    slug: "pickalbatros-sea-world",
  },
  "الباتروس سيتادل": {
    en: "Pickalbatros Citadel",
    slug: "pickalbatros-citadel",
  },
  "كونتنتال": { en: "Continental Hurghada", slug: "continental-hurghada" },
  "كايسول رومانس": { en: "Kaisol Romance", slug: "kaisol-romance" },
  "جاز كوستا": { en: "Jaz Costa Mares", slug: "jaz-costa-mares" },
  "ساتايا": { en: "Sataya Resort", slug: "sataya" },
  "هابي لايف": { en: "Happy Life Dahab", slug: "happy-life" },
  "تروبيتال دهب اوسيس": {
    en: "Tropitel Dahab Oasis",
    slug: "tropitel-dahab-oasis",
  },
  "بريمير لي ريف": { en: "Premier Le Reve", slug: "premier-le-reve" },
};

/**
 * Alias links used ONLY by the image inventory (Phase C) to collapse the same
 * physical property that appears under slightly different Arabic spellings or
 * with/without an "(Adults Only)" suffix. Routing keeps these separate.
 * key = canonical destination-hotel Arabic name, value = other Arabic strings.
 */
export const HOTEL_ALIASES: Record<string, string[]> = {
  "الباتروس رويال جراند (كبار فقط)": ["الباتروس رويال جراند"],
  "الباتروس سي ورلد": ["الباتروس سي وورلد"],
};
