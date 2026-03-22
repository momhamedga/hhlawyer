'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PRACTICE_AREAS } from '@/constants/PracticeAreas';
import { CLIENT_PROCESS } from '@/constants/ClientProcess';


export const ClientProcess: React.FC = () => {
  return (
    <section id="process" className="relative py-32 bg-transparent">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-gold font-black text-sm uppercase tracking-[0.6em] mb-4"
          >
            خارطة الطريق
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white leading-tight"
          >
            كيف نبدأ <span className="text-white/20 italic">رحلتنا القانونية؟</span>
          </motion.h3>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-8 relative">
          
          {/* Connector Line (Desktop Only) - v4 hidden md:block syntax */}
          <div className="hidden lg:block absolute top-24 left-0 w-full h-px bg-linear-to-r from-transparent via-gold/20 to-transparent z-0" />

          {PRACTICE_AREAS.length > 0 && CLIENT_PROCESS.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="relative group flex flex-col items-center text-center"
            >
              {/* Step ID (Neon Number) */}
              <div className="absolute -top-12 text-8xl font-black text-white/3 group-hover:text-gold/[0.07] transition-colors duration-700 pointer-events-none tracking-tighter">
                {step.id}
              </div>

              {/* Icon Container with Neon Glow */}
              <motion.div 
                whileHover={{ rotateY: 180 }}
                transition={{ duration: 0.6 }}
                className={`relative size-24 rounded-3xl bg-royal-charcoal border border-white/10 flex items-center justify-center text-gold z-10 shadow-2xl transition-all duration-500 group-hover:border-gold/50 ${step.color} group-hover:shadow-[0_0_30px_-5px_rgba(212,175,55,0.3)]`}
              >
                <step.icon className="size-10" />
                
                {/* Number Badge */}
                <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-gold text-royal-charcoal font-black text-sm flex items-center justify-center shadow-lg">
                  {step.id}
                </div>
              </motion.div>

              {/* Content */}
              <div className="mt-10 relative z-10" dir="rtl">
                <h4 className="text-2xl font-black text-white mb-4 group-hover:text-gold transition-colors tracking-tight">
                  {step.title}
                </h4>
                <p className="text-white/40 text-base leading-relaxed font-light max-w-xs group-hover:text-white/70 transition-colors">
                  {step.desc}
                </p>
              </div>

              {/* Mobile Connector Line */}
              {index !== CLIENT_PROCESS.length - 1 && (
                <div className="lg:hidden w-px h-16 bg-linear-to-b from-gold/30 to-transparent mt-8" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};