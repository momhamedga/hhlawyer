import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Cairo, Inter } from "next/font/google";
import "./globals.css";

// المكونات المشتركة
import { Header } from "@/components/shared/Header";
import { Footer } from "@/components/layout/Footer";
import { AnimatedBackground } from "@/components/shared/layout/AnimatedBackground";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LocaleProvider } from "@/components/providers/LocaleProvider";
import { DEFAULT_LOCALE, isLocale, localeAttributes } from "@/i18n/locale";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-english",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "حسين الحارثي | محاماة واستشارات قانونية - أبوظبي، الإمارات",
    template: "%s | حسين الحارثي"
  },
  description: "المحامي حسين الحارثي، خبير في القانون الإماراتي. حلول قانونية ذكية في القضايا الجنائية والتجارية.",
  metadataBase: new URL("https://hhlawyer.ae"),
  // منع الـ Crawlers من قراءة الـ favicon القديم الثابت لو موجود
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#F4F0E9", media: "(prefers-color-scheme: light)" },
    { color: "#15120F", media: "(prefers-color-scheme: dark)" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover", // لمسة الموبايل عشان الـ Notch
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localeHeader = (await headers()).get("x-hhlawyer-locale");
  const locale = localeHeader && isLocale(localeHeader) ? localeHeader : DEFAULT_LOCALE;
  const { dir, fontClass } = localeAttributes[locale];
  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cairo.variable} ${inter.variable} ${fontClass} scroll-smooth`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col overflow-x-hidden">

        {/* الخلفية الحية */}
        <ThemeProvider>
        <LocaleProvider>
        <QueryProvider>
          <AnimatedBackground />

        {/* الهيدر */}
        <Header />

        {/* 4. حاوية المحتوى الرئيسي */}
        <main className="relative z-10 grow pt-18 md:pt-20">
          {children}
        </main>

          <Footer />
        </QueryProvider>
        </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
