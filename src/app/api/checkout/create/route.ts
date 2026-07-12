import { NextResponse } from "next/server";
import { z } from "zod";
import { getHotelBySlug } from "@/lib/data";
import { bookingAmountEGP, createPayment, isEasyKashConfigured } from "@/lib/easykash";
import { computeBreakdown } from "@/lib/booking/pricing";
import { createOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  hotelSlug: z.string().min(1).max(120),
  periodIndex: z.coerce.number().int().min(0).max(60),
  occupancy: z.enum(["double", "triple"]),
  adults: z.coerce.number().int().min(1).max(30),
  children: z.coerce.number().int().min(0).max(30),
  nights: z.coerce.number().int().min(1).max(60),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  mobile: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,19}$/, "رقم هاتف غير صالح"),
});

export async function POST(req: Request) {
  if (!isEasyKashConfigured()) {
    return NextResponse.json({ error: "payments_disabled" }, { status: 503 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "validation", details: parsed.error.flatten() }, { status: 422 });
  }
  const { hotelSlug, periodIndex, occupancy, adults, children, nights, name, email, mobile } =
    parsed.data;

  const hotel = await getHotelBySlug(hotelSlug);
  if (!hotel) return NextResponse.json({ error: "hotel_not_found" }, { status: 404 });
  if (periodIndex >= hotel.periods.length) {
    return NextResponse.json({ error: "bad_period" }, { status: 422 });
  }

  // Authoritative price — recomputed SERVER-SIDE from the catalog; the client's
  // number is only a preview and is never trusted.
  const breakdown = computeBreakdown(hotel.periods, {
    periodIndex,
    occupancy,
    adults,
    children,
    nights,
  });
  if (!breakdown.computable || breakdown.total <= 0) {
    return NextResponse.json({ error: "no_price" }, { status: 409 });
  }

  // Deposit (or full) amount actually charged online.
  const amount = bookingAmountEGP(breakdown.total);
  const reference = Date.now(); // unique numeric merchant reference
  const period = hotel.periods[periodIndex];

  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const redirectUrl = `${base}/checkout/success`;

  // Persist first (best-effort) so the callback can reconcile even if the buyer
  // never returns to the site.
  await createOrder({
    reference,
    hotel,
    amount,
    name,
    email,
    mobile,
    periodLabel: period?.period ?? null,
    occupancy,
    adults: breakdown.adults,
    children: breakdown.children,
    nights: breakdown.isPerNight ? breakdown.nightsCharged : (period?.nights ?? null),
    total: breakdown.total,
  }).catch(() => {});

  try {
    const { redirectUrl: payUrl } = await createPayment({
      amount,
      currency: "EGP",
      name,
      email,
      mobile,
      redirectUrl,
      customerReference: reference,
    });
    return NextResponse.json({ redirectUrl: payUrl, reference });
  } catch {
    return NextResponse.json(
      { error: "gateway_error", message: "تعذّر بدء الدفع حاليًا. برجاء المحاولة لاحقًا أو الحجز عبر واتساب." },
      { status: 502 },
    );
  }
}
