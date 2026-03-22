import { BookingSystem } from "@/components/consultation/molecules/BookingSystem";
import { PageHero } from "@/components/layout/PageHero";

export default function ConsultationPage() {
  return (
    <main className="relative min-h-screen pb-20 md:pb-40 overflow-hidden " dir="rtl">
      
      <PageHero 
        title="اطلب استشارة"
        subtitle="احجز جلستك القانونية الخاصة الآن. نؤمن لك بيئة آمنة وخبيرة لمناقشة أدق التفاصيل."
        breadcrumb={[
          { label: "الرئيسية", href: "/" }, 
          { label: "اطلب استشارة" }
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 -mt-12 md:-mt-32">
        <BookingSystem />
      </div>

      {/* توهج يمين فوق - باستخدام قيم v4 المختصرة */}
      <div className="absolute top-0 right-0 size-64 md:size-150 bg-gold/3 blur-[80px] md:blur-[120px] rounded-full -z-10 pointer-events-none will-change-transform" />
      
      {/* توهج يسار تحت */}
      <div className="absolute bottom-[10%] left-0 size-48 md:size-125 bg-gold/2 blur-[60px] md:blur-[100px] rounded-full -z-10 pointer-events-none will-change-transform" />

      {/* توهج مركزي */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-72 md:size-96 bg-white/1 blur-[100px] md:blur-[150px] rounded-full -z-20 pointer-events-none" />
      
      {/* تدرج القاع - المسمى الجديد v4 */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-linear-to-t from-[#030303] to-transparent pointer-events-none -z-10" />
    </main>
  );
}