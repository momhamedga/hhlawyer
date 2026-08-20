import type { Locale } from "./locale";

export const serviceFaqSlugs = ["criminal", "commercial", "civil", "notary", "taxes"] as const;

export type ServiceFaqSlug = (typeof serviceFaqSlugs)[number];
export type ServiceFaqIntent = "understanding" | "preparation" | "process" | "scope" | "consultation" | "related-service";

export type ServiceFaqItem = {
  id: string;
  intent: ServiceFaqIntent;
  question: string;
  answer: string;
};

export type ServiceFaqContent = {
  eyebrow: string;
  title: string;
  intro: string;
  items: readonly ServiceFaqItem[];
};

const ar = {
  criminal: {
    eyebrow: "أسئلة شائعة",
    title: "فهم المسألة الجنائية قبل المحادثة الأولى.",
    intro: "إجابات موجزة تساعد على تنظيم المعلومات وفهم نطاق الحديث الأول في المسائل الجنائية.",
    items: [
      { id: "criminal-consultation-timing", intent: "consultation", question: "متى تكون الاستشارة في مسألة جنائية خطوة مناسبة؟", answer: "قد تكون الاستشارة مفيدة عندما تحتاج إلى فهم طبيعة المسألة أو ترتيب المعلومات المتاحة قبل اتخاذ خطوة. ويعتمد نطاق الحديث على الوقائع والأسئلة والمستندات ذات الصلة بكل حالة." },
      { id: "criminal-consultation-preparation", intent: "preparation", question: "ما الذي يفيد إحضاره إلى الاستشارة؟", answer: "يساعد إحضار تسلسل مختصر للوقائع، وأي مراسلات أو مستندات متاحة، والأسئلة التي تهمك. ليس المقصود إعداد ملف كامل، بل توفير سياق واضح للحوار الأول." },
      { id: "criminal-matter-scope", intent: "scope", question: "ما أنواع المسائل التي يمكن مناقشتها ضمن هذا المجال؟", answer: "يمكن أن يتناول الحديث مسائل مرتبطة بتحقيقات أو إجراءات أو مستندات دفاع أو تمثيل، بالقدر الذي تسمح به معلومات المسألة. يحدد السياق الفعلي ما إذا كان هذا المجال مناسبًا." },
      { id: "criminal-information-handling", intent: "understanding", question: "كيف يساعد ترتيب المعلومات والمستندات؟", answer: "ترتيب المعلومات المتاحة يسهّل تحديد ما يحتاج إلى توضيح وما قد يكون ذا صلة بالمحادثة. لا يغني ذلك عن تقييم قانوني للحالة، لكنه يجعل النقاش الأول أكثر تركيزًا." },
      { id: "criminal-before-action", intent: "process", question: "هل يمكن مناقشة المسألة قبل اتخاذ أي خطوة؟", answer: "يمكن أن تبدأ المحادثة بفهم السؤال والوقائع المتاحة قبل مناقشة الخيارات العامة التالية. لا تقدم الإجابة العامة بديلًا عن التقييم المرتبط بظروفك الخاصة." },
      { id: "criminal-first-conversation", intent: "consultation", question: "ماذا يحدث عادة في الاستشارة الأولى؟", answer: "تُستخدم الاستشارة الأولى لفهم الخلفية، وتحديد النقاط التي تحتاج إلى إيضاح، ومراجعة ما يتوفر من معلومات. وقد تساعد على تحديد ما يلزم بحثه بصورة أدق بعد ذلك." },
      { id: "criminal-related-service", intent: "related-service", question: "متى قد يكون مجال قانوني آخر أقرب إلى الموضوع؟", answer: "بعض المسائل قد تتداخل مع نزاع مدني أو علاقة تجارية أو مستند يحتاج إلى توثيق. يظهر المجال الأقرب بعد فهم الوقائع، وقد يكون من المفيد طرح هذا التداخل في بداية المحادثة." },
    ],
  },
  commercial: {
    eyebrow: "أسئلة شائعة",
    title: "أسئلة عملية قبل ترتيب علاقة أو قرار تجاري.",
    intro: "إجابات موجزة تساعد على جمع السياق والمستندات المرتبطة بالمسائل التجارية والشركات والعقود.",
    items: [
      { id: "commercial-relationship-structure", intent: "understanding", question: "متى يفيد طلب استشارة حول علاقة تجارية أو شركة؟", answer: "قد يفيد الحديث المبكر عند تأسيس علاقة بين شركاء، أو تنظيم دور الأطراف، أو مراجعة مسألة قبل اتخاذ قرار. تبدأ المحادثة من طبيعة العلاقة والمعلومات المتاحة عنها." },
      { id: "commercial-contract-review", intent: "scope", question: "هل يمكن مناقشة عقد أو اتفاق قائم؟", answer: "يمكن مناقشة العقد أو الاتفاق في ضوء السؤال المطروح والسياق التجاري المحيط به. تساعد النسخة المتاحة وأي مراسلات مرتبطة على توضيح النقاط التي تحتاج إلى مراجعة." },
      { id: "commercial-risk-context", intent: "process", question: "كيف يساعد فهم المخاطر قبل اتخاذ قرار؟", answer: "يسمح تنظيم الوقائع والالتزامات المطروحة بتحديد الأسئلة التي تستحق بحثًا أعمق. لا يعني ذلك توقع نتيجة، بل بناء صورة أوضح قبل المضي في قرار تجاري." },
      { id: "commercial-preparation", intent: "preparation", question: "ما المستندات التي قد تكون مفيدة للمحادثة الأولى؟", answer: "قد يفيد إحضار مسودة العقد أو الاتفاق القائم، وهيكل العلاقة بين الأطراف، والمراسلات ذات الصلة، وملخصًا قصيرًا للسؤال التجاري. تختلف أهمية كل مستند بحسب الموضوع." },
      { id: "commercial-civil-distinction", intent: "related-service", question: "كيف يختلف الموضوع التجاري عن نزاع مدني؟", answer: "يرتبط الموضوع التجاري عادة بالعلاقة أو النشاط التجاري أو العقود، بينما قد يكون للنزاع المدني سياق مختلف. يوضح فهم الأطراف والمستندات وطبيعة المطالبة المجال الأنسب للنقاش." },
      { id: "commercial-first-consultation", intent: "consultation", question: "ما فائدة الاستشارة الأولى في مسألة تجارية؟", answer: "تساعد الاستشارة الأولى على ترتيب السؤال، وفهم المستندات المتاحة، وتحديد المسائل التي قد تحتاج إلى متابعة. وهي بداية لفهم السياق وليست حكمًا مسبقًا على النتيجة." },
      { id: "commercial-tax-link", intent: "related-service", question: "متى قد ترتبط المسألة بالضرائب أو الامتثال؟", answer: "قد تظهر صلة بالضرائب أو الامتثال عندما تتصل المسألة بسجلات أو التزامات أو عمليات منشأة. يمكن تحديد مدى الصلة بعد فهم المعاملة والمستندات ذات العلاقة." },
    ],
  },
  civil: {
    eyebrow: "أسئلة شائعة",
    title: "مساحة هادئة لفهم مسائل الأحوال الشخصية والنزاعات المدنية.",
    intro: "إجابات مختصرة تساعد على الاستعداد لمحادثة أولى تراعي حساسية المسألة وسياقها.",
    items: [
      { id: "civil-matter-fit", intent: "scope", question: "متى قد تندرج المسألة ضمن الأحوال الشخصية أو المنازعات المدنية؟", answer: "قد ترتبط المسألة بالعلاقات الأسرية أو الإرث أو حق مدني أو خلاف بين أطراف. يظل توصيف المجال مرتبطًا بالوقائع والمستندات، لذلك يبدأ الحديث من السياق لا من افتراض مسبق." },
      { id: "civil-preparation", intent: "preparation", question: "ما الذي يمكن تجهيزه قبل المحادثة الأولى؟", answer: "قد يفيد ملخص هادئ للوقائع، وتسلسل زمني مختصر، وأي مستندات أو مراسلات ذات صلة، مع تحديد الأسئلة الأهم بالنسبة إليك. يكفي ما يساعد على فهم البداية." },
      { id: "civil-sensitive-information", intent: "understanding", question: "كيف يمكن عرض معلومات حساسة في الاستشارة؟", answer: "يمكن التركيز على المعلومات اللازمة لفهم السؤال مع ترتيبها بصورة واضحة ومختصرة. تحدد ظروف المسألة ما يلزم بحثه، ولا تحتاج المحادثة الأولى إلى افتراضات أو تفاصيل لا ترتبط بالسؤال المطروح." },
      { id: "civil-first-conversation", intent: "consultation", question: "ما الذي يمكن توقعه من الاستشارة الأولى؟", answer: "تهدف الاستشارة الأولى إلى فهم الخلفية، والاستماع إلى الأسئلة، ومراجعة ما يتوفر من معلومات. وقد تساعد على توضيح النقاط التي تحتاج إلى نظر لاحق بصورة منظمة." },
      { id: "civil-options-understanding", intent: "process", question: "هل تساعد الاستشارة على فهم الخيارات دون اتخاذ قرار فوري؟", answer: "يمكن أن تساعد المحادثة على ترتيب المسألة وتحديد الأسئلة العملية المرتبطة بها. أما أي تقييم أو خطوة لاحقة فيعتمد على المعلومات الكاملة والظروف الخاصة بكل حالة." },
      { id: "civil-personal-status-distinction", intent: "related-service", question: "ما الفرق بين مسألة أحوال شخصية ومسألة مدنية؟", answer: "قد تتصل الأحوال الشخصية بالعلاقات الأسرية أو الإرث، بينما قد تتناول المسألة المدنية حقوقًا أو التزامات بين أطراف في سياق آخر. يوضح السياق المجال الأقرب دون اختزال المسألة في عنوان واحد." },
      { id: "civil-commercial-link", intent: "related-service", question: "متى قد تكون المسألة التجارية أكثر صلة؟", answer: "إذا كان السؤال يدور حول شركة أو عقد تجاري أو علاقة عمل تجارية، فقد يكون المجال التجاري أقرب للنقاش. يمكن الإشارة إلى هذا الارتباط عند عرض الوقائع والمستندات." },
    ],
  },
  notary: {
    eyebrow: "أسئلة شائعة",
    title: "إيضاحات عملية حول خدمات الكاتب العدل الخاص.",
    intro: "إجابات موجزة تساعد على فهم طبيعة التوثيق وما قد يفيد تحضيره قبل الاستفسار أو الموعد.",
    items: [
      { id: "notary-service-nature", intent: "scope", question: "ما طبيعة خدمات الكاتب العدل الخاص؟", answer: "تتصل هذه الخدمات بتوثيق محررات ووثائق مثل الوكالات والعقود ضمن النطاق المتاح. يحدد نوع المستند والأطراف والسياق ما يحتاج إلى إيضاح قبل البدء." },
      { id: "notary-document-review", intent: "preparation", question: "ما الوثائق التي قد تحتاج إلى مراجعة أو توثيق؟", answer: "قد يشمل ذلك عقودًا أو وكالات أو محررات أخرى بحسب الغرض منها. يفيد تقديم نسخة واضحة من المستند وشرح مختصر لسبب الاستفسار لتحديد ما يحتاج إلى بحث." },
      { id: "notary-information-preparation", intent: "preparation", question: "ما المعلومات التي تساعد على الاستعداد؟", answer: "يفيد توضيح هوية الأطراف، وصف المستند، والصفة التي يتصرف بها كل طرف، مع المستندات المتاحة. تختلف المتطلبات العملية باختلاف المعاملة ولا ينبغي افتراض قائمة موحدة." },
      { id: "notary-party-clarity", intent: "understanding", question: "لماذا يهم وضوح الأطراف والمستند؟", answer: "يساعد وضوح الأطراف والوثيقة والغرض منها على تنظيم الاستفسار وتحديد النقاط التي تحتاج إلى مراجعة. وهو جزء من فهم المعاملة، لا تأكيد مسبق لإمكان إتمامها." },
      { id: "notary-before-appointment", intent: "consultation", question: "متى يكون من المناسب الاستفسار قبل الموعد؟", answer: "قد يكون الاستفسار مفيدًا عندما يكون نوع المستند أو دور أحد الأطراف أو المعلومات المتاحة غير واضح. طرح السؤال مبكرًا يساعد على ترتيب ما يلزم مناقشته دون افتراض إجراءات محددة." },
      { id: "notary-legal-advice-distinction", intent: "related-service", question: "ما الفرق بين الاستشارة القانونية وخدمة التوثيق؟", answer: "تركز خدمة التوثيق على المستند والمعاملة ضمن نطاقها، بينما قد تتطلب بعض الأسئلة تقييمًا قانونيًا أوسع. يوضح موضوع السؤال ما إذا كانت الحاجة تتجاوز التوثيق إلى استشارة قانونية." },
      { id: "notary-commercial-link", intent: "related-service", question: "متى قد يرتبط المستند بمسألة تجارية؟", answer: "قد يرتبط المستند بعلاقة بين شركاء أو اتفاق تجاري أو صلاحية تمثيل. عند وجود هذا السياق، يفيد عرضه بوضوح لمعرفة ما إذا كانت هناك أسئلة تجارية تحتاج إلى مناقشة مستقلة." },
    ],
  },
  taxes: {
    eyebrow: "أسئلة شائعة",
    title: "أسئلة أولية حول الضرائب والامتثال في سياق المنشأة.",
    intro: "إجابات مختصرة تساعد على تنظيم المعلومات والسجلات قبل مناقشة مسألة ضريبية أو التزام امتثال.",
    items: [
      { id: "taxes-matter-scope", intent: "scope", question: "متى تكون مسألة الضرائب أو الامتثال مناسبة للنقاش؟", answer: "قد يكون ذلك عند وجود سؤال حول التزامات منشأة أو سجلات أو معاملة تحتاج إلى فهم أدق. يبدأ الحديث من الوقائع والمستندات المتاحة، لا من نصيحة ضريبية شخصية عامة." },
      { id: "taxes-document-organisation", intent: "preparation", question: "ما الذي يساعد على تنظيم المستندات قبل الاستشارة؟", answer: "قد تساعد العقود والسجلات والمراسلات والملخصات التي تشرح النشاط أو المعاملة. الهدف هو بناء سياق واضح؛ أما المستندات اللازمة فعليًا فتتحدد بحسب السؤال المطروح." },
      { id: "taxes-contracts-records", intent: "understanding", question: "لماذا قد تكون العقود والسجلات ذات صلة؟", answer: "قد توضح العقود والسجلات طبيعة التعامل والأطراف والالتزامات محل السؤال. مراجعتها ضمن السياق تساعد على تحديد المعلومات التي تحتاج إلى إيضاح إضافي." },
      { id: "taxes-compliance-context", intent: "process", question: "كيف يُفهم الامتثال بصورة عامة؟", answer: "يتصل الامتثال عادة بتنظيم المعلومات وفهم الالتزامات التي قد تنشأ في سياق معين. تختلف التفاصيل بحسب النشاط والوقائع، لذلك لا تصلح إجابة عامة كبديل عن مراجعة الحالة." },
      { id: "taxes-business-review", intent: "consultation", question: "متى تستفيد المنشأة من مراجعة قانونية أولية؟", answer: "قد تساعد المراجعة الأولية عندما تحتاج المنشأة إلى ترتيب سؤالها أو فهم المستندات المرتبطة بمعاملة أو التزام. تركز البداية على السياق قبل تحديد ما قد يحتاج إلى متابعة." },
      { id: "taxes-commercial-link", intent: "related-service", question: "متى ترتبط المسألة بخدمة تجارية أو شركات؟", answer: "قد يكون الارتباط قائمًا عندما يتصل السؤال بعقد أو هيكل شركة أو علاقة بين أطراف تجاريين. يساعد عرض هذه الخلفية على تمييز الجوانب التجارية من جوانب الامتثال." },
      { id: "taxes-first-conversation", intent: "consultation", question: "كيف تبدأ المحادثة الأولى حول الامتثال؟", answer: "تبدأ عادة بتحديد النشاط أو المعاملة والسؤال الأساسي، ثم مراجعة المعلومات المتاحة ذات الصلة. الغرض هو فهم الموضوع وترتيب ما يحتاج إلى بحث، لا تقديم نتيجة مسبقة." },
    ],
  },
} satisfies Record<ServiceFaqSlug, ServiceFaqContent>;

const en = {
  criminal: {
    eyebrow: "Common questions",
    title: "Understanding a criminal matter before the first conversation.",
    intro: "Short answers to help organise the available information and frame an initial discussion about a criminal matter.",
    items: [
      { id: "criminal-consultation-timing", intent: "consultation", question: "When can a consultation about a criminal matter be a sensible first step?", answer: "A consultation can be useful when you need to clarify the nature of a matter or organise the available information before deciding what to do next. Its scope depends on the facts, questions, and documents relevant to the individual situation." },
      { id: "criminal-consultation-preparation", intent: "preparation", question: "What is useful to bring to an initial consultation?", answer: "A concise timeline, available correspondence or documents, and the questions most important to you can help. The aim is not to prepare a complete file, but to provide a clear context for the first discussion." },
      { id: "criminal-matter-scope", intent: "scope", question: "What kinds of issues can be discussed in this area?", answer: "The discussion may cover matters connected with investigations, procedures, defence documents, or representation, as appropriate to the information available. The context determines whether this practice area is the right fit." },
      { id: "criminal-information-handling", intent: "understanding", question: "How does organising information and documents help?", answer: "Putting the available information in order can clarify what needs explanation and what may be relevant to the discussion. It does not replace a legal assessment, but it can make the first conversation more focused." },
      { id: "criminal-before-action", intent: "process", question: "Can the matter be discussed before any step is taken?", answer: "A conversation can begin with the core question and the available facts before general next considerations are discussed. General information is not a substitute for an assessment based on your own circumstances." },
      { id: "criminal-first-conversation", intent: "consultation", question: "What usually happens in an initial consultation?", answer: "The initial conversation is used to understand the background, identify points needing clarification, and review the information available. It may help identify what requires closer consideration afterwards." },
      { id: "criminal-related-service", intent: "related-service", question: "When might another legal service be closer to the issue?", answer: "Some matters can overlap with a civil dispute, a commercial relationship, or a document requiring notarisation. The closer area becomes clearer after the facts are understood, so it can be useful to raise any overlap at the outset." },
    ],
  },
  commercial: {
    eyebrow: "Common questions",
    title: "Practical questions before structuring a commercial relationship or decision.",
    intro: "Short answers to help gather the context and documents relevant to commercial, corporate, and contract matters.",
    items: [
      { id: "commercial-relationship-structure", intent: "understanding", question: "When can a consultation help with a commercial relationship or company?", answer: "An early conversation can be useful when partners are establishing a relationship, roles need to be organised, or a question arises before a decision is made. The discussion begins with the relationship and the information available about it." },
      { id: "commercial-contract-review", intent: "scope", question: "Can an existing contract or agreement be discussed?", answer: "A contract or agreement can be discussed in light of the question raised and its commercial context. An available copy and relevant correspondence can help identify the points that may need review." },
      { id: "commercial-risk-context", intent: "process", question: "How does understanding risk help before a decision?", answer: "Organising the facts and obligations in view can identify the questions that merit closer examination. It is not a prediction of an outcome; it is a way to develop a clearer picture before a commercial decision." },
      { id: "commercial-preparation", intent: "preparation", question: "Which documents may help at the first conversation?", answer: "A draft or existing agreement, the structure of the parties’ relationship, relevant correspondence, and a short summary of the commercial question can all help. The importance of each document depends on the matter." },
      { id: "commercial-civil-distinction", intent: "related-service", question: "How can a commercial issue differ from a civil dispute?", answer: "A commercial issue commonly concerns a business relationship, activity, or contract, while a civil dispute may arise in a different context. The parties, documents, and nature of the question help indicate the closer area." },
      { id: "commercial-first-consultation", intent: "consultation", question: "What is the value of an initial commercial consultation?", answer: "An initial consultation can help organise the question, understand the documents available, and identify matters that may require follow-up. It is a starting point for understanding context, not a predetermined conclusion." },
      { id: "commercial-tax-link", intent: "related-service", question: "When might tax or compliance be relevant to a commercial issue?", answer: "A tax or compliance aspect may arise where the question involves company records, obligations, or business operations. Its relevance can be considered after the transaction and related documents are understood." },
    ],
  },
  civil: {
    eyebrow: "Common questions",
    title: "A calm space to understand personal status and civil matters.",
    intro: "Concise answers to help prepare for an initial conversation that respects the sensitivity and context of the matter.",
    items: [
      { id: "civil-matter-fit", intent: "scope", question: "When might a matter fall within personal status or civil issues?", answer: "A matter may concern family relationships, inheritance, a civil right, or a disagreement between parties. The appropriate area depends on the facts and documents, so the conversation starts with context rather than an assumption." },
      { id: "civil-preparation", intent: "preparation", question: "What can be prepared before the first conversation?", answer: "A calm summary of the facts, a short timeline, relevant documents or correspondence, and the questions most important to you can help. The aim is simply to provide what helps explain the starting point." },
      { id: "civil-sensitive-information", intent: "understanding", question: "How can sensitive information be shared in a consultation?", answer: "The discussion can focus on the information needed to understand the question, arranged clearly and concisely. The circumstances determine what needs closer attention; the first conversation need not include unrelated detail or assumptions." },
      { id: "civil-first-conversation", intent: "consultation", question: "What can be expected from an initial consultation?", answer: "The first consultation is intended to understand the background, listen to the questions raised, and review the information available. It may help clarify the points that require more structured consideration." },
      { id: "civil-options-understanding", intent: "process", question: "Can a consultation help explain options without requiring an immediate decision?", answer: "A conversation can help organise the matter and identify the practical questions connected with it. Any assessment or later step depends on the complete information and the circumstances of the individual case." },
      { id: "civil-personal-status-distinction", intent: "related-service", question: "How do personal status and civil matters differ?", answer: "Personal status may relate to family relationships or inheritance, while a civil matter may concern rights or obligations in another setting. Context helps identify the closer area without reducing the matter to a single label." },
      { id: "civil-commercial-link", intent: "related-service", question: "When might a commercial service be more relevant?", answer: "If the question centres on a company, commercial agreement, or business relationship, a commercial practice area may be closer to the discussion. This connection can be raised when the facts and documents are outlined." },
    ],
  },
  notary: {
    eyebrow: "Common questions",
    title: "Practical clarification around private notary services.",
    intro: "Short answers to help explain the nature of notarisation and what may be useful to prepare before an enquiry or appointment.",
    items: [
      { id: "notary-service-nature", intent: "scope", question: "What is the nature of private notary services?", answer: "These services relate to the notarisation of instruments and documents, such as powers of attorney and agreements, within the available scope. The document type, parties, and context indicate what needs clarification before proceeding." },
      { id: "notary-document-review", intent: "preparation", question: "Which documents may need review or notarisation?", answer: "This can include agreements, powers of attorney, or other instruments depending on their purpose. A clear copy of the document and a short explanation of the enquiry can help identify what needs to be considered." },
      { id: "notary-information-preparation", intent: "preparation", question: "What information can help with preparation?", answer: "It can be helpful to clarify the parties’ identities, the document, the capacity in which each party acts, and the documents available. Practical requirements vary by transaction, so there is no single universal list." },
      { id: "notary-party-clarity", intent: "understanding", question: "Why does clarity about the parties and document matter?", answer: "Clear information about the parties, instrument, and purpose helps organise the enquiry and identify points that may need review. It is part of understanding the transaction, not confirmation that it can be completed." },
      { id: "notary-before-appointment", intent: "consultation", question: "When is it useful to enquire before an appointment?", answer: "An enquiry can be useful where the document type, a party’s role, or the available information is unclear. Raising the question early helps organise what needs discussion without assuming a particular procedure." },
      { id: "notary-legal-advice-distinction", intent: "related-service", question: "How does legal advice differ from notarisation?", answer: "Notarisation focuses on the document and transaction within its scope, while some questions may require a broader legal assessment. The subject of the question helps indicate whether the need goes beyond notarisation." },
      { id: "notary-commercial-link", intent: "related-service", question: "When might a document connect with a commercial matter?", answer: "A document may connect with a partner arrangement, commercial agreement, or authority to act. Setting out that context can help identify whether a separate commercial question should also be discussed." },
    ],
  },
  taxes: {
    eyebrow: "Common questions",
    title: "Initial questions on tax and compliance in a business context.",
    intro: "Concise answers to help organise information and records before discussing a tax question or compliance obligation.",
    items: [
      { id: "taxes-matter-scope", intent: "scope", question: "When can a tax or compliance question be suitable for discussion?", answer: "It may be suitable where a business has a question about obligations, records, or a transaction that needs clearer understanding. The discussion begins with the available facts and documents, not with generic personal tax advice." },
      { id: "taxes-document-organisation", intent: "preparation", question: "What helps organise documents before a consultation?", answer: "Relevant agreements, records, correspondence, and short summaries that explain the activity or transaction may help. The goal is to establish clear context; the documents actually needed depend on the question raised." },
      { id: "taxes-contracts-records", intent: "understanding", question: "Why might agreements and records be relevant?", answer: "Agreements and records may clarify the transaction, parties, and obligations connected with the question. Looking at them in context helps identify information that may need further explanation." },
      { id: "taxes-compliance-context", intent: "process", question: "How can compliance be understood in general terms?", answer: "Compliance commonly involves organising information and understanding obligations that may arise in a particular context. Details vary with the activity and facts, so a general answer is not a substitute for reviewing the matter." },
      { id: "taxes-business-review", intent: "consultation", question: "When can a business benefit from an initial legal review?", answer: "An initial review can help when a business needs to organise its question or understand documents linked to a transaction or obligation. The first step focuses on context before identifying what may require follow-up." },
      { id: "taxes-commercial-link", intent: "related-service", question: "When does the question connect with commercial or corporate work?", answer: "A connection can arise where the question involves an agreement, company structure, or a relationship between commercial parties. Setting out that background helps distinguish commercial aspects from compliance considerations." },
      { id: "taxes-first-conversation", intent: "consultation", question: "How does an initial compliance conversation begin?", answer: "It usually begins by identifying the activity or transaction and the central question, then reviewing the relevant information available. The purpose is to understand and organise the subject, not to provide a predetermined result." },
    ],
  },
} satisfies Record<ServiceFaqSlug, ServiceFaqContent>;

export const serviceFaqContent: Record<Locale, Record<ServiceFaqSlug, ServiceFaqContent>> = { ar, en };

export const serviceFaqExpectedCount = 7;
