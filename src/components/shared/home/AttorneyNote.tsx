'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ATTORNEY_NOTE } from '@/constants/AttorneyNote';

// سنستخدم أيقونة اقتباس مخصصة تشبه التصميم الأصلي
const GoldQuote = () => (
  <svg width="65" height="52" viewBox="0 0 65 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gold group-hover:scale-110 transition-transform duration-500">
    <path d="M21.125 0C9.46875 0 0 9.46875 0 21.125V52H26V26H13C13 18.2812 19.2812 12 27 12V0H21.125ZM59.125 0C47.4688 0 38 9.46875 38 21.125V52H64V26H51C51 18.2812 57.2812 12 65 12V0H59.125Z" fill="currentColor" fillOpacity="0.8"/>
  </svg>
);

export const AttorneyNote: React.FC = () => {
  return (
    <section id="founder-note" className="relative py-24 md:py-32 overflow-hidden bg-transparent">
      
      {/* خلفية زخرفية (الميزان النيون) - v4 native positioning */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-150 text-white/1 pointer-events-none -z-10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" className="size-full">
          <path d="M16 16c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v11z"/><path d="M2 10h14"/><path d="M10 3v13"/><path d="M20 7h2"/><path d="M20 11h2"/><path d="M20 15h2"/><path d="M17 19h5"/><path d="M17 21h5"/><path d="M19 7v14"/>
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* الترتيب RTL: الصورة يمين، النص يسار */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20" dir="rtl">
          
          {/* الجانب البصري - الصورة الفخمة */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative w-full lg:w-1/2 flex items-center justify-center group"
          >
            {/* الهالة الذهبية خلف الصورة مباشرة (Pulse effect) */}
            <div className="absolute size-[90%] bg-gold/5 rounded-full blur-[100px] animate-pulse" />
            
            {/* الحاوية الزجاجية للصورة */}
            <div className="relative size-full aspect-4/5 max-w-sm rounded-4xl overflow-hidden border border-white/5 bg-white/1 backdrop-blur-2xl p-4 shadow-[0_0_60px_-15px_rgba(0,0,0,0.6)]">
              {/* تأثير نيون جانبي */}
              <div className="absolute inset-y-0 right-0 w-px bg-linear-to-b from-transparent via-gold/30 to-transparent" />
              
              <Image 
                src={ATTORNEY_NOTE.image}
                alt={ATTORNEY_NOTE.name}
                fill
                priority
                // التعديل الرئيسي: contain بدلاً من cover لإظهار الغترة كاملة، وإزالة grayscale
                className="object-contain p-2" 
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </motion.div>

          {/* الجانب النصي - الاقتباس مسطرة عربي */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="w-full lg:w-1/2 text-right"
          >
            {/* أيقونة الاقتباس الذهبية السميكة */}
            <div className="mb-8 md:mb-12">
              <GoldQuote />
            </div>
            
            <h2 className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-4">
              كلمة المؤسس
            </h2>
            
            <blockquote className="text-3xl md:text-[44px] font-black text-white leading-tight mb-12 tracking-tight italic">
              {ATTORNEY_NOTE.quote}
            </blockquote>
            
            {/* التوقيع والهوية */}
            <div className="flex flex-col items-start gap-1.5 border-r-2 border-gold pr-5">
              <h4 className="text-2xl md:text-3xl font-bold text-white tracking-tighter">
                الأستاذ {ATTORNEY_NOTE.name}
              </h4>
              <p className="text-gold/60 font-medium tracking-[0.3em] text-[11px] md:text-xs uppercase">
                {ATTORNEY_NOTE.title}
              </p>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};