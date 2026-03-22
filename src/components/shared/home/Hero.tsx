'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Gavel, ShieldCheck } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, staggerChildren: 0.2 } 
  }
};

const imageContainerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, x: -50 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    x: 0,
    transition: { duration: 1, ease: "easeOut" } 
  }
};

export const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 lg:py-0">
      
      {/* تمت إزالة خلفيات الـ Gradient والـ Glow من هنا 
         لأننا نعتمد الآن على AnimatedBackground الموحد 
      */}

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* الجانب النصي - v4 Syntax */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center lg:text-right order-2 lg:order-1"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md border border-gold/20 px-5 py-2 rounded-full mb-8"
            >
              <span className="size-2 bg-gold rounded-full animate-pulse shadow-[0_0_8px_var(--color-gold)]" />
              <span className="text-gold font-bold text-xs tracking-widest uppercase">
                نخبة المستشارين القانونيين في الإمارات
              </span>
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight mb-8 tracking-tight">
              نصون الحقوق <br className="hidden md:block" /> 
              <span className="text-transparent bg-clip-text bg-linear-to-r from-gold via-white to-gold animate-gradient-x">بأمانة واقتدار</span>
            </h1>
            
            <p className="text-white/70 text-lg md:text-xl mb-12 max-w-2xl mx-auto lg:mr-0 leading-relaxed font-light">
              مكتب المحامي <strong className="text-white font-bold">حسين الحارثي</strong>، وجهتكم الموثوقة للعدالة والاستشارات القانونية المتكاملة، حيث الخبرة تلتقي بالنزاهة.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
              <Link 
                href="#consultation" 
                className="group relative px-10 py-4 bg-gold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_oklch(0.85_0.15_85/0.4)]"
              >
                <span className="relative z-10 text-royal-charcoal font-black text-lg">احجز استشارة الآن</span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </Link>

              <Link 
                href="#services" 
                className="px-10 py-4 border border-white/10 bg-white/5 backdrop-blur-md rounded-xl text-white font-bold text-lg hover:bg-white/10 hover:border-gold/30 transition-all text-center"
              >
                مجالات التخصص
              </Link>
            </div>
          </motion.div>

          {/* الجانب البصري - Portrait v4 Style */}
          <motion.div 
            variants={imageContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative flex justify-center items-center order-1 lg:order-2"
          >
            {/* v4 Spacing: w-80 (320px) to w-128 (512px) */}
            <div className="relative w-80 h-112 md:w-112 md:h-144 lg:w-128 lg:h-160 group">
              
              {/* إطار الهالة الخلفي (Halo Effect) */}
              <div className="absolute inset-0 bg-gold/10 rounded-[48px] rotate-3 scale-105 blur-2xl transition-transform duration-1000 group-hover:rotate-6" />
              
              {/* حاوية الصورة الرئيسية */}
              <div className="absolute inset-0 rounded-[48px] overflow-hidden border border-white/10 z-10 shadow-3xl bg-royal-charcoal">
                <Image 
                  src="/Hussein-Alharathi-1.webp" 
                  alt="المحامي حسين الحارثي" 
                  fill
                  priority
                  className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 512px"
                />
                {/* Overlay درامي لدمج الصورة مع الخلفية */}
                <div className="absolute inset-0 bg-linear-to-t from-royal-charcoal via-transparent to-transparent opacity-60" />
              </div>

              {/* الأيقونات الطائرة - v4 size utility */}
              <motion.div 
                animate={{ y: [0, -20, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                className="absolute -top-4 -right-4 z-20 bg-royal-charcoal/80 backdrop-blur-3xl size-16 md:size-20 flex items-center justify-center rounded-3xl border border-gold/30 shadow-2xl"
              >
                <Gavel className="text-gold size-8 md:size-10" />
              </motion.div>
              
              <motion.div 
                animate={{ y: [0, 20, 0] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} 
                className="absolute -bottom-4 -left-4 z-20 bg-royal-charcoal/80 backdrop-blur-3xl size-16 md:size-20 flex items-center justify-center rounded-3xl border border-gold/30 shadow-2xl"
              >
                <ShieldCheck className="text-gold size-8 md:size-10" />
              </motion.div>

              {/* كارت الخبرة العائم */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute bottom-16 -right-10 z-30 bg-white/5 backdrop-blur-xl border-l-4 border-gold p-6 rounded-2xl hidden md:block"
              >
                <p className="text-gold font-black text-4xl leading-none">+15</p>
                <p className="text-white/80 text-[10px] uppercase font-bold tracking-[0.3em] mt-2">عاماً من الريادة</p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};