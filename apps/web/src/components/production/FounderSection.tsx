"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

import type { Locale } from "@/i18n/locale";

import styles from "./EditorialHome.module.css";
import { useHydrationSafeReducedMotion } from "./useHydrationSafeReducedMotion";

type FounderSectionProps = {
  locale: Locale;
  profileHref: string;
};

const copy = (locale: Locale, en: string, ar: string) => locale === "en" ? en : ar;

export function FounderSection({ locale, profileHref }: FounderSectionProps) {
  const reduced = useHydrationSafeReducedMotion();
  const rise = { opacity: 1, y: 0 };
  const initial = { opacity: 0, y: reduced ? 0 : 18 };

  return <section aria-labelledby="founder-title" className={styles.founder} data-testid="homepage-founder">
    <motion.div className={styles.founderCopy} initial={initial} transition={{ duration: reduced ? 0 : .55, ease: "easeOut" }} viewport={{ amount: .3, once: true }} whileInView={rise}>
      <p className={styles.eyebrow}>{copy(locale, "01 / Founder", "01 / المؤسس")}</p>
      <h2 id="founder-title">{copy(locale, "A practice built around understanding the person behind the file.", "ممارسة تُبنى على فهم الشخص وراء الملف.")}</h2>
      <p>{copy(locale, "Hussein Al Harithi brings a composed, attentive approach to each conversation — beginning with the context and ending with a clear next step.", "يتعامل حسين الحارثي مع كل محادثة بهدوء واهتمام؛ يبدأ بالسياق وينتهي بخطوة تالية واضحة.")}</p>
      <Link href={profileHref}>{copy(locale, "Read the profile", "اقرأ الملف التعريفي")}<ArrowUpRight aria-hidden="true" size={18} /></Link>
    </motion.div>
    <motion.div className={styles.founderArt} initial={{ clipPath: reduced ? "inset(0)" : "inset(8% 0 0 0)", opacity: 0 }} transition={{ duration: reduced ? 0 : .65, ease: "easeOut", delay: reduced ? 0 : .08 }} viewport={{ amount: .25, once: true }} whileInView={{ clipPath: "inset(0)", opacity: 1 }}>
      <span aria-hidden="true" className={styles.founderNumber}>01</span>
      <div className={styles.founderRule} />
      <div className={styles.founderPortrait}>
        <Image alt={copy(locale, "Hussein Al Harithi in legal attire", "حسين الحارثي بالزي القانوني")} fill sizes="(max-width: 800px) 100vw, 45vw" src="/Hussein-Alharathi-2.webp" />
      </div>
      <motion.div aria-hidden="true" className={styles.founderFrame} initial={{ scaleX: reduced ? 1 : 0 }} transition={{ duration: reduced ? 0 : .5, ease: "easeOut", delay: reduced ? 0 : .28 }} viewport={{ once: true }} whileInView={{ scaleX: 1 }} />
    </motion.div>
  </section>;
}
