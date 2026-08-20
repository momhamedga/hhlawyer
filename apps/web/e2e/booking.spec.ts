import { expect, test } from "@playwright/test";

test("submits a real pending consultation through the booking form", async ({ page }) => {
  await page.goto("/consultation");
  await page.getByRole("button", { name: "Criminal Law" }).click();
  await page.locator("button[aria-label^='20']").last().click();
  await page.getByRole("button", { name: "المتابعة للوقت" }).click();
  await page.getByRole("button", { name: "09:00 AM" }).click();
  await page.getByLabel("الاسم الكامل").fill("PHASE3B_E2E_BROWSER");
  await page.getByLabel("البريد الإلكتروني").fill("browser.e2e@example.test");
  await page.getByLabel("رقم الهاتف").fill("+971501234567");
  await page.getByRole("button", { name: "إرسال طلب الاستشارة" }).click();
  await expect(page.getByText("تم استلام طلب الاستشارة بنجاح.")).toBeVisible();
  await expect(page.getByText(/^CONS-\d{4}-\d{6}$/)).toBeVisible();
});
