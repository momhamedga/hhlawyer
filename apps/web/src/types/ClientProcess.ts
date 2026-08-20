import { LucideIcon } from 'lucide-react';

export interface ProcessStep {
  id: string; // "01" مثلاً
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string; // لون النيون الخاص بالخطوة
}