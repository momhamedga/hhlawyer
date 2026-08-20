import type { MetadataRoute } from "next";

import { guideSlugs } from "@/i18n/legal-guides-content";

const pages = ["", "/about", "/services", "/find-your-service", "/consultation", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ["ar", "en"].flatMap((locale) => [...pages, "/guides", ...guideSlugs.map((slug) => `/guides/${slug}`)].map((path) => ({ url: `https://hhlawyer.ae/${locale}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : path === "/guides" ? 0.8 : path.startsWith("/guides/") ? 0.7 : 0.8 })));
}
