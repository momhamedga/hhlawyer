import { expect, test } from "@playwright/test";

const surfaces = ["contact-hero", "contact-information", "contact-intake", "contact-form-surface", "contact-context", "contact-consultation-alternative"];

async function mockContactApi(page: import("@playwright/test").Page, mode: "success" | "validation" = "success") {
  await page.route("**/api/v1/contact", async (route) => {
    if (mode === "success") {
      await new Promise((resolve) => setTimeout(resolve, 150));
      await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, data: { status: "received", createdAt: "2099-01-01T00:00:00.000Z" } }) });
      return;
    }
    await route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ success: false, error: { code: "VALIDATION_ERROR", message: "Please correct the highlighted fields.", fields: { email: ["Enter a valid email address."] } } }) });
  });
}

async function selectTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.getByTestId("public-theme-trigger").click();
  await page.getByTestId(`public-theme-option-${theme}`).click();
}

async function fillValidForm(page: import("@playwright/test").Page, locale: "ar" | "en") {
  await page.getByLabel(locale === "en" ? "Name" : "الاسم").fill("Contact Editorial Test");
  await page.getByLabel(locale === "en" ? "Email address" : "البريد الإلكتروني").fill("contact.editorial@example.test");
  await page.getByLabel(locale === "en" ? "Subject" : "الموضوع").fill(locale === "en" ? "General legal question" : "سؤال قانوني عام");
  await page.getByLabel(locale === "en" ? "Message" : "الرسالة").fill(locale === "en" ? "This is a complete test message for the direct contact form." : "هذه رسالة اختبار كاملة لنموذج التواصل المباشر.");
}

async function expectNoOverflow(page: import("@playwright/test").Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

type Box = { x: number; y: number; width: number; height: number };

function intersects(first: Box, second: Box) {
  return first.x < second.x + second.width && first.x + first.width > second.x && first.y < second.y + second.height && first.y + first.height > second.y;
}

function isInside(inner: Box, outer: Box) {
  const tolerance = 1;
  return inner.x >= outer.x - tolerance && inner.y >= outer.y - tolerance && inner.x + inner.width <= outer.x + outer.width + tolerance && inner.y + inner.height <= outer.y + outer.height + tolerance;
}

async function expectContactRowsToBeStructurallySound(page: import("@playwright/test").Page) {
  for (const id of ["phone", "email", "location"] as const) {
    const row = page.getByTestId(`contact-row-${id}`);
    const [rowBox, numberBox, iconBox, labelBox, valueBox, arrowBox] = await Promise.all([
      row.boundingBox(),
      page.getByTestId(`contact-number-${id}`).boundingBox(),
      page.getByTestId(`contact-icon-${id}`).boundingBox(),
      page.getByTestId(`contact-label-${id}`).boundingBox(),
      page.getByTestId(`contact-value-${id}`).boundingBox(),
      page.getByTestId(`contact-arrow-${id}`).boundingBox(),
    ]);
    if (!rowBox || !numberBox || !iconBox || !labelBox || !valueBox || !arrowBox) throw new Error(`Contact ${id} row did not render a measurable layout.`);
    for (const box of [numberBox, iconBox, labelBox, valueBox, arrowBox]) expect(isInside(box, rowBox)).toBe(true);
    for (const [first, second] of [[numberBox, iconBox], [iconBox, labelBox], [iconBox, valueBox], [labelBox, valueBox], [valueBox, arrowBox]] as const) expect(intersects(first, second)).toBe(false);
    if (id === "location") {
      expect(valueBox.width).toBeGreaterThan(150);
      expect(valueBox.height).toBeLessThanOrEqual(54);
    }
  }
}

test("Contact is bilingual, editorial, light-safe, and exposes real direct contact links", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockContactApi(page);
  for (const locale of ["ar", "en"] as const) {
    await page.setViewportSize({ width: 1440, height: 920 });
    await page.goto(`/${locale}/contact`, { waitUntil: "domcontentloaded" });
    await selectTheme(page, "light");
    await expect(page.locator("html")).toHaveAttribute("dir", locale === "ar" ? "rtl" : "ltr");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const testId of surfaces) await expect(page.getByTestId(testId)).toBeVisible();
    await expect(page.getByTestId("contact-information").locator('a[href="tel:+971502001797"]')).toBeVisible();
    await expect(page.getByTestId("contact-information").locator('a[href="mailto:info@hussein.ae"]')).toBeVisible();
    await expect(page.getByTestId("contact-consultation-alternative").getByRole("link")).toHaveAttribute("href", `/${locale}/consultation`);
    await expect(page.getByTestId("contact-message-form").locator("input")).toHaveCount(4);
    await expectContactRowsToBeStructurallySound(page);
    await expectNoOverflow(page);
    const pageText = await page.getByTestId("contact-hero").locator("xpath=..").innerText();
    if (locale === "ar") expect(pageText).not.toMatch(/Direct contact|Send a message|Request a consultation/);
    else expect(pageText).not.toMatch(/طرق التواصل المباشر|أرسل رسالة|اطلب استشارة/);
    for (const testId of surfaces) {
      const background = await page.getByTestId(testId).evaluate((element) => `${getComputedStyle(element).backgroundColor} ${getComputedStyle(element).backgroundImage}`);
      expect(background).not.toMatch(/33, 26, 21|30, 23, 19|21, 17, 14|13, 10, 9/);
    }
  }
  expect(errors).toEqual([]);
});

test("Contact preserves validation, payload, loading, and inline success without a real submission", async ({ page }) => {
  const errors: string[] = [];
  const requests: unknown[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/v1/contact", async (route) => {
    requests.push(route.request().postDataJSON());
    await new Promise((resolve) => setTimeout(resolve, 250));
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ success: true, data: { status: "received", createdAt: "2099-01-01T00:00:00.000Z" } }) });
  });
  await page.goto("/en/contact", { waitUntil: "domcontentloaded" });
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.getByLabel("Name").fill("");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Name")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
  expect(requests).toHaveLength(0);

  await fillValidForm(page, "en");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("button", { name: "Sending..." })).toBeDisabled();
  await expect(page.getByTestId("contact-form-success")).toBeVisible();
  expect(requests).toEqual([{ name: "Contact Editorial Test", email: "contact.editorial@example.test", subject: "General legal question", message: "This is a complete test message for the direct contact form.", website: "" }]);
  expect(errors).toEqual([]);
});

test("Contact renders its existing API field error without a real submission", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockContactApi(page, "validation");
  await page.goto("/en/contact", { waitUntil: "domcontentloaded" });
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await fillValidForm(page, "en");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByLabel("Email address")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText("Enter a valid email address.")).toHaveAttribute("role", "alert");
  expect(errors).toEqual([]);
});

test("Contact is responsive, reduced-motion safe, dark-compatible, and has production metadata", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mockContactApi(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const locale of ["ar", "en"] as const) {
    for (const width of [360, 375, 390, 430, 768, 1024, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${locale}/contact`, { waitUntil: "domcontentloaded" });
      await expect(page.getByTestId("contact-hero")).toBeVisible();
      await page.getByTestId("contact-form-surface").scrollIntoViewIfNeeded();
      await expect(page.getByTestId("contact-message-form")).toBeVisible();
      await expectNoOverflow(page);
    }
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/en/contact", { waitUntil: "domcontentloaded" });
  await selectTheme(page, "dark");
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.goto("/ar/contact", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/contact");
  await expect(page.locator('link[rel="alternate"][hreflang="ar"]')).toHaveAttribute("href", "https://hhlawyer.ae/ar/contact");
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", "https://hhlawyer.ae/en/contact");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://hhlawyer.ae/ar/contact");
  expect(errors).toEqual([]);
});
