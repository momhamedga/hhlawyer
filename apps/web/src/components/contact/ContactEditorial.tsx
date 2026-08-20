"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone, Send } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { messages } from "@/i18n/messages";
import { ContactForm } from "./ContactForm";
import styles from "./ContactEditorial.module.css";

const copy = {
  ar: {
    eyebrow: "تواصل معنا",
    title: "ابدأ بمحادثة مباشرة وواضحة.",
    lead: "شارك رسالتك أو سؤالك العام، وسيتابع المكتب التواصل عبر مسار الرسائل القائم.",
    location: "أبوظبي · الإمارات العربية المتحدة",
    contactLabel: "طرق التواصل المباشر",
    contactTitle: "الوصول إلى المكتب، ببساطة.",
    phone: "الهاتف",
    email: "البريد الإلكتروني",
    office: "الموقع",
    formLabel: "أرسل رسالة",
    formTitle: "أخبرنا بما تحتاج إلى فهمه.",
    formLead: "المساحة مخصصة للتواصل العام. للاستشارة القانونية المنظمة، استخدم مسار الاستشارة.",
    noteLabel: "سياق الرسالة",
    note: "شارك المعلومات الأساسية التي تساعد على فهم موضوع رسالتك عبر مسار التواصل الحالي.",
    alternativeLabel: "تحتاج إلى استشارة قانونية منظمة؟",
    alternativeTitle: "ابدأ بطلب استشارة.",
    alternativeAction: "اطلب استشارة",
  },
  en: {
    eyebrow: "Contact",
    title: "Begin with a direct, clear conversation.",
    lead: "Share your message or general question, and the practice will continue communication through the existing message workflow.",
    location: "Abu Dhabi · United Arab Emirates",
    contactLabel: "Direct contact",
    contactTitle: "Reach the practice, simply.",
    phone: "Phone",
    email: "Email",
    office: "Location",
    formLabel: "Send a message",
    formTitle: "Tell us what you need clarity on.",
    formLead: "This space is for general communication. For a structured legal consultation, use the consultation route.",
    noteLabel: "Message context",
    note: "Share the essential information that helps frame your message through the existing contact workflow.",
    alternativeLabel: "Need a structured legal consultation?",
    alternativeTitle: "Begin with a consultation request.",
    alternativeAction: "Request a consultation",
  },
} as const;

export function ContactEditorial() {
  const locale = useLocale();
  const content = copy[locale];
  const location = messages[locale].public.footer.location;
  const reducedMotion = useReducedMotion();
  const enter = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 };
  const contactRows = [
    { id: "phone", icon: Phone, label: content.phone, value: "0502001797", href: "tel:+971502001797", ltr: true },
    { id: "email", icon: Mail, label: content.email, value: "info@hussein.ae", href: "mailto:info@hussein.ae", ltr: true },
    { id: "location", icon: MapPin, label: content.office, value: location, href: undefined, ltr: false },
  ];

  return (
    <div className={styles.page}>
      <section className={styles.hero} data-testid="contact-hero" aria-labelledby="contact-title">
        <motion.div animate={{ opacity: 1, y: 0 }} initial={enter} transition={{ duration: reducedMotion ? 0 : 0.42, ease: "easeOut" }}>
          <p className={styles.label}>{content.eyebrow}</p>
          <h1 id="contact-title">{content.title}</h1>
          <p className={styles.heroLead}>{content.lead}</p>
          <p className={styles.location}>{content.location}</p>
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} className={styles.contactMotif} initial={enter} transition={{ duration: reducedMotion ? 0 : 0.48, delay: reducedMotion ? 0 : 0.05, ease: "easeOut" }} aria-hidden="true"><span>01</span><i /><i /><b /></motion.div>
      </section>

      <section className={styles.contactSection} data-testid="contact-information" aria-labelledby="contact-information-title">
        <header>
          <p className={styles.label}>{content.contactLabel}</p>
          <h2 id="contact-information-title">{content.contactTitle}</h2>
        </header>
        <address className={styles.contactRows}>
          {contactRows.map(({ id, icon: Icon, label, value, href, ltr }, index) => {
            const row = <><span className={styles.contactNumber} data-testid={`contact-number-${id}`}>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden="true" className={styles.contactIcon} data-testid={`contact-icon-${id}`} size={18} strokeWidth={1.35} /><span className={styles.contactLabel} data-testid={`contact-label-${id}`}>{label}</span>{ltr ? <bdi className={styles.contactValue} data-testid={`contact-value-${id}`} dir="ltr">{value}</bdi> : <strong className={styles.contactValue} data-testid={`contact-value-${id}`}>{value}</strong>}<ArrowUpRight aria-hidden="true" className={styles.contactArrow} data-testid={`contact-arrow-${id}`} size={18} strokeWidth={1.35} /></>;
            return href ? <a className={styles.contactRow} data-testid={`contact-row-${id}`} href={href} key={label}>{row}</a> : <div className={styles.contactRow} data-testid={`contact-row-${id}`} key={label}>{row}</div>;
          })}
        </address>
      </section>

      <section className={styles.intake} data-testid="contact-intake" aria-labelledby="contact-form-title">
        <div className={styles.formIntro}>
          <p className={styles.label}>{content.formLabel}</p>
          <h2 id="contact-form-title">{content.formTitle}</h2>
          <p>{content.formLead}</p>
          <div className={styles.contextNote} data-testid="contact-context"><Send aria-hidden="true" size={18} strokeWidth={1.35} /><div><p className={styles.label}>{content.noteLabel}</p><p>{content.note}</p></div></div>
        </div>
        <div className={styles.formSurface} data-testid="contact-form-surface"><span className={styles.formRule} aria-hidden="true" /><ContactForm /></div>
      </section>

      <section className={styles.alternative} data-testid="contact-consultation-alternative" aria-labelledby="contact-alternative-title">
        <div><p className={styles.label}>{content.alternativeLabel}</p><h2 id="contact-alternative-title">{content.alternativeTitle}</h2></div>
        <Link href={localizePath("/consultation", locale)}>{content.alternativeAction}<ArrowUpRight aria-hidden="true" size={19} /></Link>
      </section>
    </div>
  );
}
