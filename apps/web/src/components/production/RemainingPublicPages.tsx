"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check, Mail, MapPin, Phone } from "lucide-react";
import { use } from "react";
import { notFound } from "next/navigation";
import { LAW_SERVICES } from "@/constants/Services";
import { BookingSystem } from "@/components/consultation/molecules/BookingSystem";
import { ContactForm } from "@/components/contact/ContactForm";
import { localizePath, useLocale } from "@/components/providers/LocaleProvider";
import { localizeService } from "@/i18n/format";
import { messages } from "@/i18n/messages";
import styles from "./RemainingPublicPages.module.css";

const text = (locale: "ar" | "en", en: string, ar: string) => locale === "en" ? en : ar;

function Label({ children }: { children: React.ReactNode }) { return <p className={styles.label}>{children}</p>; }

export function AboutEditorial() {
  const locale = useLocale(); const t = messages[locale].public.about; const go = (path: string) => localizePath(path, locale);
  return <main className={styles.page}><section className={styles.aboutIntro}><div><Label>{text(locale, "The firm / Abu Dhabi", "المكتب / أبوظبي")}</Label><h1>{t.title}</h1><p>{t.subtitle}</p></div><div className={styles.aboutImage}><Image alt={text(locale, "Attorney in a contemporary legal office", "محامٍ في مكتب قانوني معاصر")} fill priority sizes="(max-width: 760px) 100vw, 42vw" src="/images/founder-portrait.png"/></div></section><section className={styles.bio}><div><Label>{text(locale, "A considered practice", "ممارسة مدروسة")}</Label><h2>{t.bioName}</h2></div><p>{t.bioDescription}</p><blockquote>{text(locale, "“Clear advice starts with a precise understanding of the person behind the matter.”", "«الاستشارة الواضحة تبدأ بفهم دقيق للشخص وراء القضية.»")}</blockquote></section><section className={styles.principles}><header><Label>{t.philosophyTitle}</Label><h2>{text(locale, "The principles that shape the work.", "المبادئ التي تصوغ العمل.")}</h2></header><div>{t.philosophy.map((item, index) => <article key={item.title}><span>0{index + 1}</span><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section><section className={styles.timeline}><div><Label>{text(locale, "Professional record", "السجل المهني")}</Label><h2>{text(locale, "Experience and education, in context.", "الخبرة والتعليم، في سياقهما.")}</h2></div><div className={styles.timelineLists}>{[[t.experience, t.experienceItems], [t.education, t.educationItems]].map(([title, entries]) => <section key={title as string}><h3>{title as string}</h3>{(entries as Array<{ year: string; title: string; company: string }>).map((item) => <div key={`${item.year}-${item.title}`}><span>{item.year}</span><p><b>{item.title}</b>{item.company}</p></div>)}</section>)}</div></section><section className={styles.pageClosing}><h2>{text(locale, "A conversation is the right place to begin.", "المحادثة هي المكان الصحيح للبدء.")}</h2><Link href={`${go("/consultation")}#consultation`}>{text(locale, "Arrange a consultation", "رتّب استشارة")} <ArrowUpRight size={19}/></Link></section></main>;
}

export function ServiceDetailEditorial({ params }: { params: Promise<{ slug: string }> }) {
  const locale = useLocale(); const { slug } = use(params); const service = LAW_SERVICES.find((item) => item.id === slug); if (!service) notFound(); const copy = localizeService(locale, service); const go = (path: string) => localizePath(path, locale);
  return <main className={styles.page}><section className={styles.serviceHero}><p>0{LAW_SERVICES.findIndex((item) => item.id === service.id) + 1}</p><div><Label>{text(locale, "Practice area", "مجال الممارسة")}</Label><h1>{copy.title}</h1><p>{copy.description}</p></div><Link href={`${go("/consultation")}#consultation`}>{text(locale, "Book a consultation", "احجز استشارة")} <ArrowUpRight size={18}/></Link></section><section className={styles.serviceBody}><div className={styles.serviceLead}><Label>{text(locale, "How we can help", "كيف يمكننا المساعدة")}</Label><h2>{text(locale, "A focused legal approach, shaped around the details of your matter.", "منهج قانوني مركز، يُبنى حول تفاصيل قضيتك.")}</h2><p>{text(locale, "The consultation creates space to understand the context, identify the relevant legal questions, and consider a structured next step.", "تتيح الاستشارة مساحة لفهم السياق وتحديد الأسئلة القانونية ذات الصلة والنظر في خطوة تالية منظمة.")}</p></div><ol>{service.features?.map((feature, index) => <li key={feature.title}><span>0{index + 1}</span><div><h3>{feature.title}</h3><p>{feature.description}</p></div><Check size={19}/></li>)}</ol></section><section className={styles.preparation}><div><Label>{text(locale, "Before the consultation", "قبل الاستشارة")}</Label><h2>{text(locale, "Bring the context that helps us understand the matter.", "أحضر السياق الذي يساعدنا على فهم القضية.")}</h2></div><p>{text(locale, "Relevant documents, a concise timeline, and the questions most important to you can help make the conversation more focused.", "يمكن للمستندات ذات الصلة والتسلسل الزمني المختصر والأسئلة الأهم بالنسبة لك أن تجعل الحديث أكثر تركيزًا.")}</p></section><nav className={styles.otherServices} aria-label={text(locale, "Other services", "خدمات أخرى")}><Label>{text(locale, "Continue exploring", "واصل الاستكشاف")}</Label>{LAW_SERVICES.filter((item) => item.id !== service.id).slice(0, 4).map((item) => <Link href={go(`/services/${item.id}`)} key={item.id}>{localizeService(locale, item).title}<ArrowUpRight size={17}/></Link>)}</nav></main>;
}

export function ConsultationEditorial() {
  const locale = useLocale(); const t = messages[locale].public.consultation;
  return <main className={styles.page}><section className={styles.bookingIntro}><div><Label>{text(locale, "Private consultation", "استشارة خاصة")}</Label><h1>{t.title}</h1><p>{t.subtitle}</p><ol><li><span>01</span>{text(locale, "Choose the relevant service", "اختر الخدمة ذات الصلة")}</li><li><span>02</span>{text(locale, "Select your preferred date and time", "حدد التاريخ والوقت المناسبين")}</li><li><span>03</span>{text(locale, "Share the essential details", "شارك التفاصيل الأساسية")}</li></ol></div><div className={styles.bookingPanel}><BookingSystem /></div></section></main>;
}

export function ContactEditorial() {
  const locale = useLocale(); const t = messages[locale].public.contact;
  return <main className={styles.page}><section className={styles.contactIntro}><div><Label>{text(locale, "Start a conversation", "ابدأ محادثة")}</Label><h1>{t.title}</h1><p>{t.subtitle}</p><p className={styles.contactNote}>{text(locale, "Tell us what you need help understanding. The right next step often starts with a clear question.", "أخبرنا بما تحتاج إلى فهمه. غالبًا ما تبدأ الخطوة التالية الصحيحة بسؤال واضح.")}</p><address><a href="tel:+971502001797"><Phone size={17}/><bdi>0502001797</bdi></a><a href="mailto:info@hussein.ae"><Mail size={17}/><bdi>info@hussein.ae</bdi></a><p><MapPin size={17}/>{messages[locale].public.footer.location}</p></address></div><div className={styles.contactForm}><ContactForm /></div></section></main>;
}
