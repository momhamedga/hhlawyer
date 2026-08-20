import { TimelineItem } from '@/types/About';
import { Eye, Target, Shield } from 'lucide-react';

import { VisionValue } from '@/types/About';
export const EXPERIENCES: TimelineItem[] = [
  { year: "2018 - الآن", title: "مؤسس المكتب", company: "مكتب حسين الحارثي للمحاماة" },
  { year: "2012 - 2018", title: "مستشار قانوني أول", company: "دائرة القضاء - أبوظبي" }
];

export const EDUCATION: TimelineItem[] = [
  { year: "2010", title: "ماجستير في القانون الدولي", company: "جامعة الإمارات العربية المتحدة" },
  { year: "2007", title: "بكالوريوس القانون", company: "جامعة الشارقة" }
];



 export const PHILOSOPHY_VALUES: VisionValue[] = [
  { 
    title: "رؤيتنا", 
    desc: "صياغة مستقبل قانوني رقمي يحمي الحقوق في عصر التحول السريع، لنكون المرجع الأول للعدالة المبتكرة.", 
    icon: Eye,
    color: "#D4AF37" // لون الذهب (Gold)
  },
  { 
    title: "رسالتنا", 
    desc: "تقديم استشارات قانونية استباقية تتجاوز التوقعات، مع الالتزام المطلق بالنزاهة والسرية المهنية.", 
    icon: Target,
    color: "#3B82F6" // لون أزرق نيون
  },
  { 
    title: "قيمنا", 
    desc: "الشفافية المطلقة، والابتكار المستمر، والولاء الكامل لمصالح موكلينا هي جوهر هويتنا القانونية.", 
    icon: Shield,
    color: "#10B981" // لون أخضر نيون
  }
];