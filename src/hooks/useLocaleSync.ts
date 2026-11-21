"use client";

import { useEffect } from "react";

import { directionFor } from "@/lib/i18n";
import { useAppStore } from "@/stores/useAppStore";

/**
 * Mirrors the persisted locale onto the document root so the whole tree
 * inherits the correct `lang` and `dir` attributes after hydration.
 *
 * Server output always renders `lang="en" dir="ltr"`; this effect corrects it
 * once the client store is live, which keeps SSR and hydration identical.
 */
export function useLocaleSync(): void {
  const locale = useAppStore((state) => state.locale);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = directionFor(locale);
    root.dataset.locale = locale;
  }, [locale]);
}
