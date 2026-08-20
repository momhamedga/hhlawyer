"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/components/ui/cn";

const officialLogos = {
  ar: {
    dark: { height: 607, src: "/images/logo-ar-dark-transparent.webp", width: 1733 },
    light: { height: 511, src: "/images/logo-ar-light-transparent.webp", width: 1673 },
  },
  en: {
    dark: { height: 601, src: "/images/logo-en-dark-transparent.webp", width: 2054 },
    light: { height: 569, src: "/images/logo-en-light-transparent.webp", width: 1790 },
  },
} as const;

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  variant: "footer" | "header" | "mobile";
};

export function BrandLogo({ className, priority = false, variant }: BrandLogoProps) {
  const locale = useLocale();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const logo = officialLogos[locale][theme];

  if (!mounted) return <span aria-hidden="true" className={cn(className, "block")} data-testid={`brand-logo-${variant}-pending`} />;

  return <Image alt={locale === "ar" ? "شعار حسين الحارثي" : "Hussein Al Harithi logo"} className={className} data-logo-source={logo.src} data-testid={`brand-logo-${variant}`} height={logo.height} priority={priority} sizes={variant === "footer" ? "(max-width: 700px) min(70vw, 260px), min(30vw, 460px)" : variant === "mobile" ? "min(58vw, 165px)" : "(max-width: 720px) min(42vw, 165px), min(18vw, 220px)"} src={logo.src} width={logo.width} />;
}
