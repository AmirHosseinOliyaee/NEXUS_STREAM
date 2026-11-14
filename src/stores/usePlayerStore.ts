import { create } from "zustand";

export interface PlayerState {
  activeVideoId: string | null;
  isPlaying: boolean;
  /** Normalized playback volume, 0–1. */
  volume: number;
  /** Mirrored media clock in seconds. */
  currentTime: number;
  /** Mirrored media duration in seconds. */
  duration: number;
  /** Chameleon ambient color sampled from the active video. */
  ambientColorHex: string;
  isPipMode: boolean;
  audioDeckMode: boolean;
  /** Cross-component seek command consumed by the active player. */
  seekRequestSec: number | null;
  playVideo: (id: string) => void;
  setActiveVideo: (id: string) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  setAmbientColor: (hex: string) => void;
  togglePip: () => void;
  toggleAudioDeck: () => void;
  requestSeek: (seconds: number) => void;
  clearSeekRequest: () => void;
}

const clampVolume = (value: number): number =>
  Math.min(1, Math.max(0, value));

const clampSeconds = (value: number): number =>
  Number.isFinite(value) ? Math.max(0, value) : 0;

/**
 * Ephemeral playback state. Intentionally not persisted: the player should
 * never resume autonomously on a cold boot.
 */
export const usePlayerStore = create<PlayerState>()((set) => ({
  activeVideoId: null,
  isPlaying: false,
  volume: 0.8,
  currentTime: 0,
  duration: 0,
  ambientColorHex: "#00F0FF",
  isPipMode: false,
  audioDeckMode: false,
  seekRequestSec: null,

  playVideo: (id) =>
    set({ activeVideoId: id, isPlaying: true, currentTime: 0 }),
  setActiveVideo: (id) =>
    set({ activeVideoId: id, isPlaying: false, currentTime: 0 }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => set({ volume: clampVolume(volume) }),
  setCurrentTime: (seconds) => set({ currentTime: clampSeconds(seconds) }),
  setDuration: (seconds) => set({ duration: clampSeconds(seconds) }),
  setAmbientColor: (hex) => set({ ambientColorHex: hex }),
  togglePip: () => set((state) => ({ isPipMode: !state.isPipMode })),
  toggleAudioDeck: () =>
    set((state) => ({ audioDeckMode: !state.audioDeckMode })),
  requestSeek: (seconds) =>
    set({ seekRequestSec: clampSeconds(seconds) }),
  clearSeekRequest: () => set({ seekRequestSec: null }),
}));
