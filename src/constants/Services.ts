import { Scale, Building2, Gavel, FileSignature, Wallet } from 'lucide-react';
import { ServiceItem } from '@/types/Services';

export const LAW_SERVICES: ServiceItem[] = [
  {
    id: 'criminal',
    title: 'القانون الجنائي',
    desc: 'دفاع متكامل وأمانة مطلقة في كافة القضايا الجنائية لضمان محاكمة عادلة وحماية حقوقكم.',
    icon: Gavel,
    color: 'from-red/30 to-red/10 border-red/20 text-red hover:shadow-[0_0_30px_5px_rgba(255,100,100,0.3)]',
    gridSpan: 'grid-cols-2 lg:grid-cols-1 grid-rows-2 lg:grid-rows-1 col-span-2 lg:col-span-2',
    features: [
      { title: "تمثيل أمام النيابة", description: "حضور التحقيقات وضمان سير الإجراءات القانونية وفق دستور الدولة." },
      { title: "قضايا الجنايات والجنح", description: "إعداد مذكرات الدفاع والمرافعة في أعقد القضايا الجنائية." }
    ]
  },
  {
    id: 'commercial',
    title: 'القانون التجاري والشركات',
    desc: 'تأسيس الشركات وإدارة النزاعات التجارية لحماية استثماراتكم في بيئة الإمارات الاقتصادية.',
    icon: Building2,
    color: 'from-blue/30 to-blue/10 border-blue/20 text-blue hover:shadow-[0_0_30px_5px_rgba(100,100,255,0.3)]',
    gridSpan: 'col-span-1 row-span-1',
    features: [
      { title: "تأسيس الشركات", description: "دعم كامل في اختيار الهيكل القانوني الأنسب (Limited Liability, PJSC)." },
      { title: "صياغة الاتفاقيات", description: "إعداد اتفاقيات الشركاء وعقود الامتياز التجاري بدقة متناهية." }
    ]
  },
  {
    id: 'civil',
    title: 'الأحوال الشخصية والمنازعات المدنية',
    desc: 'استشارات دقيقة في قضايا الأسرة، الإرث، والمنازعات المدنية وفقاً للقوانين الإماراتية.',
    icon: Scale,
    color: 'from-gold/30 to-gold/10 border-gold/20 text-gold hover:shadow-[0_0_30px_5px_rgba(212,175,55,0.3)]',
    gridSpan: 'col-span-1 row-span-1',
    features: [
      { title: "قضايا الأسرة", description: "حلول قانونية تراعي مصلحة الأسرة والطفل في قضايا الأحوال الشخصية." },
      { title: "توزيع المواريث", description: "تطبيق أحكام الشريعة والقانون في تقسيم التركات وتوثيق الأنصبة." }
    ]
  },
  {
    id: 'notary',
    title: 'التوثيق الخاص',
    desc: 'بصفتنا كاتب عدل خاص مرخص، نقدم خدمات توثيق العقود وتصديق المحررات بسرعة ودقة.',
    icon: FileSignature,
    color: 'from-white/30 to-white/10 border-white/20 text-white hover:shadow-[0_0_30px_5px_rgba(255,255,255,0.3)]',
    gridSpan: 'col-span-2 lg:col-span-2 row-span-1',
    features: [
      { title: "تصديق العقود", description: "توثيق عقود التأسيس والوكالات القانونية بشكل رسمي ومعتمد." },
      { title: "سرعة الإنجاز", description: "نظام إلكتروني مرتبط بدائرة القضاء لضمان التوثيق اللحظي." }
    ]
  },
  {
    id: 'taxes',
    title: 'قانون الضرائب والامتثال',
    desc: 'استشارات متخصصة في ضريبة الشركات والقيمة المضافة لضمان الامتثال التام للأنظمة الجديدة.',
    icon: Wallet,
    color: 'from-green/30 to-green/10 border-green/20 text-green hover:shadow-[0_0_30px_5px_rgba(100,255,100,0.3)]',
    gridSpan: 'col-span-1 row-span-1',
    features: [
      { title: "ضريبة الشركات", description: "توجيه الشركات للامتثال لمتطلبات الهيئة الاتحادية للضرائب." },
      { title: "التخطيط الضريبي", description: "استراتيجيات قانونية لتقليل الأعباء الضريبية بما يتوافق مع القانون." }
    ]
  }
];