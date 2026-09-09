"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, BriefcaseBusiness, LockKeyhole, MessageSquareText } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { LAW_SERVICES } from "@/constants/Services";
import { localizeService } from "@/i18n/format";

import { FounderSection } from "./FounderSection";
import { HeroPortraitRotation } from "./HeroPortraitRotation";
import { LegalJourney } from "./LegalJourney";
import { MatterFinderTeaser } from "@/components/legal-matter-finder/MatterFinderTeaser";
import styles from "./EditorialHome.module.css";
import { TeamSection } from "./TeamSection";
import { UaeLegalPresence } from "./UaeLegalPresence";
import { useHydrationSafeReducedMotion } from "./useHydrationSafeReducedMotion";

const copy = (locale: "ar" | "en", en: string, ar: string) => locale === "en" ? en : ar;

const trustValues = [
  [LockKeyhole, "Confidential handling", "تعامل بسرية"],
  [MessageSquareText, "Clear communication", "تواصل واضح"],
  [BriefcaseBusiness, "Structured guidance", "توجيه منظم"],
] as const;

export function EditorialHome() {
  const locale = useLocale();
  const reduced = useHydrationSafeReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const architectureY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 38]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -18]);
  const go = (path: string) => localizePath(path, locale);
  const entrance = (delay: number) => ({ delay: reduced ? 0 : delay, duration: reduced ? 0 : .54, ease: "easeOut" as const });
  const rise = (delay: number) => ({ animate: { opacity: 1, y: 0 }, initial: { opacity: 0, y: reduced ? 0 : 15 }, transition: entrance(delay) });

  return <div className={styles.home}>
    <section aria-labelledby="home-title" className={styles.hero} data-testid="homepage-hero" ref={heroRef}>
      <motion.div className={styles.heroArchitecture} style={{ y: architectureY }}><Image alt={copy(locale, "Contemporary legal office architecture", "هندسة مكتب قانوني معاصر")} fill priority sizes="100vw" src="/images/editorial-office.png" /></motion.div>
      <div className={styles.heroCopy}>
        <motion.div {...rise(0)} className={styles.heroBrand}><span aria-hidden="true" /><p>{copy(locale, "Legal services & consultations · Abu Dhabi", "خدمات واستشارات قانونية · أبوظبي")}</p></motion.div>
        <motion.p {...rise(.07)} className={styles.eyebrow}>{copy(locale, "A private legal practice", "ممارسة قانونية خاصة")}</motion.p>
        <motion.h1 {...rise(.14)} id="home-title">{copy(locale, "Clarity for the decision in front of you.", "وضوح للقرار الذي أمامك.")}</motion.h1>
        <motion.p {...rise(.22)} className={styles.lead}>{copy(locale, "Careful counsel for matters that deserve discretion, direct communication, and a disciplined legal path.", "استشارة مدروسة للقضايا التي تستحق السرية والتواصل المباشر ومسارًا قانونيًا منضبطًا.")}</motion.p>
        <motion.div {...rise(.3)} className={styles.actions}><Link href={`${go("/consultation")}#consultation`}>{copy(locale, "Arrange a consultation", "رتّب استشارة")}<ArrowUpRight aria-hidden="true" size={18} /></Link><Link href={go("/services")}>{copy(locale, "Explore practice areas", "استكشف مجالات الممارسة")}</Link></motion.div>
        <motion.p {...rise(.38)} className={styles.heroNote}><span>01</span>{copy(locale, "Hussein Al Harithi · Attorney & Private Notary", "حسين الحارثي · محامٍ وكاتب عدل خاص")}</motion.p>
      </div>
      <motion.div animate={{ clipPath: "inset(0 0 0 0)", opacity: 1, scale: 1, x: 0 }} className={styles.heroPortrait} initial={{ clipPath: reduced ? "inset(0)" : "inset(0 0 100% 0)", opacity: 0, scale: reduced ? 1 : 1.025, x: locale === "ar" ? -12 : 12 }} style={{ y: portraitY }} transition={entrance(.29)}><motion.div animate={{ scaleY: 1 }} className={styles.portraitHalo} initial={{ scaleY: reduced ? 1 : 0 }} transition={entrance(.46)} /><HeroPortraitRotation locale={locale} reduced={reduced} /></motion.div>
      <a className={styles.scrollIndicator} href="#services"><span>{copy(locale, "Explore", "استكشف المكتب")}</span><ArrowDown aria-hidden="true" size={15} /></a>
    </section>

    <section aria-label={copy(locale, "Practice values", "قيم الممارسة")} className={styles.trust}>
      <p>{copy(locale, "Legal work is personal. Its handling should be exact.", "العمل القانوني شخصي، وطريقة التعامل معه يجب أن تكون دقيقة.")}</p>
      {trustValues.map(([Icon, en, ar], index) => <motion.div initial={{ opacity: 0, y: reduced ? 0 : 10 }} key={en} transition={{ delay: reduced ? 0 : index * .07, duration: reduced ? 0 : .38 }} viewport={{ amount: .65, once: true }} whileInView={{ opacity: 1, y: 0 }}><Icon aria-hidden="true" size={18}/><span>{copy(locale, en, ar)}</span></motion.div>)}
    </section>

    <section className={styles.services} data-testid="homepage-services-index" id="services">
      <header><p className={styles.eyebrow}>{copy(locale, "Practice areas", "مجالات الممارسة")}</p><div><h2>{copy(locale, "Law, considered in the detail.", "القانون، يُنظر إليه في تفاصيله.")}</h2><p>{copy(locale, "Explore the practice area that best frames your matter, then begin with an informed conversation.", "استكشف مجال الممارسة الذي يوضح قضيتك، ثم ابدأ بمحادثة واعية.")}</p></div></header>
      <ol>{LAW_SERVICES.map((service, index) => { const serviceCopy = localizeService(locale, service); return <li key={service.id}><Link aria-label={`${copy(locale, "View", "عرض")} ${serviceCopy.title}`} className={styles.serviceRow} href={go(`/services/${service.id}`)}><span>0{index + 1}</span><div><h3>{serviceCopy.title}</h3><p>{serviceCopy.description}</p></div><ArrowUpRight aria-hidden="true" size={19}/></Link></li>; })}</ol>
      <Link className={styles.servicesLink} href={go("/services")}>{copy(locale, "View all practice areas", "عرض كل مجالات الممارسة")}<ArrowUpRight aria-hidden="true" size={18}/></Link>
    </section>

    <MatterFinderTeaser locale={locale} />

    <FounderSection locale={locale} profileHref={go("/about")} />
    <TeamSection locale={locale} />
    <UaeLegalPresence locale={locale} />
    <LegalJourney locale={locale} />
  </div>;
}
