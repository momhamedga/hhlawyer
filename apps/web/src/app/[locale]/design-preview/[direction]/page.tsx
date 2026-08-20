import { notFound } from "next/navigation";

import { PreviewExperience } from "@/components/design-preview/PreviewExperience";
import { isLocale } from "@/i18n/locale";

const directions = ["01", "02", "03"] as const;
function isDirection(value: string): value is (typeof directions)[number] { return directions.includes(value as (typeof directions)[number]); }

export default async function PublicDesignPreview({ params }: { params: Promise<{ locale: string; direction: string }> }) {
  const { locale, direction } = await params;
  if (!isLocale(locale) || !isDirection(direction)) notFound();
  return <PreviewExperience direction={direction} locale={locale} />;
}
