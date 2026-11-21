import { db } from "@/services/db";
import { useAppStore } from "@/stores/useAppStore";
import type {
  EqualizerWeights,
  HoloCommentEntity,
  PlayerProfileEntity,
  VideoEntity,
} from "@/types/schema";

/** Artificial latency so loading states behave like a real network. */
const NETWORK_LATENCY_MS = 400;

/**
 * Affinity floor for the Algorithm Equalizer. When weights are supplied, videos
 * that fall below this match score are filtered out of the feed entirely.
 */
const MIN_AFFINITY = 30;

export class NexusApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NexusApiError";
  }
}

const byNewest = (a: VideoEntity, b: VideoEntity): number =>
  b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id);

const normalizeToken = (value: string): string =>
  value.trim().replace(/^@/, "").toLocaleLowerCase();

/**
 * 0–100 affinity between a video's telemetry scores and the user's fader
 * positions. Each axis contributes a weighted absolute distance, so a fader at
 * 100 makes that axis decisive while a fader at 0 ignores it.
 */
function affinityScore(
  video: VideoEntity,
  weights: EqualizerWeights,
  totalWeight: number,
): number {
  const weightedDistance =
    Math.abs(video.noveltyScore - weights.novelty) * weights.novelty +
    Math.abs(video.complexityScore - weights.depth) * weights.depth +
    Math.abs(video.hypeScore - weights.hype) * weights.hype;

  return 100 - weightedDistance / totalWeight;
}

/**
 * Bridge between the React Query layer and the data source. Today it reads
 * Dexie; swapping the internals for `fetch` against NestJS later keeps every
 * call site and return type identical.
 */
export class NexusApiClient {
  private async simulateLatency(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, NETWORK_LATENCY_MS);
    });
  }

  /**
   * Ranked feed. Without weights (or in Chrono-Pure mode) the feed is strictly
   * chronological; otherwise videos are scored against the fader positions and
   * low-affinity entries are filtered out.
   */
  async getVideos(weights?: EqualizerWeights): Promise<VideoEntity[]> {
    await this.simulateLatency();

    const videos = await db.videos.toArray();
    const { blacklistedChannels, blacklistedKeywords } = useAppStore.getState();
    const channelBlocklist = new Set(blacklistedChannels.map(normalizeToken));
    const keywordBlocklist = blacklistedKeywords
      .map((keyword) => keyword.trim().toLocaleLowerCase())
      .filter(Boolean);
    const visibleVideos = videos.filter((video) => {
      const channelTokens = [video.channel.id, video.channel.handle]
        .map(normalizeToken);
      const blockedChannel = channelTokens.some((token) => channelBlocklist.has(token));
      const searchableText = `${video.title} ${video.description}`.toLocaleLowerCase();
      const blockedKeyword = keywordBlocklist.some((keyword) =>
        searchableText.includes(keyword),
      );
      return !blockedChannel && !blockedKeyword;
    });

    if (!weights || weights.chronoPure) {
      return visibleVideos.sort(byNewest);
    }

    const totalWeight = weights.novelty + weights.depth + weights.hype;
    if (totalWeight <= 0) {
      return visibleVideos.sort(byNewest);
    }

    const scored = visibleVideos.map((video) => ({
      video,
      affinity: affinityScore(video, weights, totalWeight),
    }));

    const relevant = scored.filter((entry) => entry.affinity >= MIN_AFFINITY);
    const pool = relevant.length > 0 ? relevant : scored;

    return pool
      .sort(
        (a, b) => b.affinity - a.affinity || byNewest(a.video, b.video),
      )
      .map((entry) => entry.video);
  }

  /** Resolve a seeded player profile by handle, falling back to the primary. */
  async getProfileByHandle(handle: string): Promise<PlayerProfileEntity> {
    await this.simulateLatency();
    const normalizedHandle = normalizeToken(handle);
    const profiles = await db.profiles.toArray();
    const profile = profiles.find(
      (candidate) => normalizeToken(candidate.handle) === normalizedHandle,
    ) ?? profiles.find((candidate) => candidate.handle === "@netrunner-01");

    if (!profile) {
      throw new NexusApiError("No player profile is available yet.");
    }

    const { blacklistedChannels, blacklistedKeywords } = useAppStore.getState();
    return {
      ...profile,
      blacklistedChannels: Array.from(
        new Set([...profile.blacklistedChannels, ...blacklistedChannels]),
      ),
      blacklistedKeywords: Array.from(
        new Set([...profile.blacklistedKeywords, ...blacklistedKeywords]),
      ),
    };
  }

  /** Vertical Hyper-Feed catalog, newest clip first. */
  async getShortsFeed(): Promise<VideoEntity[]> {
    await this.simulateLatency();
    const videos = await db.videos.where("format").equals("short").toArray();
    const { blacklistedChannels, blacklistedKeywords } = useAppStore.getState();
    const blockedChannels = new Set(blacklistedChannels.map(normalizeToken));
    const blockedKeywords = blacklistedKeywords
      .map((keyword) => keyword.trim().toLocaleLowerCase())
      .filter(Boolean);
    return videos
      .filter((video) => {
        const channelBlocked = [video.channel.id, video.channel.handle]
          .map(normalizeToken)
          .some((token) => blockedChannels.has(token));
        const searchable = `${video.title} ${video.description}`.toLocaleLowerCase();
        return !channelBlocked && !blockedKeywords.some((keyword) => searchable.includes(keyword));
      })
      .sort(byNewest);
  }

  /** Resolve a single video or throw a typed not-found error. */
  async getVideoById(id: string): Promise<VideoEntity> {
    await this.simulateLatency();

    const video = await db.videos.get(id);
    if (!video) {
      throw new NexusApiError(`Video not found: ${id}`);
    }

    return video;
  }

  /** Time-anchored comments, ordered by their position in the video. */
  async getHoloComments(videoId: string): Promise<HoloCommentEntity[]> {
    await this.simulateLatency();

    const comments = await db.comments
      .where("videoId")
      .equals(videoId)
      .toArray();

    return comments.sort(
      (a, b) =>
        a.videoTimestampSec - b.videoTimestampSec || b.upvotes - a.upvotes,
    );
  }
}

export const apiClient = new NexusApiClient();
