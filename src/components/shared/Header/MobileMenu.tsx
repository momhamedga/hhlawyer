'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { NAV_LINKS } from '@/constants/navigation';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const sidebarVariants: Variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
  closed: {
    x: '100%',
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 40,
    },
  },
};

const linkVariants: Variants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: 30 },
};

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية المظللة - v4 backdrop-blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />

          {/* القائمة الجانبية - v4 Dynamic Viewport Height (h-dvh) */}
          <motion.nav
            ref={menuRef}
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            dir="rtl"
            className="fixed top-0 right-0 z-50 h-dvh w-80 max-w-[85%] bg-royal-charcoal/95 border-l border-gold/20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] lg:hidden flex flex-col p-8 backdrop-blur-2xl"
          >
            {/* قسم اللوجو المحدث */}
            <div className="mt-16 mb-12 flex flex-col items-center">
              <div className="relative size-24 md:size-28 mb-6 group">
                {/* الهالة الذهبية خلف اللوجو */}
                <div className="absolute inset-0 bg-gold/10 rounded-full blur-xl animate-pulse" />
                <div className="relative size-full rounded-full border border-gold/30 p-2 bg-white/5 backdrop-blur-md overflow-hidden">
                  <Image
                    src="/logo.webp"
                    alt="لوجو حسين الحارثي"
                    fill
                    className="object-contain p-2 drop-shadow-[0_0_8px_rgba(197,160,89,0.5)]"
                  />
                </div>
              </div>
              <p className="text-white font-black text-2xl tracking-tight uppercase">حسين الحارثي</p>
              <span className="text-gold/60 text-[10px] tracking-[.4em] mt-2 font-medium">محامي وموثق خاص</span>
              <div className="w-12 h-0.5 bg-linear-to-r from-transparent via-gold to-transparent mt-6 opacity-40" />
            </div>

            {/* روابط التنقل */}
            <div className="flex flex-col gap-y-8 pr-4">
              {NAV_LINKS.map((link) => (
                <motion.div key={link.href} variants={linkVariants}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className="group flex items-center justify-between text-2xl font-bold text-white/80 hover:text-gold transition-all duration-300"
                  >
                    <span>{link.label}</span>
                    <motion.span 
                      whileHover={{ scale: 1.5 }}
                      className="size-1.5 rounded-full bg-gold shadow-[0_0_8px_var(--color-gold)] opacity-0 group-hover:opacity-100 transition-opacity" 
                    />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* زر الأكشن السفلي - v4 shadow utilities */}
            <motion.div variants={linkVariants} className="mt-auto pb-6">
              <Link 
                href="#consultation" 
                onClick={onClose} 
                className="relative block w-full text-center py-5 bg-gold text-royal-charcoal rounded-2xl font-black text-lg shadow-[0_10px_25px_oklch(0.85_0.15_85/0.3)] active:scale-95 transition-all overflow-hidden"
              >
                <span className="relative z-10">احجز استشارة فورية</span>
                <div className="absolute inset-0 bg-white opacity-0 active:opacity-20 transition-opacity" />
              </Link>
              <p className="text-white/30 text-center text-[10px] mt-6 uppercase tracking-[0.4em] font-medium">
                Hussein Al Harithi Law Firm
              </p>
            </motion.div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
};