"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/i18n/locale";

import styles from "./HeroPortraitRotation.module.css";

const ROTATION_INTERVAL_MS = 10_000;
const SECOND_IMAGE_DELAY_MS = 1_500;

type HeroPortraitRotationProps = {
  locale: Locale;
  reduced: boolean;
};

const copy = (locale: Locale, en: string, ar: string) => locale === "en" ? en : ar;

export function HeroPortraitRotation({ locale, reduced }: HeroPortraitRotationProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const touchPauseTimer = useRef<number | undefined>(undefined);
  const [activePortrait, setActivePortrait] = useState<0 | 1>(0);
  const [secondRequested, setSecondRequested] = useState(false);
  const [secondReady, setSecondReady] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const [fineHover, setFineHover] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);

  const canRotate = !reduced && secondReady && documentVisible && inViewport && !hoverPaused && !touchPaused;

  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setSecondRequested(true), SECOND_IMAGE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [reduced]);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFineHover(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setDocumentVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInViewport(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canRotate) return;
    const timer = window.setTimeout(() => setActivePortrait((portrait) => portrait === 0 ? 1 : 0), ROTATION_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [activePortrait, canRotate]);

  useEffect(() => () => {
    if (touchPauseTimer.current) window.clearTimeout(touchPauseTimer.current);
  }, []);

  function handleTouchPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (fineHover || event.pointerType === "mouse") return;
    if (touchPaused) {
      if (touchPauseTimer.current) window.clearTimeout(touchPauseTimer.current);
      touchPauseTimer.current = undefined;
      setTouchPaused(false);
      return;
    }

    setTouchPaused(true);
    touchPauseTimer.current = window.setTimeout(() => {
      touchPauseTimer.current = undefined;
      setTouchPaused(false);
    }, ROTATION_INTERVAL_MS);
  }

  return (
    <div
      className={styles.stage}
      data-active-portrait={activePortrait + 1}
      data-rotation-state={reduced ? "reduced" : canRotate ? "running" : "paused"}
      data-secondary-ready={String(secondReady)}
      data-testid="homepage-founder-portrait"
      onPointerDown={handleTouchPointerDown}
      onPointerEnter={() => { if (fineHover) setHoverPaused(true); }}
      onPointerLeave={() => { if (fineHover) setHoverPaused(false); }}
      ref={stageRef}
    >
      <div aria-hidden={activePortrait !== 0} className={`${styles.layer} ${activePortrait === 0 ? styles.active : ""}`} data-portrait-source="/Hussein-Alharathi-1.webp">
        <Image alt={copy(locale, "Legal professional in a contemporary office", "محامٍ في مكتب معاصر")} fill preload sizes="(max-width: 800px) 86vw, 38vw" src="/Hussein-Alharathi-1.webp" />
      </div>
      {secondRequested ? (
        <div aria-hidden={activePortrait !== 1} className={`${styles.layer} ${activePortrait === 1 ? styles.active : ""}`} data-portrait-source="/Hussein-Alharathi-2.webp">
          <Image alt={copy(locale, "Legal professional in a contemporary office", "محامٍ في مكتب معاصر")} fill loading="eager" onLoad={() => setSecondReady(true)} sizes="(max-width: 800px) 86vw, 38vw" src="/Hussein-Alharathi-2.webp" />
        </div>
      ) : null}
    </div>
  );
}
