import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PAGES = [
  "/",
  "/destinations/sharm-el-sheikh",
  "/hotels/falcon-naama-star",
  "/honeymoon",
  "/internal/elbakri-admin/login",
];

for (const path of PAGES) {
  test(`a11y (no serious/critical violations): ${path}`, async ({ page }, testInfo) => {
    // a11y is orientation-independent; run once (desktop project).
    test.skip(testInfo.project.name !== "desktop", "run on desktop only");
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    const serious = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      serious.map((v) => ({ id: v.id, help: v.help, nodes: v.nodes.length })),
    ).toEqual([]);
  });
}
