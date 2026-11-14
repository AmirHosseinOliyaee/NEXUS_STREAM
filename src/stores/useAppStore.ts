import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { EqualizerWeights } from "@/types/schema";

/** Equalizer axes that can be individually re-weighted. */
export type EqualizerWeightKey = Exclude<keyof EqualizerWeights, "chronoPure">;

export interface AppState {
  equalizerWeights: EqualizerWeights;
  isDarkVoid: boolean;
  blacklistedChannels: string[];
  setEqualizerWeight: (key: EqualizerWeightKey, value: number) => void;
  toggleChronoPure: () => void;
  blacklistChannel: (id: string) => void;
}

const DEFAULT_WEIGHTS: EqualizerWeights = {
  novelty: 50,
  depth: 50,
  hype: 50,
  chronoPure: false,
};

const clampScore = (value: number): number =>
  Math.min(100, Math.max(0, value));

/**
 * Global app preferences: Algorithm Equalizer weights, the dark-void theme
 * flag and the hardware-level channel blacklist.
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
    }),
    {
      name: "nexus-app-storage",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({
        equalizerWeights: state.equalizerWeights,
        isDarkVoid: state.isDarkVoid,
        blacklistedChannels: state.blacklistedChannels,
      }),
    },
  ),
);
