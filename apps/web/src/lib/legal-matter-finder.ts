import type { ServiceFaqSlug } from "@/i18n/service-faq-content";

export const finderQuestionIds = ["nature", "focus", "setting"] as const;
export type FinderQuestionId = (typeof finderQuestionIds)[number];

export type FinderOptionId = "criminal" | "commercial" | "civil" | "notary" | "taxes" | "unsure" | "understand" | "documents" | "disagreement" | "transaction" | "compliance" | "individual" | "business" | "document" | "unclear";
export type FinderAnswers = Partial<Record<FinderQuestionId, FinderOptionId>>;
export type FinderRecommendationKey = ServiceFaqSlug;

export type FinderResolution =
  | { kind: "uncertain" }
  | { kind: "recommendation"; primary: ServiceFaqSlug; related?: ServiceFaqSlug; explanation: FinderRecommendationKey };

export function resolveLegalMatterFinder(answers: FinderAnswers): FinderResolution | undefined {
  const { nature, focus, setting } = answers;
  if (!nature || !focus || !setting) return undefined;
  if (nature === "unsure" || focus === "unsure" || setting === "unclear") return { kind: "uncertain" };

  if (nature === "criminal") return { kind: "recommendation", primary: "criminal", explanation: "criminal" };
  if (nature === "commercial") return { kind: "recommendation", primary: "commercial", related: focus === "compliance" ? "taxes" : undefined, explanation: "commercial" };
  if (nature === "civil") return { kind: "recommendation", primary: "civil", related: setting === "business" ? "commercial" : undefined, explanation: "civil" };
  if (nature === "notary") return { kind: "recommendation", primary: "notary", related: setting === "business" ? "commercial" : undefined, explanation: "notary" };
  if (nature === "taxes") return { kind: "recommendation", primary: "taxes", related: focus === "transaction" ? "commercial" : undefined, explanation: "taxes" };
  return { kind: "uncertain" };
}
