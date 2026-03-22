'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { VALUES_PROPOSITION } from '@/constants/WhyUs';

export const WhyUs: React.FC = () => {
  return (
    <section id="why-us" className="relative py-24 md:py-32 overflow-hidden bg-royal-charcoal border-t border-white/5">
      <div className="container mx-auto px-5 md:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center lg:items-end mb-16 md:mb-20 text-center lg:text-right w-full gap-6" dir="rtl">
          <div className="max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-gold font-black text-xs md:text-sm uppercase tracking-[0.4em] mb-3"
            >
              مكامن القوة والتميز
            </motion.h2>
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-black text-white leading-tight"
            >
              لماذا مكتب <span className="text-transparent bg-clip-text bg-linear-to-r from-gold via-white to-gold animate-gradient-x">حسين الحارثي</span>؟
            </motion.h3>
          </div>
        </div>

        {/* Features Cards Grid - v4 native style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 auto-rows-[220px] md:auto-rows-[250px]">
          {VALUES_PROPOSITION.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              
              // التفاعل: Hover للكمبيوتر و Tap للموبايل
              whileHover={{ y: -8, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              
              className="group relative rounded-3xl md:rounded-4xl overflow-hidden border border-white/5 bg-white/3 backdrop-blur-3xl p-8 md:p-10 flex flex-col justify-end transition-all duration-700 hover:border-white/10 ${item.gradient}"
            >
              {/* التدرج اللوني النيون عند التحويم - v4 native linear-to */}
              <div className={`absolute inset-0 bg-linear-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
              
              {/* الأيقونة العلوية وجهة اليسار لعمل توازن - v4 size utility */}
              <div className="absolute top-8 left-8 size-14 rounded-2xl bg-royal-charcoal/50 border border-white/10 flex items-center justify-center text-white/50 group-hover:bg-linear-to-r from-gold to-white group-hover:text-royal-charcoal transition-all duration-500 shadow-xl">
                <item.icon className="size-7" />
              </div>

              {/* المحتوى النصي جهة اليمين (RTL) */}
              <div className="relative z-10 text-right" dir="rtl">
                <h4 className="text-2xl md:text-3xl font-black text-white mb-3 md:mb-4 group-hover:text-gold transition-colors italic tracking-tight">
                  {item.title}
                </h4>
                <p className="text-white/40 text-sm md:text-base leading-relaxed font-light line-clamp-2 group-hover:text-white/80 transition-colors">
                  {item.desc}
                </p>
              </div>

              {/* زاوية ديكورية صغيرة تبين تفاعل الكارت - v4 native size units */}
              <div className="absolute bottom-4 left-4 size-2 bg-gold/10 rounded-full md:hidden animate-pulse" />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Background Cinematic Glow - v4 size units */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 md:size-150 bg-gold/5 blur-[80px] md:blur-[120px] rounded-full -z-10 animate-gradient-y" />
    </section>
  );
};