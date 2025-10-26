import { test, expect } from "@playwright/test";

test("login → manager wp/sampling edit flow", async ({ page }) => {
  await page.goto("/auth/sign-in");
  await page.getByLabel(/البريد|Email/i).fill("admin@example.com");
  await page.getByLabel(/كلمة المرور|Password/i).fill("Admin#2025");
  await page.getByRole("button", { name: /تسجيل|Sign in/i }).click();
  await expect(page).toHaveURL(/admin|manager/i);

  await page.goto("/manager/engagements");
  const row = page.getByRole("row").nth(1);
  const link = await row.getByRole("link").first();
  const href = await link.getAttribute("href");
  expect(href).toBeTruthy();

  await page.goto(`${href}/working-papers`);
  await page.getByText(/إجراءات|Actions/i).first();
  const edit = page.getByRole("button", { name: /Edit|تعديل/i }).first();
  if (await edit.isVisible()) {
    await edit.click();
    await page.getByLabel(/Objective|الهدف/i).fill("Updated via E2E");
    await page.getByRole("button", { name: /Save|حفظ/i }).click();
    await expect(
      page.locator("text=Saved").or(page.locator("text=تم الحفظ")).first(),
    ).toBeVisible({ timeout: 5000 });
  }

  await page.goto(`${href}/sampling`);
  await expect(page.locator("text=random").or(page.locator("text=عشوائي")).first()).toBeVisible();
  const edit2 = page.getByRole("button", { name: /Edit|تعديل/i }).first();
  if (await edit2.isVisible()) {
    await edit2.click();
    await page.getByLabel(/Size|الحجم/i).fill("9");
    await page.getByRole("button", { name: /Save|حفظ/i }).click();
    await expect(
      page.locator("text=Saved").or(page.locator("text=تم الحفظ")).first(),
    ).toBeVisible({ timeout: 5000 });
  }
});
