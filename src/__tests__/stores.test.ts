import { beforeEach, describe, expect, it } from "vitest";

import { useAppStore } from "@/stores/useAppStore";
import { useQueueStore } from "@/stores/useQueueStore";
import type { VideoEntity } from "@/types/schema";

const video = (id: string): VideoEntity => ({
  id,
  title: `Video ${id}`,
  description: "Test fixture",
  thumbnailUrl: "https://example.test/thumb.jpg",
  videoUrl: "https://example.test/video.mp4",
  durationSec: 60,
  publishedAt: "2026-11-21T12:00:00.000Z",
  format: "long",
  category: "tech",
  dominantColorHex: "#00ffcc",
  complexityScore: 50,
  noveltyScore: 50,
  hypeScore: 50,
  channel: { id: "channel", handle: "@channel", name: "Channel", avatarUrl: "https://example.test/avatar.jpg", isVerified: false, subscribersCount: 1 },
  heatmap: [],
  transcript: [],
  viewsCount: 0,
});

beforeEach(() => {
  useAppStore.setState({
    equalizerWeights: { novelty: 50, depth: 50, hype: 50, chronoPure: false },
    isDarkVoid: true,
    blacklistedChannels: [],
    blacklistedKeywords: [],
    locale: "en",
  });
  useQueueStore.setState({ queue: [], currentIndex: 0 });
});

describe("app preferences", () => {
  it("clamps equalizer weights to the supported range", () => {
    useAppStore.getState().setEqualizerWeight("novelty", -20);
    useAppStore.getState().setEqualizerWeight("depth", 140);
    expect(useAppStore.getState().equalizerWeights).toMatchObject({ novelty: 0, depth: 100 });
  });

  it("toggles chronological mode", () => {
    useAppStore.getState().toggleChronoPure();
    expect(useAppStore.getState().equalizerWeights.chronoPure).toBe(true);
  });

  it("normalizes and deduplicates keyword blocklist entries", () => {
    useAppStore.getState().blacklistKeyword("  Spoiler  ");
    useAppStore.getState().blacklistKeyword("SPOILER");
    useAppStore.getState().blacklistKeyword("   ");
    expect(useAppStore.getState().blacklistedKeywords).toEqual(["spoiler"]);
  });

  it("switches locale in both directions", () => {
    useAppStore.getState().toggleLocale();
    expect(useAppStore.getState().locale).toBe("fa");
    useAppStore.getState().setLocale("en");
    expect(useAppStore.getState().locale).toBe("en");
  });
});

describe("playback queue", () => {
  it("deduplicates tracks and clamps selection and advancement safely", () => {
    const first = video("one");
    const second = video("two");
    useQueueStore.getState().addToQueue(first);
    useQueueStore.getState().addToQueue(first);
    useQueueStore.getState().addToQueue(second);
    expect(useQueueStore.getState().queue.map((item) => item.id)).toEqual(["one", "two"]);

    useQueueStore.getState().selectTrack(100);
    expect(useQueueStore.getState().currentIndex).toBe(1);
    useQueueStore.getState().playNext();
    expect(useQueueStore.getState().currentIndex).toBe(1);
    useQueueStore.getState().removeFromQueue("one");
    expect(useQueueStore.getState().currentIndex).toBe(0);
    useQueueStore.getState().clearQueue();
    useQueueStore.getState().playNext();
    expect(useQueueStore.getState()).toMatchObject({ queue: [], currentIndex: 0 });
  });
});
