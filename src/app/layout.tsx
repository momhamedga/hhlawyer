import type { Metadata, Viewport } from "next";
import { Almarai } from "next/font/google";
import "./globals.css";

// المكونات المشتركة
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/shared/layout/AnimatedBackground";
import DynamicFavicon from "@/components/layout/DynamicIcon";

const almarai = Almarai({
  subsets: ["arabic"],
  weight: ["300", "400", "700", "800"],
  variable: "--font-almarai",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "حسين الحارثي | محاماة واستشارات قانونية - أبوظبي، الإمارات",
    template: "%s | حسين الحارثي"
  },
  description: "المحامي حسين الحارثي، خبير في القانون الإماراتي. حلول قانونية ذكية في القضايا الجنائية والتجارية.",
  metadataBase: new URL("https://hussein-alharithi.ae"),
  // منع الـ Crawlers من قراءة الـ favicon القديم الثابت لو موجود
  icons: {
    icon: "/favicon.ico", 
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // لمسة الموبايل عشان الـ Notch
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
      <body className="font-sans bg-[#050505] text-white/90 antialiased min-h-screen flex flex-col overflow-x-hidden">
        
        {/* 1. الفافيكون الديناميكي (Animated Favicon) */}
        <DynamicFavicon />

        {/* 2. الخلفية الحية */}
        <AnimatedBackground />

        {/* 3. الهيدر */}
        <Header />

        {/* 4. حاوية المحتوى الرئيسي */}
        <main className="relative grow pt-20 md:pt-28 z-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}