import { NextResponse } from "next/server";
import { verifyCallbackSignature, type EasyKashCallbackFields } from "@/lib/easykash";
import { markOrderPaid } from "@/lib/orders";

// EasyKash calls this URL (configured in Integration Settings) after payment.
// The docs describe a GET callback; we also accept POST (JSON/form) defensively.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(fields: EasyKashCallbackFields) {
  if (!verifyCallbackSignature(fields)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }
  if (fields.status === "PAID" && fields.customerReference) {
    const reference = Number(fields.customerReference);
    if (Number.isFinite(reference)) {
      await markOrderPaid({
        reference,
        easykashRef: fields.easykashRef ?? null,
        paymentMethod: fields.PaymentMethod ?? null,
        productCode: fields.ProductCode ?? null,
      }).catch(() => {});
    }
  }
  return NextResponse.json({ received: true });
}

export async function GET(req: Request) {
  const fields: EasyKashCallbackFields = {};
  new URL(req.url).searchParams.forEach((v, k) => {
    fields[k] = v;
  });
  return handle(fields);
}

export async function POST(req: Request) {
  const fields: EasyKashCallbackFields = {};
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      Object.assign(fields, await req.json());
    } else {
      (await req.formData()).forEach((v, k) => {
        fields[k] = String(v);
      });
    }
  } catch {
    return NextResponse.json({ error: "bad_body" }, { status: 400 });
  }
  return handle(fields);
}
