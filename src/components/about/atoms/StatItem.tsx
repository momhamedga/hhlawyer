'use client';

import { motion } from 'framer-motion';
import { StatItemProps } from '@/types/About';

export const StatItem = ({ label, value, index = 0 }: StatItemProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="flex flex-col items-center flex-1"
  >
    {/* الرقم: حجم ذكي يتنفس */}
    <span className="text-4xl md:text-7xl font-black text-gold italic leading-none tabular-nums tracking-tighter">
      {value}
    </span>
    
    {/* الوصف: صغير جداً وأنيق تحت الرقم مباشرة */}
    <span className="text-[8px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.4em] text-white/30 font-bold mt-2 md:mt-4 text-center">
      {label}
    </span>

    {/* لمسة نيون سفلية بسيطة */}
    <div className="h-px w-4 md:w-8 bg-gold/20 mt-2" />
  </motion.div>
);