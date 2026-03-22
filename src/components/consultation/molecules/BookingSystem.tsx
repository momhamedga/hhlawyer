'use client';

import { useActionState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookingStore } from '@/store/dateStore';
import { addDays, startOfToday } from 'date-fns';
import { ServiceStep, DateStep } from './BookingSteps';
import { BookingInput } from './BookingInput';

// 1. تعريف الـ Types بدقة للأكشن
interface BookingResponse {
  success: boolean;
  message?: string;
}

const SERVICES: string[] = ["استشارة قانونية عامة", "قضايا أحوال شخصية", "منازعات تجارية"];
const TIMES: string[] = ["09:00 AM", "10:30 AM", "01:00 PM", "04:30 PM"];

export const BookingSystem = () => {
  const { step, setStep, selectedService, selectedDate, selectedTime, setData } = useBookingStore();
  const currentWeek: Date[] = Array.from({ length: 7 }).map((_, i) => addDays(startOfToday(), i));

  // 2. تعديل الـ Action ليتوافق مع React 19 Strict Mode
  const [state, formAction, isPending] = useActionState(
    async (_prevState: BookingResponse | null, formData: FormData): Promise<BookingResponse> => {
      const bookingData = {
        serviceType: selectedService,
        date: selectedDate,
        timeSlot: selectedTime,
        userInfo: {
          name: formData.get('full_name') as string,
          phone: formData.get('phone') as string,
        }
      };
      
      await new Promise(res => setTimeout(res, 2000));
      console.log("Booking Confirmed:", bookingData);
      
      return { success: true, message: "تم الحجز بنجاح" };
    }, 
    null // القيمة الابتدائية
  );

  return (
    <div className="w-full max-w-xl mx-auto min-h-137.5 relative select-none px-4 md:px-0" dir="rtl">
      
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-12">
        {step > 1 ? (
          <button 
            type="button" // مهم عشان ميعملش Submit بالخطأ
            onClick={() => setStep(step - 1)} 
            className="text-white/40 hover:text-gold transition-all cursor-pointer text-sm font-bold tracking-widest flex items-center gap-2 active:scale-90"
          >
            <span className="text-xl">→</span> رجوع
          </button>
        ) : <div className="w-10" />}
        
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`h-1 w-6 md:w-8 rounded-full transition-all duration-700 ${step >= s ? 'bg-gold shadow-[0_0_15px_#d4af3799]' : 'bg-white/10'}`} 
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <ServiceStep 
            key="step1"
            services={SERVICES} 
            selected={selectedService} 
            onSelect={(s: string) => { 
              setData({ selectedService: s }); 
              setStep(2); 
            }} 
          />
        )}
        
        {step === 2 && (
          <DateStep 
            key="step2"
            days={currentWeek} 
            selected={selectedDate} 
            onSelect={(d: string) => setData({ selectedDate: d })} 
            onNext={() => setStep(3)} 
          />
        )}

        {step === 3 && (
          <motion.div 
            key="step3" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-gold text-sm font-black uppercase tracking-[0.4em]">03. توقيت الجلسة</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {TIMES.map(t => (
                <button 
                  key={t} 
                  type="button"
                  onClick={() => { setData({ selectedTime: t }); setStep(4); }}
                  className={`py-6 rounded-2xl border transition-all duration-500 cursor-pointer active:scale-95 text-center
                    ${selectedTime === t 
                      ? 'bg-gold text-black border-gold shadow-[0_0_20px_#d4af374d] font-black' 
                      : 'bg-white/3 border-white/5 text-white/40 hover:border-white/20'}`}
                >
                  <span className="text-sm tracking-tighter">{t}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.form 
            // الحل للخط الأحمر في الفورم: استخدام الـ action المباشر
            action={formAction}
            key="step4" 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="space-y-10"
          >
            <div className="relative p-6 rounded-4xl border border-white/5 bg-white/1 overflow-hidden group">
              <div className="absolute top-0 right-0 size-24 bg-gold/5 blur-3xl rounded-full" />
              <div className="flex justify-between items-center relative z-10">
                <div className="space-y-1 text-right">
                   <p className="text-[10px] text-gold font-black uppercase tracking-widest leading-none">تأكيد الحجز</p>
                   <h3 className="text-white text-base font-bold">{selectedService}</h3>
                </div>
                <div className="text-left">
                   <p className="text-white/40 text-[10px] font-medium uppercase">{selectedDate}</p>
                   <p className="text-white text-xs font-black tracking-widest">{selectedTime}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <BookingInput name="full_name" label="الاسم الكامل" placeholder="محمد جيمي" required />
              <BookingInput name="phone" label="رقم الواتساب" type="tel" placeholder="050 XXXXXXX" required />
            </div>

            <button 
              disabled={isPending}
              type="submit"
              className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-gold transition-all uppercase text-xs tracking-[0.4em] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? 'جاري الحجز...' : 'تأكيد الحجز الآن'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};