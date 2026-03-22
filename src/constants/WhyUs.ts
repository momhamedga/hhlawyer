import { ValueItem } from '@/types/WhyUs';
import { ShieldCheck, Bolt, MapPin, Handshake } from 'lucide-react';

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