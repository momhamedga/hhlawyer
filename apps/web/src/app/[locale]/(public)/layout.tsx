import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/shared/Header";
import { AnimatedBackground } from "@/components/shared/layout/AnimatedBackground";

export default function PublicLocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="relative z-10 grow pt-18 md:pt-20" id="public-main">
        {children}
      </main>
      <Footer />
    </>
  );
}
