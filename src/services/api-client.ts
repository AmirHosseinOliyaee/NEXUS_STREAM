import { db } from "@/services/db";
import type {
  EqualizerWeights,
  HoloCommentEntity,
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

    if (!weights || weights.chronoPure) {
      return videos.sort(byNewest);
    }

    const totalWeight = weights.novelty + weights.depth + weights.hype;
    if (totalWeight <= 0) {
      return videos.sort(byNewest);
    }

    const scored = videos.map((video) => ({
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
