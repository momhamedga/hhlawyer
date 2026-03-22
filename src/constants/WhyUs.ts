import {  ValueItem } from '@/types/WhyUs';
import { ShieldCheck, Bolt, MapPin, Handshake , Zap, Scale, Award} from 'lucide-react';

export const VALUES_PROPOSITION: ValueItem[] = [
  {
    icon: ShieldCheck,
    title: 'السرية التامة',
    desc: 'نضمن حماية بياناتكم وملفاتكم بأعلى معايير الأمان والخصوصية القانونية.',
    gradient: 'from-blue/20 to-transparent' // توهج أزرق للأمان
  },
  {
    icon: Bolt,
    title: 'السرعة في الإنجاز',
    desc: 'نستجيب فوراً لاستشاراتكم ونعمل بجدية لإنهاء قضاياكم في أسرع وقت ممكن.',
    gradient: 'from-gold/20 to-transparent' // توهج ذهبي للسرعة
  },
  {
    icon: MapPin,
    title: 'خبرة محلية عميقة',
    desc: 'فريقنا ملم تماماً بالقوانين والاجراءات القضائية داخل دولة الإمارات العربية المتحدة.',
    gradient: 'from-green/20 to-transparent' // توهج أخضر للبيئة المحلية
  },
  {
    icon: Handshake,
    title: 'الشفافية والنزاهة',
    desc: 'نتعامل بصدق مطلق في توضيح المواقف القانونية والتكاليف المتوقعة منذ البداية.',
    gradient: 'from-white/10 to-transparent' // توهج أبيض للنزاهة
  }
];





export const WHY_US_VALUES: ValueItem[] = [
  { 
    title: "دقة التنفيذ", 
    desc: "نحلل أدق التفاصيل لضمان الأمان القانوني.", 
    icon: ShieldCheck,
    gradient: "from-gold/20 via-gold/5 to-transparent" 
  },
  { 
    title: "سرعة الاستجابة", 
    desc: "فريق مخصص للرد الفوري على الاستشارات.", 
    icon: Zap,
    gradient: "from-blue-500/20 via-blue-500/5 to-transparent"
  },
  { 
    title: "نزاهة مهنية", 
    desc: "الشفافية هي أساس علاقتنا بالموكلين.", 
    icon: Scale,
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent"
  },
  { 
    title: "خبرة محلية", 
    desc: "فهم عميق للتشريعات في دولة الإمارات.", 
    icon: Award,
    gradient: "from-purple-500/20 via-purple-500/5 to-transparent"
  },
];