'use client';

import { use } from 'react';
import { motion } from 'framer-motion';
import { LAW_SERVICES } from '@/constants/Services';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';

export default function ServiceDetails({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const service = LAW_SERVICES.find((s) => s.id === slug);

  if (!service) return notFound();

  return (
    <main className="min-h-screen text-white selection:bg-gold/30 pb-20 md:pb-0">
      
      <PageHero 
        title={service.title}
        subtitle={service.desc} 
        breadcrumb={[
          { label: 'الرئيسية', href: '/' },
          { label: 'خدماتنا', href: '/services' },
          { label: service.title } 
        ]}
      />

      {/* تقليل الـ Gap والـ Padding في الموبايل */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24 grid grid-cols-1 lg:grid-cols-3 gap-10 md:gap-16" dir="rtl">
        
        <div className="lg:col-span-2 space-y-8 md:space-y-12">
          {/* كارت المقدمة - زوايا أنعم في الموبايل */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-8 md:p-14 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 bg-white/2 backdrop-blur-xl shadow-2xl"
          >
            <h3 className="text-2xl md:text-4xl font-black mb-6 md:mb-8 text-gold italic uppercase tracking-tighter">
              لماذا تختارنا في {service.title}؟
            </h3>
            <p className="text-white/60 text-lg md:text-2xl leading-[1.6] md:leading-[1.8] font-light">
               نحن في مكتب الأستاذ حسين  الحارثي نضمن لك أفضل تمثيل قانوني، مع الالتزام التام بمعايير السرية في دولة الإمارات .
            </p>
          </motion.div>

          {/* المميزات - Grid مرن */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
            {service.features?.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                // إضافة Tap effect للموبايل
                whileTap={{ scale: 0.98 }}
                className="p-8 md:p-10 rounded-4xl md:rounded-[3rem] border border-white/5 bg-white/1 hover:border-gold/20 transition-all duration-500 backdrop-blur-md relative overflow-hidden"
              >
                <div className="size-12 md:size-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 mb-5 flex items-center justify-center">
                  <div className="size-2 rounded-full bg-gold animate-pulse" />
                </div>
                <h4 className="text-xl md:text-2xl font-bold mb-3 text-white">
                  {feature.title}
                </h4>
                <p className="text-white/40 text-base md:text-lg font-light leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar - يتحول لكارت أنيق في نهاية الصفحة في الموبايل */}
        <aside className="lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="sticky top-32 p-8 md:p-10 rounded-[2.5rem] md:rounded-[4rem] border border-gold/20 bg-linear-to-b from-gold/10 to-transparent backdrop-blur-2xl text-center md:text-right"
          >
            <h3 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 italic tracking-tighter text-white">استشارة فورية</h3>
            <p className="text-white/40 text-sm md:text-base mb-8 md:mb-10 leading-relaxed">
               احجز موعدك الآن لمناقشة ملفك مع مستشارينا القانونيين.
            </p>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-5 md:py-6 rounded-2xl md:rounded-3xl bg-gold text-black font-black uppercase tracking-widest md:tracking-[0.2em] text-xs md:text-sm shadow-[0_10px_30px_-10px_rgba(212,175,55,0.5)] transition-all duration-500"
            >
              احجز موعدك الآن
            </motion.button>
          </motion.div>
        </aside>
      </section>

      {/* Floating Action Button للموبايل فقط (Optional) */}
      <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            className="w-full py-4 rounded-xl bg-white text-black font-bold shadow-2xl flex items-center justify-center gap-3"
          >
            <span className="size-2 rounded-full bg-gold animate-ping" />
            تحدث معنا الآن
          </motion.button>
      </div>
    </main>
  );
}