import { ProcessStep } from '@/types/ClientProcess';
import { CalendarCheck, FileSearch, Scale } from 'lucide-react';

export const CLIENT_PROCESS: ProcessStep[] = [
  {
    id: '01',
    title: 'حجز استشارة',
    desc: 'ابدأ بالتواصل معنا لتحديد موعد استشارة قانونية أولية لدراسة تفاصيل قضيتك.',
    icon: CalendarCheck,
    color: 'shadow-gold/40'
  },
  {
    id: '02',
    title: 'دراسة الملف',
    desc: 'يقوم فريقنا بتحليل كافة المستندات والوقائع لبناء استراتيجية قانونية محكمة.',
    icon: FileSearch,
    color: 'shadow-white/20'
  },
  {
    id: '03',
    title: 'التنفيذ والتمثيل',
    desc: 'نتولى كافة الإجراءات القضائية والقانونية لضمان استعادة حقوقك بأفضل النتائج.',
    icon: Scale,
    color: 'shadow-gold/40'
  }
];