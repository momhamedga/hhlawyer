import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// استيراد ديناميكي نظيف
const Hero = dynamic(() => import('@/components/shared/home/Hero').then(m => m.Hero));
const Stats = dynamic(() => import('@/components/shared/home/Stats').then(m => m.Stats));
const PracticeAreas = dynamic(() => import('@/components/shared/home/PracticeAreas').then(m => m.PracticeAreas));
const WhyUs = dynamic(() => import('@/components/shared/home/WhyUs').then(m => m.WhyUs));
const AttorneyNote = dynamic(() => import('@/components/shared/home/AttorneyNote').then(m => m.AttorneyNote));
const ClientProcess = dynamic(() => import('@/components/shared/home/ClientProcess').then(m => m.ClientProcess));
const FAQ = dynamic(() => import('@/components/shared/home/FAQ').then(m => m.FAQ));
const FinalCTA = dynamic(() => import('@/components/shared/home/FinalCTA').then(m => m.FinalCTA));
export default function HomePage() {
  return (
    <main className="relative w-full flex flex-col items-center bg-transparent">
      
      <Suspense fallback={null}>
        <Hero />


        <Stats />
  


        <PracticeAreas />
  


        <WhyUs />
  

     
        <AttorneyNote />
  


        <ClientProcess />
        <FAQ />
        <FinalCTA />
</Suspense>
      {/* الخطوة الجاية: قسم رحلة العميل (Step by Step) */}

    </main>
  );
}