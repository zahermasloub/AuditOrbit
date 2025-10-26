import { test, expect } from "@playwright/test";

const pages = ["/", "/admin", "/manager/engagements", "/auditor/tasks"];

test.describe("Visual snapshots — LTR/Light", () => {
  for (const p of pages) {
    test(`snapshot ${p}`, async ({ page }) => {
      await page.goto(p);
      await expect(page).toHaveScreenshot(`ltr-light${p.replace(/\W+/g, "_")}.png`, {
        fullPage: true,
        maxDiffPixels: 200,
      });
    });
  }
});

test.describe("Visual snapshots — RTL/Dark", () => {
  for (const p of pages) {
    test(`snapshot ${p}`, async ({ page }) => {
      await page.goto(p);
      await page.evaluate(() => {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        localStorage.setItem("dir", "rtl");
      });
      await page.reload();
      await expect(page).toHaveScreenshot(`rtl-dark${p.replace(/\W+/g, "_")}.png`, {
        fullPage: true,
        maxDiffPixels: 250,
      });
    });
  }
});
