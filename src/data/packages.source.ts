export type ChildPricingType = "free" | "fixed" | "percent_adult" | "adult_rate" | "manual";
export type ChildBedType = "sharing" | "extra_bed" | "any";

export type ChildPolicyRule = {
  childNumberFrom: number;
  childNumberTo: number;
  ageFrom: number;
  ageTo: number;
  pricingType: ChildPricingType;
  value?: number;
  bedType: ChildBedType;
  notes?: string;
};

export type ChildPolicy = {
  code?: string;
  name: string;
  description?: string;
  minAdults: number;
  maxChildren: number;
  rules: ChildPolicyRule[];
  requiresManualConfirmation: boolean;
  legacy?: boolean;
};

export type PricePeriod = {
  period: string;
  board?: string;
  double?: string;
  triple?: string;
  price?: string; // for honeymoon per room
  perks?: string;
  /* ── Live-rate enrichment (from the elbakri-rate hub; undefined for the
     static seed). Powers the checkout price calculator. ── */
  dateFrom?: string;
  dateTo?: string;
  nights?: number;
  days?: number;
  /** e.g. "per_person_per_night" | "per_person_per_trip" | "per_room_per_night" */
  pricingBasis?: string;
  /** Numeric per-adult price (single/generic occupancy) in the period currency. */
  adultPrice?: number;
  /** Numeric per-child price; when absent the checkout hides the children input. */
  childPrice?: number;
  childAgeFrom?: number;
  childAgeTo?: number;
  /** Structured hotel policy, with optional occupancy-specific overrides. */
  childPolicy?: ChildPolicy;
  childPolicyByRoom?: Partial<Record<"single" | "double" | "triple", ChildPolicy>>;
  currency?: string;
};

export type Hotel = {
  name: string;
  location?: string;
  periods: PricePeriod[];
};

export type PackageCategory = {
  id: string;
  name: string;
  note?: string;
  priceUnit: "per_person_trip" | "per_person_night" | "per_room_night" | "per_room_trip";
  hotels: Hotel[];
};

export type Destination = {
  id: string;
  name: string;
  tagline: string;
  image: string;
  categories: PackageCategory[];
};

const UNIT_LABEL: Record<PackageCategory["priceUnit"], string> = {
  per_person_trip: "للفرد / الرحلة",
  per_person_night: "للفرد / الليلة",
  per_room_night: "للغرفة / الليلة",
  per_room_trip: "للغرفة / الرحلة",
};
export const unitLabel = (u: PackageCategory["priceUnit"]) => UNIT_LABEL[u];

/* ============ DESTINATIONS ============ */
export const destinations: Destination[] = [
  {
    id: "sharm",
    name: "شرم الشيخ",
    tagline: "شواطئ فيروزية وشعاب مرجانية خلابة",
    image: "/images/destinations/sharm-el-sheikh.webp",
    categories: [
      {
        id: "select",
        name: "باقة Select",
        priceUnit: "per_person_trip",
        note: "يمكن إضافة انتقالات بقيمة 650 ج للفرد ذهابًا وعودة. الأسعار قابلة للتغيير حسب التوافر.",
        hotels: [
          { name: "فالكون نعمة ستار", periods: [
            { period: "01/07 – 31/10/2026", board: "نصف إقامة", double: "5,900", triple: "5,750" },
          ]},
          { name: "فالكون هيلز", periods: [
            { period: "01/07 – 31/10/2026", board: "نصف إقامة", double: "4,820", triple: "4,670" },
          ]},
          { name: "شرم هوليداي", periods: [
            { period: "01/07 – 10/07/2026", board: "نصف إقامة", double: "7,700", triple: "7,650" },
            { period: "11/07 – 31/10/2026", board: "نصف إقامة", double: "8,450", triple: "8,400" },
          ]},
        ],
      },
      {
        id: "premium",
        name: "باقة Premium",
        priceUnit: "per_person_trip",
        hotels: [
          { name: "سان جورج", periods: [
            { period: "01/07 – 14/07/2026", board: "SAI", double: "9,275", triple: "9,195" },
            { period: "15/07 – 30/09/2026", board: "SAI", double: "10,625", triple: "10,545" },
          ]},
          { name: "دريمز فاكيشن", periods: [
            { period: "01/07 – 14/07/2026", board: "SAI", double: "9,950", triple: "9,680" },
            { period: "15/07 – 15/09/2026", board: "SAI", double: "11,300", triple: "11,030" },
          ]},
          { name: "الجافي", periods: [
            { period: "01/07 – 09/07/2026", board: "SAI", double: "8,450", triple: "8,400" },
            { period: "10/07 – 30/07/2026", board: "SAI", double: "10,700", triple: "10,650" },
            { period: "31/07 – 12/09/2026", board: "SAI", double: "12,950", triple: "12,900" },
          ]},
          { name: "ريجنسي بلازا اكوا بارك", periods: [
            { period: "01/07 – 31/07/2026", board: "SAI", double: "14,000", triple: "13,975" },
            { period: "01/08 – 31/08/2026", board: "SAI", double: "15,350", triple: "15,325" },
          ]},
          { name: "شيراتون شرم", periods: [
            { period: "01/07 – 31/07/2026", board: "نصف إقامة", double: "11,825", triple: "11,775" },
            { period: "01/08 – 31/08/2026", board: "نصف إقامة", double: "14,825", triple: "14,775" },
          ]},
        ],
      },
      {
        id: "elite",
        name: "باقة Elite",
        priceUnit: "per_person_trip",
        hotels: [
          { name: "دريمز بيتش", periods: [
            { period: "01/07 – 14/07/2026", board: "SAI", double: "11,300", triple: "11,030" },
            { period: "15/07 – 15/09/2026", board: "SAI", double: "12,650", triple: "12,380" },
          ]},
          { name: "بروميناد ماونتن", periods: [
            { period: "01/07 – 29/07/2026", board: "SAI", double: "12,230", triple: "9,425" },
            { period: "30/07 – 19/09/2026", board: "SAI", double: "14,300", triple: "10,805" },
          ]},
          { name: "نعمه باي", periods: [
            { period: "01/07 – 15/07/2026", board: "SAI", double: "11,855", triple: "11,720" },
            { period: "16/07 – 31/07/2026", board: "SAI", double: "12,800", triple: "12,665" },
            { period: "01/08 – 31/08/2026", board: "SAI", double: "14,825", triple: "14,690" },
          ]},
          { name: "شارمليون كلوب اكوا بارك", periods: [
            { period: "01/07 – 15/07/2026", board: "SAI", double: "15,165", triple: "15,120" },
            { period: "16/07 – 31/08/2026", board: "SAI", double: "16,440", triple: "16,395" },
            { period: "01/09 – 31/10/2026", board: "SAI", double: "15,134", triple: "15,120" },
          ]},
          { name: "كيروسيز بارك لاند", periods: [
            { period: "01/07 – 14/07/2026", board: "SAI", double: "14,000", triple: "13,920" },
            { period: "15/07 – 30/09/2026", board: "SAI", double: "16,025", triple: "15,945" },
            { period: "01/10 – 31/10/2026", board: "SAI", double: "14,000", triple: "13,920" },
          ]},
          { name: "تمره بيتش", periods: [
            { period: "01/07 – 31/07/2026", board: "SAI", double: "11,975", triple: "11,570" },
            { period: "01/08 – 20/09/2026", board: "SAI", double: "12,650", triple: "12,245" },
            { period: "21/09 – 31/10/2026", board: "SAI", double: "11,975", triple: "11,570" },
          ]},
        ],
      },
      {
        id: "albatros",
        name: "مجموعة الباتروس",
        priceUnit: "per_person_night",
        note: "الطفل الأول مجانًا حتى 11.99 سنة، الطفل الثاني حتى 3.99 سنة. الأطفال فوق 4 سنوات 50٪. انتقالات 650 ج للفرد (الباتروس سيتادل 950 ج).",
        hotels: [
          { name: "الباتروس رويال جراند (كبار فقط)", periods: [
            { period: "01/07 – 20/07/2026", board: "إقامة كاملة", double: "4,715", triple: "4,415" },
            { period: "21/07 – 31/08/2026", board: "إقامة كاملة", double: "5,565", triple: "5,210" },
          ]},
          { name: "الباتروس اكوا بارك", periods: [
            { period: "01/07 – 10/07/2026", board: "SAI", double: "5,775", triple: "5,405" },
            { period: "11/07 – 31/08/2026", board: "SAI", double: "6,625", triple: "6,200" },
          ]},
          { name: "الباتروس اكوا بلو", periods: [
            { period: "01/07 – 10/07/2026", board: "SAI", double: "5,775", triple: "5,405" },
            { period: "11/07 – 31/08/2026", board: "SAI", double: "6,200", triple: "5,805" },
          ]},
          { name: "الباتروس شرم", periods: [
            { period: "01/07 – 20/07/2026", board: "إقامة كاملة", double: "4,290", triple: "4,020" },
            { period: "21/07 – 31/08/2026", board: "إقامة كاملة", double: "4,925", triple: "4,615" },
            { period: "01/09 – 31/10/2026", board: "إقامة كاملة", double: "4,290", triple: "4,020" },
          ]},
          { name: "الباتروس لاجونا كلوب", periods: [
            { period: "01/07 – 20/07/2026", board: "إقامة كاملة", double: "4,925", triple: "4,615" },
            { period: "21/07 – 31/08/2026", board: "إقامة كاملة", double: "5,565", triple: "5,210" },
          ]},
          { name: "الباتروس بالاس", periods: [
            { period: "01/07 – 10/07/2026", board: "SAI", double: "5,990", triple: "5,605" },
            { period: "11/07 – 31/08/2026", board: "SAI", double: "6,415", triple: "6,005" },
            { period: "01/09 – 31/10/2026", board: "SAI", double: "5,775", triple: "5,410" },
          ]},
          { name: "الباتروس لاجونا فيستا", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "6,200", triple: "5,805" },
            { period: "11/07 – 31/08/2026", board: "إقامة كاملة", double: "6,625", triple: "6,200" },
          ]},
          { name: "الباتروس رويال موديرنا", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "11/07 – 31/08/2026", board: "إقامة كاملة", double: "6,200", triple: "5,805" },
            { period: "01/09 – 31/10/2026", board: "إقامة كاملة", double: "5,565", triple: "6,200" },
          ]},
        ],
      },
    ],
  },
  {
    id: "dahab",
    name: "دهب",
    tagline: "هدوء البحر وجبال سيناء الساحرة",
    image: "/images/destinations/dahab.webp",
    categories: [
      {
        id: "dahab-offers",
        name: "عروض دهب",
        priceUnit: "per_person_trip",
        note: "الأسعار شاملة الانتقال بالهاي إس ذهابًا وعودة.",
        hotels: [
          { name: "داون تاون", periods: [
            { period: "03/07 – 30/09/2026", board: "إفطار", double: "3,400", triple: "3,350" },
          ]},
          { name: "نسيمة دهب", periods: [
            { period: "06/07 – 10/11/2026", board: "إفطار", double: "5,080", triple: "5,350" },
          ]},
          { name: "دهب لاجون", periods: [
            { period: "01/07 – 09/07/2026", board: "نصف إقامة", double: "9,400", triple: "9,350" },
            { period: "10/07 – 31/08/2026", board: "نصف إقامة", double: "10,750", triple: "10,700" },
          ]},
          { name: "سويس ان دهب", periods: [
            { period: "01/07 – 09/07/2026", board: "نصف إقامة", double: "9,400", triple: "9,265" },
            { period: "10/07 – 30/09/2026", board: "نصف إقامة", double: "11,425", triple: "11,290" },
          ]},
          { name: "تروبيتال دهب", periods: [
            { period: "01/07 – 20/09/2026", board: "نصف إقامة", double: "9,400", triple: "9,350" },
          ]},
        ],
      },
    ],
  },
  {
    id: "hurghada",
    name: "الغردقة",
    tagline: "لؤلؤة البحر الأحمر ومنتجعات فاخرة",
    image: "/images/destinations/hurghada.webp",
    categories: [
      {
        id: "h-select",
        name: "باقة Select",
        priceUnit: "per_person_trip",
        hotels: [
          { name: "مينا مارك", periods: [
            { period: "01/07 – 30/09/2026", board: "SAI", double: "10,625", triple: "10,990" },
          ]},
          { name: "مارلين ان", periods: [
            { period: "01/07 – 30/09/2026", board: "إقامة كاملة", double: "11,165", triple: "9,750" },
            { period: "01/10 – 31/10/2026", board: "إقامة كاملة", double: "9,275", triple: "8,105" },
          ]},
          { name: "صنى دايز ميريت فاميلى", periods: [
            { period: "01/07 – 20/07/2026", board: "إقامة كاملة", double: "8,600", triple: "8,600" },
            { period: "21/07 – 31/10/2026", board: "إقامة كاملة", double: "10,625", triple: "10,625" },
          ]},
          { name: "الجفتون ازور", periods: [
            { period: "01/07 – 30/09/2026", board: "إقامة كاملة", double: "10,625", triple: "9,275" },
            { period: "01/10 – 31/10/2026", board: "إقامة كاملة", double: "9,275", triple: "8,105" },
          ]},
        ],
      },
      {
        id: "h-premium",
        name: "باقة Premium",
        priceUnit: "per_person_trip",
        hotels: [
          { name: "فارو ازور", periods: [
            { period: "01/07 – 30/09/2026", board: "إقامة كاملة", double: "11,975", triple: "10,445" },
            { period: "01/10 – 30/10/2026", board: "إقامة كاملة", double: "10,625", triple: "9,273" },
          ]},
          { name: "صنى دايز البلاسيو", periods: [
            { period: "01/07 – 20/07/2026", board: "إقامة كاملة", double: "9,950", triple: "9,900" },
            { period: "21/07 – 31/10/2026", board: "إقامة كاملة", double: "11,975", triple: "11,925" },
          ]},
          { name: "سندباد", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "12,650", triple: "12,050" },
            { period: "11/07 – 31/10/2026", board: "إقامة كاملة", double: "16,025", triple: "15,250" },
          ]},
          { name: "سيجال", periods: [
            { period: "01/07 – 30/09/2026", board: "إقامة كاملة", double: "14,000", triple: "14,000" },
          ]},
          { name: "ثرى كورنرز صنى بيتش", periods: [
            { period: "01/07 – 06/07/2026", board: "إقامة كاملة", double: "10,985", triple: "10,665" },
            { period: "07/07 – 31/08/2026", board: "إقامة كاملة", double: "13,010", triple: "12,625" },
            { period: "01/09 – 15/09/2026", board: "إقامة كاملة", double: "10,850", triple: "10,535" },
          ]},
        ],
      },
      {
        id: "h-elite",
        name: "باقة Elite",
        priceUnit: "per_person_trip",
        note: "لإضافة انتقالات 600 ج للفرد ذهابًا وعودة. الأسعار قابلة للتغيير.",
        hotels: [
          { name: "جرافيتى اكوا بارك", periods: [
            { period: "01/07 – 20/07/2026", board: "إقامة كاملة", double: "16,850", triple: "16,750" },
            { period: "21/07 – 30/07/2026", board: "إقامة كاملة", double: "17,600", triple: "17,550" },
          ]},
          { name: "ديزرت روز", periods: [
            { period: "01/07 – 31/10/2026", board: "إقامة كاملة", double: "20,750", triple: "18,725" },
          ]},
          { name: "شيراتون سوما باى", periods: [
            { period: "01/07 – 08/07/2026", board: "SAI", double: "14,900", triple: "14,850" },
            { period: "09/07 – 30/07/2026", board: "SAI", double: "17,900", triple: "17,850" },
            { period: "09/07 – 12/09/2026", board: "SAI", double: "17,900", triple: "17,850" },
          ]},
        ],
      },
      {
        id: "h-albatros",
        name: "مجموعة الباتروس",
        priceUnit: "per_person_night",
        hotels: [
          { name: "الباتروس وايت بيتش", periods: [
            { period: "01/07 – 13/07/2026", board: "إقامة كاملة", double: "7,050", triple: "6,600" },
            { period: "14/07 – 31/08/2026", board: "إقامة كاملة", double: "6,625", triple: "6,200" },
            { period: "01/09 – 31/10/2026", board: "إقامة كاملة", double: "6,200", triple: "5,805" },
          ]},
          { name: "الباتروس دانا بيتش", periods: [
            { period: "01/07 – 08/07/2026", board: "إقامة كاملة", double: "6,625", triple: "6,200" },
            { period: "09/07 – 14/07/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "15/07 – 31/08/2026", board: "إقامة كاملة", double: "6,200", triple: "5,805" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
          ]},
          { name: "الباتروس بلاس", periods: [
            { period: "01/07 – 14/07/2026", board: "إقامة كاملة", double: "5,565", triple: "5,210" },
            { period: "15/07 – 31/08/2026", board: "إقامة كاملة", double: "6,200", triple: "5,805" },
            { period: "01/09 – 15/09/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "5,565", triple: "5,210" },
          ]},
          { name: "بيتش الباتروس", periods: [
            { period: "06/07 – 14/07/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "15/07 – 31/08/2026", board: "إقامة كاملة", double: "6,200", triple: "5,805" },
            { period: "01/09 – 15/09/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "5,565", triple: "5,210" },
          ]},
          { name: "الباتروس اكوا بلو", periods: [
            { period: "07/07 – 31/08/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "01/09 – 15/09/2026", board: "إقامة كاملة", double: "5,350", triple: "5,010" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "4,925", triple: "4,615" },
          ]},
          { name: "الباتروس اكوا بارك", periods: [
            { period: "07/07 – 31/08/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "01/09 – 15/09/2026", board: "إقامة كاملة", double: "5,350", triple: "5,010" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "4,925", triple: "4,615" },
          ]},
          { name: "الباتروس اكوا فيستا", periods: [
            { period: "07/07 – 31/08/2026", board: "إقامة كاملة", double: "5,775", triple: "5,410" },
            { period: "01/09 – 15/09/2026", board: "إقامة كاملة", double: "5,350", triple: "5,010" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "4,925", triple: "4,615" },
          ]},
        ],
      },
      {
        id: "h-nefarland",
        name: "مجموعة نيفرلاند",
        priceUnit: "per_person_night",
        note: "الطفل الأول مجانًا حتى 11.99 سنة. انتقالات 650 ج للفرد.",
        hotels: [
          { name: "الباتروس واتر فالى", periods: [
            { period: "01/07 – 15/09/2026", board: "إقامة كاملة", double: "9,650", triple: "9,030" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "7,525", triple: "7,047" },
          ]},
          { name: "الباتروس جانجل اكوا بارك", periods: [
            { period: "01/07 – 15/09/2026", board: "إقامة كاملة", double: "8,375", triple: "7,840" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "6,250", triple: "5,860" },
          ]},
          { name: "الباتروس ألف ليلة وليلة", periods: [
            { period: "01/07 – 15/09/2026", board: "إقامة كاملة", double: "7,525", triple: "7,045" },
            { period: "16/09 – 31/10/2026", board: "إقامة كاملة", double: "5,400", triple: "5,059" },
          ]},
        ],
      },
    ],
  },
  {
    id: "marsaalam",
    name: "مرسى علم",
    tagline: "جنة الغوص والمياه الكريستالية",
    image: "/images/destinations/marsa-alam.webp",
    categories: [
      {
        id: "m-albatros",
        name: "مجموعة الباتروس",
        priceUnit: "per_person_night",
        note: "الانتقالات 950 ج للفرد. الطفل الأول مجانًا حتى 11.99 سنة، الثاني حتى 3.99 سنة، والأكبر 50٪.",
        hotels: [
          { name: "الباتروس سي ورلد", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "5,200", triple: "4,870" },
            { period: "11/07 – 12/09/2026", board: "إقامة كاملة", double: "5,650", triple: "5,290" },
            { period: "13/09 – 31/10/2026", board: "إقامة كاملة", double: "4,750", triple: "4,450" },
          ]},
          { name: "الباتروس بلاس", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "5,200", triple: "4,870" },
            { period: "11/07 – 12/09/2026", board: "إقامة كاملة", double: "5,650", triple: "5,290" },
          ]},
          { name: "الباتروس أوازيس", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "4,975", triple: "4,660" },
            { period: "11/07 – 12/09/2026", board: "إقامة كاملة", double: "5,425", triple: "5,080" },
          ]},
          { name: "الباتروس ساندس", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "4,975", triple: "4,660" },
            { period: "11/07 – 12/09/2026", board: "إقامة كاملة", double: "5,425", triple: "5,080" },
          ]},
          { name: "الباتروس بورتو فينو", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "4,750", triple: "5,450" },
            { period: "11/07 – 12/09/2026", board: "إقامة كاملة", double: "5,425", triple: "5,080" },
          ]},
          { name: "الباتروس فيتا", periods: [
            { period: "01/07 – 10/07/2026", board: "إقامة كاملة", double: "4,750", triple: "5,450" },
            { period: "11/07 – 12/09/2026", board: "إقامة كاملة", double: "5,425", triple: "5,080" },
          ]},
        ],
      },
    ],
  },
  {
    id: "northcoast",
    name: "الساحل الشمالي",
    tagline: "مياه المتوسط الصافية ونسائم الصيف",
    image: "/images/destinations/north-coast.webp",
    categories: [
      {
        id: "nc",
        name: "فنادق الساحل الشمالي",
        priceUnit: "per_room_night",
        note: "الأسعار للغرفة لليلة. الانتقالات متاحة عند الطلب.",
        hotels: [
          { name: "جيوان ريزورت", periods: [
            { period: "01/07 – 10/07/2026", board: "نصف إقامة", double: "11,700", triple: "14,760" },
            { period: "11/07 – 25/08/2026", board: "نصف إقامة", double: "17,600", triple: "21,220" },
            { period: "26/08 – 31/08/2026", board: "نصف إقامة", double: "17,100", triple: "20,720" },
          ]},
          { name: "جيوان بيتش", periods: [
            { period: "01/07 – 10/07/2026", board: "نصف إقامة", double: "13,500", triple: "17,025" },
            { period: "11/07 – 25/08/2026", board: "نصف إقامة", double: "17,600", triple: "21,220" },
            { period: "26/08 – 31/08/2026", board: "نصف إقامة", double: "17,100", triple: "20,720" },
          ]},
          { name: "ازور وان", periods: [
            { period: "01/07 – 08/07/2026", board: "إفطار", double: "9,300", triple: "12,200" },
            { period: "09/07 – 11/07/2026", board: "إفطار", double: "11,750", triple: "17,375" },
            { period: "12/07 – 22/07/2026", board: "إفطار", double: "9,300", triple: "12,200" },
          ]},
          { name: "بورتو مارينا", periods: [
            { period: "01/07 – 15/07/2026", board: "نصف إقامة", double: "8,600", triple: "12,650" },
            { period: "16/07 – 31/07/2026", board: "نصف إقامة", double: "11,900", triple: "17,600" },
            { period: "01/08 – 31/08/2026", board: "نصف إقامة", double: "13,400", triple: "19,850" },
          ]},
        ],
      },
    ],
  },
];

export type HoneymoonDeal = {
  hotel: string;
  region: string;
  periods: { period: string; board?: string; price: string; unit: string }[];
  perks: string[];
};

export const honeymoonDeals: HoneymoonDeal[] = [
  {
    hotel: "الباتروس رويال موديرنا", region: "شرم الشيخ",
    periods: [
      { period: "01/07 – 10/07/2026", board: "إقامة كاملة", price: "11,550", unit: "للغرفة/الليلة" },
      { period: "11/07 – 31/08/2026", board: "إقامة كاملة", price: "12,400", unit: "للغرفة/الليلة" },
      { period: "01/09 – 31/10/2026", board: "إقامة كاملة", price: "11,125", unit: "للغرفة/الليلة" },
    ],
    perks: ["ترقية سي فيو", "سلة فواكه", "تورتة للعروسين", "ميني بار", "إفطار في الغرفة", "عشاء شموع", "خصم 20٪ مساج"],
  },
  {
    hotel: "ليدو شرم", region: "شرم الشيخ",
    periods: [
      { period: "01/07 – 14/07/2026", price: "5,900", unit: "للغرفة/الليلة" },
      { period: "15/07 – 31/10/2026", price: "7,160", unit: "للغرفة/الليلة" },
    ],
    perks: ["سلة فواكه", "عشاء رومانسي على البحر", "إفطار في الغرفة", "نقل مجاني", "خصم 10٪ مساج"],
  },
  {
    hotel: "الباتروس رويال جراند", region: "شرم الشيخ",
    periods: [
      { period: "01/07 – 20/07/2026", board: "إقامة كاملة", price: "9,425", unit: "للغرفة/الليلة" },
      { period: "21/07 – 31/08/2026", board: "إقامة كاملة", price: "11,125", unit: "للغرفة/الليلة" },
    ],
    perks: ["ترقية سي فيو", "سلة فواكه", "تورتة", "ميني بار", "عشاء شموع", "خصم 20٪ مساج"],
  },
  {
    hotel: "تروبيتال سهل حشيش", region: "سهل حشيش",
    periods: [
      { period: "01/07 – 31/10/2026", board: "إقامة كاملة", price: "16,200", unit: "للغرفة/الليلة" },
    ],
    perks: ["ترقية سي فيو", "سلة فواكه", "تورتة", "عشاء رومانسي فاخر", "معاملة VIP", "ديكور شهر العسل"],
  },
  {
    hotel: "سويس ان الغردقة", region: "الغردقة",
    periods: [{ period: "11/07 – 31/10/2026", board: "إقامة كاملة", price: "13,100", unit: "للغرفة/الليلة" }],
    perks: ["ترقية سي فيو", "عشاء رومانسي", "ديكور شهر العسل", "سلة فواكه", "نقل مجاني", "خصم 25٪ مساج"],
  },
  {
    hotel: "الباتروس سي وورلد", region: "مرسى علم",
    periods: [
      { period: "01/07 – 10/07/2026", price: "10,400", unit: "للغرفة/الليلة" },
      { period: "11/07 – 12/09/2026", price: "11,300", unit: "للغرفة/الليلة" },
      { period: "13/09 – 31/10/2026", price: "9,500", unit: "للغرفة/الليلة" },
    ],
    perks: ["ترقية مجانية", "ديكور خاص", "سلة فواكه", "تورتة", "خصم 50٪ سبا وسفاري وتصوير"],
  },
  {
    hotel: "الباتروس سيتادل", region: "الغردقة",
    periods: [
      { period: "06/07 – 09/07/2026", board: "إقامة كاملة", price: "12,400", unit: "للغرفة/الليلة" },
      { period: "10/07 – 14/07/2026", board: "إقامة كاملة", price: "11,550", unit: "للغرفة/الليلة" },
      { period: "15/07 – 31/08/2026", board: "إقامة كاملة", price: "12,400", unit: "للغرفة/الليلة" },
      { period: "01/09 – 31/10/2026", board: "إقامة كاملة", price: "11,550", unit: "للغرفة/الليلة" },
    ],
    perks: ["سلة فواكه وتورتة", "إفطار في الغرفة", "غرفة سي فيو", "ميني بار", "خصم 25٪ مساج"],
  },
  {
    hotel: "كونتنتال", region: "الغردقة",
    periods: [{ period: "01/07 – 31/10/2026", board: "إقامة كاملة", price: "14,600", unit: "للغرفة/الليلة" }],
    perks: ["ترقية سي فيو", "سلة فواكه", "معاملة VIP", "ديكور شهر العسل", "عشاء رومانسي في AL DENTE", "ميني بار", "خصم 20٪ مساج"],
  },
  {
    hotel: "كايسول رومانس", region: "سهل حشيش",
    periods: [
      { period: "01/07 – 31/07/2026", board: "إقامة كاملة", price: "14,250", unit: "للغرفة/الليلة" },
      { period: "01/08 – 31/08/2026", board: "إقامة كاملة", price: "13,350", unit: "للغرفة/الليلة" },
    ],
    perks: ["ترقية سي فيو", "سلة فواكه وتورتة", "عشاء رومانسي فاخر", "معاملة VIP", "ديكور شهر العسل", "نقل مجاني", "4 مطاعم عالمية مجانية"],
  },
  {
    hotel: "جاز كوستا", region: "مرسى علم",
    periods: [
      { period: "01/07 – 31/08/2026", price: "25,700", unit: "للغرفة/الليلة" },
      { period: "01/09 – 31/10/2026", price: "20,300", unit: "للباكدج" },
    ],
    perks: ["مشروبات ترحيبية", "تجهيز VIP", "ترقية مع خصم 20٪", "إفطار ملكي في البلكونة", "3 عشاء A La Carte", "خصم 15٪ سبا", "تورتة"],
  },
  {
    hotel: "ساتايا", region: "مرسى علم",
    periods: [{ period: "01/07 – 31/10/2026", price: "9,050", unit: "للغرفة/الليلة" }],
    perks: ["ترقية سي فيو", "إفطار في الغرفة", "تورتة", "نقل مجاني", "خصم 25٪ مساج"],
  },
  {
    hotel: "هابي لايف", region: "دهب",
    periods: [{ period: "01/07 – 30/09/2026", price: "5,000", unit: "للغرفة/الليلة" }],
    perks: ["ترقية سي فيو", "إفطار في الغرفة", "تورتة", "نقل مجاني", "خصم 25٪ مساج"],
  },
  {
    hotel: "تروبيتال دهب اوسيس", region: "دهب",
    periods: [
      { period: "01/07 – 20/09/2026", price: "5,900", unit: "للغرفة/الليلة" },
      { period: "21/09 – 31/10/2026", price: "5,180", unit: "للباكدج" },
    ],
    perks: ["ترقية سي فيو", "تورتة", "سلة فواكه", "ديكور هاني مون", "نقل مجاني"],
  },
  {
    hotel: "بريمير لي ريف", region: "الغردقة",
    periods: [{ period: "01/07 – 31/07/2026", board: "إقامة كاملة", price: "14,000", unit: "للغرفة/الليلة" }],
    perks: ["ترقية سي فيو", "سلة فواكه وتورتة", "عشاء رومانسي فاخر", "معاملة VIP", "تدليك قدم مجاني", "خصم 25٪ مساج", "دخول صالة VIP", "مسبح سكاي وساونا وجاكوزي"],
  },
];

export const CONTACT_PHONE = "+20 12 25279820";
export const CONTACT_WHATSAPP = "201225279820";
