'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MobileMenu } from './MobileMenu';
import { DesktopMenu } from './DesktopMenu';
import { LayoutGrid, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/60 backdrop-blur-xl border-b border-gold/10">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        
        <Link href="/" className="relative group flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            // v4: استخدام مقاسات الـ Scale الثابتة (w-12 = 3rem, w-14 = 3.5rem)
            className="relative w-12 h-12 md:w-14 md:h-14"
          >
            <Image
              src="/logo.webp"
              alt="لوجو حسين الحارثي"
              fill
              priority
              className="object-contain"
              sizes="56px" 
            />
          </motion.div>

          <div className="flex flex-col leading-tight  sm:flex">
             <span className="text-gold font-bold text-lg md:text-xl tracking-wide uppercase">حسين الحارثي</span>
             <span className="text-white/50 text-xs tracking-widest mt-0.5">محامي وكاتب عدل خاص</span>
          </div>
        </Link>

        {/* DesktopMenu - v4 Logic */}
        <DesktopMenu />

        <div className="hidden lg:flex items-center">
          <Link 
            href="#consultation" 
            // v4: استخدام كلاسات الـ Transition والـ Shadow الجديدة
            className="relative overflow-hidden group bg-royal-charcoal border border-gold/30 px-8 py-3 rounded-full transition-all duration-500 shadow-xl"
          >
            <span className="relative z-10 text-gold text-sm font-bold group-hover:text-white transition-colors duration-300">
              حجز موعد قانوني
            </span>
            {/* v4: استخدام كلاسات الـ Translate النظيفة */}
            <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
          </Link>
        </div>

        {/* زر الموبايل - v4 syntax */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden text-gold p-2 hover:bg-gold/10 rounded-xl transition-colors"
        >
          {isMobileMenuOpen ? <X className="size-7" /> : <LayoutGrid className="size-7" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        )}
      </AnimatePresence>
    </header>
  );
};