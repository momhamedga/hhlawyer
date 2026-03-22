'use client';

import  { useRef } from 'react';
import { motion } from 'framer-motion';
import { PHILOSOPHY_VALUES } from "@/constants/About";
import { ValueItemCard } from "../molecules/ValueItemCard";

export const VisionSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <section className="relative py-12 md:py-24 px-0 md:px-6 overflow-visible">
      {/* 1. العنوان بلمسة انيميشن عند الظهور */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12 md:mb-20 space-y-4 px-6"
      >
        <h3 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
          الجوهر <span className="text-gold tracking-widest opacity-80">المهني</span>
        </h3>
        <div className="w-20 md:w-32 h-1.5 bg-linear-to-r from-transparent via-gold to-transparent mx-auto rounded-full opacity-30" />
      </motion.div>

      {/* 2. الـ Grid مع لمسة الموبيل (Scroll Snapping) */}
      <div 
        ref={containerRef}
        className="
          flex md:grid md:grid-cols-3 gap-6 md:gap-12 
          max-w-7xl mx-auto 
          overflow-x-auto md:overflow-visible 
          snap-x snap-mandatory scrollbar-hide
          px-6 md:px-0 pb-10
        "
      >
        {PHILOSOPHY_VALUES.map((value, index) => (
          <div 
            key={index} 
            className="shrink-0 w-[85vw] md:w-full snap-center" // لمسة الموبيل: الكارت بياخد 85% من العرض وبيثبت في النص
          >
            <ValueItemCard 
              {...value} 
              index={index} 
            />
          </div>
        ))}
      </div>

      {/* 3. مؤشر التقدم للموبيل (Progress Dots) */}
      <div className="flex md:hidden justify-center gap-2 mt-2">
        {PHILOSOPHY_VALUES.map((_, i) => (
          <motion.div 
            key={i}
            className="h-1 w-6 rounded-full bg-white/10"
            initial={{ opacity: 0.2 }}
            whileInView={{ opacity: 1, backgroundColor: '#D4AF37' }}
            viewport={{ margin: "-10% 0px -10% 0px" }} // بينور لما الكارت يكون في النص
          />
        ))}
      </div>

      {/* 4. جلو جانبي للموبيل عشان يحسسه إن فيه كروت تانية */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-20 h-full bg-linear-to-l from-black/20 to-transparent pointer-events-none md:hidden" />
    </section>
  );
};