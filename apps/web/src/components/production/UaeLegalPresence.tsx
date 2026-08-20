"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

import type { Locale } from "@/i18n/locale";

import styles from "./EditorialHome.module.css";
import { useHydrationSafeReducedMotion } from "./useHydrationSafeReducedMotion";

type UaeLegalPresenceProps = { locale: Locale };

const copy = (locale: Locale, en: string, ar: string) => locale === "en" ? en : ar;

function JusticeScales() {
  return <svg aria-hidden="true" className={styles.scales} fill="none" viewBox="0 0 620 420"><path d="M310 66v252M150 132h320M210 132 130 266h160l-80-134ZM410 132l-80 134h160l-80-134ZM230 330h160M270 372h80" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" /><circle cx="310" cy="66" r="19" stroke="currentColor" strokeWidth="5" /></svg>;
}

export function UaeLegalPresence({ locale }: UaeLegalPresenceProps) {
  const reduced = useHydrationSafeReducedMotion();
  return <section aria-labelledby="uae-presence-title" className={styles.uaePresence} data-testid="homepage-uae-presence">
    <JusticeScales />
    <motion.div initial={{ opacity: 0, y: reduced ? 0 : 16 }} transition={{ duration: reduced ? 0 : .52, ease: "easeOut" }} viewport={{ amount: .3, once: true }} whileInView={{ opacity: 1, y: 0 }}>
      <p className={styles.eyebrow}>{copy(locale, "UAE legal presence", "حضور قانوني في دولة الإمارات")}</p>
      <h2 id="uae-presence-title">{copy(locale, "Grounded counsel for matters in the UAE.", "توجيه قانوني متزن للمسائل في دولة الإمارات.")}</h2>
      <p>{copy(locale, "A clear understanding of the local legal context, with considered guidance for individuals and businesses across the matters handled by the firm.", "فهم للسياق القانوني المحلي، وتوجيه واضح للأفراد والأعمال عبر المسائل القانونية التي يتولاها المكتب.")}</p>
    </motion.div>
    <motion.dl initial={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .45, delay: reduced ? 0 : .14 }} viewport={{ amount: .3, once: true }} whileInView={{ opacity: 1 }}>
      <div><dt><MapPin aria-hidden="true" size={17} />{copy(locale, "Abu Dhabi", "أبوظبي")}</dt><dd>{copy(locale, "Office location", "المقر")}</dd></div>
      <div><dt>{copy(locale, "United Arab Emirates", "دولة الإمارات العربية المتحدة")}</dt><dd>{copy(locale, "Practice context", "نطاق الممارسة")}</dd></div>
    </motion.dl>
  </section>;
}
