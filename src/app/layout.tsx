
import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";

// المكونات المشتركة
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/shared/layout/AnimatedBackground";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
  adjustFontFallback: true,
});

// تعريف الـ Metadata بمعايير SEO 2026
export const metadata: Metadata = {
  title: {
    default: "حسين الحارثي | محاماة واستشارات قانونية - أبوظبي، الإمارات",
    template: "%s | حسين الحارثي"
  },
  description: "المحامي حسين الحارثي، خبير في القانون الإماراتي. نقدم حلولاً قانونية ذكية في القضايا الجنائية، التجارية، والمدنية مع خدمات التوثيق الخاص.",
  metadataBase: new URL("https://hussein-alharithi.ae"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ar_AE",
    url: "https://hussein-alharithi.ae",
    siteName: "مكتب حسين الحارثي للمحاماة",
    images: [{ url: '/og-image.webp', width: 1200, height: 630 }]
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A", // لون متناسق مع bg-legal-dark
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`${almarai.variable} scroll-smooth selection:bg-gold/30 selection:text-white`}
    >
      <body className="font-sans bg-[#050505] text-white/90 antialiased min-h-screen flex flex-col selection:bg-gold/20">
        
        {/* 1. الخلفية الحية - بنظام Orbs المتحركة */}
        <AnimatedBackground />

        {/* 2. الهيدر - Floating Glassmorphism */}
        <Header />

        {/* 3. حاوية المحتوى الرئيسي - مع Padding علوي للـ Floating Header */}
        <main className="relative flex-grow pt-24 md:pt-32 z-10 transition-all duration-700">
          {children}
        </main>

        {/* 4. الفوتر الفخم - ختام اللوحة الفنية */}
        <Footer />

      </body>
    </html>
  );
}