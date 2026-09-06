import { expect, test } from "@playwright/test";

const publicRoutes = ["/ar", "/en", "/ar/services", "/en/services", "/ar/consultation", "/en/consultation", "/ar/contact", "/en/contact"] as const;
const productionApiOrigin = "https://api.hhlawyer.ae";

test("public pages enforce compatible security headers and retain essential browser behavior", async ({ page }) => {
  const errors: string[] = [];
  const imageResponses: string[] = [];
  const imageFailures: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /content security policy|refused to|hydration|did not match/i.test(message.text())) errors.push(message.text());
  });
  page.on("response", (response) => {
    if (response.url().includes("/_next/image")) imageResponses.push(`${response.status()} ${response.url()}`);
  });
  page.on("requestfailed", (request) => {
    if (request.url().includes("/_next/image")) imageFailures.push(`${request.failure()?.errorText ?? "UNKNOWN"} ${request.url()}`);
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    const headers = response?.headers() ?? {};
    const csp = headers["content-security-policy"];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toMatch(/script-src 'self' 'nonce-[^']+' 'strict-dynamic'/);
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).toMatch(/style-src 'self' 'nonce-[^']+' 'sha256-nzTgYzXYDNe6BAHiiI7NNlfK8n\/auuOAhh2t92YvuXo='/);
    expect(csp).toContain("style-src-attr 'unsafe-inline'");
    expect(csp).toContain("img-src 'self' blob: data:");
    expect(csp).toContain("font-src 'self'");
    expect(csp).toContain(`connect-src 'self' ${productionApiOrigin}`);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain("upgrade-insecure-requests");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }

  expect(imageResponses.length).toBeGreaterThan(0);
  expect(imageResponses.every((response) => response.startsWith("200 "))).toBe(true);
  expect(imageFailures).toEqual([]);
  await expect.poll(() => errors).toEqual([]);
});
