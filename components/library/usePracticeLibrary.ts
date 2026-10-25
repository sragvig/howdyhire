"use client";

import { useSyncExternalStore } from "react";
import { getLibrarySnapshot, getServerLibrarySnapshot, subscribeLibrary } from "@/lib/practice-library";

export function usePracticeLibrary() {
  return useSyncExternalStore(subscribeLibrary, getLibrarySnapshot, getServerLibrarySnapshot);
}

const noopSubscribe = () => () => {};

// false during SSR/hydration, true once running in the browser (localStorage is readable).
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
