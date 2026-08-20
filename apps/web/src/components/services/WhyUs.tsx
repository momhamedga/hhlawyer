'use client';

import { WHY_US_VALUES } from '@/constants/WhyUs';
import { ValueCard } from './ValueCard';

/**
 * مكون "لماذا نحن" - يعرض معايير التميز في المكتب
 * يعتمد على هيكلية Atomic Design (مكون منظم لمجموعة من الـ Atoms)
 */
export const WhyUs = () => {
  return (
    <section className="relative w-full py-20 overflow-visible">
      {/* 1. رأس القسم (Header Section) */}
      <header className="text-right mb-16 space-y-4">
        <h2 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter leading-none">
          معايير <span className="text-gold uppercase">التميز</span> لدينا
        </h2>
        <div className="flex justify-end">
          <div className="h-1.5 w-32 bg-linear-to-l from-gold to-transparent rounded-full" />
        </div>
      </header>

      {/* 2. شبكة القيم (Bento-style Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {WHY_US_VALUES.map((value, index) => (
          <ValueCard 
            key={value.title} 
            index={index}
            title={value.title}
            desc={value.desc}
            icon={value.icon}
            gradient={value.gradient}
          />
        ))}
      </div>

      {/* 3. لمسة نيون خلفية مخصصة للقسم */}
      <div className="absolute -bottom-20 -left-20 size-80 bg-gold/5 blur-[100px] rounded-full -z-10 opacity-50" />
    </section>
  );
};