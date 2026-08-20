"use client";

import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, BriefcaseBusiness, ChevronDown, Compass, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";

import styles from "./PreviewExperience.module.css";

type Direction = "01" | "02" | "03";
type Locale = "ar" | "en";

const directionMeta = {
  "01": { name: "Editorial Luxury Law", ar: "القانون التحريري الفاخر", tone: "EDITION 01" },
  "02": { name: "Modern Legal Tech", ar: "التقنية القانونية الحديثة", tone: "SYSTEM 02" },
  "03": { name: "Bold Human-Centered Legal", ar: "قانون إنساني جريء", tone: "STUDIO 03" },
} as const;

const services = [
  ["Commercial disputes", "النزاعات التجارية"],
  ["Corporate counsel", "استشارات الشركات"],
  ["Criminal defense", "الدفاع الجنائي"],
  ["Family matters", "قضايا الأسرة"],
] as const;

const activity = [
  ["C-2048", "Commercial consultation", "استشارة تجارية", "In review", "قيد المراجعة"],
  ["C-2047", "Family case review", "مراجعة قضية أسرية", "Scheduled", "مجدولة"],
  ["C-2046", "Corporate matter", "مسألة شركات", "Complete", "مكتملة"],
] as const;

function copy(locale: Locale, english: string, arabic: string) {
  return locale === "en" ? english : arabic;
}

function ThemeControl() {
  const { setTheme, theme } = useTheme();
  return <div aria-label="Preview theme" className={styles.themeControl} role="group">
    <button aria-label="Light theme" className={theme === "light" ? styles.activeTheme : ""} data-testid="preview-theme-light" onClick={() => setTheme("light")} type="button"><Sun size={15} /></button>
    <button aria-label="Dark theme" className={theme === "dark" ? styles.activeTheme : ""} data-testid="preview-theme-dark" onClick={() => setTheme("dark")} type="button"><Moon size={15} /></button>
  </div>;
}

function PreviewNav({ direction, locale, admin = false }: { direction: Direction; locale: Locale; admin?: boolean }) {
  const [open, setOpen] = useState(false);
  const otherLocale: Locale = locale === "ar" ? "en" : "ar";
  const root = `/${locale}/design-preview/${direction}${admin ? "/admin" : ""}`;
  const localeHref = `/${otherLocale}/design-preview/${direction}${admin ? "/admin" : ""}`;
  const links = admin
    ? [["Overview", "نظرة عامة"], ["Matters", "الملفات"], ["Clients", "العملاء"], ["Reports", "التقارير"]]
    : [["Expertise", "الخبرات"], ["The firm", "المكتب"], ["Insights", "الرؤى"], ["Contact", "تواصل"]];
  return <header className={styles.previewHeader} data-testid={`preview-${direction}-header`}>
    <Link aria-label="Back to design comparison" className={styles.previewMark} href={`/${locale}/design-preview`}>
      <span>H</span><b>{directionMeta[direction].tone}</b>
    </Link>
    <nav aria-label={copy(locale, "Preview navigation", "تنقل المعاينة")} className={styles.desktopNav}>
      {links.map(([en, ar]) => <a href={admin ? "#operations" : "#services"} key={en}>{copy(locale, en, ar)}</a>)}
    </nav>
    <div className={styles.navActions}>
      <ThemeControl />
      <Link className={styles.localeLink} href={localeHref}>{otherLocale.toUpperCase()}</Link>
      <a className={styles.headerCta} href={admin ? "#operations" : "#consultation"}>{copy(locale, admin ? "Open workspace" : "Start a consultation", admin ? "فتح مساحة العمل" : "ابدأ استشارة")}</a>
      <button aria-expanded={open} aria-label={open ? "Close preview menu" : "Open preview menu"} className={styles.menuButton} onClick={() => setOpen((value) => !value)} type="button">{open ? <X size={20} /> : <Menu size={20} />}</button>
    </div>
    {open ? <nav className={styles.mobileNav} aria-label={copy(locale, "Mobile preview navigation", "تنقل المعاينة للهاتف")}>
      {links.map(([en, ar]) => <a href={admin ? "#operations" : "#services"} key={en} onClick={() => setOpen(false)}>{copy(locale, en, ar)}<ArrowUpRight size={17} /></a>)}
      <Link href={root} onClick={() => setOpen(false)}>{copy(locale, "Preview home", "واجهة المعاينة")}</Link>
    </nav> : null}
  </header>;
}

function EditorialPublic({ locale, direction }: { locale: Locale; direction: Direction }) {
  return <>
    <section className={`${styles.hero} ${styles.editorialHero}`} aria-labelledby="preview-title">
      <p className={styles.eyebrow}>{copy(locale, "Independent counsel / Abu Dhabi", "استشارات مستقلة / أبوظبي")}</p>
      <div className={styles.editorialTitle}><span>01</span><h1 id="preview-title">{copy(locale, "Law, with the clarity to move forward.", "القانون، بوضوحٍ يمنحك القدرة على المضي قدمًا.")}</h1></div>
      <div className={styles.heroAside}><p>{copy(locale, "A measured legal practice for decisions that carry weight.", "ممارسة قانونية متزنة للقرارات التي تحمل أثرًا حقيقيًا.")}</p><a href="#consultation">{copy(locale, "Arrange a private consultation", "رتّب استشارة خاصة")} <ArrowDownLeft size={18} /></a></div>
      <div className={styles.editorialArtwork} aria-label={copy(locale, "Architectural legal office study", "دراسة معمارية لمكتب قانوني")}><span>ABU DHABI<br />EST. 2008</span></div>
    </section>
    <section className={styles.editorialStatement}><p>{copy(locale, "The work is personal. The standard is exacting.", "العمل شخصي. والمعيار لا يقبل التنازل.")}</p><span>{copy(locale, "Selected legal practice", "ممارسة قانونية مختارة")}</span></section>
    <section className={styles.editorialServices} id="services"><div><p className={styles.eyebrow}>{copy(locale, "Practice index", "فهرس الممارسات")}</p><h2>{copy(locale, "Built around the matters that matter most.", "مصمم حول القضايا التي تهمك أكثر.")}</h2></div><ol>{services.map(([en, ar], index) => <li key={en}><span>0{index + 1}</span><a href="#consultation">{copy(locale, en, ar)}<ArrowUpRight size={20} /></a></li>)}</ol></section>
    <section className={styles.editorialProfile}><div className={styles.profileFrame}><span>{copy(locale, "Portrait / counsel", "صورة / المستشار")}</span></div><div><p className={styles.eyebrow}>{copy(locale, "The firm", "المكتب")}</p><h2>{copy(locale, "A steady hand for complex, consequential work.", "يد ثابتة للعمل المعقد والمصيري.")}</h2><p>{copy(locale, "Senior judgment, direct communication, and legal strategy shaped around the real life of every client.", "حكم قانوني رفيع، وتواصل مباشر، واستراتيجية تُبنى حول واقع كل عميل.")}</p><a href="#consultation" className={styles.textLink}>{copy(locale, "Meet the practice", "تعرّف على الممارسة")} <ArrowUpRight size={18} /></a></div></section>
    <section className={styles.editorialProcess}><p className={styles.eyebrow}>{copy(locale, "A considered process", "منهج مدروس")}</p>{[["Listen", "نستمع"], ["Frame", "نؤطر"], ["Act", "نتحرك"]].map(([en, ar], index) => <div key={en}><span>0{index + 1}</span><h3>{copy(locale, en, ar)}</h3><p>{copy(locale, ["Your context comes first.", "A legal path made legible.", "Progress with purpose."][index], ["سياقك يأتي أولًا.", "مسار قانوني واضح المعالم.", "تقدم بهدف."][index])}</p></div>)}</section>
    <ConsultationBand locale={locale} direction={direction} />
    <EditorialFooter locale={locale} />
  </>;
}

function TechPublic({ locale, direction }: { locale: Locale; direction: Direction }) {
  return <>
    <section className={`${styles.hero} ${styles.techHero}`} aria-labelledby="preview-title"><div><p className={styles.eyebrow}>{copy(locale, "Legal intelligence / UAE", "ذكاء قانوني / الإمارات")}</p><h1 id="preview-title">{copy(locale, "Decisive legal guidance for a moving world.", "توجيه قانوني حاسم لعالم متسارع.")}</h1><p>{copy(locale, "A high-trust legal practice with the visibility, rigor, and pace modern decisions require.", "ممارسة قانونية عالية الثقة تمنحك الوضوح والدقة والسرعة التي تتطلبها القرارات الحديثة.")}</p><a className={styles.solidButton} href="#consultation">{copy(locale, "Open a consultation", "افتح استشارة")} <ArrowUpRight size={18} /></a></div><div className={styles.signalModule}><div className={styles.signalTop}><span>{copy(locale, "MATTER SIGNAL", "إشارة الملف")}</span><i /></div><strong>92<span>%</span></strong><p>{copy(locale, "case readiness", "جاهزية الملف")}</p><div className={styles.signalRows}><span>{copy(locale, "Brief received", "استلام الموجز")}<b /></span><span>{copy(locale, "Counsel assigned", "تعيين المستشار")}<b /></span><span>{copy(locale, "Strategy mapped", "رسم الاستراتيجية")}<b /></span></div></div></section>
    <section className={styles.techMetrics}>{[["24h", "أول رد"], ["05", "مجالات ممارسة"], ["UAE", "تركيز محلي"], ["1:1", "تواصل مباشر"]].map(([value, label]) => <div key={value}><strong>{value}</strong><span>{copy(locale, label === "أول رد" ? "First response" : label === "مجالات ممارسة" ? "Practice areas" : label === "تركيز محلي" ? "Local focus" : "Direct counsel", label)}</span></div>)}</section>
    <section className={styles.techServices} id="services"><header><p className={styles.eyebrow}>{copy(locale, "Service explorer", "مستكشف الخدمات")}</p><h2>{copy(locale, "Find the right legal track.", "ابحث عن المسار القانوني المناسب.")}</h2><button type="button"><Search size={16} /> {copy(locale, "Explore all", "استكشف الكل")}</button></header><div>{services.map(([en, ar], index) => <a href="#consultation" key={en}><span>0{index + 1}</span><h3>{copy(locale, en, ar)}</h3><p>{copy(locale, "Focused counsel, clear next steps.", "استشارة مركزة وخطوات تالية واضحة.")}</p><ArrowUpRight size={19} /></a>)}</div></section>
    <section className={styles.techSplit}><div><span className={styles.gridTag}>/ 01</span><h2>{copy(locale, "Legal work, made visible.", "العمل القانوني، بوضوح تام.")}</h2><p>{copy(locale, "Structured updates replace uncertainty. Every stage has an owner, a purpose, and a next action.", "تحديثات منظمة بدل الغموض. لكل مرحلة مسؤول وهدف وخطوة تالية.")}</p></div><div className={styles.techTimeline}>{[["01", "Intake mapped", "تحديد المدخلات"], ["02", "Strategy clarified", "توضيح الاستراتيجية"], ["03", "Action coordinated", "تنسيق التنفيذ"]].map(([n, en, ar]) => <div key={n}><span>{n}</span><p>{copy(locale, en, ar)}</p><i /></div>)}</div></section>
    <ConsultationBand locale={locale} direction={direction} />
    <TechFooter locale={locale} />
  </>;
}

function HumanPublic({ locale, direction }: { locale: Locale; direction: Direction }) {
  return <>
    <section className={`${styles.hero} ${styles.humanHero}`} aria-labelledby="preview-title"><p className={styles.heroStamp}>{copy(locale, "LEGAL, BUT HUMAN", "قانون، ولكن بإنسانية")}</p><h1 id="preview-title">{copy(locale, "When it matters, you deserve someone fully in your corner.", "حين يكون الأمر مهمًا، تستحق من يقف في صفك بكل قوة.")}</h1><div className={styles.humanIntro}><p>{copy(locale, "Clear legal help for the decisions that keep you up at night—and the future you want to protect.", "مساعدة قانونية واضحة للقرارات التي تشغلك، وللمستقبل الذي تريد حمايته.")}</p><a href="#consultation">{copy(locale, "Talk to a lawyer", "تحدث إلى محامٍ")} <ArrowUpRight size={20} /></a></div><div className={styles.humanShape} aria-hidden="true" /></section>
    <section className={styles.humanTrust}><p>{copy(locale, "Trusted for the conversations that cannot wait.", "موثوق به للمحادثات التي لا تحتمل الانتظار.")}</p><div><strong>16+</strong><span>{copy(locale, "years of hard-won judgment", "عامًا من الخبرة المتراكمة")}</span></div><div><strong>1:1</strong><span>{copy(locale, "access to your counsel", "تواصل مباشر مع مستشارك")}</span></div></section>
    <section className={styles.humanServices} id="services"><header><p className={styles.eyebrow}>{copy(locale, "How we can help", "كيف يمكننا المساعدة")}</p><h2>{copy(locale, "Your situation is unique. The starting point should be too.", "وضعك فريد. ويجب أن تكون البداية كذلك.")}</h2></header><div>{services.map(([en, ar], index) => <a href="#consultation" key={en}><span>{String(index + 1).padStart(2, "0")}</span><h3>{copy(locale, en, ar)}</h3><p>{copy(locale, "A direct conversation, then a practical way forward.", "حديث مباشر، ثم طريق عملي للمضي قدمًا.")}</p><ArrowUpRight size={20} /></a>)}</div></section>
    <section className={styles.humanFounder}><div className={styles.founderPhoto}><span>{copy(locale, "HUSSEIN AL HARITHI", "حسين الحارثي")}</span></div><div><p className={styles.eyebrow}>{copy(locale, "A practice built on presence", "ممارسة مبنية على الحضور")}</p><blockquote>{copy(locale, "“The right answer begins with being properly heard.”", "«الإجابة الصحيحة تبدأ بالإنصات الحقيقي.»")}</blockquote><p>{copy(locale, "Legal advice should feel direct, grounded, and useful—not distant or difficult to decode.", "يجب أن تكون الاستشارة القانونية مباشرة وواقعية ومفيدة، لا بعيدة أو معقدة.")}</p></div></section>
    <ConsultationBand locale={locale} direction={direction} />
    <HumanFooter locale={locale} />
  </>;
}

function ConsultationBand({ locale, direction }: { locale: Locale; direction: Direction }) {
  return <section className={styles.consultationBand} id="consultation"><p className={styles.eyebrow}>{copy(locale, "The next step", "الخطوة التالية")}</p><h2>{copy(locale, "Start with a conversation that moves things forward.", "ابدأ بمحادثة تدفع الأمور إلى الأمام.")}</h2><a href={`/${locale}/consultation`}>{copy(locale, "Book a consultation", "احجز استشارة")} <ArrowUpRight size={20} /></a><span>{directionMeta[direction].tone}</span></section>;
}

function EditorialFooter({ locale }: { locale: Locale }) { return <footer className={styles.editorialFooter}><p>HUSSEIN<br />AL HARITHI</p><div><span>{copy(locale, "A private legal practice in Abu Dhabi.", "ممارسة قانونية خاصة في أبوظبي.")}</span><a href="mailto:info@example.com">info@example.com</a></div><small>© 2026 / UAE</small></footer>; }
function TechFooter({ locale }: { locale: Locale }) { return <footer className={styles.techFooter}><div><strong>H/LAW</strong><p>{copy(locale, "The legal operating system for consequential decisions.", "نظامك القانوني للقرارات المصيرية.")}</p></div><div><a href="#services">{copy(locale, "Services", "الخدمات")}</a><a href="#consultation">{copy(locale, "Consultation", "استشارة")}</a><a href="#">{copy(locale, "Privacy", "الخصوصية")}</a></div><span>© 2026</span></footer>; }
function HumanFooter({ locale }: { locale: Locale }) { return <footer className={styles.humanFooter}><p>{copy(locale, "Let’s make the next step clearer.", "لنجعل الخطوة التالية أوضح.")}</p><a href="#consultation">{copy(locale, "Start here", "ابدأ من هنا")} <ArrowUpRight size={20} /></a><small>{copy(locale, "Abu Dhabi · United Arab Emirates · © 2026", "أبوظبي · الإمارات العربية المتحدة · © ٢٠٢٦")}</small></footer>; }

function AdminPrototype({ direction, locale }: { direction: Direction; locale: Locale }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const rows = useMemo(() => activity.filter((item) => `${item[0]} ${item[1]} ${item[2]}`.toLowerCase().includes(query.toLowerCase()) && (status === "all" || item[3] === status)), [query, status]);
  const label = (en: string, ar: string) => copy(locale, en, ar);
  return <div className={`${styles.adminPreview} ${styles[`admin${direction}`]}`} id="operations">
    <PreviewNav direction={direction} locale={locale} admin />
    <aside className={styles.adminSidebar}><div className={styles.sidebarBrand}><BriefcaseBusiness size={20} /><span>{label("Workspace", "مساحة العمل")}</span></div>{[["Overview", "نظرة عامة"], ["Consultations", "الاستشارات"], ["Contacts", "التواصل"], ["Services", "الخدمات"], ["Team", "الفريق"]].map(([en, ar], index) => <a className={index === 0 ? styles.current : ""} href="#operations" key={en}><span>0{index + 1}</span>{label(en, ar)}</a>)}<div className={styles.sidebarFoot}><span>{label("Secure workspace", "مساحة عمل آمنة")}</span><b>ADMIN</b></div></aside>
    <main className={styles.adminMain}><section className={styles.adminHeading}><div><p>{directionMeta[direction].tone} / {label("Operations", "العمليات")}</p><h1>{label("A clearer view of the work ahead.", "رؤية أوضح للعمل القادم.")}</h1></div><button type="button">{label("New consultation", "استشارة جديدة")} <ArrowUpRight size={17} /></button></section>
      <section className={styles.metricStrip} aria-label={label("Summary metrics", "مؤشرات موجزة")}>{[["24", "Active matters", "ملفات نشطة"], ["08", "Awaiting reply", "بانتظار الرد"], ["92%", "Response within target", "الرد ضمن الهدف"], ["04", "Today’s meetings", "اجتماعات اليوم"]].map(([value, en, ar]) => <div key={en}><strong>{value}</strong><span>{label(en, ar)}</span></div>)}</section>
      <section className={styles.operationsGrid}><div className={styles.workQueue}><header><div><p>{label("Work queue", "قائمة العمل")}</p><h2>{label("Recent matters", "أحدث الملفات")}</h2></div><a href="#operations">{label("View all", "عرض الكل")} <ArrowUpRight size={16} /></a></header><div className={styles.filters}><label><Search size={16} /><input aria-label={label("Search matters", "البحث في الملفات")} onChange={(event) => setQuery(event.target.value)} placeholder={label("Search reference or matter", "ابحث بالمرجع أو الملف")} value={query} /></label><label><span>{label("Status", "الحالة")}</span><select aria-label={label("Filter status", "تصفية الحالة")} onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">{label("All", "الكل")}</option><option value="In review">{label("In review", "قيد المراجعة")}</option><option value="Scheduled">{label("Scheduled", "مجدولة")}</option><option value="Complete">{label("Complete", "مكتملة")}</option></select><ChevronDown size={14} /></label></div><div className={styles.tableWrap}><table><thead><tr><th>{label("Reference", "المرجع")}</th><th>{label("Matter", "الملف")}</th><th>{label("Status", "الحالة")}</th><th>{label("Action", "الإجراء")}</th></tr></thead><tbody>{rows.map(([id, en, ar, statusEn, statusAr]) => <tr key={id}><td>{id}</td><td>{label(en, ar)}</td><td><span className={`${styles.status} ${styles[statusEn.replace(" ", "").toLowerCase()]}`}>{label(statusEn, statusAr)}</span></td><td><button type="button" aria-label={`${label("Open", "فتح")} ${id}`}><ArrowUpRight size={17} /></button></td></tr>)}</tbody></table></div></div>
        <aside className={styles.activityPanel}><p>{label("Today", "اليوم")}</p><h2>{label("A calm command center.", "مركز تحكم هادئ.")}</h2><div className={styles.activityLine}><span>09:30</span><p>{label("Client review", "مراجعة عميل")}</p></div><div className={styles.activityLine}><span>11:00</span><p>{label("Case strategy", "استراتيجية قضية")}</p></div><div className={styles.activityLine}><span>14:15</span><p>{label("Document sign-off", "اعتماد مستند")}</p></div><button type="button">{label("Open calendar", "فتح التقويم")}</button></aside>
      </section>
    </main>
  </div>;
}

export function PreviewExperience({ direction, locale, admin = false }: { direction: Direction; locale: Locale; admin?: boolean }) {
  return <div className={styles.previewCanvas} data-admin={admin || undefined} data-direction={direction} data-testid={`design-preview-${direction}${admin ? "-admin" : ""}`}>
    {admin ? <AdminPrototype direction={direction} locale={locale} /> : <div className={styles.publicPreview}><PreviewNav direction={direction} locale={locale} />{direction === "01" ? <EditorialPublic direction={direction} locale={locale} /> : direction === "02" ? <TechPublic direction={direction} locale={locale} /> : <HumanPublic direction={direction} locale={locale} />}</div>}
  </div>;
}

export function DirectionComparison({ locale }: { locale: Locale }) {
  const label = (en: string, ar: string) => copy(locale, en, ar);
  const entries: Array<[Direction, string, string, string, string]> = [
    ["01", "Editorial Luxury Law", "القانون التحريري الفاخر", "Architectural, composed, and authority-led.", "معماري، متزن، ويقود بالثقة."],
    ["02", "Modern Legal Tech", "التقنية القانونية الحديثة", "Structured, intelligent, and operationally precise.", "منظم، ذكي، ودقيق تشغيليًا."],
    ["03", "Bold Human-Centered Legal", "قانون إنساني جريء", "Warm, direct, and unmistakably client-first.", "دافئ، مباشر، والعميل أولًا بلا التباس."],
  ];
  return <div className={styles.comparison} data-testid="design-preview-comparison"><header><Link href={`/${locale}`} className={styles.previewMark}><span>H</span><b>{label("DESIGN EXPLORATION", "استكشاف التصميم")}</b></Link><ThemeControl /></header><main><p>{label("Phase 8B.1 / isolated prototypes", "المرحلة 8B.1 / نماذج معزولة")}</p><h1>{label("Three different ways this legal brand could lead.", "ثلاث طرق مختلفة يمكن أن تقود بها هذه العلامة القانونية.")}</h1><p className={styles.comparisonIntro}>{label("These are exploration routes only. They do not alter the production website, business workflows, or database.", "هذه مسارات استكشافية فقط. لا تعدل الموقع الإنتاجي أو مسارات الأعمال أو قاعدة البيانات.")}</p><section>{entries.map(([direction, en, ar, enDesc, arDesc]) => <article data-direction={direction} key={direction}><span>0{Number(direction)}</span><h2>{label(en, ar)}</h2><p>{label(enDesc, arDesc)}</p><dl><div><dt>{label("Strength", "القوة")}</dt><dd>{direction === "01" ? label("Premium authority", "ثقة فاخرة") : direction === "02" ? label("Operational clarity", "وضوح تشغيلي") : label("Human connection", "تواصل إنساني")}</dd></div><div><dt>{label("Tradeoff", "المقابل")}</dt><dd>{direction === "01" ? label("Lower density", "كثافة أقل") : direction === "02" ? label("More structured", "أكثر تنظيمًا") : label("Less formal", "أقل رسمية")}</dd></div></dl><div><Link href={`/${locale}/design-preview/${direction}`}>{label("Public preview", "معاينة عامة")} <ArrowUpRight size={17} /></Link><Link href={`/${locale}/design-preview/${direction}/admin`}>{label("Admin preview", "معاينة إدارية")} <Compass size={17} /></Link></div></article>)}</section></main></div>;
}
