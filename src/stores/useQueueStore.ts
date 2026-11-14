import { create } from "zustand";

import type { VideoEntity } from "@/types/schema";

export interface QueueState {
  /** Ordered cartridge queue. */
  queue: VideoEntity[];
  /** Index of the cartridge currently on deck. */
  currentIndex: number;
  addToQueue: (video: VideoEntity) => void;
  removeFromQueue: (id: string) => void;
  /** Jump the "on deck" pointer to a specific slot. */
  selectTrack: (index: number) => void;
  playNext: () => void;
  clearQueue: () => void;
}

const clampIndex = (index: number, length: number): number =>
  length === 0 ? 0 : Math.min(Math.max(index, 0), length - 1);

/**
 * Cartridge queue used by the Cyber-Orb dock and the bottom drawer.
 * Duplicate ids are ignored so the same video can never occupy two slots.
 */
export const useQueueStore = create<QueueState>()((set) => ({
  queue: [],
  currentIndex: 0,

  addToQueue: (video) =>
    set((state) =>
      state.queue.some((item) => item.id === video.id)
        ? state
        : { queue: [...state.queue, video] },
    ),

  removeFromQueue: (id) =>
    set((state) => {
      const removedIndex = state.queue.findIndex((video) => video.id === id);
      if (removedIndex === -1) return state;

      const queue = state.queue.filter((video) => video.id !== id);
      const currentIndex =
        removedIndex < state.currentIndex
          ? clampIndex(state.currentIndex - 1, queue.length)
          : clampIndex(state.currentIndex, queue.length);

      return { queue, currentIndex };
    }),

  playNext: () =>
    set((state) => {
      if (state.queue.length === 0) return state;
      return {
        currentIndex: clampIndex(state.currentIndex + 1, state.queue.length),
      };
    }),

  selectTrack: (index) =>
    set((state) => ({
      currentIndex: clampIndex(index, state.queue.length),
    })),

  clearQueue: () => set({ queue: [], currentIndex: 0 }),
}));
