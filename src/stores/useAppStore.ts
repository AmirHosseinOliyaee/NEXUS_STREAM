import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Locale } from "@/lib/i18n";
import type { EqualizerWeights } from "@/types/schema";

/** Equalizer axes that can be individually re-weighted. */
export type EqualizerWeightKey = Exclude<keyof EqualizerWeights, "chronoPure">;

export interface AppState {
  equalizerWeights: EqualizerWeights;
  isDarkVoid: boolean;
  blacklistedChannels: string[];
  blacklistedKeywords: string[];
  /** Interface language for the bilingual shell. */
  locale: Locale;
  setEqualizerWeight: (key: EqualizerWeightKey, value: number) => void;
  toggleChronoPure: () => void;
  blacklistChannel: (id: string) => void;
  whitelistChannel: (id: string) => void;
  blacklistKeyword: (keyword: string) => void;
  whitelistKeyword: (keyword: string) => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const DEFAULT_WEIGHTS: EqualizerWeights = {
  novelty: 50,
  depth: 50,
  hype: 50,
  chronoPure: false,
};

const DEFAULT_LOCALE: Locale = "en";

const clampScore = (value: number): number =>
  Math.min(100, Math.max(0, value));

/** Coerce unknown persisted values into a supported locale. */
const normalizeLocale = (value: unknown): Locale =>
  value === "fa" ? "fa" : DEFAULT_LOCALE;

/**
 * Global app preferences: Algorithm Equalizer weights, the dark-void theme
 * flag, the hardware-level channel blacklist and the interface locale.
 *
 * Persisted to `localStorage` under `nexus-app-storage`; only user-owned state
 * is serialized, never the action functions.
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      equalizerWeights: DEFAULT_WEIGHTS,
      isDarkVoid: true,
      blacklistedChannels: [],
      blacklistedKeywords: [],
      locale: DEFAULT_LOCALE,

      setEqualizerWeight: (key, value) =>
        set((state) => ({
          equalizerWeights: {
            ...state.equalizerWeights,
            [key]: clampScore(value),
          },
        })),

      toggleChronoPure: () =>
        set((state) => ({
          equalizerWeights: {
            ...state.equalizerWeights,
            chronoPure: !state.equalizerWeights.chronoPure,
          },
        })),

      blacklistChannel: (id) =>
        set((state) =>
          state.blacklistedChannels.includes(id)
            ? state
            : { blacklistedChannels: [...state.blacklistedChannels, id] },
        ),
      whitelistChannel: (id) =>
        set((state) => ({
          blacklistedChannels: state.blacklistedChannels.filter(
            (value) => value !== id,
          ),
        })),
      blacklistKeyword: (keyword) =>
        set((state) => {
          const normalized = keyword.trim().toLocaleLowerCase();
          return !normalized || state.blacklistedKeywords.includes(normalized)
            ? state
            : { blacklistedKeywords: [...state.blacklistedKeywords, normalized] };
        }),
      whitelistKeyword: (keyword) =>
        set((state) => ({
          blacklistedKeywords: state.blacklistedKeywords.filter(
            (value) => value !== keyword,
          ),
        })),

      setLocale: (locale) => set({ locale }),
      toggleLocale: () =>
        set((state) => ({ locale: state.locale === "en" ? "fa" : "en" })),
    }),
    {
      name: "nexus-app-storage",
      version: 3,
      migrate: (persistedState, version) => {
        const previous = persistedState as Partial<AppState>;
        return {
          ...previous,
          blacklistedChannels: previous.blacklistedChannels ?? [],
          blacklistedKeywords: previous.blacklistedKeywords ?? [],
          locale: version < 3 ? DEFAULT_LOCALE : normalizeLocale(previous.locale),
        } as AppState;
      },
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        equalizerWeights: state.equalizerWeights,
        isDarkVoid: state.isDarkVoid,
        blacklistedChannels: state.blacklistedChannels,
        blacklistedKeywords: state.blacklistedKeywords,
        locale: state.locale,
      }),
    },
  ),
);
