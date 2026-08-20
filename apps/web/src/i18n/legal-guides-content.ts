import { serviceContent } from "./service-content";
import type { Locale } from "./locale";

export const guideSlugs = [
  "criminal-matter-overview",
  "commercial-relationship-basics",
  "civil-dispute-preparation",
  "notary-document-preparation",
  "tax-compliance-documents",
] as const;

export type GuideSlug = (typeof guideSlugs)[number];
export type GuidePracticeSlug = keyof typeof serviceContent.en;

type GuideSection = {
  title: string;
  paragraphs: readonly string[];
  list?: readonly string[];
  keyPoint?: string;
};

export type LegalGuide = {
  slug: GuideSlug;
  practiceSlug: GuidePracticeSlug;
  title: string;
  description: string;
  intro: string;
  sections: readonly GuideSection[];
  relatedGuideSlugs: readonly GuideSlug[];
};

export type GuidesLocaleContent = {
  index: {
    eyebrow: string;
    title: string;
    intro: string;
    all: string;
    selected: string;
    explore: string;
    category: string;
    readingTime: (minutes: number) => string;
    empty: string;
  };
  detail: {
    guides: string;
    backToGuides: string;
    practiceArea: string;
    relatedPractice: string;
    viewPractice: string;
    keyPoint: string;
    relatedGuides: string;
    relatedGuidesTitle: string;
    finderTitle: string;
    finderBody: string;
    finderAction: string;
    consultationTitle: string;
    consultationAction: string;
    disclaimer: string;
  };
  guides: Record<GuideSlug, LegalGuide>;
};

const ar: GuidesLocaleContent = {
  index: {
    eyebrow: "مكتبة معرفة قانونية",
    title: "الأدلة القانونية",
    intro: "قراءات موجزة تساعد على ترتيب الفكرة وفهم ما قد يكون مفيدًا قبل الخطوة التالية.",
    all: "الكل",
    selected: "دليل مختار",
    explore: "اقرأ الدليل",
    category: "مجال الممارسة",
    readingTime: (minutes) => `${minutes} دقائق قراءة`,
    empty: "لا توجد أدلة ضمن هذا التصنيف حاليًا.",
  },
  detail: {
    guides: "الأدلة القانونية",
    backToGuides: "العودة إلى الأدلة القانونية",
    practiceArea: "مجال الممارسة",
    relatedPractice: "مرتبط بمجال الممارسة",
    viewPractice: "استكشف مجال الممارسة",
    keyPoint: "نقطة مهمة",
    relatedGuides: "أدلة ذات صلة",
    relatedGuidesTitle: "استكشف قراءة قانونية قريبة من الموضوع.",
    finderTitle: "لست متأكدًا من المجال الأقرب؟",
    finderBody: "استخدم توجيهًا قصيرًا من اختيارات عامة لاستكشاف مجال ممارسة مناسب للبدء.",
    finderAction: "ابدأ من مشكلتك",
    consultationTitle: "هل تحتاج إلى مناقشة مسألتك؟",
    consultationAction: "رتّب استشارة",
    disclaimer: "هذا الدليل لأغراض معلوماتية عامة ولا يُعد استشارة قانونية. تختلف المسائل القانونية باختلاف ظروفها.",
  },
  guides: {
    "criminal-matter-overview": {
      slug: "criminal-matter-overview",
      practiceSlug: "criminal",
      title: "ما الذي يجب معرفته عند التعامل مع مسألة جنائية؟",
      description: "توجيه عام يساعد على ترتيب المعلومات والأسئلة قبل مناقشة مسألة جنائية.",
      intro: "قد تثير المسألة الجنائية أسئلة كثيرة في وقت قصير. تساعد البداية الهادئة على فهم طبيعة المعلومات المتاحة وما يحتاج إلى مناقشة مهنية.",
      sections: [
        { title: "ابدأ بفهم السياق", paragraphs: ["قد يكون من المفيد التمييز بين الوقائع التي تعرفها مباشرةً، والمعلومات التي وصلتك من مصادر أخرى، والأسئلة التي ما زالت غير واضحة.", "لا يهدف هذا الترتيب إلى استخلاص نتيجة قانونية، بل إلى جعل المحادثة الأولى أكثر وضوحًا وتركيزًا."], keyPoint: "الوضوح في عرض ما هو معلوم وما يحتاج إلى توضيح يهيئ لمناقشة أكثر فائدة." },
        { title: "رتّب المعلومات المتاحة", paragraphs: ["يمكن تنظيم ما لديك من مراسلات أو إشعارات أو مستندات ذات صلة، مع ملاحظة السياق العام لكل منها.", "احفظ الأصل كما هو وتجنب تعديل أي مادة قد تكون ذات صلة قبل طلب توجيه مهني."], list: ["ملاحظات موجزة عن التسلسل العام للأحداث", "المراسلات أو الإشعارات ذات الصلة", "الأسئلة التي تريد فهمها في المحادثة الأولى"] },
        { title: "اطلب توجيهًا مهنيًا في الوقت المناسب", paragraphs: ["تختلف المسائل الجنائية باختلاف وقائعها وظروفها. لذلك تكون المحادثة المهنية المبكرة وسيلة لفهم المسألة بهدوء وتحديد ما يلزم بحثه."] },
      ],
      relatedGuideSlugs: ["civil-dispute-preparation", "notary-document-preparation"],
    },
    "commercial-relationship-basics": {
      slug: "commercial-relationship-basics",
      practiceSlug: "commercial",
      title: "نقاط مهمة قبل الدخول في علاقة تجارية أو تعاقدية",
      description: "قراءة عامة حول وضوح الالتزامات والمستندات قبل بدء علاقة تجارية أو تعاقدية.",
      intro: "تبدأ العلاقات التجارية القوية بفهم مشترك لما يتوقعه كل طرف. ويمكن أن تساعد القراءة المنظمة للمسألة على تحديد الموضوعات التي تستحق المراجعة قبل الالتزام.",
      sections: [
        { title: "وضوح الغرض والالتزامات", paragraphs: ["يفيد أن يكون الهدف التجاري ومجال العمل والالتزامات المتوقعة مفهومة بصورة متسقة بين الأطراف.", "عندما تكون النقاط الجوهرية مبهمة، قد يصبح من الصعب تقييم المخاطر أو ترتيب الخطوة التالية."], keyPoint: "الوضوح لا يعني التنبؤ بكل الاحتمالات، بل توثيق الفهم المشترك للنقاط الأساسية." },
        { title: "المستندات جزء من السياق", paragraphs: ["العروض والمراسلات والمسودات والسجلات المتاحة قد تساعد على فهم تسلسل العلاقة التجارية ومراحلها.", "يمكن ترتيبها بحسب الموضوع أو التاريخ لتكون مراجعتها أكثر سهولة عند الحاجة."], list: ["الأطراف المعنية ودور كل طرف", "المسودات أو الاتفاقات المتداولة", "المراسلات التي توضح التوقعات أو التغييرات"] },
        { title: "المراجعة المهنية قبل الالتزام", paragraphs: ["المراجعة القانونية المهنية قد تساعد على مناقشة المسائل التي تحتاج إلى وضوح قبل الدخول في العلاقة أو الاستمرار فيها. ولا يغني هذا الدليل عن تلك المراجعة."], },
      ],
      relatedGuideSlugs: ["tax-compliance-documents", "notary-document-preparation"],
    },
    "civil-dispute-preparation": {
      slug: "civil-dispute-preparation",
      practiceSlug: "civil",
      title: "كيف تستعد لمناقشة نزاع مدني مع مستشارك القانوني؟",
      description: "خطوات عامة لترتيب التسلسل والمستندات والأسئلة قبل مناقشة نزاع مدني.",
      intro: "قد تتداخل في النزاعات المدنية أحداث ومراسلات ووجهات نظر متعددة. يساعد التنظيم الأولي على جعل الحديث عن المسألة أدق وأسهل متابعة.",
      sections: [
        { title: "اكتب تسلسلًا عامًا", paragraphs: ["يمكن إعداد خط زمني موجز يوضح المحطات الأساسية كما تتذكرها، من دون محاولة توصيفها قانونيًا.", "يساعد ذلك على فهم ترتيب الأحداث وبيان ما قد يحتاج إلى استيضاح أثناء المحادثة."], keyPoint: "الخط الزمني الموجز وسيلة لترتيب الحديث، وليس بديلًا عن التقييم القانوني." },
        { title: "اجمع المستندات والمراسلات", paragraphs: ["اجمع نسخًا مرتبة من المستندات أو المراسلات ذات الصلة، ودوّن مصدر كل مجموعة وسياقها العام.", "لا تحتاج إلى تحميل هذه المواد في الموقع؛ يكفي إعدادها لمناقشتها بطريقة مناسبة."], list: ["المراسلات ذات الصلة", "الاتفاقات أو المستندات المتاحة", "ملاحظات عامة عن الأطراف والموضوعات المطروحة"] },
        { title: "حضّر أسئلتك", paragraphs: ["تساعد الأسئلة المحددة على توجيه المحادثة الأولى نحو ما يهمك فهمه. وقد تشمل طبيعة الخيارات التي ينبغي بحثها أو المعلومات التي تحتاج إلى مراجعة لاحقة."], },
      ],
      relatedGuideSlugs: ["commercial-relationship-basics", "criminal-matter-overview"],
    },
    "notary-document-preparation": {
      slug: "notary-document-preparation",
      practiceSlug: "notary",
      title: "الاستعداد لخدمات الكاتب العدل والتوثيق",
      description: "توجيه عام لترتيب المستند والسياق والأسئلة قبل مناقشة خدمات التوثيق.",
      intro: "تتصل خدمات الكاتب العدل والتوثيق بطبيعة المستند والغرض منه وسياق استخدامه. الإعداد العام يساعد على بدء حديث واضح حول ما ترغب في ترتيبه.",
      sections: [
        { title: "افهم غرض المستند", paragraphs: ["ابدأ بتحديد الغرض العملي من المستند أو الوكالة أو الاتفاق. يساعد ذلك على وضع أسئلة التوثيق في سياقها الصحيح.", "لا يفترض هذا الدليل قائمة متطلبات أو إجراءً رسميًا محددًا؛ فكل مسألة تحتاج إلى مراجعة في سياقها."], keyPoint: "الغرض من المستند والسياق الذي سيُستخدم فيه نقطتا بداية مفيدتان للمناقشة." },
        { title: "رتّب النسخ والأسئلة", paragraphs: ["يمكن جمع النسخ المتاحة وتحديد ما إذا كانت هناك مسودات أو ملاحظات توضح التغيير المطلوب أو الأطراف المعنية.", "تساعد قائمة قصيرة بالأسئلة على بيان ما تريد فهمه قبل البدء."], list: ["الغرض العملي من المستند", "النسخ أو المسودات المتاحة", "الأسئلة المتعلقة بالسياق أو الترتيب"] },
        { title: "ناقش المسألة ضمن نطاقها", paragraphs: ["يمكن للمناقشة المهنية أن تساعد على فهم نطاق الخدمة المتاح وطريقة الاستعداد المناسبة للمستند. لا يقدم هذا الدليل توجيهًا رسميًا أو تأكيدًا لإجراء بعينه."], },
      ],
      relatedGuideSlugs: ["commercial-relationship-basics", "civil-dispute-preparation"],
    },
    "tax-compliance-documents": {
      slug: "tax-compliance-documents",
      practiceSlug: "taxes",
      title: "تنظيم المستندات عند التعامل مع مسائل الضرائب والامتثال",
      description: "قراءة عامة عن ترتيب المستندات والسجلات والأسئلة عند مناقشة مسائل الضرائب والامتثال.",
      intro: "قد تضم مسائل الضرائب والامتثال سجلات ومراسلات واتفاقات متعددة. التنظيم الهادئ لهذه المواد يمكن أن يدعم فهم السياق قبل طلب مراجعة مهنية.",
      sections: [
        { title: "اجمع السياق قبل التفاصيل", paragraphs: ["ابدأ بتجميع صورة عامة عن النشاط أو الالتزام أو السؤال الذي ترغب في فهمه، من دون افتراض نتيجة أو معالجة محددة.", "هذا يساعد على ترتيب النقاط التي تحتاج إلى نقاش أكثر تفصيلًا."], keyPoint: "تنظيم السياق لا يساوي تقديم رأي ضريبي؛ إنه فقط يهيئ لمناقشة أكثر وضوحًا." },
        { title: "رتّب السجلات المتاحة", paragraphs: ["يمكن تصنيف المستندات بحسب الموضوع أو الفترة أو مصدرها، مع الاحتفاظ بما يوضح علاقتها بالسؤال المطروح.", "تجنب الاعتماد على ملخصات غير مكتملة عندما تكون النسخ الأصلية أو السجلات المتاحة ذات صلة."], list: ["السجلات أو المستندات المتاحة", "الاتفاقات أو المراسلات ذات الصلة", "الأسئلة التي تحتاج إلى مراجعة مهنية"] },
        { title: "اطلب مراجعة مهنية", paragraphs: ["قد تساعد المراجعة المهنية على تحديد الموضوعات التي تستحق بحثًا أوسع في ضوء ظروف المسألة. لا يتضمن هذا الدليل معدلات أو مواعيد أو التزامات تقديم."], },
      ],
      relatedGuideSlugs: ["commercial-relationship-basics", "notary-document-preparation"],
    },
  },
};

const en: GuidesLocaleContent = {
  index: {
    eyebrow: "A legal knowledge library",
    title: "Legal Guides",
    intro: "Brief reading designed to help organise a question and understand what may be useful before the next conversation.",
    all: "All",
    selected: "Selected guide",
    explore: "Read guide",
    category: "Practice area",
    readingTime: (minutes) => `${minutes} min read`,
    empty: "There are no guides in this category at present.",
  },
  detail: {
    guides: "Legal Guides",
    backToGuides: "Back to Legal Guides",
    practiceArea: "Practice area",
    relatedPractice: "Related practice area",
    viewPractice: "Explore practice area",
    keyPoint: "Key point",
    relatedGuides: "Related guides",
    relatedGuidesTitle: "Explore reading connected to this subject.",
    finderTitle: "Not sure which practice area is closest?",
    finderBody: "Use a short set of general choices to explore a practice area that may be useful to begin with.",
    finderAction: "Find the right practice area",
    consultationTitle: "Need to discuss your matter?",
    consultationAction: "Arrange a consultation",
    disclaimer: "This guide is for general informational purposes and does not constitute legal advice. Legal matters depend on their specific circumstances.",
  },
  guides: {
    "criminal-matter-overview": {
      slug: "criminal-matter-overview",
      practiceSlug: "criminal",
      title: "What to Know When Facing a Criminal Matter",
      description: "General orientation for organising information and questions before discussing a criminal matter.",
      intro: "A criminal matter can raise many questions in a short period of time. A calm start can help clarify the information available and what may be useful to discuss professionally.",
      sections: [
        { title: "Start with the context", paragraphs: ["It can be useful to distinguish between facts you know directly, information received from other sources, and questions that remain unclear.", "That organisation is not intended to reach a legal conclusion. It simply helps make an initial conversation clearer and more focused."], keyPoint: "Being clear about what is known and what needs clarification can support a more useful discussion." },
        { title: "Organise available information", paragraphs: ["You may wish to arrange relevant correspondence, notices, or documents and note the general context for each item.", "Keep original material as it is and avoid altering anything that may be relevant before seeking professional guidance."], list: ["Brief notes on the general sequence of events", "Relevant correspondence or notices", "Questions you want to understand in an initial conversation"] },
        { title: "Seek professional guidance at an appropriate time", paragraphs: ["Criminal matters differ according to their facts and circumstances. A timely professional conversation can help frame the matter calmly and identify what may need further consideration."] },
      ],
      relatedGuideSlugs: ["civil-dispute-preparation", "notary-document-preparation"],
    },
    "commercial-relationship-basics": {
      slug: "commercial-relationship-basics",
      practiceSlug: "commercial",
      title: "Key Considerations Before Entering a Commercial Relationship",
      description: "General reading on clear obligations and documentation before starting a commercial or contractual relationship.",
      intro: "Strong commercial relationships begin with a shared understanding of what each party expects. A structured review can help identify the subjects worth considering before a commitment is made.",
      sections: [
        { title: "Clarity of purpose and obligations", paragraphs: ["It is useful for the commercial purpose, scope of work, and expected obligations to be understood consistently between the parties.", "When core points are unclear, it can be difficult to assess risk or decide what needs attention next."], keyPoint: "Clarity does not predict every possibility; it records a shared understanding of the essential points." },
        { title: "Documents are part of the context", paragraphs: ["Proposals, correspondence, drafts, and available records can help explain the sequence and stages of a commercial relationship.", "Arranging them by subject or date can make them easier to review when needed."], list: ["The parties involved and each party’s role", "Drafts or agreements being considered", "Correspondence explaining expectations or changes"] },
        { title: "Professional review before commitment", paragraphs: ["Professional legal review can help discuss matters that may need clarity before entering or continuing a relationship. This guide is not a substitute for that review."] },
      ],
      relatedGuideSlugs: ["tax-compliance-documents", "notary-document-preparation"],
    },
    "civil-dispute-preparation": {
      slug: "civil-dispute-preparation",
      practiceSlug: "civil",
      title: "How to Prepare for a Discussion About a Civil Dispute",
      description: "General steps for arranging a timeline, documents, and questions before discussing a civil dispute.",
      intro: "Civil disputes can involve several events, correspondence threads, and perspectives. Initial organisation can make the conversation about a matter more precise and easier to follow.",
      sections: [
        { title: "Write a general timeline", paragraphs: ["You can prepare a brief timeline of key moments as you remember them, without trying to describe them in legal terms.", "This can help show the order of events and what may require clarification during a discussion."], keyPoint: "A brief timeline is a way to organise a conversation, not a substitute for legal assessment." },
        { title: "Gather documents and correspondence", paragraphs: ["Arrange copies of relevant documents or correspondence, noting the source and general context of each group.", "There is no need to upload this material to the website; it can simply be prepared for an appropriate discussion."], list: ["Relevant correspondence", "Available agreements or documents", "General notes about the parties and subjects involved"] },
        { title: "Prepare your questions", paragraphs: ["Specific questions can help direct an initial conversation toward what you need to understand. They may include options that merit consideration or information that may need later review."] },
      ],
      relatedGuideSlugs: ["commercial-relationship-basics", "criminal-matter-overview"],
    },
    "notary-document-preparation": {
      slug: "notary-document-preparation",
      practiceSlug: "notary",
      title: "Preparing for Notary and Document Authentication Services",
      description: "General orientation for arranging a document, its context, and questions before discussing notary services.",
      intro: "Notary and document-authentication services connect to the nature of an instrument, its purpose, and the context in which it will be used. General preparation can help begin a clear discussion.",
      sections: [
        { title: "Understand the document’s purpose", paragraphs: ["Start by identifying the practical purpose of a document, power of attorney, or agreement. This can put authentication questions in their proper context.", "This guide does not assume a list of requirements or a particular official process; each matter needs review in context."], keyPoint: "The document’s purpose and intended context are useful starting points for a discussion." },
        { title: "Arrange copies and questions", paragraphs: ["You can gather available versions and identify any drafts or notes that explain a proposed change or the parties involved.", "A short list of questions can make clear what you want to understand before beginning."], list: ["The document’s practical purpose", "Available versions or drafts", "Questions about context or arrangement"] },
        { title: "Discuss the matter within its scope", paragraphs: ["A professional conversation can help explain the available scope of service and appropriate preparation for a document. This guide does not provide official instruction or confirm any particular procedure."] },
      ],
      relatedGuideSlugs: ["commercial-relationship-basics", "civil-dispute-preparation"],
    },
    "tax-compliance-documents": {
      slug: "tax-compliance-documents",
      practiceSlug: "taxes",
      title: "Organising Documents for Tax and Compliance Matters",
      description: "General reading on arranging documents, records, and questions when discussing tax and compliance matters.",
      intro: "Tax and compliance matters can involve several records, communications, and agreements. Calmly organising these materials can support an understanding of context before professional review is sought.",
      sections: [
        { title: "Gather context before detail", paragraphs: ["Start by assembling a general picture of the activity, obligation, or question you want to understand, without assuming an outcome or a specific treatment.", "This can help arrange the points that may need more detailed discussion."], keyPoint: "Organising context is not tax advice; it simply prepares for a clearer conversation." },
        { title: "Arrange available records", paragraphs: ["Documents can be grouped by subject, period, or source, while retaining anything that explains their connection to the question being considered.", "Avoid relying on incomplete summaries when original versions or available records are relevant."], list: ["Available records or documents", "Relevant agreements or correspondence", "Questions that need professional review"] },
        { title: "Seek professional review", paragraphs: ["Professional review may help identify subjects that merit further consideration in light of the matter’s circumstances. This guide does not provide rates, deadlines, or filing obligations."] },
      ],
      relatedGuideSlugs: ["commercial-relationship-basics", "notary-document-preparation"],
    },
  },
};

export const legalGuidesContent: Record<Locale, GuidesLocaleContent> = { ar, en };

export function isGuideSlug(value: string): value is GuideSlug {
  return (guideSlugs as readonly string[]).includes(value);
}

export function guideReadingMinutes(guide: LegalGuide) {
  const words = [guide.title, guide.description, guide.intro, ...guide.sections.flatMap((section) => [section.title, ...section.paragraphs, ...(section.list ?? []), section.keyPoint ?? ""])].join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}
