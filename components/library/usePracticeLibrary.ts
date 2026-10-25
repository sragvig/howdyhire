"use client";

import { useSyncExternalStore } from "react";
import { getLibrarySnapshot, getServerLibrarySnapshot, subscribeLibrary } from "@/lib/practice-library";

export function usePracticeLibrary() {
  return useSyncExternalStore(subscribeLibrary, getLibrarySnapshot, getServerLibrarySnapshot);
}

export { useHydrated } from "@/components/ui/useHydrated";
