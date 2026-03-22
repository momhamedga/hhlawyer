'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ar as localeAr } from 'date-fns/locale';

// --- 1. تعريف الـ Interfaces (عشان ننهي عصر الـ any) ---
interface ServiceStepProps {
  services: string[];
  selected: string | null;
  onSelect: (service: string) => void;
}

interface DateStepProps {
  days: Date[];
  selected: string | null;
  onSelect: (dateStr: string) => void;
  onNext: () => void;
}

// --- Step 1: Services (التخصصات) ---
export const ServiceStep = ({ services, selected, onSelect }: ServiceStepProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    exit={{ opacity: 0, y: -20 }} 
    className="space-y-6 md:space-y-8 touch-none select-none"
  >
    <div className="text-center mb-8">
      <h2 className="text-gold text-sm font-black uppercase tracking-[0.4em]">01. نوع التخصص</h2>
      <p className="text-white/30 text-xs mt-3 font-medium tracking-wide">اختر مجال الخبرة القانونية المطلوبة</p>
    </div>

    <div className="grid gap-3 md:gap-4">
      {services.map((s) => (
        <button 
          key={s} 
          type="button"
          onClick={() => onSelect(s)}
          // Tailwind v4 touch-up: bg-white/3 بدل bg-white/[0.03]
          className={`w-full p-6 rounded-2xl border text-right transition-all duration-300 cursor-pointer group active:scale-[0.96] touch-manipulation
            ${selected === s 
              ? 'border-gold bg-gold/10 text-white shadow-[0_0_30px_-10px_#d4af3733]' 
              : 'border-white/5 bg-white/3 text-white/40 active:border-white/20'}`}
        >
          <span className="text-base font-bold group-active:pr-1 transition-all block">{s}</span>
        </button>
      ))}
    </div>
  </motion.div>
);

// --- Step 2: Date Selector (اختر اليوم) ---
export const DateStep = ({ days, selected, onSelect, onNext }: DateStepProps) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} 
    animate={{ opacity: 1, scale: 1 }} 
    className="space-y-8 md:space-y-10 select-none"
  >
    <div className="text-center">
      <h2 className="text-gold text-sm font-black uppercase tracking-[0.4em]">02. اليوم</h2>
      <p className="text-white/30 text-xs mt-3 font-medium">اختر الموعد المناسب لجدولك</p>
    </div>

    <div className="flex flex-col gap-3 max-h-100 overflow-y-auto pb-4 scrollbar-hide">
      {days.map((date) => {
        const dateStr = format(date, 'yyyy/MM/dd');
        const isSelected = selected === dateStr;
        return (
          <button 
            key={dateStr} 
            type="button"
            onClick={() => onSelect(dateStr)}
            className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.98] touch-manipulation
              ${isSelected 
                ? 'bg-white text-black border-white translate-x-2 md:translate-x-3 shadow-xl' 
                : 'bg-white/3 border-white/5 text-white/30 active:bg-white/8'}`}
          >
            <div className="flex items-center gap-5">
              <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'opacity-70' : 'opacity-30'}`}>
                {format(date, 'EEEE', { locale: localeAr })}
              </span>
              <span className="text-xl font-black">{format(date, 'd')}</span>
            </div>
            
            {isSelected ? (
              <motion.span layoutId="arrow" className="text-xl leading-none">←</motion.span>
            ) : (
              <div className="size-1.5 rounded-full bg-white/10" />
            )}
          </button>
        );
      })}
    </div>

    <div className="pt-2">
      <button 
        disabled={!selected} 
        type="button"
        onClick={onNext} 
        className="w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all duration-300 bg-gold text-black active:scale-[0.95] disabled:opacity-10 disabled:grayscale cursor-pointer shadow-lg active:shadow-none"
      >
        المتابعة للوقت
      </button>
    </div>
  </motion.div>
);