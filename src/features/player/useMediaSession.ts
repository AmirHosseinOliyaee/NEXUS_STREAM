"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";

const ALBUM_NAME = "NEXUS STREAM // CYBER-HUD";
const SEEK_STEP_SEC = 10;

export interface MediaSessionSource {
  readonly id: string;
  readonly title: string;
  readonly channelName: string;
  readonly thumbnailUrl: string;
  readonly durationSec: number;
}

export interface MediaSessionOptions {
  /** Current media clock in seconds; keeps the OS scrubber in sync. */
  readonly currentTime: number;
  /** Live playback flag driving the OS play/pause glyph. */
  readonly isPlaying: boolean;
  /** Issued when the OS asks to resume. */
  readonly onPlay: () => void;
  /** Issued when the OS asks to pause. */
  readonly onPause: () => void;
  /** Relative seek, in seconds, applied against the latest media clock. */
  readonly onSeek: (targetSec: number) => void;
  /**
   * Tie-break when several players hold a live track. The OS media session is a
   * single global slot, so the highest priority wins; the floating mini-player
   * outranks the in-page player because it is the surface a viewer popped out.
   */
  readonly priority?: number;
}

const isSupported = (): boolean =>
  typeof navigator !== "undefined" && "mediaSession" in navigator;

/** Clamp a relative seek inside the track bounds. */
const resolveSeekTarget = (
  currentTime: number,
  offset: number,
  durationSec: number,
): number => {
  const upperBound = durationSec > 0 ? durationSec : currentTime + offset;
  return Math.min(Math.max(0, currentTime + offset), Math.max(0, upperBound));
};

/* -- Global ownership arbitration ---------------------------------- */
/*
 * The OS exposes exactly one media session, while the shell can mount two
 * players at once (the watch-page player and the floating mini-player). Every
 * instance registers what it currently holds, and the highest-priority live
 * registration owns the session. Because ownership lives in a module store read
 * through `useSyncExternalStore`, handing the session over — for example when a
 * viewer toggles picture-in-picture — re-renders both instances on its own.
 */
interface MediaSessionRegistration {
  readonly token: symbol;
  readonly priority: number;
  active: boolean;
}

const registrations = new Map<symbol, MediaSessionRegistration>();
const ownershipListeners = new Set<() => void>();
let ownerToken: symbol | null = null;

function emitOwnership(): void {
  for (const listener of ownershipListeners) listener();
}

function recomputeOwner(): void {
  let winner: MediaSessionRegistration | null = null;

  for (const candidate of registrations.values()) {
    if (!candidate.active) continue;
    if (winner === null || candidate.priority > winner.priority) {
      winner = candidate;
    }
  }

  const nextOwner = winner?.token ?? null;
  if (nextOwner === ownerToken) return;

  ownerToken = nextOwner;
  emitOwnership();
}

function subscribeOwnership(listener: () => void): () => void {
  ownershipListeners.add(listener);
  return () => {
    ownershipListeners.delete(listener);
  };
}

/**
 * Bridges the active video into the OS lock-screen / hardware media UI.
 *
 * Metadata is published once per track; every action handler is re-bound on
 * each render so the closures never read a stale media clock. Handlers are
 * explicitly torn down when an instance loses ownership or unmounts, so no
 * global shortcut can ever point at a dead player.
 */
export function useMediaSession(
  source: MediaSessionSource | null,
  options: MediaSessionOptions,
): void {
  const {
    currentTime,
    isPlaying,
    onPlay,
    onPause,
    onSeek,
    priority = 0,
  } = options;

  // Stable per-instance identity used to arbitrate the global media session.
  const [token] = useState(() => Symbol("nexus-media-session"));

  // Latest-value refs keep handler effects from re-running on every tick.
  const clockRef = useRef(currentTime);
  clockRef.current = currentTime;

  const callbacksRef = useRef({ onPlay, onPause, onSeek });
  callbacksRef.current = { onPlay, onPause, onSeek };

  const videoId = source?.id ?? null;
  const title = source?.title ?? null;
  const channelName = source?.channelName ?? null;
  const thumbnailUrl = source?.thumbnailUrl ?? null;
  const durationSec = source?.durationSec ?? 0;
  const isLive = videoId !== null && title !== null && channelName !== null;

  const isOwner = useSyncExternalStore(
    subscribeOwnership,
    () => ownerToken === token,
    () => false,
  );

  /* -- Registration ------------------------------------------------- */
  useEffect(() => {
    registrations.set(token, { token, priority, active: isLive });
    recomputeOwner();
  }, [token, priority, isLive]);

  useEffect(() => {
    return () => {
      registrations.delete(token);
      recomputeOwner();
    };
  }, [token]);

  const owns = isOwner && isLive;

  /* -- Hand-off / teardown ----------------------------------------- */
  useEffect(() => {
    if (!owns || !isSupported()) return;
    return () => {
      if (!isSupported()) return;
      // A different instance already claimed the session; leave its state alone.
      if (ownerToken !== null) return;
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = "none";
    };
  }, [owns]);

  /* -- Metadata: one write per track ------------------------------- */
  useEffect(() => {
    if (!owns || !isSupported()) return;
    if (title === null || channelName === null) return;

    const artwork: MediaImage[] = thumbnailUrl
      ? [
          { src: thumbnailUrl, sizes: "512x512", type: "image/jpeg" },
          { src: thumbnailUrl, sizes: "256x256", type: "image/jpeg" },
        ]
      : [];

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: channelName,
      album: ALBUM_NAME,
      artwork,
    });
  }, [owns, title, channelName, thumbnailUrl]);

  /* -- Playback state ---------------------------------------------- */
  useEffect(() => {
    if (!owns || !isSupported()) return;
    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
  }, [owns, isPlaying]);

  /* -- Position state ---------------------------------------------- */
  useEffect(() => {
    if (!owns || !isSupported() || durationSec <= 0) return;
    if (!Number.isFinite(durationSec) || !Number.isFinite(currentTime)) return;

    const clampedPosition = Math.min(Math.max(0, currentTime), durationSec);
    try {
      navigator.mediaSession.setPositionState({
        duration: durationSec,
        position: clampedPosition,
        playbackRate: 1,
      });
    } catch {
      /* Some engines reject out-of-range positions; the OS scrubber is optional. */
    }
  }, [owns, currentTime, durationSec]);

  /* -- Action handlers --------------------------------------------- */
  useEffect(() => {
    if (!owns || !isSupported()) return;

    const session = navigator.mediaSession;

    const seekBy = (offset: number): void => {
      const { onSeek: seek } = callbacksRef.current;
      seek(resolveSeekTarget(clockRef.current, offset, durationSec));
    };

    const handlers: Array<[MediaSessionAction, MediaSessionActionHandler]> = [
      ["play", () => callbacksRef.current.onPlay()],
      ["pause", () => callbacksRef.current.onPause()],
      ["seekbackward", () => seekBy(-SEEK_STEP_SEC)],
      ["seekforward", () => seekBy(SEEK_STEP_SEC)],
      [
        "seekto",
        (details) => {
          const target = details.seekTime;
          if (target === undefined) return;
          callbacksRef.current.onSeek(Math.max(0, target));
        },
      ],
      [
        "nexttrack",
        () => {
          useQueueStore.getState().playNext();
          const next = useQueueStore.getState();
          const track = next.queue[next.currentIndex];
          if (track) {
            usePlayerStore.getState().playVideo(track.id);
          }
        },
      ],
    ];

    const bound: Array<[MediaSessionAction, MediaSessionActionHandler]> = [];

    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
        bound.push([action, handler]);
      } catch {
        /* Unsupported action for this engine — skip silently. */
      }
    }

    return () => {
      for (const [action] of bound) {
        try {
          session.setActionHandler(action, null);
        } catch {
          /* Already detached. */
        }
      }
    };
  }, [owns, durationSec]);
}
