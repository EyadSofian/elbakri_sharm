/**
 * EasyKash Direct Pay (hosted) integration.
 * Docs: https://easykash.gitbook.io/easykash-apis-documentation
 *
 * SERVER-ONLY in practice: only imported by /api/checkout route handlers.
 * No `import "server-only"` so the pure signature helpers stay unit-testable.
 * Secrets are read from env at call time — never hard-coded, never sent to the
 * browser.
 */
import crypto from "node:crypto";

const PAY_ENDPOINT = "https://back.easykash.net/api/directpayv1/pay";

export type EasyKashCurrency = "EGP" | "USD" | "SAR" | "EUR" | "GBP" | "QAR" | "AED" | "KWD";

/** Payments are live only when BOTH the API key and the HMAC secret are set. */
export function isEasyKashConfigured(): boolean {
  return Boolean(process.env.EASYKASH_API_KEY && process.env.EASYKASH_HMAC_SECRET);
}

/** Deposit percentage charged online (env EASYKASH_DEPOSIT_PERCENT, default 100). */
export function depositPercent(): number {
  return Math.min(100, Math.max(1, Number(process.env.EASYKASH_DEPOSIT_PERCENT) || 100));
}

/** Amount (EGP) to charge online for a booking = starting price × deposit%. */
export function bookingAmountEGP(minPrice: number): number {
  return Math.round(minPrice * depositPercent()) / 100;
}

export type CreatePaymentInput = {
  amount: number;
  currency?: EasyKashCurrency;
  name: string;
  email: string;
  mobile: string;
  /** Absolute URL EasyKash returns the buyer to after payment. */
  redirectUrl: string;
  /** Merchant order reference — MUST be a number per the API. */
  customerReference: number;
  /** Optional allow-list of EasyKash payment-option ids; omit to use dashboard defaults. */
  paymentOptions?: number[];
};

/**
 * Create a hosted payment. Returns the EasyKash URL to redirect the buyer to.
 * The API key is passed in the `authorization` header (per the Pay API docs).
 */
export async function createPayment(input: CreatePaymentInput): Promise<{ redirectUrl: string }> {
  const apiKey = process.env.EASYKASH_API_KEY;
  if (!apiKey) throw new Error("EASYKASH_API_KEY is not configured");

  const payload: Record<string, unknown> = {
    amount: input.amount,
    currency: input.currency ?? "EGP",
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    redirectUrl: input.redirectUrl,
    customerReference: input.customerReference,
  };
  if (input.paymentOptions?.length) payload.paymentOptions = input.paymentOptions;

  const res = await fetch(PAY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", authorization: apiKey },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`EasyKash pay failed (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = (await res.json().catch(() => null)) as { redirectUrl?: string } | null;
  if (!data?.redirectUrl) throw new Error("EasyKash response missing redirectUrl");
  return { redirectUrl: data.redirectUrl };
}

/**
 * Fields signed by EasyKash, concatenated in THIS order with NO separator,
 * then HMAC-SHA512 (hex) with the HMAC secret. Compared against `signatureHash`.
 */
export const SIGNED_FIELDS = [
  "ProductCode",
  "Amount",
  "ProductType",
  "PaymentMethod",
  "status",
  "easykashRef",
  "customerReference",
] as const;

export type EasyKashCallbackFields = Record<string, string | undefined>;

export function computeSignature(fields: EasyKashCallbackFields, secret: string): string {
  const dataStr = SIGNED_FIELDS.map((k) => fields[k] ?? "").join("");
  return crypto.createHmac("sha512", secret).update(dataStr).digest("hex");
}

/** Constant-time verification of an EasyKash callback's `signatureHash`. */
export function verifyCallbackSignature(
  fields: EasyKashCallbackFields,
  secret: string | undefined = process.env.EASYKASH_HMAC_SECRET,
): boolean {
  if (!secret) return false;
  const provided = fields.signatureHash;
  if (!provided) return false;
  const expected = computeSignature(fields, secret);
  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(expected, "hex");
    b = Buffer.from(String(provided), "hex");
  } catch {
    return false;
  }
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
