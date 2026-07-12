import { test, expect } from "@playwright/test";

test("home renders hero and destinations", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("اختار فندقك بثقة");
  await expect(page.getByRole("link", { name: "شرم الشيخ" }).first()).toBeVisible();
});

test("analytics bootstrap Meta Pixel, Clarity and GTM", async ({ page }) => {
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(() => ({
        dataLayer: Array.isArray(window.dataLayer),
        fbq: typeof window.fbq === "function",
        clarity: typeof (window as Window & { clarity?: unknown }).clarity === "function",
      })),
    )
    .toEqual({ dataLayer: true, fbq: true, clarity: true });
});

test("destination: package tabs + hotel search filter", async ({ page }) => {
  await page.goto("/destinations/sharm-el-sheikh");
  await expect(page.getByRole("tab").first()).toBeVisible();
  const search = page.getByPlaceholder("ابحث عن فندق...");
  await search.fill("فالكون");
  await expect(page.getByRole("heading", { name: /فالكون/ }).first()).toBeVisible();
  await search.fill("لا يوجد هذا الفندق");
  await expect(page.getByText("لا توجد نتائج مطابقة.")).toBeVisible();
});

test("hotel detail: exact price + WhatsApp CTA", async ({ page }) => {
  await page.goto("/hotels/falcon-naama-star");
  await expect.poll(() => page.getByText("5,900").filter({ visible: true }).count()).toBeGreaterThan(0);
  await expect.poll(() => page.getByText("5,750").filter({ visible: true }).count()).toBeGreaterThan(0);
  const wa = page.getByRole("link", { name: /احجز الآن عبر واتساب/ });
  await expect(wa).toHaveAttribute("href", /wa\.me\/201225279820/);
});

test("legacy hotel URL 308-redirects to canonical slug", async ({ page }) => {
  await page.goto("/hotel/sharm/select/0");
  await expect(page).toHaveURL(/\/hotels\/falcon-naama-star$/);
});

test("legacy destination id redirects to canonical", async ({ page }) => {
  await page.goto("/destinations/sharm");
  await expect(page).toHaveURL(/\/destinations\/sharm-el-sheikh$/);
});

test("invalid route returns Arabic 404", async ({ page }) => {
  const res = await page.goto("/does-not-exist-xyz");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("الصفحة غير موجودة")).toBeVisible();
});

test("honeymoon: region filter and detail", async ({ page }) => {
  await page.goto("/honeymoon");
  await page.getByRole("button", { name: "دهب" }).click();
  await expect(page.getByRole("heading", { name: /هابي لايف/ })).toBeVisible();
  await page.getByRole("heading", { name: /هابي لايف/ }).click();
  await expect(page).toHaveURL(/\/honeymoon\//);
});
