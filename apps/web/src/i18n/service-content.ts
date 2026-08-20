import type { Locale } from "./locale";

type ServiceFeature = { title: string; description: string };
type ServiceContent = { title: string; description: string; features: ServiceFeature[] };

const ar = {
  criminal: {
    title: "القانون الجنائي",
    description: "دعم وتمثيل قانوني في المسائل الجنائية، يبدأ بفهم الوقائع والأسئلة المطروحة.",
    features: [
      { title: "الإجراءات الجنائية", description: "مناقشة ما يتصل بالتحقيقات والإجراءات أمام الجهات المختصة بحسب ظروف المسألة." },
      { title: "مذكرات الدفاع والتمثيل", description: "إعداد المذكرات وتمثيل الموكل في المسائل الجنائية عند الاقتضاء." },
    ],
  },
  commercial: {
    title: "القانون التجاري والشركات",
    description: "دعم قانوني للمسائل التجارية والشركات والعقود، مع التركيز على وضوح الخيارات.",
    features: [
      { title: "تأسيس الشركات وتنظيمها", description: "مناقشة الخيارات القانونية المرتبطة بتأسيس الشركات وتنظيم علاقات الشركاء." },
      { title: "العقود والاتفاقيات", description: "مراجعة وصياغة العقود والاتفاقيات التجارية بما يوضح الحقوق والالتزامات." },
    ],
  },
  civil: {
    title: "الأحوال الشخصية والمنازعات المدنية",
    description: "مقاربة هادئة للمسائل الأسرية والإرث والمنازعات المدنية، مع مراعاة سياق كل حالة.",
    features: [
      { title: "مسائل الأحوال الشخصية", description: "تنظيم الحوار حول المسائل الأسرية ذات الصلة قبل تحديد الخطوة التالية." },
      { title: "الإرث والمنازعات المدنية", description: "مراجعة المستندات والأسئلة المتعلقة بالإرث أو النزاعات المدنية بصورة منظمة." },
    ],
  },
  notary: {
    title: "خدمات الكاتب العدل الخاص",
    description: "خدمات تتصل بتوثيق المحررات والوكالات والعقود ضمن النطاق المتاح.",
    features: [
      { title: "توثيق المحررات", description: "بحث متطلبات توثيق العقود والوكالات والمحررات ذات الصلة." },
      { title: "الاستعداد للمعاملة", description: "مراجعة المعلومات والمستندات اللازمة قبل البدء في إجراءات التوثيق." },
    ],
  },
  taxes: {
    title: "الضرائب والامتثال",
    description: "دعم قانوني للمسائل الضريبية والامتثال في دولة الإمارات العربية المتحدة.",
    features: [
      { title: "الالتزامات الضريبية", description: "مناقشة الالتزامات والأسئلة ذات الصلة بالضرائب في ضوء الإطار النظامي." },
      { title: "الامتثال الضريبي", description: "تنظيم المعلومات والوثائق التي تساعد على فهم متطلبات الامتثال." },
    ],
  },
} satisfies Record<string, ServiceContent>;

type ServiceId = keyof typeof ar;

const en: Record<ServiceId, ServiceContent> = {
  criminal: {
    title: "Criminal Law",
    description: "Legal support and representation for criminal matters, beginning with the facts and questions at hand.",
    features: [
      { title: "Criminal procedure", description: "Discussion of investigations and procedures before the relevant authorities in the context of the matter." },
      { title: "Defence memoranda and representation", description: "Preparation of memoranda and representation in criminal matters where appropriate." },
    ],
  },
  commercial: {
    title: "Commercial and Corporate Law",
    description: "Legal support for commercial, corporate, and contract matters, with a focus on clear options.",
    features: [
      { title: "Company formation and structure", description: "Discussion of legal options connected to company formation and partner arrangements." },
      { title: "Contracts and agreements", description: "Review and drafting of commercial contracts and agreements to clarify rights and obligations." },
    ],
  },
  civil: {
    title: "Personal Status and Civil Matters",
    description: "A calm approach to family, inheritance, and civil matters, with attention to each matter’s context.",
    features: [
      { title: "Personal status matters", description: "A structured conversation around the family matters relevant before identifying the next step." },
      { title: "Inheritance and civil disputes", description: "An organised review of documents and questions relating to inheritance or civil disputes." },
    ],
  },
  notary: {
    title: "Private Notary Services",
    description: "Services connected to the notarisation of documents, powers of attorney, and agreements within the available scope.",
    features: [
      { title: "Notarising documents", description: "Review of the requirements for notarising relevant contracts, powers of attorney, and instruments." },
      { title: "Preparing for the transaction", description: "Review of the information and documents needed before beginning the notarisation process." },
    ],
  },
  taxes: {
    title: "Tax and Compliance",
    description: "Legal support for tax and compliance matters in the United Arab Emirates.",
    features: [
      { title: "Tax obligations", description: "Discussion of tax obligations and related questions within the applicable regulatory framework." },
      { title: "Tax compliance", description: "Organisation of the information and documents that help clarify compliance requirements." },
    ],
  },
};

export const serviceContent: Record<Locale, Record<ServiceId, ServiceContent>> = { ar, en };
