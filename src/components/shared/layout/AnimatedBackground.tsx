'use client';

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import React, { useEffect, useState } from 'react';

export const AnimatedBackground: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
        y: (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const smoothX = useSpring(mousePosition.x, { stiffness: 40, damping: 25 });
  const rotateScale = useTransform(smoothX, [-1, 1], [-8, 8]);
  const yStructure = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  return (
    <div className="fixed inset-0 -z-10 bg-royal-charcoal overflow-hidden pointer-events-none">
      
      {/* 1. شبكة معمارية (Architectural Grid) - v4 style */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(var(--color-gold) 0.5px, transparent 0.5px), 
                            linear-gradient(90deg, var(--color-gold) 0.5px, transparent 0.5px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* 2. ميزان العدل "النيون الذهبي" (The Golden Neon Scale) */}
      <motion.div 
        style={{ y: yStructure }} 
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative size-160 flex items-center justify-center opacity-20">
          
          {/* ذراع الميزان - الآن بخط واضح وتوهج */}
          <motion.div 
            style={{ rotate: rotateScale }}
            className="absolute top-1/4 w-[85%] h-1 bg-gold shadow-[0_0_15px_var(--color-gold)] rounded-full origin-center"
          >
            {/* خيوط الكفات */}
            <div className="absolute left-0 top-0 w-px h-40 bg-linear-to-b from-gold to-transparent origin-top -rotate-6" />
            <div className="absolute right-0 top-0 w-px h-40 bg-linear-to-b from-gold to-transparent origin-top rotate-6" />
            
            {/* الكفات المضيئة */}
            <div className="absolute left-scale-offset top-40 size-24 border-b-2 border-x-2 border-gold rounded-b-full shadow-[0_5px_15px_rgba(197,160,89,0.4)]" />
            <div className="absolute right-scale-offset top-40 size-24 border-b-2 border-x-2 border-gold rounded-b-full shadow-[0_5px_15px_rgba(197,160,89,0.4)]" />
          </motion.div>

          {/* عمود الاتزان - صلب وفخم */}
          <div className="absolute top-0 w-2 h-3/4 bg-linear-to-b from-gold via-gold/20 to-transparent rounded-full shadow-[0_0_20px_var(--color-gold)]" />
          
          {/* قاعدة الميزان */}
          <div className="absolute bottom-1/4 w-40 h-2 bg-gold/30 blur-sm rounded-full" />
        </div>
      </motion.div>

      {/* 3. الأعمدة الجانبية (The Justice Pillars) */}
      <div className="absolute inset-y-0 left-[5%] w-px bg-linear-to-b from-transparent via-gold/20 to-transparent shadow-[0_0_10px_var(--color-gold)]" />
      <div className="absolute inset-y-0 right-[5%] w-px bg-linear-to-b from-transparent via-gold/20 to-transparent shadow-[0_0_10px_var(--color-gold)]" />

      {/* 4. إضاءة درامية (Cinematic Lighting) */}
      <div className="absolute -top-20 -left-20 size-150 bg-gold/5 blur-[120px] rounded-full" />
      <div className="absolute -bottom-20 -right-20 size-150 bg-royal-glow/10 blur-[120px] rounded-full" />

      {/* 5. Vignette - لتركيز النظر على المحتوى */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,var(--color-royal-charcoal)_90%)]" />

    </div>
  );
};