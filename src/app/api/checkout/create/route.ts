import { NextResponse } from "next/server";
import { z } from "zod";
import { getHotelBySlug } from "@/lib/data";
import { bookingAmountEGP, createPayment, isEasyKashConfigured } from "@/lib/easykash";
import { createOrder } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  hotelSlug: z.string().min(1).max(120),
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
  const { hotelSlug, name, email, mobile } = parsed.data;

  const hotel = await getHotelBySlug(hotelSlug);
  if (!hotel) return NextResponse.json({ error: "hotel_not_found" }, { status: 404 });
  if (hotel.minPrice == null || hotel.minPrice <= 0) {
    return NextResponse.json({ error: "no_price" }, { status: 409 });
  }

  // Amount is computed SERVER-SIDE from the catalog — never trust the client.
  const amount = bookingAmountEGP(hotel.minPrice);
  const reference = Date.now(); // unique numeric merchant reference

  const base = (process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin).replace(/\/$/, "");
  const redirectUrl = `${base}/checkout/success`;

  // Persist first (best-effort) so the callback can reconcile even if the buyer
  // never returns to the site.
  await createOrder({ reference, hotel, amount, name, email, mobile }).catch(() => {});

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
