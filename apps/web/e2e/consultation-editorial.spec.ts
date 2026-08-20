import { expect, test } from "@playwright/test";
import { messages } from "../src/i18n/messages";
import { serviceContent } from "../src/i18n/service-content";

const service = { id: "c123456789012345678901234", slug: "criminal", name: "Criminal Law", description: "Canonical API description", sortOrder: 0 };
const services = Object.entries(serviceContent.en).map(([slug, content], index) => ({
  id: `c12345678901234567890123${index}`,
  slug,
  name: content.title,
  description: `Canonical ${slug} API description`,
  sortOrder: index,
}));
const surfaces = ["consultation-hero", "consultation-intake", "consultation-form-surface", "consultation-context", "consultation-next-steps", "consultation-reassurance"];

async function mockConsultationApi(page: import("@playwright/test").Page, post: "success" | "validation" = "success") {
  await page.route("**/api/v1/services", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: [service] }) }));
  await page.route("**/api/v1/consultations", async (route) => {
    if (post === "success") {
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { referenceNumber: "CONS-2099-000001", status: "PENDING", createdAt: "2099-01-01T00:00:00.000Z" } }) });
      return;
    }
    await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: { email: ["Enter a valid email address."] } } }) });
  });
}

async function selectTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function completeToDetails(page: import("@playwright/test").Page, locale: "ar" | "en") {
  await page.getByTestId("consultation-step-service").getByRole("button").click();
  await expect(page.getByTestId("consultation-step-date")).toBeVisible();
  await page.getByTestId("consultation-step-date").locator('button[aria-label^="20"]').first().click();
  await page.getByRole("button", { name: locale === "en" ? "Continue to time" : "المتابعة للوقت" }).click();
  await expect(page.getByTestId("consultation-step-time")).toBeVisible();
  await page.getByRole("button", { name: "09:00 AM" }).click();
  await expect(page.getByTestId("consultation-details-form")).toBeVisible();
}

async function fillValidDetails(page: import("@playwright/test").Page, locale: "ar" | "en") {
  await page.getByLabel(locale === "en" ? "Full name" : "الاسم الكامل").fill("Consultation Editorial Test");
  await page.getByLabel(locale === "en" ? "Email address" : "البريد الإلكتروني").fill("consultation.editorial@example.test");
  await page.getByLabel(locale === "en" ? "Phone number" : "رقم الهاتف").fill("+971501234567");
}

async function expectNoOverflow(page: import("@playwright/test").Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("Consultation is bilingual, editorial, light-safe, and uses the preserved intake", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockConsultationApi(page);

  for (const locale of ["ar", "en"] as const) {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto(`/${locale}/consultation`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const testId of surfaces) await expect(page.getByTestId(testId)).toBeVisible();
    await expect(page.getByTestId("consultation-booking-system")).toBeVisible();
    await expect(page.getByTestId("consultation-step-service").getByRole("button")).toHaveCount(1);
    await expectNoOverflow(page);
    const mainText = await page.getByTestId("consultation-hero").locator("xpath=..").innerText();
    if (locale === "ar") expect(mainText).not.toMatch(/Legal consultation|Private handling|What happens next/);
    else expect(mainText).not.toMatch(/الاستشارة القانونية|تعامل خاص|ما الذي يحدث بعد ذلك/);
    for (const testId of surfaces) {
      const background = await page.getByTestId(testId).evaluate((element) => `${getComputedStyle(element).backgroundColor} ${getComputedStyle(element).backgroundImage}`);
      expect(background).not.toMatch(/33, 26, 21|30, 23, 19|21, 17, 14|13, 10, 9/);
    }
  }
  expect(errors).toEqual([]);
});

test("Consultation localizes dynamic API services and the selected summary without changing its serviceId payload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/v1/services", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: services }) }));

  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}/consultation`, { waitUntil: "domcontentloaded" });
    const serviceStep = page.getByTestId("consultation-step-service");
    await expect(serviceStep.getByRole("button")).toHaveCount(services.length);

    for (const item of services) {
      const expectedTitle = serviceContent[locale][item.slug as keyof typeof serviceContent.en].title;
      await expect(serviceStep).toContainText(expectedTitle);
      if (locale === "ar") await expect(serviceStep).not.toContainText(item.name);
    }

    const selected = services.find((item) => item.slug === "notary")!;
    const selectedTitle = serviceContent[locale].notary.title;
    await serviceStep.getByRole("button", { name: selectedTitle }).click();
    await page.getByTestId("consultation-step-date").locator('button[aria-label^="20"]').first().click();
    await page.getByTestId("consultation-step-date").getByRole("button").last().click();
    const timeStep = page.getByTestId("consultation-step-time");
    if (locale === "ar") await expect(timeStep).not.toContainText(/AM|PM/);
    await timeStep.getByRole("button").first().click();

    const summary = page.getByTestId("consultation-details-form").locator("div").first();
    await expect(summary).toContainText(selectedTitle);
    if (locale === "ar") {
      await expect(summary).not.toContainText(/AM|PM|202\d-/);
      await expect(summary).not.toContainText(selected.name);
    } else {
      await expect(summary).toContainText("09:00 AM");
    }
  }

  expect(errors).toEqual([]);
});

test("Consultation localizes the unavailable-services state", async ({ page }) => {
  await page.route("**/api/v1/services", (route) => route.abort("failed"));

  for (const locale of ["ar", "en"] as const) {
    await page.goto(`/${locale}/consultation`, { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("consultation-booking-system").getByRole("alert")).toHaveText(messages[locale].public.consultation.servicesError);
  }
});

test("Consultation does not silently expose an unmapped API service name in Arabic", async ({ page }) => {
  const unmappedService = { id: "c123456789012345678901299", slug: "future-service", name: "Future Service", description: "Future canonical description", sortOrder: 0 };
  await page.route("**/api/v1/services", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: [unmappedService] }) }));

  await page.goto("/ar/consultation", { waitUntil: "domcontentloaded" });
  const serviceStep = page.getByTestId("consultation-step-service");
  await expect(serviceStep).toContainText(messages.ar.errors.SERVICE_NOT_FOUND);
  await expect(serviceStep).not.toContainText(unmappedService.name);

  await page.goto("/en/consultation", { waitUntil: "domcontentloaded" });
  await expect(page.getByTestId("consultation-step-service")).toContainText(messages.en.errors.SERVICE_NOT_FOUND);
});

test("Consultation preserves validation, request payload, loading, and inline success without a real submission", async ({ page }) => {
  const errors: string[] = [];
  const requests: unknown[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/v1/services", (route) => route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: [service] }) }));
  await page.route("**/api/v1/consultations", async (route) => {
    requests.push(route.request().postDataJSON());
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ success: true, data: { referenceNumber: "CONS-2099-000001", status: "PENDING", createdAt: "2099-01-01T00:00:00.000Z" } }) });
  });
  await page.goto("/en/consultation", { waitUntil: "domcontentloaded" });
  await completeToDetails(page, "en");

  await page.getByRole("button", { name: "Send consultation request" }).click();
  await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
  expect(requests).toHaveLength(0);

  await fillValidDetails(page, "en");
  await page.getByRole("button", { name: "Send consultation request" }).click();
  await expect(page.getByRole("button", { name: "Sending request..." })).toBeDisabled();
  await expect(page.getByTestId("consultation-booking-success")).toBeVisible();
  await expect(page.getByText("CONS-2099-000001")).toBeVisible();
  expect(requests).toHaveLength(1);
  const payload = requests[0] as Record<string, unknown>;
  expect(payload).toMatchObject({ serviceId: service.id, name: "Consultation Editorial Test", email: "consultation.editorial@example.test", phone: "+971501234567", preferredDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/), preferredTime: "09:00 AM", website: "" });
  expect(payload).not.toHaveProperty("message");
  expect(errors).toEqual([]);
});

test("Consultation renders its existing API validation error without a real submission", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockConsultationApi(page, "validation");
  await page.goto("/en/consultation", { waitUntil: "domcontentloaded" });
  await completeToDetails(page, "en");
  await fillValidDetails(page, "en");
  await page.getByRole("button", { name: "Send consultation request" }).click();
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a valid email address.")).toHaveAttribute("role", "alert");
  expect(errors).toEqual([]);
});

test("Consultation is responsive, reduced-motion safe, dark-compatible, and has production metadata", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockConsultationApi(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of ["ar", "en"] as const) {
    for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/consultation`, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("consultation-hero")).toBeVisible();
      await page.getByTestId("consultation-form-surface").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("consultation-booking-system")).toBeVisible();
      await expectNoOverflow(page);
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/consultation", { waitUntil: "domcontentloaded" });
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(page.getByTestId("consultation-next-steps")).toBeVisible();
  await page.goto("/ar/consultation", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/consultation");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/consultation");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/consultation");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://hhlawyer.ae/ar/consultation");
  expect(errors).toEqual([]);
});
