import { ReactNode } from 'react';

export interface StatItem {
  id: number;
  label: string;
  value: string;
  suffix: string;
  icon: ReactNode;
}