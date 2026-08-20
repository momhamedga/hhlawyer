import { PracticeArea } from '@/types/PracticeAreas';
import { Gavel, Users, Briefcase, FileCheck, ShieldAlert } from 'lucide-react';


export const PRACTICE_AREAS: PracticeArea[] = [
  {
    title: 'القانون الجنائي',
    desc: 'تمثيل قانوني قوي وحازم في كافة القضايا الجنائية لضمان العدالة وحماية الحقوق.',
    icon: ShieldAlert,
    size: 'lg:col-span-2 lg:row-span-4', // الكارت الأكبر
    gradient: 'from-gold/20 to-transparent'
  },
  {
    title: 'الأحوال الشخصية',
    desc: 'حلول قانونية ودية وقضائية لقضايا الأسرة والارث بكل خصوصية وأمانة.',
    icon: Users,
    size: 'lg:col-span-1 lg:row-span-3',
    gradient: 'from-white/10 to-transparent'
  },
  {
    title: 'القضايا التجارية',
    desc: 'دعم الشركات والمستثمرين في العقود والنزاعات التجارية داخل الدولة.',
    icon: Briefcase,
    size: 'lg:col-span-1 lg:row-span-6', // الكارت الطويل
    gradient: 'from-gold/15 to-transparent'
  },
  {
    title: 'التوثيق الخاص',
    desc: 'خدمات الكاتب العدل الخاص وتصديق المستندات والاتفاقيات الرسمية.',
    icon: FileCheck,
    size: 'lg:col-span-1 lg:row-span-3',
    gradient: 'from-white/10 to-transparent'
  },
  {
    title: 'الاستشارات القانونية',
    desc: 'دراسات قانونية معمقة ووقائية تجنبك المخاطر قبل وقوعها.',
    icon: Gavel,
    size: 'lg:col-span-2 lg:row-span-2',
    gradient: 'from-gold/10 to-transparent'
  }
];