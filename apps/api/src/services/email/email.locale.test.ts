import { describe, expect, it } from "vitest";
import { resolveEmailLocale } from "./email.locale.js";

describe("email locale resolution", () => {
  it("uses Arabic when the request explicitly carries the Arabic route locale", () => {
    expect(resolveEmailLocale("ar")).toBe("ar");
    expect(resolveEmailLocale("ar-AE,en;q=0.9")).toBe("ar");
  });

  it("uses English for the English route locale and safe fallback cases", () => {
    expect(resolveEmailLocale("en")).toBe("en");
    expect(resolveEmailLocale("en-US,ar;q=0.9")).toBe("en");
    expect(resolveEmailLocale(undefined)).toBe("en");
  });
});
