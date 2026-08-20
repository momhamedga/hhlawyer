import type { Locale } from "./locale";
import type { FinderQuestionId, FinderOptionId, FinderRecommendationKey } from "@/lib/legal-matter-finder";

export type FinderOption = { id: FinderOptionId; label: string; description: string };
export type FinderQuestion = { id: FinderQuestionId; prompt: string; helper: string; options: readonly FinderOption[] };

export type FinderLocaleContent = {
  teaser: { eyebrow: string; title: string; body: string; action: string };
  page: { eyebrow: string; title: string; intro: string; privacy: string; progress: string; back: string; startAgain: string };
  questions: readonly FinderQuestion[];
  result: {
    eyebrow: string;
    title: string;
    body: string;
    relatedLabel: string;
    viewService: string;
    requestConsultation: string;
    startAgain: string;
    safetyNote: string;
    uncertainTitle: string;
    uncertainBody: string;
    explanations: Record<FinderRecommendationKey, string>;
  };
};

const ar = {
  teaser: {
    eyebrow: "ابدأ من مشكلتك",
    title: "لست متأكدًا من مجال الممارسة الأقرب؟",
    body: "أجب عن ثلاثة أسئلة عامة لنوجّهك إلى مجال قانوني يمكنك استكشافه أولًا.",
    action: "ابدأ من مشكلتك",
  },
  page: {
    eyebrow: "توجيه أولي",
    title: "ابدأ من مشكلتك",
    intro: "اختيارات عامة تساعدك على استكشاف مجال الممارسة الأقرب للبدء. لا نطلب أي تفاصيل شخصية أو معلومات عن القضية.",
    privacy: "تظل اختياراتك في هذه الصفحة فقط، ولا تُحفظ أو تُرسل.",
    progress: "الخطوة",
    back: "العودة إلى السؤال السابق",
    startAgain: "ابدأ من جديد",
  },
  questions: [
    {
      id: "nature",
      prompt: "أي وصف أقرب إلى ما تحتاج إلى استكشافه؟",
      helper: "اختر وصفًا عامًا فقط، من دون أسماء أو تفاصيل شخصية.",
      options: [
        { id: "criminal", label: "مسألة تتعلق باتهام أو إجراء جنائي", description: "ابدأ من سياق عام يتعلق بمسألة جنائية." },
        { id: "commercial", label: "شركة أو عقد أو تعامل تجاري", description: "سياق يرتبط بنشاط أو علاقة تجارية." },
        { id: "civil", label: "مسألة شخصية أو مدنية", description: "سياق فردي أو عائلي أو مدني." },
        { id: "notary", label: "توثيق أو تصديق مستند", description: "سياق يرتبط بوثيقة أو وكالة أو اتفاق." },
        { id: "taxes", label: "ضرائب أو امتثال", description: "سياق يرتبط بالتزام أو سجل أو نشاط منشأة." },
        { id: "unsure", label: "لست متأكدًا", description: "يمكنك الانتقال إلى توجيه عام وآمن." },
      ],
    },
    {
      id: "focus",
      prompt: "ما الذي سيكون أكثر فائدة لاستكشافه أولًا؟",
      helper: "هذا السؤال يساعد على فهم نوع المحادثة، لا على تقييم المسألة.",
      options: [
        { id: "understand", label: "فهم الوضع بصورة أوضح", description: "ترتيب السؤال العام قبل مناقشة التفاصيل." },
        { id: "documents", label: "ترتيب مستندات أو معلومات", description: "فهم ما قد يكون ذا صلة بالمحادثة الأولى." },
        { id: "disagreement", label: "فهم خلاف أو اتفاق", description: "وضع علاقة أو التزام في سياقه العام." },
        { id: "transaction", label: "الاستعداد لمعاملة أو توثيق", description: "استكشاف سياق مستند أو معاملة." },
        { id: "compliance", label: "فهم التزام امتثال", description: "استكشاف سؤال عام يتعلق بالامتثال." },
        { id: "unsure", label: "لست متأكدًا", description: "يمكنك المتابعة من دون اختيار دقيق." },
      ],
    },
    {
      id: "setting",
      prompt: "أي سياق أقرب إلى الموضوع؟",
      helper: "اختر السياق العام فقط. لا تدخل معلومات تعريفية أو مستندات هنا.",
      options: [
        { id: "individual", label: "شأن فردي أو عائلي", description: "سياق شخصي عام." },
        { id: "business", label: "شركة أو نشاط تجاري", description: "سياق يرتبط بمنشأة أو تعامل تجاري." },
        { id: "document", label: "مستند أو وكالة أو اتفاق", description: "سياق يركز على وثيقة أو معاملة." },
        { id: "unclear", label: "لا يزال السياق غير واضح", description: "سنقترح بداية عامة بدل افتراض مجال محدد." },
      ],
    },
  ],
  result: {
    eyebrow: "مجال مقترح للاستكشاف",
    title: "قد يكون هذا المجال هو الأقرب للبدء.",
    body: "بناءً على اختياراتك العامة، قد يكون هذا مجال الممارسة الأكثر صلة للاستكشاف أولًا.",
    relatedLabel: "قد يكون من المفيد أيضًا استكشاف",
    viewService: "عرض مجال الممارسة",
    requestConsultation: "اطلب استشارة",
    startAgain: "ابدأ من جديد",
    safetyNote: "يساعدك هذا التوجيه على استكشاف مجال ممارسة مناسب، ولا يُعد تقييمًا أو رأيًا قانونيًا في مسألتك.",
    uncertainTitle: "قد يكون من الأفضل البدء بمحادثة عامة.",
    uncertainBody: "لم تكن الاختيارات حاسمة بما يكفي لاقتراح مجال ممارسة واحد. يمكن أن تساعد الاستشارة العامة على فهم طبيعة المسألة قبل اختيار المسار.",
    explanations: {
      criminal: "لأن اختيارك يتصل بسياق جنائي عام، فقد يكون هذا المجال هو الأقرب للاستكشاف أولًا.",
      commercial: "لأن اختيارك يتصل بعمل أو تعامل تجاري، فقد يكون هذا المجال نقطة بداية مناسبة.",
      civil: "لأن اختيارك يتصل بعلاقة أو التزام مدني، فقد يكون هذا المجال هو الأنسب للاستكشاف أولًا.",
      notary: "لأن هدفك يرتبط بتوثيق أو ترتيب مستند، فقد يكون هذا المجال هو نقطة البداية المناسبة.",
      taxes: "لأن اختيارك يرتبط بالالتزام أو الامتثال المالي، فقد يكون هذا المجال هو الأقرب للاستكشاف أولًا.",
    },
  },
} satisfies FinderLocaleContent;

const en = {
  teaser: {
    eyebrow: "Start with your situation",
    title: "Not sure which practice area is closest?",
    body: "Answer three general questions and we will point you to a practice area you can explore first.",
    action: "Find the right practice area",
  },
  page: {
    eyebrow: "Initial guidance",
    title: "Find the right practice area",
    intro: "A few general choices can help you explore the closest practice area to begin with. We do not ask for personal details or case information.",
    privacy: "Your choices stay on this page only. They are not saved or sent.",
    progress: "Step",
    back: "Back to the previous question",
    startAgain: "Start again",
  },
  questions: [
    {
      id: "nature",
      prompt: "Which description is closest to what you need help with?",
      helper: "Choose a general description only—no names or personal details are needed.",
      options: [
        { id: "criminal", label: "A matter involving an allegation or criminal procedure", description: "Start from a general criminal-matter context." },
        { id: "commercial", label: "A company, contract, or commercial dealing", description: "A context connected with a business activity or relationship." },
        { id: "civil", label: "A personal or civil matter", description: "An individual, family, or civil context." },
        { id: "notary", label: "Notarising or certifying a document", description: "A context connected with a document, power of attorney, or agreement." },
        { id: "taxes", label: "Tax or compliance", description: "A context connected with an obligation, record, or business activity." },
        { id: "unsure", label: "I am not sure", description: "Continue to a safe, general recommendation." },
      ],
    },
    {
      id: "focus",
      prompt: "What would be most useful to explore first?",
      helper: "This helps frame the conversation; it does not assess the matter.",
      options: [
        { id: "understand", label: "Understanding the situation more clearly", description: "Organising the general question before discussing detail." },
        { id: "documents", label: "Organising documents or information", description: "Understanding what may be relevant to an initial conversation." },
        { id: "disagreement", label: "Understanding a disagreement or agreement", description: "Putting a relationship or obligation into its general context." },
        { id: "transaction", label: "Preparing for a transaction or notarisation", description: "Exploring the context of a document or transaction." },
        { id: "compliance", label: "Understanding a compliance obligation", description: "Exploring a general compliance question." },
        { id: "unsure", label: "I am not sure", description: "Continue without making a precise choice." },
      ],
    },
    {
      id: "setting",
      prompt: "Which setting is closest to the issue?",
      helper: "Choose the general setting only. Do not enter identifying information or documents here.",
      options: [
        { id: "individual", label: "An individual or family matter", description: "A general personal context." },
        { id: "business", label: "A company or business activity", description: "A context involving an organisation or commercial dealing." },
        { id: "document", label: "A document, power of attorney, or agreement", description: "A context focused on an instrument or transaction." },
        { id: "unclear", label: "The setting is still unclear", description: "We will suggest a general starting point instead of assuming a practice area." },
      ],
    },
  ],
  result: {
    eyebrow: "A practice area to explore",
    title: "This may be the closest area to begin with.",
    body: "Based on your general selections, this may be the most relevant practice area to explore first.",
    relatedLabel: "You may also wish to explore",
    viewService: "View practice area",
    requestConsultation: "Request a consultation",
    startAgain: "Start again",
    safetyNote: "This guide helps you explore a relevant practice area; it is not a legal assessment or advice on your matter.",
    uncertainTitle: "A general conversation may be the best place to start.",
    uncertainBody: "Your selections were not specific enough to suggest one practice area. A general consultation can help clarify the nature of the matter before choosing a route.",
    explanations: {
      criminal: "Your selections point to a general criminal-law context, so this is the closest area to explore first.",
      commercial: "Your selections concern a business or commercial transaction, making this a sensible place to start.",
      civil: "Your selections concern a civil relationship or obligation, so this is the most relevant area to explore first.",
      notary: "Your goal concerns the formalisation or arrangement of a document, making this the most relevant starting point.",
      taxes: "Your selections concern financial compliance or an associated obligation, so this is the closest area to explore first.",
    },
  },
} satisfies FinderLocaleContent;

export const legalMatterFinderContent: Record<Locale, FinderLocaleContent> = { ar, en };
