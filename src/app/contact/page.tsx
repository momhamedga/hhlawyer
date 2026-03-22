import { PageHero } from '@/components/layout/PageHero';
import { InfoCard } from '@/components/contact/ContactAtoms';
import { ContactForm } from '@/components/contact/ContactForm';
import { CONTACT_DATA } from '@/constants/contact';

export default function ContactPage() {
  return (
    <main className="relative min-h-screen pb-20 overflow-hidden " dir="rtl">
      <PageHero 
        title="تواصل معنا" 
        subtitle="نحن هنا للاستماع لاستفساراتكم وتقديم الدعم القانوني الذي تحتاجونه."
        breadcrumb={[
          { label: "الرئيسية", href: "/" },
          { label: "تواصل معنا" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 -mt-16 md:-mt-28">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <ContactForm />

          <div className="lg:col-span-5 space-y-4">
            {CONTACT_DATA.map((item, idx) => (
              <InfoCard key={idx} item={item} index={idx} />
            ))}
            
            <div className="h-64 rounded-4xl border border-white/5 bg-white/2 overflow-hidden relative group mt-8">
               <div className="absolute inset-0 bg-gold/5 group-hover:bg-transparent transition-all duration-700" />
               <div className="w-full h-full flex items-center justify-center text-white/20 font-black tracking-widest text-[10px] select-none uppercase">
                 Interactive Map Coming Soon
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* الـ Glows المنضفة (v4 Syntax) */}
      <div className="absolute top-[20%] right-0 size-96 bg-gold/5 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-10 left-0 size-96 bg-gold/2 blur-[100px] rounded-full -z-10" />
    </main>
  );
}