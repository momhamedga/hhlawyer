"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useLocale } from "@/components/providers/LocaleProvider";
import { cn } from "@/components/ui/cn";
import { messages } from "@/i18n/messages";

const optionDefinitions = [
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
  { value: "system", label: "system", icon: Monitor },
] as const;

type ThemeToggleProps = { className?: string; id?: string; variant?: "popover" | "inline" };

export function ThemeToggle({ className, id = "theme", variant = "popover" }: ThemeToggleProps) {
  const locale = useLocale();
  const labels = messages[locale].theme;
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const mounted = useSyncExternalStore(() => () => undefined, () => true, () => false);

  useEffect(() => {
    if (variant === "inline") return;

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [variant]);

  if (!mounted) return <div aria-hidden="true" className={cn(variant === "inline" ? "min-h-32 w-full" : "size-10", className)} />;

  if (variant === "inline") {
    return <section aria-labelledby={`${id}-label`} className={cn("w-full", className)} data-testid={`${id}-inline`}>
      <p className="mb-2 text-sm font-extrabold text-foreground" id={`${id}-label`}>{locale === "ar" ? "المظهر" : "Appearance"}</p>
      <div aria-labelledby={`${id}-label`} className="grid grid-cols-3 gap-2" role="group">
        {optionDefinitions.map(({ value, label, icon: Icon }) => {
          const active = theme === value;
          return <button aria-pressed={active} className={cn("relative inline-flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-ds-sm border px-1.5 text-center text-xs font-extrabold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background", active ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground hover:border-accent hover:text-foreground")} data-testid={`${id}-option-${value}`} key={value} onClick={() => setTheme(value)} type="button"><Icon aria-hidden="true" size={16} /><span className="truncate">{labels[label]}</span>{active ? <Check aria-hidden="true" className="absolute end-1 top-1 text-accent" size={12} strokeWidth={3} /> : null}</button>;
        })}
      </div>
    </section>;
  }

  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;
  return <div className={cn("relative inline-flex", className)} ref={menuRef}>
    <button aria-expanded={open} aria-haspopup="menu" aria-label={labels.trigger} className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-elevation-sm transition duration-200 hover:-translate-y-px hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0" data-testid={`${id}-trigger`} onClick={() => setOpen((value) => !value)} type="button"><CurrentIcon aria-hidden="true" size={16} /></button>
    {open ? <div aria-label={labels.menu} className="absolute end-0 top-[calc(100%+0.55rem)] z-[60] grid min-w-36 gap-0.5 rounded-ds-md border border-border bg-popover p-1.5 text-popover-foreground shadow-elevation-md" role="menu">
      {optionDefinitions.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return <button aria-checked={active} className={cn("inline-flex min-h-9 items-center gap-2 rounded-ds-sm px-2.5 text-start text-xs font-semibold transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground")} data-testid={`${id}-option-${value}`} key={value} onClick={() => { setTheme(value); setOpen(false); }} role="menuitemradio" type="button"><Icon aria-hidden="true" size={14} /><span>{labels[label]}</span>{active ? <Check aria-hidden="true" className="ms-auto" size={13} /> : null}</button>;
      })}
    </div> : null}
  </div>;
}
