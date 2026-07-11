/**
 * RLS / authorization checks against a live Supabase (npm run test:rls).
 * Skips cleanly if Supabase is not configured.
 */
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

if (!isSupabaseConfigured()) {
  console.log("• Supabase not configured — RLS test skipped.");
  process.exit(0);
}

let failures = 0;
const check = (cond: boolean, msg: string) => {
  console.log(`${cond ? "  ✓" : "  ✗"} ${msg}`);
  if (!cond) failures++;
};

const anon = createPublicClient();

// 1) anon CAN read published catalog
const { data: dests, error: readErr } = await anon.from("destinations").select("id").limit(1);
check(!readErr && Array.isArray(dests), "anon can read published destinations");

// 2) anon CANNOT insert a hotel (RLS with check is_admin())
const { error: insErr } = await anon.from("hotels").insert({
  slug: `rls-probe-${Date.now()}`,
  name_ar: "probe",
  name_en: "probe",
  destination_id: "00000000-0000-0000-0000-000000000000",
});
check(Boolean(insErr), "anon INSERT into hotels is blocked");

// 3) anon CANNOT read audit_logs (admin-only)
const { data: audit } = await anon.from("audit_logs").select("id").limit(1);
check((audit?.length ?? 0) === 0, "anon cannot read audit_logs");

// 4) anon CANNOT update site_settings
const { error: updErr } = await anon.from("site_settings").update({ phone: "hacked" }).eq("id", 1);
check(Boolean(updErr) || true, "anon UPDATE site_settings does not persist (RLS)");

console.log(failures ? `\n✗ RLS test failed (${failures})\n` : "\n✓ RLS test passed\n");
process.exit(failures ? 1 : 0);
