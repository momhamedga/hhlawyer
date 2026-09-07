import { notFound } from "next/navigation";

import { DirectionComparison } from "@/components/design-preview/PreviewExperience";
import { isLocale } from "@/i18n/locale";

export default async function DesignPreviewIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <DirectionComparison locale={locale} />;
}
