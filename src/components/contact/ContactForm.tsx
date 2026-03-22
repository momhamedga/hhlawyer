'use client';
import { useActionState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ContactInput } from './ContactAtoms';

interface FormState {
  success?: boolean;
  errors?: Record<string, string> | null;
}

export const ContactForm = () => {
  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState | null, formData: FormData): Promise<FormState> => {
      // Manual Validation عشان نلغي الـ Browser Popup
      const errors: Record<string, string> = {};
      if (!formData.get('name')) errors.name = "الاسم مطلوب";
      if (!formData.get('email')) errors.email = "البريد غير صحيح";
      
      if (Object.keys(errors).length > 0) return { errors };

      await new Promise(res => setTimeout(res, 2000));
      return { success: true, errors: null };
    }, 
    { errors: null }
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="lg:col-span-7 bg-white/1 border border-white/5 p-8 md:p-12 rounded-4xl backdrop-blur-3xl relative overflow-hidden"
    >
      <form action={formAction} className="space-y-8" noValidate>
        <div className="grid md:grid-cols-2 gap-8">
          <ContactInput label="الاسم" name="name" placeholder="جيمي..." error={state?.errors?.name} />
          <ContactInput label="البريد" name="email" type="email" placeholder="example@mail.com" error={state?.errors?.email} />
        </div>
        
        <ContactInput label="الموضوع" name="subject" placeholder="استشارة عقارية، تجارية..." />
        
        <div className="space-y-3">
          <label className="text-[10px] text-white/30 font-black uppercase pr-2 tracking-[0.2em]">الرسالة</label>
          <textarea 
            name="message"
            rows={4}
            className="w-full p-5 rounded-2xl border border-white/5 bg-white/2 text-white outline-none focus:border-gold/40 transition-all resize-none text-base md:text-sm"
            placeholder="كيف يمكننا مساعدتك؟"
          />
        </div>

        <button 
          disabled={isPending}
          type="submit"
          className="w-full py-6 bg-white text-black font-black rounded-2xl hover:bg-gold transition-all uppercase text-xs tracking-[0.4em] active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xl"
        >
          {isPending ? 'جاري الإرسال...' : 'إرسال الرسالة'}
        </button>
      </form>

      {/* لمسة نجاح الإرسال */}
      <AnimatePresence>
        {state?.success && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 text-center p-8">
            <div className="size-20 rounded-full bg-gold/10 flex items-center justify-center text-4xl mb-4 text-gold animate-bounce">✓</div>
            <h3 className="text-xl font-black text-white mb-2">تم الإرسال بنجاح</h3>
            <p className="text-white/40 text-sm">سيتواصل معك فريق مكتب حسين الحارثي قريباً.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};