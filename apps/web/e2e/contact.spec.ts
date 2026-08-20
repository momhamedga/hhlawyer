import { expect, test } from "@playwright/test";

test("submits a real contact message through the contact form", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("الاسم").fill("PHASE4_E2E_CONTACT");
  await page.getByLabel("البريد الإلكتروني").fill("contact.e2e@example.test");
  await page.getByLabel("الموضوع").fill("رسالة اختبار");
  await page.getByLabel("الرسالة").fill("هذه رسالة اختبار كاملة للتحقق من نموذج التواصل.");
  await page.getByRole("button", { name: "إرسال الرسالة" }).click();
  await expect(page.getByText("تم استلام رسالتك بنجاح.")).toBeVisible();
});
