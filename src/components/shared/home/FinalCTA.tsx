'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { HOME_CTA } from '@/constants/FinalCTA';

export const FinalCTA: React.FC = () => {
  return (
    <section className="relative py-24 md:py-32 bg-transparent overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 relative z-10">
        
        {/* الحاوية الزجاجية الكبرى */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] border border-white/10 bg-white/2 backdrop-blur-3xl p-12 md:p-20 overflow-hidden text-center"
        >
          {/* خلفية نيون داخلية متغيرة */}
          <div className="absolute -top-24 -right-24 size-96 bg-gold/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute -bottom-24 -left-24 size-96 bg-white/5 blur-[120px] rounded-full" />

          {/* المحتوى النصي */}
          <div className="relative z-10 flex flex-col items-center gap-8" dir="rtl">
            <h2 className="text-4xl md:text-7xl font-black text-white leading-tight tracking-tighter max-w-4xl">
              {HOME_CTA.title}
            </h2>
            
            <p className="text-white/40 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
              {HOME_CTA.subtitle}
            </p>

            {/* أزرار التفاعل - v4 Flex gap */}
            <div className="flex flex-col sm:flex-row items-center gap-5 mt-4">
              
              {/* زر الحجز الرئيسي */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-10 py-5 rounded-2xl bg-gold text-black font-black text-lg flex items-center gap-3 overflow-hidden transition-all shadow-[0_20px_40px_-15px_rgba(212,175,55,0.4)]"
              >
                <span className="relative z-10">{HOME_CTA.primaryBtn}</span>
                <ArrowLeft className="relative z-10 size-5 group-hover:-translate-x-2 transition-transform duration-300" />
                <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>

              {/* زر الواتساب */}
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 rounded-2xl border border-white/10 bg-white/5 text-white font-bold text-lg flex items-center gap-3 hover:bg-white/10 transition-all backdrop-blur-md"
              >
                <MessageCircle className="size-5 text-gold" />
                <span>{HOME_CTA.secondaryBtn}</span>
              </motion.button>

            </div>
          </div>

          {/* زخرفة هندسية - v4 border utility */}
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />
        </motion.div>

      </div>
    </section>
  );
};