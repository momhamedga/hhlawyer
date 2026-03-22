'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useId } from 'react';

// كارت المعلومات الجانبي - تم تحسينه للموبايل (Touch Targets)
export const InfoCard = ({ item, index }: { item: any, index: number }) => (
  <motion.a
    href={item.href}
    initial={{ opacity: 0, x: 15 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1, ease: "easeOut" }}
    className="flex items-center gap-4 p-5 rounded-3xl border border-white/5 bg-white/2 hover:bg-white/5 active:scale-[0.98] transition-all group select-none"
  >
    <div className="size-12 rounded-2xl bg-gold/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
      {item.icon}
    </div>
    <div className="flex-1">
      <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em] leading-none mb-1.5">{item.label}</p>
      <p className="text-white font-bold text-sm leading-tight">{item.value}</p>
    </div>
  </motion.a>
);

// Input مخصص بمعايير v4 ومنع الـ Native Popup
export const ContactInput = ({ label, error, ...props }: any) => {
  const id = useId();
  return (
    <div className="space-y-3 w-full relative group">
      <label htmlFor={id} className="text-[10px] text-white/30 font-black uppercase pr-2 tracking-[0.2em] group-focus-within:text-gold transition-colors">
        {label}
      </label>
      <div className="relative">
        <input 
          {...props}
          id={id}
          className={`w-full p-5 rounded-2xl border bg-white/2 text-white placeholder:text-white/10 outline-none transition-all text-base md:text-sm active:scale-[0.99]
            ${error ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-gold/40 focus:bg-white/5'}`}
        />
        {/* Error Indicator Dot */}
        {error && <div className="absolute left-5 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444]" />}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[10px] text-red-400 font-bold pr-2 absolute -bottom-5"
          >
            ⚠️ {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};