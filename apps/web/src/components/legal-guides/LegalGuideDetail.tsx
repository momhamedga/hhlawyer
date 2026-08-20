import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronLeft, Compass, Scale } from "lucide-react";

import { LAW_SERVICES } from "@/constants/Services";
import { localizeService } from "@/i18n/format";
import { guideReadingMinutes, legalGuidesContent, type GuideSlug } from "@/i18n/legal-guides-content";
import type { Locale } from "@/i18n/locale";
import styles from "./LegalGuides.module.css";

export function LegalGuideDetail({ locale, slug }: { locale: Locale; slug: GuideSlug }) {
  const content = legalGuidesContent[locale];
  const guide = content.guides[slug];
  const service = LAW_SERVICES.find((item) => item.id === guide.practiceSlug);
  if (!service) return null;
  const practice = localizeService(locale, service);
  const relatedGuides = guide.relatedGuideSlugs.map((guideSlug) => content.guides[guideSlug]).slice(0, 2);
  const go = (path: string) => `/${locale}${path === "/" ? "" : path}`;

  return <main className={styles.page} data-testid="guide-detail" data-guide-slug={slug}>
    <article className={styles.article}>
      <header className={styles.articleHero} data-testid="guide-detail-hero">
        <nav aria-label={content.detail.guides} className={styles.breadcrumb}><Link href={go("/guides")}><ChevronLeft aria-hidden="true" size={15} />{content.detail.backToGuides}</Link><span aria-current="page">{guide.title}</span></nav>
        <div className={styles.articleLead}><p className={styles.eyebrow}>{content.detail.practiceArea}</p><Link className={styles.practiceTag} href={go(`/services/${service.id}`)}>{practice.title}<ArrowUpRight aria-hidden="true" size={15} /></Link><h1>{guide.title}</h1><p>{guide.intro}</p><small><BookOpen aria-hidden="true" size={15} />{content.index.readingTime(guideReadingMinutes(guide))}</small></div>
      </header>

      <div className={styles.articleBody} data-testid="guide-article">
        {guide.sections.map((section, index) => <section key={section.title} aria-labelledby={`guide-section-${index}`}>
          <div className={styles.sectionMarker}><span>{String(index + 1).padStart(2, "0")}</span></div>
          <div><h2 id={`guide-section-${index}`}>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.list ? <ul>{section.list.map((item) => <li key={item}>{item}</li>)}</ul> : null}{section.keyPoint ? <aside className={styles.keyPoint} data-testid="guide-key-point"><span>{content.detail.keyPoint}</span><p>{section.keyPoint}</p></aside> : null}</div>
        </section>)}
      </div>

      <section className={styles.practiceConnection} data-testid="guides-practice-link" aria-labelledby="guide-practice-title"><p className={styles.eyebrow}>{content.detail.relatedPractice}</p><div><Scale aria-hidden="true" size={23} strokeWidth={1.3} /><div><h2 id="guide-practice-title">{practice.title}</h2><p>{practice.description}</p></div><Link href={go(`/services/${service.id}`)}>{content.detail.viewPractice}<ArrowUpRight aria-hidden="true" size={17} /></Link></div></section>

      <section className={styles.related} data-testid="guides-related" aria-labelledby="related-guides-title"><header><p className={styles.eyebrow}>{content.detail.relatedGuides}</p><h2 id="related-guides-title">{content.detail.relatedGuidesTitle}</h2></header><nav aria-label={content.detail.relatedGuides}>{relatedGuides.map((relatedGuide, index) => <Link href={go(`/guides/${relatedGuide.slug}`)} key={relatedGuide.slug}><span>{String(index + 1).padStart(2, "0")}</span><div><p>{localizeService(locale, LAW_SERVICES.find((item) => item.id === relatedGuide.practiceSlug)!).title}</p><b>{relatedGuide.title}</b></div><ArrowUpRight aria-hidden="true" size={18} /></Link>)}</nav></section>

      <aside className={styles.finderLink}><Compass aria-hidden="true" size={20} strokeWidth={1.3} /><div><h2>{content.detail.finderTitle}</h2><p>{content.detail.finderBody}</p></div><Link href={go("/find-your-service")}>{content.detail.finderAction}<ArrowUpRight aria-hidden="true" size={17} /></Link></aside>
      <section className={styles.consultation} data-testid="guides-consultation" aria-labelledby="guides-consultation-title"><div><p className={styles.eyebrow}>01</p><h2 id="guides-consultation-title">{content.detail.consultationTitle}</h2></div><Link data-testid="guides-consultation-link" href={go("/consultation")}>{content.detail.consultationAction}<ArrowUpRight aria-hidden="true" size={18} /></Link></section>
      <p className={styles.disclaimer} data-testid="guides-disclaimer">{content.detail.disclaimer}</p>
    </article>
  </main>;
}
