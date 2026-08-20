import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/ar/admin", "/en/admin", "/api/"] }, sitemap: "https://hhlawyer.ae/sitemap.xml" };
}
