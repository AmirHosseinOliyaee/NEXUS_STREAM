"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

import { useLocaleSync } from "@/hooks/useLocaleSync";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { useAppStore } from "@/stores/useAppStore";

/**
 * Client-side providers. TanStack Query is instantiated lazily per browser
 * session so the cache is never shared across requests during SSR. Persisted
 * Zustand state is rehydrated after mount to avoid hydration mismatches.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  // Mirrors the persisted locale onto <html lang> / <html dir>.
  useLocaleSync();
  // Best-effort offline shell registration; never blocks rendering.
  useServiceWorker();

  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
}
