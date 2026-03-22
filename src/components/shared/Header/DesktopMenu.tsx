// src/components/shared/Header/DesktopMenu.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; // تأكد من وجود AnimatePresence
import { NAV_LINKS } from '@/constants/navigation';

export const DesktopMenu: React.FC = () => {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <nav 
      className="hidden lg:flex items-center p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full relative"
      onMouseLeave={() => setHoveredPath(null)}
    >
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onMouseEnter={() => setHoveredPath(link.href)}
          className="relative px-8 py-2.5 text-sm font-black text-white/70 hover:text-gold transition-colors duration-500 z-10 group"
        >
          <span className="relative z-20">{link.label}</span>

          {/* Magnetic Background - v4 Style */}
          <AnimatePresence>
            {hoveredPath === link.href && (
              <motion.span
                layoutId="nav-hover-bg"
                className="absolute inset-0 bg-linear-to-r from-gold/10 via-white/5 to-gold/10 rounded-full -z-10 border border-gold/15 shadow-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              />
            )}
          </AnimatePresence>

          {/* النقطة النيون - v4 size utility */}
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 bg-gold rounded-full opacity-0 group-hover:opacity-100 shadow-[0_0_10px_var(--color-gold)] transition-all duration-500" />
        </Link>
      ))}
    </nav>
  );
};