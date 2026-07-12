import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { computeSignature, verifyCallbackSignature, SIGNED_FIELDS } from "@/lib/easykash";

/**
 * Locks the EasyKash HMAC contract: field order + no separator + SHA512 hex.
 * Concatenation example from the docs:
 *   "EDV447111.00Direct PayCash Through FawryPAID2911105009TEST11111"
 */
const SAMPLE = {
  ProductCode: "EDV4471",
  Amount: "11.00",
  ProductType: "Direct Pay",
  PaymentMethod: "Cash Through Fawry",
  status: "PAID",
  easykashRef: "2911105009",
  customerReference: "TEST11111",
};
const EXPECTED_CONCAT = "EDV447111.00Direct PayCash Through FawryPAID2911105009TEST11111";
const SECRET = "test_hmac_secret";

describe("easykash signature", () => {
  it("concatenates the signed fields in the documented order with no separator", () => {
    const built = SIGNED_FIELDS.map((k) => (SAMPLE as Record<string, string>)[k]).join("");
    expect(built).toBe(EXPECTED_CONCAT);
  });

  it("computes HMAC-SHA512 hex over the concatenated string", () => {
    const expected = crypto.createHmac("sha512", SECRET).update(EXPECTED_CONCAT).digest("hex");
    expect(computeSignature(SAMPLE, SECRET)).toBe(expected);
  });

  it("verifies a correct signatureHash and rejects a tampered one", () => {
    const good = computeSignature(SAMPLE, SECRET);
    expect(verifyCallbackSignature({ ...SAMPLE, signatureHash: good }, SECRET)).toBe(true);
    expect(verifyCallbackSignature({ ...SAMPLE, signatureHash: good }, "wrong_secret")).toBe(false);
    expect(
      verifyCallbackSignature({ ...SAMPLE, Amount: "9999.00", signatureHash: good }, SECRET),
    ).toBe(false);
    expect(verifyCallbackSignature({ ...SAMPLE, signatureHash: "deadbeef" }, SECRET)).toBe(false);
  });
});
