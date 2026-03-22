'use client';
import { useId } from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const BookingInput = ({ label, ...props }: Props) => {
  const id = useId();
  
  return (
    <div className="group flex flex-col gap-3 w-full" dir="rtl">
      {/* Label - مقاس مريح للعين لمنع تشتت المستخدم */}
      <label 
        htmlFor={id} 
        className="mr-4 text-sm font-black uppercase tracking-widest text-white/20 group-focus-within:text-gold group-focus-within:translate-x-1 transition-all duration-500"
      >
        {label}
      </label>

      <div className="relative">
        {/* Glow Effect - شغال بـ opacity عشان ميعملش رندر تقيل على الموبايلات القديمة */}
        <div className="absolute -inset-px bg-linear-to-r from-gold/0 via-gold/40 to-gold/0 rounded-2xl opacity-0 group-focus-within:opacity-100 blur-[2px] transition-opacity duration-500" />
        
        {/* Input Container */}
        <div className="relative flex items-center bg-white/3 border border-white/10 rounded-2xl transition-all duration-500 group-focus-within:border-gold/50 group-focus-within:bg-black group-focus-within:shadow-[0_10px_40px_-10px_rgba(212,175,55,0.15)]">
          <input 
            {...props}
            id={id}
            autoComplete="off"
            /* لمسات الموبايل:
               1. text-[16px]: يمنع الـ iOS من عمل Auto-zoom إجباري.
               2. py-5: مساحة ضغط (Tap Target) مريحة جداً للإبهام.
               3. inputMode: لو "phone" يفتح لوحة أرقام فوراً.
            */
            className="w-full bg-transparent py-5 px-6 text-[16px] text-white outline-none placeholder:text-white/10 active:scale-[0.99] transition-transform
              [&:-webkit-autofill]:[transition:background-color_5000s_ease-in-out_0s]
              [&:-webkit-autofill]:[-webkit-text-fill-color:white]"
          />
          
          {/* Status Indicator - لمسة بصرية تفاعلية عند الكتابة */}
          <div className="ml-5 flex items-center justify-center shrink-0">
             <div className="size-2.5 rounded-full bg-white/5 group-focus-within:bg-gold group-focus-within:animate-pulse transition-all shadow-[0_0_15px_#D4AF37]" />
          </div>
        </div>
      </div>
    </div>
  );
};