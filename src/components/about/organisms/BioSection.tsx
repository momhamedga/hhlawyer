'use client';

import { motion } from 'framer-motion';
import { StatItem } from '../atoms/StatItem';

export const BioSection = () => (
  <section className="relative w-full py-20 md:py-40 flex flex-col items-center">
    
    {/* الخلفية: جلو هادئ جداً بعيد عن المحتوى */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02)_0%,transparent_70%)] pointer-events-none" />

    <div className="w-full max-w-5xl px-6 md:px-10 space-y-20 md:space-y-32">
      
      {/* النصوص: Bio راقي */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center space-y-6"
      >
        <h2 className="text-5xl md:text-9xl font-black text-white italic tracking-tighter uppercase leading-none">
          حسين <span className="text-gold">الحارثي</span>
        </h2>
        <p className="text-sm md:text-xl text-white/40 font-light leading-relaxed max-w-2xl mx-auto italic">
          محامٍ وكاتب عدل خاص مرخص لدى محاكم دولة الإمارات، كرس مسيرته المهنية لحماية الحقوق وصياغة العدالة.
        </p>
      </motion.div>

      {/* الإحصائيات: السلكان الحقيقي هنا */}
      <div className="
        w-full 
        flex flex-row // دايماً جنب بعض في الموبيل والديسكتوب
        items-start justify-between 
        gap-2 md:gap-10 
        pt-12 md:pt-20 
        border-t border-white/5
      ">
        <StatItem label="قضية ناجحة" value="500+" index={1} />
        <StatItem label="عام من الخبرة" value="15" index={2} />
        <StatItem label="مؤلف قانوني" value="03" index={3} />
      </div>
    </div>
  </section>
);