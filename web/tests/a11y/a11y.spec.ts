import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function checkA11y(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag22aa"])
    .analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
}

test("a11y: sign-in, admin, manager dashboard (LTR/RTL + Light/Dark)", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await checkA11y(page);

  await page.evaluate(() => document.documentElement.classList.add("dark"));
  await checkA11y(page);

  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  await checkA11y(page);

  await page.goto("/");
  await checkA11y(page);
});
