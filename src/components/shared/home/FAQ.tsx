'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_DATA } from '@/constants/FAQ';

export const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section className="relative py-32 bg-transparent overflow-hidden" dir="rtl">
      <div className="mx-auto max-w-4xl px-6 relative z-10">
        
        {/* Header - v4 inline-flex with native gap */}
        <div className="flex flex-col items-center mb-24 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-gold/20 bg-gold/5 text-gold text-[10px] font-black uppercase tracking-[0.4em]"
          >
            <HelpCircle className="size-3.5" />
            مركز المساعدة
          </motion.div>
          
          <h2 className="mt-8 text-4xl md:text-6xl font-black text-white tracking-tighter">
            لديك <span className="text-gold italic font-light">استفسارات؟</span>
          </h2>
        </div>

        {/* Accordion List - v4 space utility */}
        <div className="grid gap-5">
          {FAQ_DATA.map((item, index) => {
            const isOpen = activeIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                viewport={{ once: true }}
                // v4 transition-discrete behavior
                className={`group relative rounded-4xl border transition-all duration-500 overflow-hidden ${
                  isOpen 
                    ? 'border-gold/30 bg-white/4 shadow-2xl shadow-gold/5' 
                    : 'border-white/5 bg-white/1 hover:border-white/10 hover:bg-white/2'
                }`}
              >
                <button
                  onClick={() => setActiveIndex(isOpen ? null : index)}
                  className="w-full cursor-pointer px-8 py-8 flex items-center justify-between text-right"
                >
                  <span className={`text-lg md:text-xl font-bold tracking-tight transition-colors duration-500 ${isOpen ? 'text-gold' : 'text-white/90'}`}>
                    {item.question}
                  </span>
                  
                  {/* Icon Container with v4 size utility */}
                  <div className={`size-10 rounded-2xl border flex items-center justify-center transition-all duration-700 ${
                    isOpen 
                      ? 'bg-gold border-gold text-black rotate-180 shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                      : 'border-white/10 text-white/30 group-hover:border-gold/50 group-hover:text-gold'
                  }`}>
                    <ChevronDown className="size-5" strokeWidth={2.5} />
                  </div>
                </button>

                <AnimatePresence mode="wait">
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} // Custom spring-like easing
                    >
                      {/* Content Area - v4 border and leading */}
                      <div className="px-8 pb-8 pt-2 text-white/40 leading-relaxed text-base md:text-lg">
                        <div className="h-px w-full bg-linear-to-r from-gold/20 via-transparent to-transparent mb-6" />
                        <p className="max-w-3xl">
                           {item.answer}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
      
      {/* Background Decorative Glow for v4 harmony */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-128 bg-gold/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </section>
  );
};