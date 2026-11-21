import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/services/api-client";
import { db } from "@/services/db";
import { useAppStore } from "@/stores/useAppStore";
import type { EqualizerWeights, VideoEntity } from "@/types/schema";

const chrono: EqualizerWeights = { novelty: 50, depth: 50, hype: 50, chronoPure: true };
const niche: EqualizerWeights = { novelty: 100, depth: 0, hype: 0, chronoPure: false };

function video(id: string, publishedAt: string, noveltyScore: number): VideoEntity {
  return {
    id,
    title: `Video ${id}`,
    description: "Fixture",
    videoUrl: "https://example.test/video.mp4",
    thumbnailUrl: "https://example.test/thumb.jpg",
    dominantColorHex: "#00ffcc",
    durationSec: 60,
    viewsCount: 0,
    publishedAt,
    format: "long",
    channel: {
      id: `channel-${id}`,
      handle: `@${id}`,
      name: `Channel ${id}`,
      avatarUrl: "https://example.test/avatar.jpg",
      subscribersCount: 1,
      isVerified: false,
    },
    category: "tech",
    complexityScore: 50,
    noveltyScore,
    hypeScore: 50,
    heatmap: [],
    transcript: [],
  };
}

beforeEach(() => {
  vi.spyOn(globalThis, "setTimeout").mockImplementation(((callback: TimerHandler) => {
    if (typeof callback === "function") callback();
    return 0;
  }) as typeof setTimeout);
});

afterEach(() => {
  vi.restoreAllMocks();
  useAppStore.setState({ blacklistedChannels: [], blacklistedKeywords: [] });
});

describe("NexusApiClient feed ranking", () => {
  it("returns chronological order in Chrono-Pure mode", async () => {
    vi.spyOn(db.videos, "toArray").mockResolvedValue([
      video("older", "2026-01-01T00:00:00.000Z", 50),
      video("newer", "2026-02-01T00:00:00.000Z", 50),
    ]);

    const result = await apiClient.getVideos(chrono);
    expect(result.map(({ id }) => id)).toEqual(["newer", "older"]);
  });

  it("ranks higher novelty affinity first", async () => {
    vi.spyOn(db.videos, "toArray").mockResolvedValue([
      video("novel", "2026-01-01T00:00:00.000Z", 90),
      video("mainstream", "2026-02-01T00:00:00.000Z", 40),
    ]);

    const result = await apiClient.getVideos(niche);
    expect(result.map(({ id }) => id)).toEqual(["novel", "mainstream"]);
  });

  it("filters videos matching channel and keyword blocklists", async () => {
    vi.spyOn(db.videos, "toArray").mockResolvedValue([
      video("allowed", "2026-01-01T00:00:00.000Z", 70),
      { ...video("channel-blocked", "2026-02-01T00:00:00.000Z", 70), channel: { ...video("channel-blocked", "2026-02-01T00:00:00.000Z", 70).channel, handle: "@blocked" } },
      { ...video("keyword-blocked", "2026-03-01T00:00:00.000Z", 70), title: "Spoiler alert" },
    ]);
    useAppStore.setState({ blacklistedChannels: ["@Blocked"], blacklistedKeywords: ["spoiler"] });

    const result = await apiClient.getVideos(chrono);
    expect(result.map(({ id }) => id)).toEqual(["allowed"]);
  });
});
