import { beforeEach, vi } from "vitest";

import { useAppStore } from "@/stores/useAppStore";

const storage = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string): string | null => storage.get(key) ?? null,
  setItem: (key: string, value: string): void => { storage.set(key, value); },
  removeItem: (key: string): void => { storage.delete(key); },
  clear: (): void => { storage.clear(); },
};

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("window", { localStorage: localStorageMock });

beforeEach(() => {
  storage.clear();
  useAppStore.setState({
    equalizerWeights: { novelty: 50, depth: 50, hype: 50, chronoPure: false },
    isDarkVoid: true,
    blacklistedChannels: [],
    blacklistedKeywords: [],
    locale: "en",
  });
});
