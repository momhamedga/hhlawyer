import type { Locale } from "@/i18n/locale";

type ServiceVisual = { src: string; position: string; alt: Record<Locale, string> };

const serviceVisuals: Record<string, ServiceVisual> = {
  criminal: { src: "/images/services/criminal.png", position: "center center", alt: { ar: "مساحة استشارة قانونية خاصة لمراجعة ملف قضية", en: "Private legal consultation setting for confidential case review" } },
  commercial: { src: "/images/services/commercial.png", position: "55% center", alt: { ar: "قاعة استشارات قانونية تجارية بإطلالة على أفق أعمال أبوظبي", en: "Commercial legal advisory room overlooking an Abu Dhabi business skyline" } },
  civil: { src: "/images/services/civil.png", position: "center center", alt: { ar: "غرفة استشارة هادئة للمسائل المدنية والأحوال الشخصية", en: "Calm private consultation room for civil and personal matters" } },
  notary: { src: "/images/services/notary.png", position: "center center", alt: { ar: "مساحة عمل لتوثيق المستندات القانونية", en: "Document-authentication workspace for legal instruments" } },
  taxes: { src: "/images/services/taxes.png", position: "center center", alt: { ar: "مساحة عمل منظمة لسجلات الامتثال والوثائق المالية", en: "Organized executive workspace for compliance records and financial documents" } },
};

export function serviceVisualFor(slug: string) {
  return serviceVisuals[slug] ?? serviceVisuals.criminal;
}

export { serviceVisuals };
