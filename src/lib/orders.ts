import "server-only";
import { isSupabaseConfigured, SUPABASE_SERVICE_ROLE_KEY } from "@/lib/supabase/env";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Hotel } from "@/lib/catalog";

/**
 * Best-effort order persistence. Orders are stored only when Supabase +
 * the service-role key are configured; otherwise the payment still works
 * (EasyKash keeps its own record) and these calls are no-ops. Callers should
 * treat failures as non-fatal (`.catch(() => {})`).
 */
function canPersist(): boolean {
  return isSupabaseConfigured() && Boolean(SUPABASE_SERVICE_ROLE_KEY);
}

export async function createOrder(o: {
  reference: number;
  hotel: Hotel;
  amount: number;
  name: string;
  email: string;
  mobile: string;
  periodLabel?: string | null;
  occupancy?: string | null;
  adults?: number | null;
  children?: number | null;
  nights?: number | null;
  total?: number | null;
}): Promise<void> {
  if (!canPersist()) return;
  const db = createAdminClient();
  await db.from("orders").insert({
    reference: o.reference,
    hotel_slug: o.hotel.slug,
    hotel_name: o.hotel.nameAr,
    period_label: o.periodLabel ?? o.hotel.periods[0]?.period ?? null,
    amount: o.amount,
    currency: "EGP",
    customer_name: o.name,
    customer_email: o.email,
    customer_mobile: o.mobile,
    occupancy: o.occupancy ?? null,
    adults: o.adults ?? null,
    children: o.children ?? null,
    nights: o.nights ?? null,
    total_amount: o.total ?? null,
    status: "pending",
  });
}

export async function markOrderPaid(p: {
  reference: number;
  easykashRef: string | null;
  paymentMethod: string | null;
  productCode: string | null;
}): Promise<void> {
  if (!canPersist()) return;
  const db = createAdminClient();
  await db
    .from("orders")
    .update({
      status: "paid",
      easykash_ref: p.easykashRef,
      payment_method: p.paymentMethod,
      product_code: p.productCode,
      paid_at: new Date().toISOString(),
    })
    .eq("reference", p.reference);
}
