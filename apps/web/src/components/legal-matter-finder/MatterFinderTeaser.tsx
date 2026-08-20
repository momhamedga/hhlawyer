import Link from "next/link";
import { ArrowUpRight, Scale } from "lucide-react";

import { localizePath } from "@/components/providers/LocaleProvider";
import { legalMatterFinderContent } from "@/i18n/legal-matter-finder-content";
import type { Locale } from "@/i18n/locale";
import styles from "./MatterFinderTeaser.module.css";

export function MatterFinderTeaser({ locale }: { locale: Locale }) {
  const copy = legalMatterFinderContent[locale].teaser;
  return <section className={styles.teaser} data-testid="homepage-matter-finder" aria-labelledby="matter-finder-teaser-title"><div className={styles.icon}><Scale aria-hidden="true" size={25} strokeWidth={1.3} /></div><div><p>{copy.eyebrow}</p><h2 id="matter-finder-teaser-title">{copy.title}</h2><span>{copy.body}</span></div><Link href={localizePath("/find-your-service", locale)}>{copy.action}<ArrowUpRight aria-hidden="true" size={17} /></Link></section>;
}
