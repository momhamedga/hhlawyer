"use client";

import { useReducedMotion } from "framer-motion";
import { useSyncExternalStore } from "react";

const subscribe = () => () => undefined;

export function useHydrationSafeReducedMotion() {
  const prefersReducedMotion = useReducedMotion();
  return useSyncExternalStore(subscribe, () => Boolean(prefersReducedMotion), () => false);
}
