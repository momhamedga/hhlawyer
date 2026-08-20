'use client';

import { ExperienceCard } from '../molecules/ExperienceCard';
import { motion } from 'framer-motion';
import { TimelineSectionProps } from '@/types/About';

export const TimelineSection = ({ title, items }: TimelineSectionProps) => (
  <div className="space-y-6 md:space-y-10">
    {/* 1. العنوان بلمسة نيون خفيفة جداً في الموبيل */}
    <div className="relative inline-block">
      <motion.h3 
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="text-2xl md:text-4xl font-black text-white italic border-r-4 border-gold pr-4 leading-none"
      >
        {title}
      </motion.h3>
      {/* لمسة "جلو" خلف العنوان للموبيل */}
      <div className="absolute -right-2 top-0 h-full w-4 bg-gold/10 blur-xl -z-10 md:hidden" />
    </div>
    
    {/* 2. حاوية الكروت بلمسة Glassmorphism */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="
        relative
        border border-white/5 
        rounded-4xl md:rounded-[3.5rem] 
        bg-white/2 backdrop-blur-2xl 
        overflow-hidden 
        divide-y divide-white/5
        shadow-2xl shadow-black/50
      "
    >
      {items.map((item, index) => (
        <ExperienceCard key={index} {...item} />
      ))}
      
      {/* لمسة نيون داخلية في الموبيل (Indicator) */}
      <div className="absolute top-0 right-0 w-1 h-full bg-linear-to-b from-gold/20 via-transparent to-gold/20 opacity-30 md:hidden" />
    </motion.div>
  </div>
);