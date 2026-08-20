"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, LibraryBig } from "lucide-react";
import { useState } from "react";

import { localizePath } from "@/components/providers/LocaleProvider";
import { LAW_SERVICES } from "@/constants/Services";
import { localizeService } from "@/i18n/format";
import { guideReadingMinutes, guideSlugs, legalGuidesContent, type GuidePracticeSlug } from "@/i18n/legal-guides-content";
import type { Locale } from "@/i18n/locale";
import styles from "./LegalGuides.module.css";

type GuideFilter = "all" | GuidePracticeSlug;

export function LegalGuidesIndex({ locale }: { locale: Locale }) {
  const [filter, setFilter] = useState<GuideFilter>("all");
  const content = legalGuidesContent[locale];
  const guides = guideSlugs.map((slug) => content.guides[slug]);
  const visibleGuides = filter === "all" ? guides : guides.filter((guide) => guide.practiceSlug === filter);
  const featured = guides[0];

  return (
    <main className={styles.page} data-testid="guides-index">
      <section className={styles.indexHero} data-testid="guides-hero" aria-labelledby="guides-title">
        <div className={styles.heroMarker}><LibraryBig aria-hidden="true" size={28} strokeWidth={1.3} /><span>01</span></div>
        <div><p className={styles.eyebrow}>{content.index.eyebrow}</p><h1 id="guides-title">{content.index.title}</h1></div>
        <p>{content.index.intro}</p>
      </section>

      <nav className={styles.filters} data-testid="guides-filters" aria-label={content.index.category}>
        <span>{content.index.category}</span>
        <div>
          <button aria-pressed={filter === "all"} data-testid="guides-filter-all" onClick={() => setFilter("all")} type="button">{content.index.all}</button>
          {LAW_SERVICES.map((service) => {
            const title = localizeService(locale, service).title;
            return <button aria-pressed={filter === service.id} data-testid={`guides-filter-${service.id}`} key={service.id} onClick={() => setFilter(service.id as GuidePracticeSlug)} type="button">{title}</button>;
          })}
        </div>
      </nav>

      {filter === "all" ? <section className={styles.featured} data-testid="guides-featured" aria-labelledby="featured-guide-title">
        <div className={styles.featuredIndex}><BookOpen aria-hidden="true" size={22} strokeWidth={1.35} /><span>01</span></div>
        <div><p className={styles.eyebrow}>{content.index.selected}</p><span className={styles.practice}>{localizeService(locale, LAW_SERVICES.find((service) => service.id === featured.practiceSlug)!).title}</span><h2 id="featured-guide-title">{featured.title}</h2><p>{featured.description}</p><Link href={localizePath(`/guides/${featured.slug}`, locale)}>{content.index.explore}<ArrowUpRight aria-hidden="true" size={17} /></Link></div>
      </section> : null}

      <section className={styles.guideIndex} data-testid="guides-list" aria-live="polite" aria-label={content.index.title}>
        {visibleGuides.map((guide) => {
          const service = LAW_SERVICES.find((item) => item.id === guide.practiceSlug);
          if (!service) return null;
          return <Link className={styles.guideRow} data-testid={`guide-row-${guide.slug}`} href={localizePath(`/guides/${guide.slug}`, locale)} key={guide.slug}>
            <span className={styles.guideNumber}>{String(guideSlugs.indexOf(guide.slug) + 1).padStart(2, "0")}</span>
            <div><p>{localizeService(locale, service).title}</p><h2>{guide.title}</h2><span>{guide.description}</span></div>
            <small>{content.index.readingTime(guideReadingMinutes(guide))}</small>
            <ArrowUpRight aria-hidden="true" size={20} />
          </Link>;
        })}
        {visibleGuides.length === 0 ? <p className={styles.empty}>{content.index.empty}</p> : null}
      </section>
    </main>
  );
}
