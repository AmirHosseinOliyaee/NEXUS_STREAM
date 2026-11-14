/**
 * NEXUS STREAM — Canonical domain contracts.
 *
 * Every interface below mirrors the future NestJS/PostgreSQL schema so that the
 * client data layer, mock repositories and REST/GraphQL DTOs share one source
 * of truth. Field names stay snake-free and unit-suffixed (e.g. `timestampSec`)
 * to make serialization deterministic across the wire.
 */

/** Emotional classification attached to a timeline waveform marker. */
export type EmotionTag = "hype" | "funny" | "shock" | "insight" | "sponsor";

/** Top-level content taxonomy used by the recommendation equalizer. */
export type VideoCategory =
  | "tech"
  | "gaming"
  | "science"
  | "music"
  | "cyberculture"
  | "design";

/** Delivery format — long-form, vertical short, or live transmission. */
export type VideoFormat = "long" | "short" | "live";

/** Discussion lane a holographic comment belongs to. */
export type CommentCategory = "meme" | "deep_dive" | "timestamp";

/** Trophy scarcity tier. */
export type TrophyRarity = "common" | "rare" | "legendary";

/** A single emotional spike on the video heatmap. */
export interface TimelineMarker {
  id: string;
  /** Seconds from the start of the video. */
  timestampSec: number;
  /** Marker width in seconds. */
  durationSec: number;
  /** Waveform amplitude, clamped 0–100. */
  intensity: number;
  emotion: EmotionTag;
  /** Human/AI label indexed by Neural Scrubbing. */
  label?: string;
}

/** A time-anchored transcript fragment. */
export interface TranscriptSegment {
  timeSec: number;
  text: string;
}

/** Denormalized channel summary embedded in a video payload. */
export interface ChannelSummary {
  id: string;
  handle: string;
  name: string;
  avatarUrl: string;
  subscribersCount: number;
  isVerified: boolean;
}

/** Full video aggregate returned by the mock API and future NestJS service. */
export interface VideoEntity {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  /** Drives the Chameleon ambient lighting engine. */
  dominantColorHex: string;
  durationSec: number;
  viewsCount: number;
  /** ISO-8601 timestamp. */
  publishedAt: string;
  format: VideoFormat;
  /** Set when `format === "short"` to bridge back to the long-form source. */
  parentLongVideoId?: string;
  /** Exact second the short was sliced from its parent long-form video. */
  parentTimestampSec?: number;
  channel: ChannelSummary;
  category: VideoCategory;
  /** 0 = casual, 100 = deep technical. */
  complexityScore: number;
  /** 0 = mainstream, 100 = underground/niche. */
  noveltyScore: number;
  /** 0 = chill/ambient, 100 = high-octane. */
  hypeScore: number;
  heatmap: TimelineMarker[];
  transcript: TranscriptSegment[];
}

/** Time-anchored holographic comment. */
export interface HoloCommentEntity {
  id: string;
  videoId: string;
  author: {
    name: string;
    handle: string;
    avatarUrl: string;
    badge?: string;
  };
  content: string;
  videoTimestampSec: number;
  category: CommentCategory;
  upvotes: number;
  /** ISO-8601 timestamp. */
  createdAt: string;
}

/** Unlockable profile trophy. */
export interface TrophyItem {
  id: string;
  title: string;
  description?: string;
  icon: string;
  rarity: TrophyRarity;
  /** ISO-8601 timestamp. */
  unlockedAt: string;
}

/** One axis of the 6-point Watch DNA radar. */
export interface WatchDnaSlice {
  category: VideoCategory;
  /** Share of total watch time, 0–100. */
  percentage: number;
}

/** Player identity card persisted per handle. */
export interface PlayerProfileEntity {
  id: string;
  handle: string;
  displayName: string;
  titleBadge: string;
  level: number;
  xp: number;
  auraColorHex: string;
  watchDna: WatchDnaSlice[];
  trophies: TrophyItem[];
  blacklistedChannels: string[];
  blacklistedKeywords: string[];
}

/** Live Algorithm Equalizer configuration. */
export interface EqualizerWeights {
  /** 0–100 */
  novelty: number;
  /** 0–100 */
  depth: number;
  /** 0–100 */
  hype: number;
  /** Strict chronological bypass of all ranking. */
  chronoPure: boolean;
}
