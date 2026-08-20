'use client';

import { motion } from 'framer-motion';
import { TimelineItem } from '@/types/About';

export const ExperienceCard = ({ year, title, company }: TimelineItem) => (
  <motion.div 
    // لمسة الموبيل: تفاعل مع الضغط يغير الخلفية ويصغر الكارت بنسبة بسيطة
    whileTap={{ 
      backgroundColor: 'rgba(212, 175, 55, 0.05)', 
      scale: 0.98,
      transition: { duration: 0.1 } 
    }}
    whileHover={{ x: -5 }} // ديسكتوب فقط
    className="
      relative flex flex-col md:flex-row md:items-center 
      gap-3 md:gap-8 p-6 md:p-8 
      group transition-all duration-500 
      cursor-pointer md:cursor-default
      active:bg-white/2
    "
  >
    {/* 1. التاريخ: لمسة نيون خفيفة في الموبيل لجذب العين */}
    <div className="flex items-center gap-3 md:block">
      <span className="
        text-gold font-mono text-[10px] md:text-sm font-black tracking-[0.2em] 
        opacity-70 md:opacity-50 group-hover:opacity-100 italic 
        bg-gold/5 md:bg-transparent px-2 py-1 md:p-0 rounded-sm
      ">
        {year}
      </span>
      {/* خط وهمي يظهر في الموبيل بس عشان يربط العناصر */}
      <div className="h-px flex-1 bg-gold/10 md:hidden" />
    </div>

    {/* 2. المحتوى النصي */}
    <div className="flex flex-col text-right space-y-1">
      <h4 className="
        text-white font-bold text-lg md:text-2xl 
        group-hover:text-gold transition-colors duration-500
        leading-tight
      ">
        {title}
      </h4>
      <p className="
        text-white/30 text-[13px] md:text-base 
        font-light italic tracking-wide 
        group-hover:text-white/60 transition-colors
      ">
        {company}
      </p>
    </div>

    {/* 3. لمسة الموبيل: سهم صغير "Chevron" يلمح إن فيه تفاعل (اختياري) */}
    <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 md:group-hover:opacity-20 transition-opacity hidden md:block text-gold">
      ←
    </div>
  </motion.div>
);