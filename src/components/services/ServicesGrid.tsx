'use client';

import  { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { LAW_SERVICES } from '@/constants/Services';
import { ServiceItem } from '@/types/Services';
import Link from 'next/link';

interface ServiceCardProps {
  service: ServiceItem;
  index: number;
}

const ServiceCard = ({ service, index }: ServiceCardProps) => {
  const Icon = service.icon;
  const mouseX = useSpring(useMotionValue(0), { stiffness: 500, damping: 50 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 500, damping: 50 });

  const glowColors: Record<string, string> = {
    criminal: 'rgba(239, 68, 68, 0.15)',
    commercial: 'rgba(59, 130, 246, 0.15)',
    civil: 'rgba(212, 175, 55, 0.15)',
    taxes: 'rgba(34, 197, 94, 0.15)',
    notary: 'rgba(255, 255, 255, 0.15)',
  };

  const glowColor = glowColors[service.id] || 'rgba(212, 175, 55, 0.15)';

  function handleInteraction(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    const isTouch = 'touches' in e && e.touches.length > 0;
    const clientX = isTouch ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = isTouch ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    // snap-center للموبيل عشان الكارت يثبت في النص وهو بيسكرول
    <Link href={`/services/${service.id}`} className="block shrink-0 snap-center first:pl-6 last:pr-6 md:first:pl-0 md:last:pr-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1, duration: 0.8 }}
        onMouseMove={handleInteraction}
        onTouchMove={handleInteraction}
        // إضافة tap effect للموبيل
        whileTap={{ scale: 0.98 }}
        className="group relative flex flex-col w-[85vw] md:w-full h-125 md:h-137.5 overflow-hidden rounded-[2.5rem] md:rounded-[4rem] border border-white/5 bg-white/1 p-8 md:p-12 transition-all duration-700 hover:border-white/20 shadow-2xl cursor-pointer"
      >
        <div className="absolute inset-0 backdrop-blur-[80px] -z-20" />

        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 -z-10"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${mouseX}px ${mouseY}px,
                ${glowColor},
                transparent 80%
              )
            `,
          }}
        />

        <div className="relative z-10 flex flex-col h-full justify-between text-right" dir="rtl">
          <div className="flex justify-start">
            <div className={`size-16 md:size-20 rounded-2xl md:rounded-[2.5rem] border border-white/10 bg-white/5 flex items-center justify-center transition-all duration-700 group-hover:rotate-12 group-active:rotate-12 ${service.color.split(' ').pop()}`}>
              <Icon className="size-8 md:size-10 text-white" strokeWidth={1} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter leading-tight">
              {service.title}
            </h4>
            <p className="text-white/40 group-hover:text-white/70 text-base md:text-lg font-light leading-relaxed line-clamp-3 md:line-clamp-4">
              {service.desc}
            </p>
            
            <div className="pt-6 flex items-center gap-3 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-700 translate-x-0 md:translate-x-4 group-hover:translate-x-0">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">اكتشف المزيد</span>
              <div className="h-px flex-1 bg-linear-to-r from-gold/40 to-transparent origin-right" />
            </div>
          </div>
        </div>

        <div className={`absolute bottom-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${service.color.split(' ').filter((c) => c.startsWith('text-')).join(' ')}`} />
      </motion.div>
    </Link>
  );
};

export const ServicesGrid = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative w-full group/grid">
      {/* Container السكرول للموبيل */}
      <div 
        ref={scrollRef}
        className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-10 overflow-x-auto md:overflow-visible pb-12 px-0 md:px-0 snap-x snap-mandatory scrollbar-hide focus:outline-none"
      >
        {LAW_SERVICES.map((service, index) => (
          <ServiceCard key={service.id} service={service} index={index} />
        ))}
      </div>

      {/* مؤشر السكرول للموبيل (Dots) - يظهر فقط في الشاشات الصغيرة */}
      <div className="flex md:hidden justify-center gap-3 -mt-4">
        {LAW_SERVICES.map((_, i) => (
          <div 
            key={i} 
            className="h-1 w-8 rounded-full bg-white/10 overflow-hidden"
          >
             <motion.div 
               initial={{ width: "0%" }}
               whileInView={{ width: "100%" }}
               transition={{ duration: 2, delay: i * 0.2 }}
               className="h-full bg-gold/40"
             />
          </div>
        ))}
      </div>
    </div>
  );
};