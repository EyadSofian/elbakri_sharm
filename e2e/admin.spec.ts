import { test, expect } from "@playwright/test";

const BASE = "/internal/elbakri-admin";
const HAS_SUPABASE = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const HAS_ADMIN = Boolean(process.env.E2E_ADMIN_EMAIL && process.env.E2E_ADMIN_PASSWORD);

test("admin is not linked from the public site", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(`a[href*="elbakri-admin"]`)).toHaveCount(0);
});

test("unauthenticated admin redirects to login", async ({ page }) => {
  await page.goto(BASE);
  await expect(page).toHaveURL(new RegExp(`${BASE}/login`));
  await expect(page.getByRole("heading", { name: "لوحة التحكم" })).toBeVisible();
});

// Full CRUD flow — requires a Supabase project, a seeded DB, and a test admin.
test.describe("authenticated admin", () => {
  test.skip(
    !HAS_SUPABASE || !HAS_ADMIN,
    "Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE keys, and E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD (seeded active admin).",
  );

  test("login → edit price → reflect publicly → add+publish+archive package → logout", async ({ page }) => {
    // Login
    await page.goto(`${BASE}/login`);
    await page.getByLabel("البريد الإلكتروني").fill(process.env.E2E_ADMIN_EMAIL!);
    await page.getByLabel("كلمة المرور").fill(process.env.E2E_ADMIN_PASSWORD!);
    await page.getByRole("button", { name: "تسجيل الدخول" }).click();
    await expect(page).toHaveURL(new RegExp(`${BASE}$`));

    // Edit a price on a known hotel, then verify it publicly
    await page.goto(`${BASE}/hotels/falcon-naama-star`);
    const dbl = page.locator('input[name="double_text"]').first();
    await dbl.fill("6,111");
    await page.getByRole("button", { name: /حفظ|تم/ }).first().click();
    await expect(page.getByText("تم").first()).toBeVisible();
    await page.goto("/hotels/falcon-naama-star");
    await expect(page.getByText("6,111").first()).toBeVisible();

    // Add a package, publish (default), verify publicly, then archive
    await page.goto(`${BASE}/packages`);
    await page.locator('select[name="destination_id"]').selectOption({ label: "شرم الشيخ" });
    await page.getByLabel("اسم الباقة").fill("باقة اختبار E2E");
    await page.getByRole("button", { name: /إضافة الباقة/ }).click();
    await expect(page.getByText("باقة اختبار E2E")).toBeVisible();

    await page.goto("/destinations/sharm-el-sheikh");
    await expect(page.getByRole("tab", { name: "باقة اختبار E2E" })).toBeVisible();

    await page.goto(`${BASE}/packages`);
    const row = page.locator("div", { hasText: "باقة اختبار E2E" }).last();
    await row.getByRole("button", { name: "أرشفة" }).click();
    await row.getByRole("button", { name: "نعم" }).click();

    // Logout
    await page.getByRole("button", { name: /تسجيل الخروج|خروج/ }).first().click();
    await expect(page).toHaveURL(new RegExp(`${BASE}/login`));
    // Access revoked
    await page.goto(BASE);
    await expect(page).toHaveURL(new RegExp(`${BASE}/login`));
  });
});
