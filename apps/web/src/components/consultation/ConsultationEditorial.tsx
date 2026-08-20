"use client";

import { ArrowUpRight, FileText, ShieldCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/components/providers/LocaleProvider";
import { BookingSystem } from "./molecules/BookingSystem";
import styles from "./ConsultationEditorial.module.css";

const copy = {
  ar: {
    eyebrow: "الاستشارة القانونية",
    title: "ابدأ بمشاركة ما تحتاج إلى فهمه.",
    lead: "اختر المجال والوقت المناسبين، ثم شارك المعلومات الأساسية ليُراجع الطلب من خلال مسار الاستشارة الحالي.",
    context: "استشارة خاصة · أبوظبي، الإمارات العربية المتحدة",
    intakeLabel: "بيانات الاستشارة",
    intakeTitle: "مسار واضح نحو المحادثة الأولى.",
    intakeLead: "تنتقل خطوات الحجز بهدوء من تحديد المجال إلى التفاصيل التي تساعد على فهم طلبك.",
    handling: ["تعامل خاص", "معلومات واضحة", "تواصل منظم"],
    nextLabel: "بعد الإرسال",
    nextTitle: "ما الذي يحدث بعد ذلك؟",
    nextSteps: [
      ["إرسال المعلومات الأساسية", "اختر المجال والموعد ثم أضف التفاصيل التي تود مشاركتها."],
      ["مراجعة الطلب", "يظهر طلب الاستشارة ضمن مسار المراجعة القائم."],
      ["التواصل بشأن الخطوة التالية", "سيتم التواصل معك لتأكيد الموعد."],
    ],
    noteLabel: "ملاحظة مهمة",
    note: "يفضل مشاركة المعلومات الأساسية اللازمة لفهم الطلب. لا تعني رسالة الاستلام تأكيدًا نهائيًا للموعد.",
  },
  en: {
    eyebrow: "Legal consultation",
    title: "Start with what you need clarity on.",
    lead: "Choose the relevant area and time, then share the essential context for review through the existing consultation process.",
    context: "Private consultation · Abu Dhabi, United Arab Emirates",
    intakeLabel: "Consultation intake",
    intakeTitle: "A clear path to the first conversation.",
    intakeLead: "The booking steps move calmly from selecting the practice area to the details that help frame your request.",
    handling: ["Private handling", "Clear information", "Structured communication"],
    nextLabel: "After you send",
    nextTitle: "What happens next?",
    nextSteps: [
      ["Share the essential information", "Choose the area and time, then add the details you would like to share."],
      ["Request review", "The consultation request enters the established review workflow."],
      ["Contact about the next step", "We will contact you to confirm the appointment."],
    ],
    noteLabel: "A considered note",
    note: "Share the essential information needed to understand the request. A receipt message does not by itself confirm an appointment.",
  },
} as const;

export function ConsultationEditorial() {
  const locale = useLocale();
  const content = copy[locale];
  const reducedMotion = useReducedMotion();
  const enter = reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 };

  return (
    <div className={styles.page}>
      <section className={styles.hero} data-testid="consultation-hero" aria-labelledby="consultation-title">
        <motion.div animate={{ opacity: 1, y: 0 }} initial={enter} transition={{ duration: reducedMotion ? 0 : 0.42, ease: "easeOut" }}>
          <p className={styles.label}>{content.eyebrow}</p>
          <h1 id="consultation-title">{content.title}</h1>
          <p className={styles.heroLead}>{content.lead}</p>
          <p className={styles.context}>{content.context}</p>
        </motion.div>
        <motion.div animate={{ opacity: 1, y: 0 }} className={styles.documentMotif} initial={enter} transition={{ duration: reducedMotion ? 0 : 0.48, delay: reducedMotion ? 0 : 0.05, ease: "easeOut" }} aria-hidden="true">
          <span>01</span><i /><i /><i /><b />
        </motion.div>
      </section>

      <section className={styles.intake} data-testid="consultation-intake" aria-labelledby="consultation-intake-title">
        <aside className={styles.guidance} data-testid="consultation-context">
          <p className={styles.label}>{content.intakeLabel}</p>
          <h2 id="consultation-intake-title">{content.intakeTitle}</h2>
          <p>{content.intakeLead}</p>
          <ul aria-label={content.intakeLabel}>
            {content.handling.map((item) => <li key={item}><ShieldCheck aria-hidden="true" size={16} strokeWidth={1.4} />{item}</li>)}
          </ul>
        </aside>
        <div className={styles.formSurface} data-testid="consultation-form-surface">
          <div className={styles.formRule} aria-hidden="true" />
          <BookingSystem />
        </div>
      </section>

      <section className={styles.nextSteps} data-testid="consultation-next-steps" aria-labelledby="consultation-next-title">
        <header>
          <p className={styles.label}>{content.nextLabel}</p>
          <h2 id="consultation-next-title">{content.nextTitle}</h2>
        </header>
        <ol>
          {content.nextSteps.map(([title, description], index) => <li key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div><h3>{title}</h3><p>{description}</p></div>
          </li>)}
        </ol>
      </section>

      <section className={styles.note} data-testid="consultation-reassurance" aria-label={content.noteLabel}>
        <FileText aria-hidden="true" size={20} strokeWidth={1.25} />
        <div><p className={styles.label}>{content.noteLabel}</p><p>{content.note}</p></div>
        <ArrowUpRight aria-hidden="true" className={styles.noteArrow} size={22} strokeWidth={1.25} />
      </section>
    </div>
  );
}
