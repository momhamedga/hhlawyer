import { BioSection } from '@/components/about/organisms/BioSection';
import { TimelineSection } from '@/components/about/organisms/TimelineSection';
import { VisionSection } from '@/components/about/organisms/VisionSection'; // المكون الجديد
import { PageHero } from '@/components/layout/PageHero';
import { EXPERIENCES, EDUCATION } from '@/constants/About';

export const metadata = {
  title: "عن المحامي حسين الحارثي | مسيرة من العدالة",
  description: "تعرف على الخبرات القانونية والتحصيل الأكاديمي للأستاذ حسين الحارثي، ورؤيته لمستقبل المحاماة في الإمارات.",
};

export default function AboutPage() {
  return (
    // شيلنا الـ bg-black عشان عيونك.. دلوقتي الخلفية Transparent
    <main className="relative pb-24 md:pb-40 overflow-hidden" dir="rtl">
      
      {/* 1. الهيرو (يظهر أولاً لسرعة التحميل) */}
      <PageHero 
        title="عن المحامي"
        subtitle="مسيرة مهنية صاغتها العدالة وعززتها الخبرة في قلب القضاء الإماراتي."
        breadcrumb={[
          { label: "الرئيسية", href: "/" }, 
          { label: "عن المحامي" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-6 space-y-24 md:space-y-48 mt-12 md:mt-20 relative z-10">
        
        {/* 2. السيرة الذاتية (Bio) - مع صورة الميزان سنتر */}
        <section>
          <BioSection />
        </section>

        {/* 3. الرؤية والقيم (تملأ الفراغ البصري بتأثيرات نيون) */}
        <section className="pt-10">
          <VisionSection />
        </section>

        {/* 4. شبكة المسيرة المهنية (Timeline) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">
          <TimelineSection title="الخبرات العملية" items={EXPERIENCES} />
          <TimelineSection title="التحصيل الأكاديمي" items={EDUCATION} />
        </div>

      </div>

      {/* 5. توزيع الـ Glows (لمسة الموبيل والديكستوب) */}
      {/* توهج يمين علوي */}
      <div className="absolute top-1/4 -right-32 size-80 md:size-150 bg-gold/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      
      {/* توهج يسار سفلي */}
      <div className="absolute bottom-1/4 -left-32 size-60 md:size-120 bg-gold/5 blur-[100px] rounded-full -z-10" />

      {/* لمسة نيون إضافية للموبيل في المنتصف */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 size-96 bg-blue-500/5 blur-[150px] rounded-full -z-10 md:hidden" />
    </main>
  );
}