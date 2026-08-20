import { LucideIcon } from 'lucide-react';

// 1. تعريف واجهة لنقاط الخدمة (المميزات)
export interface ServicePoint {
  title: string;
  description: string;
}

// 2. تحديث الواجهة الرئيسية للخدمة
export interface ServiceItem {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
  gridSpan: string;
  
  // الإضافات الجديدة لعام 2026:
  fullDescription?: string;    // نص طويل لصفحة التفاصيل
  features?: ServicePoint[];   // النقاط اللي بتظهر في الـ Bento Grid تحت الهيرو
  ctaText?: string;            // نص مخصص للزرار (اختياري)
}