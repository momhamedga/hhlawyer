import { Users, Briefcase, Award, Scale } from 'lucide-react';
import { StatItem } from '@/types/stats';

export const STATS_DATA: StatItem[] = [
  {
    id: 1,
    label: 'قضية ناجحة',
    value: '1500',
    suffix: '+',
    icon: <Briefcase className="text-gold" size={28} />,
  },
  {
    id: 2,
    label: 'عميل واثق',
    value: '850',
    suffix: '+',
    icon: <Users className="text-gold" size={28} />,
  },
  {
    id: 3,
    label: 'عام من الخبرة',
    value: '15',
    suffix: '+',
    icon: <Award className="text-gold" size={28} />,
  },
  {
    id: 4,
    label: 'نزاهة قانونية',
    value: '100',
    suffix: '%',
    icon: <Scale className="text-gold" size={28} />,
  },
];