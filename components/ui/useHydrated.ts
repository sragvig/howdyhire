"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

// false during SSR and hydration, true once running in the browser. Unlike a mounted-state
// effect, this also stays false while a late-hydrating Suspense boundary hydrates, so components
// can render exactly what the server rendered until hydration finishes.
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
