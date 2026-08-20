"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronLeft } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { notFound } from "next/navigation";
import { use } from "react";
import { LAW_SERVICES } from "@/constants/Services";
import { localizeService } from "@/i18n/format";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { serviceVisualFor } from "./serviceVisuals";
import { localizeServiceFeatures } from "./serviceDetailCopy";
import { ServiceFaq } from "./ServiceFaq";
import type { ServiceFaqSlug } from "@/i18n/service-faq-content";
import styles from "./ServiceDetailDossier.module.css";

const content = {
  ar: {
    dossier: "ملف ممارسة قانونية",
    practiceArea: "مجال الممارسة",
    overview: "نظرة عامة",
    overviewTitle: "فهم واضح للمسألة قبل تحديد الخطوة التالية.",
    overviewBody: "نبدأ من سياق الموضوع والأسئلة ذات الصلة، ثم نرتب الحوار حول المعلومات التي تساعد على فهم المسألة بصورة أدق.",
    help: "كيف يمكننا المساعدة",
    helpTitle: "خدمات مركزة ضمن هذا المجال القانوني.",
    prepare: "قبل الاستشارة",
    prepareTitle: "أحضر السياق الذي يساعد على فهم المسألة.",
    prepareBody: "يمكن للمستندات ذات الصلة، وتسلسل زمني مختصر، والأسئلة الأهم بالنسبة لك أن تجعل الحديث أكثر تركيزًا.",
    other: "مجالات ممارسة أخرى",
    otherTitle: "استكشف خدمات قانونية أخرى.",
    book: "احجز استشارة",
    back: "العودة إلى الخدمات القانونية",
    caption: "ممارسة قانونية مدروسة · أبوظبي",
    closingLabel: "الخطوة التالية",
    closingTitle: "محادثة واضحة هي المكان الصحيح للبدء.",
    closingBody: "شاركنا السؤال الأساسي، وسنساعدك على تنظيم بداية مدروسة.",
    service: "الخدمة",
  },
  en: {
    dossier: "Legal practice dossier",
    practiceArea: "Practice area",
    overview: "Overview",
    overviewTitle: "A clear understanding of the matter before the next step.",
    overviewBody: "We begin with the context and the questions at hand, then structure the conversation around the information that brings the matter into focus.",
    help: "How we can help",
    helpTitle: "Focused services within this legal practice area.",
    prepare: "Before the consultation",
    prepareTitle: "Bring the context that helps frame the matter.",
    prepareBody: "Relevant documents, a concise timeline, and the questions most important to you can make the conversation more focused.",
    other: "Other practice areas",
    otherTitle: "Explore other legal services.",
    book: "Book a consultation",
    back: "Back to Legal Services",
    caption: "A considered legal practice · Abu Dhabi",
    closingLabel: "The next step",
    closingTitle: "A clear conversation is the right place to begin.",
    closingBody: "Share the essential question and we will help bring a considered start into focus.",
    service: "Service",
  },
} as const;

type ServiceDetailDossierProps = { params: Promise<{ slug: string }> };

export function ServiceDetailDossier({ params }: ServiceDetailDossierProps) {
  const locale = useLocale();
  const reducedMotion = useReducedMotion();
  const { slug } = use(params);
  const service = LAW_SERVICES.find((item) => item.id === slug);
  if (!service) notFound();

  const t = content[locale];
  const copy = localizeService(locale, service);
  const position = LAW_SERVICES.findIndex((item) => item.id === service.id) + 1;
  const number = String(position).padStart(2, "0");
  const Icon = service.icon;
  const go = (path: string) => localizePath(path, locale);
  const related = LAW_SERVICES.filter((item) => item.id !== service.id).slice(0, 4);
  const visual = serviceVisualFor(service.id);
  const features = localizeServiceFeatures(locale, service);
  const fade = reducedMotion ? { duration: 0 } : { duration: 0.5, ease: "easeOut" as const };

  return (
    <main className={styles.page} data-service={service.id}>
      <section className={styles.hero} data-testid="service-detail-hero">
        <motion.div animate={{ opacity: 1, y: 0 }} className={styles.heroCopy} initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }} transition={fade}>
          <div className={styles.eyebrowRow}>
            <span>{t.dossier}</span><span aria-hidden="true" /><b>{t.service} / {number}</b>
          </div>
          <p className={styles.label}>{t.practiceArea}</p>
          <h1>{copy.title}</h1>
          <p className={styles.description}>{copy.description}</p>
          <div className={styles.heroActions}>
            <Link href={`${go("/consultation")}#consultation`}>{t.book}<ArrowUpRight aria-hidden="true" size={18} /></Link>
            <Link className={styles.backLink} href={go("/services")}><ChevronLeft aria-hidden="true" size={18} />{t.back}</Link>
          </div>
        </motion.div>
        <motion.figure animate={{ opacity: 1, y: 0 }} className={styles.heroVisual} data-service-source={visual.src} data-testid="service-detail-image" initial={{ opacity: 0, y: reducedMotion ? 0 : 22 }} transition={{ ...fade, delay: reducedMotion ? 0 : 0.14 }}>
          <Image alt={visual.alt[locale]} fill priority sizes="(max-width: 820px) 100vw, (max-width: 1200px) 46vw, 560px" src={visual.src} style={{ objectPosition: visual.position }} />
          <span aria-hidden="true" className={styles.imageOverlay} />
          <span aria-hidden="true" className={styles.visualNumber}>{number}</span>
          <figcaption><Icon aria-hidden="true" size={17} strokeWidth={1.5} />{t.caption}</figcaption>
        </motion.figure>
      </section>

      <section className={styles.overview} data-testid="service-detail-overview" aria-labelledby="service-overview-title">
        <div><p className={styles.label}>{t.overview}</p><p className={styles.sectionNumber}>01</p></div>
        <div><h2 id="service-overview-title">{t.overviewTitle}</h2><p>{copy.description}</p><p>{t.overviewBody}</p></div>
      </section>

      <section className={styles.help} data-testid="service-detail-help" aria-labelledby="service-help-title">
        <header><p className={styles.label}>{t.help}</p><h2 id="service-help-title">{t.helpTitle}</h2></header>
        <ol>
          {features.map((feature, index) => <motion.li animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }} key={feature.title} transition={{ ...fade, delay: reducedMotion ? 0 : index * 0.06 }}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div><Check aria-hidden="true" size={19} strokeWidth={1.5} />
          </motion.li>)}
        </ol>
      </section>

      <section className={styles.prepare} data-testid="service-detail-prepare" aria-labelledby="service-prepare-title">
        <div><p className={styles.label}>{t.prepare}</p><h2 id="service-prepare-title">{t.prepareTitle}</h2></div>
        <p>{t.prepareBody}</p>
      </section>

      <ServiceFaq locale={locale} serviceId={service.id as ServiceFaqSlug} />

      <section className={styles.other} data-testid="service-detail-other" aria-labelledby="other-services-title">
        <header><p className={styles.label}>{t.other}</p><h2 id="other-services-title">{t.otherTitle}</h2></header>
        <nav aria-label={t.other}>
          {related.map((item) => <Link href={go(`/services/${item.id}`)} key={item.id}><span>{String(LAW_SERVICES.findIndex((serviceItem) => serviceItem.id === item.id) + 1).padStart(2, "0")}</span><b>{localizeService(locale, item).title}</b><ArrowUpRight aria-hidden="true" size={18} /></Link>)}
        </nav>
      </section>

      <section className={styles.closing} data-testid="service-detail-cta">
        <div><p className={styles.label}>{t.closingLabel}</p><h2>{t.closingTitle}</h2><p>{t.closingBody}</p></div>
        <Link href={`${go("/consultation")}#consultation`}>{t.book}<ArrowUpRight aria-hidden="true" size={19} /></Link>
      </section>
    </main>
  );
}
