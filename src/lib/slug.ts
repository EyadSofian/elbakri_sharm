/**
 * Slug helpers. Hotel/destination slugs come from the authoritative map in
 * `hotel-names.ts`; `slugify` is only a fallback for incidental Latin strings.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Parse an Arabic/Latin price string like "5,900" -> 5900. */
export function parsePrice(input?: string): number | null {
  if (!input) return null;
  const n = Number(input.replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Format an integer price back to grouped form: 5900 -> "5,900". */
export function formatPrice(n: number): string {
  return n.toLocaleString("en-US");
}
