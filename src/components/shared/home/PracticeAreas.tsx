'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PRACTICE_AREAS } from '@/constants/PracticeAreas';

export const PracticeAreas: React.FC = () => {
  return (
    <section id="services" className="relative py-20 md:py-32 overflow-hidden bg-royal-charcoal">
      <div className="container mx-auto px-5 md:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-start mb-12 md:mb-20 text-right w-full" dir="rtl">
          <motion.h2 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-3"
          >
            نطاق العمل والتخصص
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-6xl font-black text-white leading-tight"
          >
            خبرات قانونية <span className="text-white/20 italic">لا تساوم</span>
          </motion.h3>
        </div>

        {/* Bento Grid System
            Mobile: h-auto (يتمدد حسب المحتوى)
            Desktop: lg:h-225 (ارتفاع ثابت للتنسيق الهندسي)
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-6 gap-4 md:gap-6 h-auto lg:h-225">
          {PRACTICE_AREAS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.5 }}
              viewport={{ once: true }}
              
              whileHover={{ y: -5, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              
              // التعديل هنا: min-h على الموبايل لضمان مساحة كافية للنص
              className={`group relative rounded-3xl md:rounded-4xl overflow-hidden border border-white/5 bg-white/3 backdrop-blur-3xl p-6 md:p-10 flex flex-col justify-end min-h-50 md:min-h-0 transition-all duration-500 hover:border-gold/40 ${item.size}`}
            >
              {/* Overlay Gradient */}
              <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              {/* Icon - أصغر قليلاً على الموبايل */}
              <div className="absolute top-6 right-6 md:top-8 md:right-8 size-12 md:size-14 rounded-xl md:rounded-2xl bg-royal-charcoal/50 border border-white/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-royal-charcoal transition-all duration-500">
                <item.icon className="size-6 md:size-7" />
              </div>

              {/* Textual Content */}
              <div className="relative z-10 text-right mt-12 md:mt-0" dir="rtl">
                <h4 className="text-xl md:text-3xl font-black text-white mb-2 md:mb-4 group-hover:text-gold transition-colors">
                  {item.title}
                </h4>
                <p className="text-white/40 text-xs md:text-base leading-relaxed font-light group-hover:text-white/80 transition-colors line-clamp-3 md:line-clamp-none">
                  {item.desc}
                </p>
              </div>

              {/* Mobile Glow Indicator (نقطة صغيرة ذهبية تبين إن الكارت تفاعلي) */}
              <div className="absolute bottom-4 left-4 size-1 bg-gold/20 rounded-full md:hidden" />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Decorative Background - v4 size units */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 md:size-150 bg-gold/5 blur-[80px] md:blur-[120px] rounded-full -z-10" />
    </section>
  );
};