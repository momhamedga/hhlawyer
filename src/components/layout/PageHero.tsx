'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PageHeroProps } from '@/types/Layout';

export const PageHero: React.FC<PageHeroProps> = ({ title, subtitle, breadcrumb }) => {
  return (
    <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden" dir="rtl">
      
      {/* 1. تأثيرات الخلفية (Ambient Neon) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] size-96 bg-gold/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] size-80 bg-white/5 blur-[100px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          
          {/* 2. Breadcrumbs - v4 logical properties */}
          <motion.nav 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-white/5 bg-white/2 backdrop-blur-md"
          >
            <Link href="/" className="text-white/40 hover:text-gold text-xs transition-colors">الرئيسية</Link>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={index}>
                <ChevronLeft className="size-3 text-white/20" />
                {item.href ? (
                  <Link href={item.href} className="text-white/40 hover:text-gold text-xs transition-colors">{item.label}</Link>
                ) : (
                  <span className="text-gold text-xs font-bold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </motion.nav>

          {/* 3. العناوين - Massive Typography 2026 */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[1.1]"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-lg md:text-xl font-light max-w-2xl leading-relaxed"
            >
              {subtitle}
            </motion.p>
          )}

          {/* 4. الخط الزخرفي النيون السفلي */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-1 bg-linear-to-r from-transparent via-gold to-transparent mt-12 shadow-[0_0_15px_rgba(212,175,55,0.5)]"
          />
        </div>
      </div>

      {/* زخرفة هندسية خفيفة (v4 opacity utility) */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-white/5 to-transparent" />
    </section>
  );
};