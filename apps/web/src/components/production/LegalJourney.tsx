"use client";

import { motion } from "framer-motion";

import type { Locale } from "@/i18n/locale";

import styles from "./EditorialHome.module.css";
import { useHydrationSafeReducedMotion } from "./useHydrationSafeReducedMotion";

type LegalJourneyProps = { locale: Locale };

const stages = [
  ["Initial contact", "التواصل الأول"],
  ["Understand the matter", "فهم القضية"],
  ["Legal consultation", "الاستشارة القانونية"],
  ["Next steps", "الخطوات التالية"],
] as const;

const copy = (locale: Locale, en: string, ar: string) => locale === "en" ? en : ar;

export function LegalJourney({ locale }: LegalJourneyProps) {
  const reduced = useHydrationSafeReducedMotion();

  return <section aria-labelledby="journey-title" className={styles.journey} data-testid="homepage-legal-journey">
    <header>
      <p className={styles.eyebrow}>{copy(locale, "A considered process", "عملية مدروسة")}</p>
      <h2 id="journey-title">{copy(locale, "From first contact to the right next step.", "من أول تواصل إلى الخطوة التالية الصحيحة.")}</h2>
    </header>
    <motion.ol className={styles.timeline} initial="hidden" viewport={{ amount: .25, once: true }} whileInView="visible">
      <motion.li aria-hidden="true" className={styles.timelineLine} variants={{ hidden: { scaleX: reduced ? 1 : 0 }, visible: { scaleX: 1, transition: { duration: reduced ? 0 : .7, ease: "easeOut" } } }} />
      {stages.map(([en, ar], index) => <motion.li className={styles.timelineStage} key={en} variants={{ hidden: { opacity: 0, y: reduced ? 0 : 14 }, visible: { opacity: 1, y: 0, transition: { delay: reduced ? 0 : .16 + index * .1, duration: reduced ? 0 : .42, ease: "easeOut" } } }}>
        <span className={styles.timelineDot} aria-hidden="true" />
        <span className={styles.timelineNumber}>0{index + 1}</span>
        <h3>{copy(locale, en, ar)}</h3>
        <p>{copy(locale, "A clear, deliberate stage in the work.", "مرحلة واضحة ومدروسة في العمل.")}</p>
      </motion.li>)}
    </motion.ol>
  </section>;
}
