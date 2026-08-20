"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { localizeService } from "@/i18n/format";
import { LAW_SERVICES } from "@/constants/Services";
import { serviceVisualFor } from "./serviceVisuals";
import styles from "./ServicesEditorial.module.css";

const copy = {
  ar: {
    eyebrow: "مجالات الممارسة",
    title: "فهرس للممارسة القانونية في المسائل التي أمامك.",
    lead: "استكشف المجال الذي يمنح قضيتك إطارها الأوضح، ثم ابدأ بمحادثة مدروسة.",
    location: "أبوظبي · الإمارات",
    context: "من أول سؤال إلى الخطوة التالية، نساعدك على تحديد المسار القانوني المناسب بثقة ووضوح.",
    explorerEyebrow: "مستكشف الممارسة",
    explorerTitle: "اعثر على مجال الممارسة الذي يوضح قضيتك.",
    explorerLead: "اختر مجالًا لعرض نبذة مركزة ومسار واضح إلى تفاصيل الخدمة.",
    viewService: "عرض الخدمة",
    book: "احجز استشارة",
    guidanceTitle: "غير متأكد من نوع الخدمة المناسبة لحالتك؟",
    guidanceLead: "ابدأ باستشارة أولية، وسنساعدك على تنظيم السؤال قبل اتخاذ الخطوة التالية.",
    preview: "معاينة الخدمة",
  },
  en: {
    eyebrow: "Practice areas",
    title: "A practice index for the matters in front of you.",
    lead: "Explore the area that gives your matter its clearest frame, then begin with a considered conversation.",
    location: "Abu Dhabi · UAE",
    context: "From the first question to the next step, we help you identify the legal path with clarity and confidence.",
    explorerEyebrow: "Practice explorer",
    explorerTitle: "Find the practice area that best frames your matter.",
    explorerLead: "Choose a practice area for a focused introduction and a clear route to its service detail.",
    viewService: "View service",
    book: "Book a consultation",
    guidanceTitle: "Not sure which service applies to your matter?",
    guidanceLead: "Start with an initial consultation and we will help bring the question into focus before the next step.",
    preview: "Preview service",
  },
} as const;

export function ServicesEditorial() {
  const locale = useLocale();
  const text = copy[locale];
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(LAW_SERVICES[0]?.id ?? "criminal");
  const [openId, setOpenId] = useState<string | null>(LAW_SERVICES[0]?.id ?? null);
  const active = LAW_SERVICES.find((service) => service.id === activeId) ?? LAW_SERVICES[0];
  const ActiveIcon = active.icon;
  const activeCopy = localizeService(locale, active);
  const activeVisual = serviceVisualFor(active.id);

  return (
    <main className={styles.page}>
      <section className={styles.hero} data-testid="services-hero">
        <div className={styles.heroInner}>
          <p className={styles.label}>{text.eyebrow}</p>
          <h1>{text.title}</h1>
          <p className={styles.heroLead}>{text.lead}</p>
          <div className={styles.heroContext}>
            <span>{text.location}</span>
            <span aria-hidden="true" className={styles.contextRule} />
            <span>{text.context}</span>
          </div>
        </div>
        <div aria-hidden="true" className={styles.heroMotif} />
      </section>

      <section className={styles.explorer} data-testid="services-explorer" aria-labelledby="services-explorer-title">
        <header className={styles.explorerHeading}>
          <p className={styles.label}>{text.explorerEyebrow}</p>
          <h2 id="services-explorer-title">{text.explorerTitle}</h2>
          <p>{text.explorerLead}</p>
        </header>

        <div className={styles.desktopExplorer}>
          <div className={styles.index} aria-label={text.explorerEyebrow}>
            {LAW_SERVICES.map((service, index) => {
              const serviceCopy = localizeService(locale, service);
              const selected = service.id === active.id;
              return (
                <div className={styles.indexRow} key={service.id}>
                  <span className={styles.indexNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <Link className={styles.indexLink} data-testid={`service-link-${service.id}`} href={localizePath(`/services/${service.id}`, locale)}>{serviceCopy.title}</Link>
                  <button aria-label={`${text.preview}: ${serviceCopy.title}`} aria-pressed={selected} className={styles.indexButton} data-testid={`service-index-${service.id}`} onClick={() => setActiveId(service.id)} onFocus={() => setActiveId(service.id)} type="button"><ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} /></button>
                </div>
              );
            })}
          </div>

          <article className={styles.preview} data-testid="service-preview">
            <div className={styles.previewImage} data-service-source={activeVisual.src} data-testid="service-preview-image">
              <Image alt={activeVisual.alt[locale]} fill priority sizes="(max-width: 1100px) 46vw, 540px" src={activeVisual.src} style={{ objectPosition: activeVisual.position }} />
              <span aria-hidden="true" className={styles.imageWash} />
            </div>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className={styles.previewContent}
                exit={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
                key={active.id}
                transition={{ duration: reducedMotion ? 0 : 0.22, ease: "easeOut" }}
              >
                <span className={styles.previewIcon}><ActiveIcon aria-hidden="true" size={24} strokeWidth={1.5} /></span>
                <p className={styles.previewNumber}>{String(LAW_SERVICES.indexOf(active) + 1).padStart(2, "0")}</p>
                <h3>{activeCopy.title}</h3>
                <p>{activeCopy.description}</p>
                <div className={styles.previewActions}>
                  <Link href={localizePath(`/services/${active.id}`, locale)}>{text.viewService}<ArrowUpRight aria-hidden="true" size={17} /></Link>
                  <Link className={styles.quietLink} href={localizePath("/consultation", locale)}>{text.book}</Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </article>
        </div>

        <div className={styles.mobileExplorer} data-testid="services-mobile-accordion">
          {LAW_SERVICES.map((service, index) => {
            const serviceCopy = localizeService(locale, service);
            const ServiceIcon = service.icon;
            const open = openId === service.id;
            return (
              <article className={styles.mobileItem} data-open={open} key={service.id}>
                <button
                  aria-expanded={open}
                  className={styles.mobileButton}
                  data-testid={`service-mobile-${service.id}`}
                  onClick={() => setOpenId(open ? null : service.id)}
                  type="button"
                >
                  <span className={styles.indexNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span>{serviceCopy.title}</span>
                  <Plus aria-hidden="true" className={styles.plus} size={20} strokeWidth={1.5} />
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      animate={{ height: "auto", opacity: 1 }}
                      className={styles.mobilePanel}
                      exit={{ height: 0, opacity: 0 }}
                      initial={{ height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
                    >
                      <div className={styles.mobileContent}>
                        <ServiceIcon aria-hidden="true" size={21} strokeWidth={1.5} />
                        <p>{serviceCopy.description}</p>
                        <Link href={localizePath(`/services/${service.id}`, locale)}>{text.viewService}<ArrowUpRight aria-hidden="true" size={16} /></Link>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.guidance} data-testid="services-guidance">
        <div>
          <p className={styles.label}>{text.location}</p>
          <h2>{text.guidanceTitle}</h2>
          <p>{text.guidanceLead}</p>
        </div>
        <Link href={localizePath("/consultation", locale)}>{text.book}<ArrowUpRight aria-hidden="true" size={18} /></Link>
      </section>
    </main>
  );
}
