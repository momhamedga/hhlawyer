import { expect, test, type Page } from "@playwright/test";
import { formatConsultationTime, formatLocaleDate, formatLocaleDateTime } from "../src/i18n/format";
import type { Locale } from "../src/i18n/locale";
import { serviceContent } from "../src/i18n/service-content";
import { consultationsContent } from "../src/features/admin/consultations/consultations-content";

const service = {
  id: "c123456789012345678901234",
  slug: "commercial",
  name: "Commercial and Corporate Law",
  description: "Canonical API description",
  sortOrder: 0,
};
const consultation = {
  id: "localization-consultation",
  referenceNumber: "CONS-2099-000777",
  name: "Localization Client",
  email: "localization@example.test",
  phone: "+971501234567",
  preferredDate: "2099-12-31T12:00:00.000Z",
  preferredTime: "10:30 AM",
  status: "PENDING",
  createdAt: "2099-12-20T08:15:00.000Z",
  updatedAt: "2099-12-21T09:30:00.000Z",
  message: "Controlled localization proof.",
  service: { id: service.id, slug: service.slug, name: service.name },
};

async function mockAdminConsultations(page: Page) {
  await page.route("**/api/v1/auth/me", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { user: { id: "admin-localization", name: "Localization Admin", email: "admin@example.test", role: "ADMIN" } } }) }));
  await page.route("**/api/v1/services", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: [service] }) }));
  await page.route("**/api/v1/admin/consultations**", (route) => {
    const data = route.request().url().includes("/localization-consultation")
      ? consultation
      : { items: [consultation], pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } };
    return route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data }) });
  });
}

for (const locale of ["ar", "en"] as const satisfies readonly Locale[]) {
  test(`Admin consultation list and detail localize dynamic values for ${locale}`, async ({ page }) => {
    await mockAdminConsultations(page);
    const localizedService = serviceContent[locale].commercial.title;
    const otherService = serviceContent[locale === "ar" ? "en" : "ar"].commercial.title;
    const localizedTime = formatConsultationTime(consultation.preferredTime, locale);
    const copy = consultationsContent[locale];

    await page.goto(`/${locale}/admin/consultations`, { waitUntil: "domcontentloaded" });
    const row = page.getByText(consultation.referenceNumber, { exact: true }).locator("xpath=ancestor::tr");
    await expect(row).toContainText(localizedService);
    await expect(row).toContainText(localizedTime);
    await expect(row).toContainText(formatLocaleDate(consultation.preferredDate, locale));
    await expect(row).toContainText(formatLocaleDateTime(consultation.createdAt, locale));
    await expect(row).not.toContainText(otherService);
    await expect(page.getByLabel(copy.service).locator("option", { hasText: localizedService })).toHaveCount(1);

    await row.getByRole("link", { name: copy.viewDetails }).click();
    await expect(page).toHaveURL(new RegExp(`/${locale}/admin/consultations/${consultation.id}$`));
    await expect(page.getByRole("heading", { name: copy.detailTitle, level: 1 })).toBeVisible();
    const main = page.locator("main");
    await expect(main).toContainText(localizedService);
    await expect(main).toContainText(localizedTime);
    await expect(main).toContainText(formatLocaleDate(consultation.preferredDate, locale));
    await expect(main).toContainText(formatLocaleDateTime(consultation.createdAt, locale));
    await expect(main).toContainText(formatLocaleDateTime(consultation.updatedAt, locale));
    await expect(main).not.toContainText(otherService);
  });
}
