import { z } from "zod";

/**
 * Zod schemas mirroring the canonical business-data shapes in
 * `src/data/packages.source.ts`. Used by `validate:catalog` and the parity
 * tests — NOT at request time (no runtime validation cost in pages).
 */

const childPolicyRuleSchema = z.object({
  childNumberFrom: z.number().int().min(1),
  childNumberTo: z.number().int().min(1),
  ageFrom: z.number().min(0),
  ageTo: z.number().max(17.99),
  pricingType: z.enum(["free", "fixed", "percent_adult", "adult_rate", "manual"]),
  value: z.number().optional(),
  bedType: z.enum(["sharing", "extra_bed", "any"]),
  notes: z.string().optional(),
});

const childPolicySchema = z.object({
  code: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  minAdults: z.number().int().min(1),
  maxChildren: z.number().int().min(0),
  rules: z.array(childPolicyRuleSchema),
  requiresManualConfirmation: z.boolean(),
  legacy: z.boolean().optional(),
});

export const pricePeriodSchema = z.object({
  period: z.string().min(1),
  board: z.string().optional(),
  double: z.string().optional(),
  triple: z.string().optional(),
  price: z.string().optional(),
  perks: z.string().optional(),
  // Live-rate enrichment (optional; absent in the static seed).
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  nights: z.number().optional(),
  pricingBasis: z.string().optional(),
  adultPrice: z.number().optional(),
  childPrice: z.number().optional(),
  childAgeFrom: z.number().optional(),
  childAgeTo: z.number().optional(),
  childPolicy: childPolicySchema.optional(),
  childPolicyByRoom: z.object({
    single: childPolicySchema.optional(),
    double: childPolicySchema.optional(),
    triple: childPolicySchema.optional(),
  }).optional(),
  currency: z.string().optional(),
});

export const hotelSchema = z.object({
  name: z.string().min(1),
  location: z.string().optional(),
  periods: z.array(pricePeriodSchema).min(1),
});

export const priceUnitSchema = z.enum([
  "per_person_trip",
  "per_person_night",
  "per_room_night",
  "per_room_trip",
]);

export const packageCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  note: z.string().optional(),
  priceUnit: priceUnitSchema,
  hotels: z.array(hotelSchema).min(1),
});

export const destinationSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tagline: z.string().min(1),
  image: z.string().min(1),
  categories: z.array(packageCategorySchema).min(1),
});

export const honeymoonPeriodSchema = z.object({
  period: z.string().min(1),
  board: z.string().optional(),
  price: z.string().min(1),
  unit: z.string().min(1),
});

export const honeymoonDealSchema = z.object({
  hotel: z.string().min(1),
  region: z.string().min(1),
  periods: z.array(honeymoonPeriodSchema).min(1),
  perks: z.array(z.string().min(1)).min(1),
});

export const destinationsSchema = z.array(destinationSchema);
export const honeymoonDealsSchema = z.array(honeymoonDealSchema);
