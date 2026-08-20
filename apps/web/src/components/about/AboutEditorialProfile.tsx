"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { LAW_SERVICES } from "@/constants/Services";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { localizeService } from "@/i18n/format";
import { messages } from "@/i18n/messages";
import styles from "./AboutEditorialProfile.module.css";

const copy = {
  ar: {
    heroLabel: "01 / عن المحامي",
    heroTitle: "ممارسة قانونية تبدأ بالإنصات، ثم تتقدم بوضوح.",
    heroLead: "مساحة هادئة لفهم المسألة قبل تحديد الخطوة القانونية التالية.",
    location: "أبوظبي · الإمارات العربية المتحدة",
    storyLabel: "الإنسان وراء الممارسة",
    storyTitle: "الفهم الدقيق يسبق التوجيه الواضح.",
    storyQuote: "الاستشارة الواضحة تبدأ بفهم دقيق للشخص وراء القضية.",
    storyContext: "لكل مسألة سياقها، وتبدأ المحادثة القانونية المدروسة بإتاحة مساحة للاستماع إلى هذا السياق.",
    philosophyLabel: "منهج الممارسة",
    philosophyTitle: "كيف تُقارب المسائل القانونية.",
    portraitLabel: "ملاحظة تحريرية",
    portraitTitle: "الدقة والسرية جزءان من طريقة العمل.",
    portraitCaption: "حسين الحارثي · ممارسة قانونية خاصة",
    uaeLabel: "سياق الممارسة",
    uaeTitle: "أبوظبي، في قلب دولة الإمارات.",
    uaeBody: "سياق محلي واضح يضع الحوار القانوني في موضعه الصحيح، بهدوء وعناية بالتفاصيل.",
    servicesLabel: "مجالات الممارسة",
    servicesTitle: "استكشف المجال الأقرب إلى مسألتك.",
    servicesLink: "عرض الخدمة",
    closingLabel: "ابدأ بمحادثة",
    closingTitle: "ابدأ باستشارة قانونية خاصة ومدروسة.",
    closingBody: "شارك السؤال الأول، ثم حدّد الخطوة التالية بوضوح.",
    consultation: "اطلب استشارة",
    heroAlt: "صورة حسين الحارثي في سياق مهني",
    portraitAlt: "صورة تحريرية لحسين الحارثي",
  },
  en: {
    heroLabel: "01 / ABOUT",
    heroTitle: "A legal practice that begins by listening, then moves with clarity.",
    heroLead: "A calm space to understand the matter before defining the next legal step.",
    location: "Abu Dhabi · United Arab Emirates",
    storyLabel: "The person behind the practice",
    storyTitle: "Precise understanding comes before clear direction.",
    storyQuote: "Clear advice starts with a precise understanding of the person behind the matter.",
    storyContext: "Every matter has its own context. A considered legal conversation begins by making room to hear it.",
    philosophyLabel: "Practice approach",
    philosophyTitle: "How legal work is approached.",
    portraitLabel: "Editorial note",
    portraitTitle: "Precision and confidentiality are part of the working method.",
    portraitCaption: "Hussein Al Harithi · Private legal practice",
    uaeLabel: "Practice context",
    uaeTitle: "Abu Dhabi, at the heart of the UAE.",
    uaeBody: "A clear local context places each legal conversation where it belongs: with calm attention to the details.",
    servicesLabel: "Practice areas",
    servicesTitle: "Explore the area closest to your matter.",
    servicesLink: "View service",
    closingLabel: "Begin a conversation",
    closingTitle: "Begin with a private, considered legal consultation.",
    closingBody: "Share the first question, then define the next step with clarity.",
    consultation: "Request a consultation",
    heroAlt: "Portrait of Hussein Al Harithi in a professional setting",
    portraitAlt: "Editorial portrait of Hussein Al Harithi",
  },
} as const;

export function AboutEditorialProfile() {
  const locale = useLocale();
  const content = copy[locale];
  const about = messages[locale].public.about;
  const reducedMotion = useReducedMotion();
  const go = (path: string) => localizePath(path, locale);
  const reveal = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 };

  return (
    <main className={styles.page}>
      <section className={styles.hero} data-testid="about-hero" aria-labelledby="about-title">
        <motion.div animate={{ opacity: 1, y: 0 }} className={styles.heroCopy} initial={reveal} transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeOut" }}>
          <p className={styles.label}>{content.heroLabel}</p>
          <p className={styles.identity}>{about.bioName}</p>
          <h1 id="about-title">{content.heroTitle}</h1>
          <p className={styles.lead}>{content.heroLead}</p>
          <p className={styles.location}>{content.location}</p>
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} className={styles.heroPortrait} data-founder-source="/Hussein-Alharathi-1.webp" initial={reveal} transition={{ duration: reducedMotion ? 0 : 0.6, delay: reducedMotion ? 0 : 0.08, ease: "easeOut" }}>
          <span aria-hidden="true" className={styles.heroFrame} />
          <Image alt={content.heroAlt} fill priority sizes="(max-width: 760px) 92vw, (max-width: 1100px) 46vw, 600px" src="/Hussein-Alharathi-1.webp" />
        </motion.div>
      </section>

      <section className={styles.story} data-testid="about-story" aria-labelledby="about-story-title">
        <motion.div animate={{ opacity: 1, y: 0 }} initial={reveal} transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeOut" }}>
          <p className={styles.label}>{content.storyLabel}</p>
          <h2 id="about-story-title">{content.storyTitle}</h2>
        </motion.div>
        <div className={styles.storyBody}>
          <p className={styles.storyQuote}>“{content.storyQuote}”</p>
          <div>
            <p>{about.bioDescription}</p>
            <p>{content.storyContext}</p>
          </div>
        </div>
      </section>

      <section className={styles.philosophy} data-testid="about-philosophy" aria-labelledby="about-philosophy-title">
        <header>
          <p className={styles.label}>{content.philosophyLabel}</p>
          <h2 id="about-philosophy-title">{content.philosophyTitle}</h2>
        </header>
        <ol>
          {about.philosophy.map((item, index) => (
            <li key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{item.title}</h3><p>{item.description}</p></div>
              <ArrowUpRight aria-hidden="true" size={22} strokeWidth={1.25} />
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.portraitMoment} data-testid="about-portrait-moment" aria-labelledby="about-portrait-title">
        <div className={styles.portraitImage} data-founder-source="/Hussein-Alharathi-2.webp">
          <Image alt={content.portraitAlt} fill loading="eager" sizes="(max-width: 760px) 100vw, 72vw" src="/Hussein-Alharathi-2.webp" />
        </div>
        <div className={styles.portraitCopy}>
          <p className={styles.label}>{content.portraitLabel}</p>
          <h2 id="about-portrait-title">{content.portraitTitle}</h2>
          <p>{content.portraitCaption}</p>
        </div>
      </section>

      <section className={styles.uae} data-testid="about-uae" aria-labelledby="about-uae-title">
        <div aria-hidden="true" className={styles.uaeRule} />
        <p className={styles.label}>{content.uaeLabel}</p>
        <h2 id="about-uae-title">{content.uaeTitle}</h2>
        <p>{content.uaeBody}</p>
      </section>

      <section className={styles.services} data-testid="about-practice-links" aria-labelledby="about-services-title">
        <header>
          <p className={styles.label}>{content.servicesLabel}</p>
          <h2 id="about-services-title">{content.servicesTitle}</h2>
        </header>
        <nav aria-label={content.servicesLabel}>
          {LAW_SERVICES.map((service, index) => <Link href={go(`/services/${service.id}`)} key={service.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{localizeService(locale, service).title}</strong>
            <span className={styles.serviceAction}>{content.servicesLink}<ArrowUpRight aria-hidden="true" size={17} /></span>
          </Link>)}
        </nav>
      </section>

      <section className={styles.closing} data-testid="about-cta" aria-labelledby="about-closing-title">
        <div>
          <p className={styles.label}>{content.closingLabel}</p>
          <h2 id="about-closing-title">{content.closingTitle}</h2>
          <p>{content.closingBody}</p>
        </div>
        <Link href={`${go("/consultation")}#consultation`}>{content.consultation}<ArrowUpRight aria-hidden="true" size={19} /></Link>
      </section>
    </main>
  );
}
