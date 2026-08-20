'use client';
import { motion } from 'framer-motion';
import { ValueItemCardProps } from '@/types/About';

export const ValueItemCard = ({ title, desc, icon: Icon, color, index }: ValueItemCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ delay: index * 0.1, duration: 0.5 }}
    
    // لمسة الموبيل: تفاعل عند الضغط (Scale down + Glow opacity)
    whileTap={{ scale: 0.96 }} 
    
    className="
      group relative p-8 md:p-10 
      rounded-[2.5rem] md:rounded-[3rem] 
      border border-white/5 
      bg-white/2 backdrop-blur-2xl 
      overflow-hidden 
      transition-all duration-500 
      hover:border-white/20 hover:bg-white/4
    "
  >
    {/* 1. تأثير الجلو (Glow) - في الموبيل بيظهر بنسبة 10% دائمًا وبيريد عند اللمس */}
    <div 
      className="
        absolute -right-20 -top-20 size-64 blur-[100px] rounded-full 
        opacity-10 md:opacity-0 group-hover:opacity-20 group-active:opacity-30 
        transition-opacity duration-700 pointer-events-none
      "
      style={{ backgroundColor: color }}
    />
    
    <div className="relative z-10 space-y-5 md:space-y-6">
      {/* 2. الأيقونة: لمسة نيون بـ Box Shadow */}
      <div 
        className="
          size-14 md:size-16 rounded-2xl flex items-center justify-center 
          transition-all duration-500 group-hover:scale-110
        "
        style={{ 
          backgroundColor: `${color}15`, 
          color: color,
          boxShadow: `0 0 20px ${color}10` // لمسة نيون خفيفة
        }}
      >
        <Icon size={28} className="md:size-8" strokeWidth={1.5} />
      </div>

      <div className="space-y-2 md:space-y-3">
        <h4 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
          {title}
        </h4>
        <p className="text-white/40 text-xs md:text-base leading-relaxed font-light group-hover:text-white/70 transition-colors duration-500">
          {desc}
        </p>
      </div>
    </div>

    {/* 3. الخط السفلي: في الموبيل خليه ظاهر بنسبة بسيطة (Glass Indicator) */}
    <div 
      className="
        absolute bottom-0 inset-x-0 h-1 
        scale-x-50 md:scale-x-0 
        group-hover:scale-x-100 transition-transform duration-700 
        origin-center opacity-30 md:opacity-100
      "
      style={{ backgroundColor: color }}
    />
  </motion.div>
);