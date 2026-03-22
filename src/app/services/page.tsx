import React from 'react';
import { ServicesGrid } from '@/components/services/ServicesGrid';
// المكون اللي فككناه
import { PageHero } from '@/components/layout/PageHero';
import { WhyUs } from '@/components/services/WhyUs';

// SEO المخصص - لضمان ظهور الموقع بشكل احترافي في محركات البحث
export const metadata = {
  title: "الخدمات القانونية | مكتب حسين الحارثي",
  description: "اكتشف الاختصاصات القانونية المتنوعة لمكتب الأستاذ حسين الحارثي، من القانون الجنائي إلى التوثيق الخاص في دولة الإمارات.",
};

export default function ServicesPage() {
  return (
    <main className="relative pb-24 md:pb-32 bg-transparent overflow-hidden" dir="rtl">
      
      {/* 1. الهيرو الموحد (Server Component لسرعة الـ LCP) */}
      <PageHero 
        title="الخدمات القانونية"
        subtitle="نقدم حلولاً قانونية ذكية تدمج بين الأصالة والابتكار لحماية مصالح موكلينا في كافة الاختصاصات القانونية الإماراتية."
        breadcrumb={[
          { label: "الرئيسية", href: "/" },
          { label: "اختصاصاتنا" }
        ]}
      />

      {/* 2. المحتوى الأساسي (Wrapped in Container) */}
      <div className="mx-auto max-w-7xl px-6 relative z-10 space-y-32">
        
        {/* شبكة الخدمات الأساسية (Interactive Cards) */}
        <section className="-mt-16 md:-mt-24">
          <ServicesGrid />
        </section>

        {/* مكون "لماذا نحن" (Atomized Component) */}
        <WhyUs />

      </div>

      {/* 3. تأثيرات بصرية (Neon Glows) */}
      {/* توهج علوي */}
      <div className="absolute top-1/4 left-0 size-96 bg-gold/5 blur-[120px] rounded-full -z-10 animate-pulse" />
      {/* توهج سفلي */}
      <div className="absolute bottom-1/4 right-0 size-96 bg-gold/5 blur-[120px] rounded-full -z-10" />
      
    </main>
  );
}