import { test, expect, type Locator } from "@playwright/test";

async function expectTouchTarget(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box, "touch target should be visible").not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
}

test("mobile conversion actions sit in reachable, valid touch targets", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-specific ergonomics");
  await page.goto("/");

  await expectTouchTarget(page.getByRole("button", { name: "فتح القائمة" }));
  await expectTouchTarget(page.getByRole("link", { name: "شاهد العروض والأسعار" }));

  const dock = page.locator("div.fixed.inset-x-0.bottom-0");
  await expect(dock).toBeVisible();
  await expectTouchTarget(dock.getByRole("link", { name: "احجز عبر واتساب" }));
  await expectTouchTarget(dock.getByRole("link", { name: "اتصال مباشر" }));

  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(noOverflow).toBeTruthy();
});

test("mobile package controls and full hotel cards are easy to tap", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-specific ergonomics");
  await page.goto("/destinations/sharm-el-sheikh");

  await expectTouchTarget(page.getByRole("tab").first());
  const hotelLink = page.getByRole("link", { name: /فالكون نعمة ستار/ });
  await hotelLink.scrollIntoViewIfNeeded();
  const box = await hotelLink.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThan(180);
  expect(box!.width).toBeGreaterThan(300);

  const noOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  expect(noOverflow).toBeTruthy();
});
