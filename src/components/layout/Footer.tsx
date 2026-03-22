'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Instagram, Twitter, Linkedin, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "عن المكتب", href: "/about" },
    { label: "الخدمات", href: "/services" },
    { label: "المدونة", href: "/blog" },
    { label: "تواصل معنا", href: "/contact" },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/5 bg-linear-to-b from-transparent via-black/20 to-black/50 pt-32 pb-16 overflow-hidden" dir="rtl">
      
      {/* 1. تأثير نيون خلفي (The Core Glow) */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 size-150 bg-gold/5 blur-[160px] rounded-full -z-10 animate-pulse" />

      <div className="mx-auto max-w-7xl px-6 relative z-10 flex flex-col items-center text-center">
        
        {/* 2. قسم معلومات الاتصال والاجتماعي */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-12 mb-20 pb-16 border-b border-white/5 items-center">
          
          <div className="flex items-center justify-center md:justify-start gap-3 order-2 md:order-1">
            {[Instagram, Twitter, Linkedin].map((Icon, i) => (
              <Link key={i} href="#" className="size-11 rounded-full border border-white/5 bg-white/5 flex items-center justify-center text-white/30 hover:text-gold hover:border-gold/30 hover:-translate-y-1 transition-all duration-500 backdrop-blur-sm shadow-xl">
                <Icon size={19} strokeWidth={1.5} />
              </Link>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2 order-1 md:order-2">
            <Link href="tel:+9710000000" className="text-3xl md:text-4xl font-bold text-white hover:text-gold transition-colors tracking-tighter" dir="ltr">
              +971 00 000 0000
            </Link>
            <p className="flex items-center gap-2 text-white/40 text-sm">
              <MapPin size={14} className="text-gold" />
              أبوظبي، الإمارات العربية المتحدة
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end order-3">
             <Link href="mailto:info@hussein.ae" className="px-6 py-3 rounded-xl border border-white/5 bg-white/5 text-white/50 hover:text-gold hover:border-gold/20 transition-all flex items-center gap-2.5 backdrop-blur-sm">
              <Mail size={16} />
              <span>info@hussein.ae</span>
            </Link>
          </div>
        </div>

        {/* 3. الروابط السريعة */}
        <nav className="flex items-center justify-center flex-wrap gap-x-10 gap-y-4 mb-24">
          {quickLinks.map((link) => (
            <Link key={link.label} href={link.href} className="text-white/50 text-base font-medium hover:text-gold transition-colors relative group">
              {link.label}
              <span className="absolute -bottom-1 inset-x-0 h-px bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center" />
            </Link>
          ))}
        </nav>

        {/* 4. قسم اللوجو الاحترافي (The Brand Masterpiece) */}
        <div className="relative w-full flex flex-col items-center justify-center select-none mb-12" dir="ltr">
          
          {/* نص الخلفية العملاق */}
          <h1 className="text-[12vw] md:text-[140px] font-black text-transparent bg-clip-text bg-linear-to-b from-white/10 via-white/5 to-transparent tracking-tighter leading-none opacity-40">
            H H A R I T H I
          </h1>

          {/* حاوية اللوجو الفعلي والنص العربي (Floating Over Watermark) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            {/* اللوجو من المسار المحدد */}
            <div className="relative size-24 md:size-32 transition-transform duration-700 hover:scale-110">
              <Image 
                src="/logo.webp" 
                alt="حسين الحارثي للمحاماة" 
                fill 
                className="object-contain"
                priority
              />
            </div>
            
            <h2 className="text-[6vw] md:text-[50px] font-black text-white leading-none tracking-tight">
                حسين <span className="text-gold italic">الحارثي</span>
            </h2>
            <p className="text-gold/60 text-[10px] md:text-xs uppercase tracking-[0.5em] font-bold">
              للمحاماة والاستشارات القانونية
            </p>
          </div>
        </div>

        {/* 5. الجزء السفلي: الحقوق */}
        <div className="w-full pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-5 text-sm">
          <p className="text-white/20 font-light text-center md:text-right">
            جميع الحقوق محفوظة © {currentYear} مكتب حسين الحارثي للمحاماة.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/10 hover:text-white transition-colors">سياسة الخصوصية</Link>
            <Link href="/terms" className="text-white/10 hover:text-white transition-colors">الشروط والأحكام</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};