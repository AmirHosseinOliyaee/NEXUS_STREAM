"use client";

import {
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

import { useI18n, type Dictionary } from "@/lib/i18n";
import { cn, formatDuration } from "@/lib/utils";
import type { EmotionTag, TimelineMarker } from "@/types/schema";

const BAR_COUNT = 96;

const EMOTION_COLOR: Record<EmotionTag, string> = {
  hype: "var(--neon-warning)",
  funny: "var(--neon-success)",
  shock: "var(--neon-secondary)",
  insight: "var(--neon-primary)",
  sponsor: "rgba(255, 255, 255, 0.32)",
};

const EMOTION_LABEL: Record<EmotionTag, keyof Dictionary["timeline"]> = {
  hype: "hype",
  funny: "funny",
  shock: "shock",
  insight: "insight",
  sponsor: "sponsor",
};

const LEGEND: readonly EmotionTag[] = [
  "hype",
  "shock",
  "insight",
  "sponsor",
];

const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

export interface EmotionalPulseTimelineProps {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
  heatmap: TimelineMarker[];
  /** Dims sponsor sections while the shield is armed. */
  sponsorShield?: boolean;
  /** Transcript timestamps highlighted by neural search. */
  matchedTimestamps?: number[];
  className?: string;
}

interface WaveBar {
  ratio: number;
  height: number;
  emotion: EmotionTag | null;
}

/**
 * Emotional waveform scrubber. Replaces the native progress bar with a
 * per-emotion bar field, hatched sponsor zones, a glowing playhead and full
 * pointer + keyboard scrubbing.
 */
export function EmotionalPulseTimeline({
  currentTime,
  duration,
  onSeek,
  heatmap,
  sponsorShield = false,
  matchedTimestamps = [],
  className,
}: EmotionalPulseTimelineProps) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setScrubbing] = useState(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);

  const safeDuration = Math.max(0, duration);
  const progress =
    safeDuration > 0 ? clamp01(currentTime / safeDuration) : 0;

  const bars = useMemo<WaveBar[]>(() => {
    return Array.from({ length: BAR_COUNT }, (_, index) => {
      const ratio = (index + 0.5) / BAR_COUNT;
      const time = ratio * safeDuration;

      const marker =
        safeDuration > 0
          ? heatmap.find(
              (entry) =>
                time >= entry.timestampSec &&
                time < entry.timestampSec + entry.durationSec,
            )
          : undefined;

      const wave =
        0.38 +
        Math.sin(index * 0.55) * 0.13 +
        Math.sin(index * 0.21 + 1.4) * 0.1;

      const height = marker
        ? 0.32 + (marker.intensity / 100) * 0.68
        : wave;

      return {
        ratio,
        height: Math.min(1, Math.max(0.14, height)),
        emotion: marker?.emotion ?? null,
      };
    });
  }, [heatmap, safeDuration]);

  const sponsorBands = useMemo(
    () =>
      heatmap
        .filter((marker) => marker.emotion === "sponsor")
        .map((marker) => ({
          id: marker.id,
          start: clamp01(
            safeDuration > 0 ? marker.timestampSec / safeDuration : 0,
          ),
          width: clamp01(
            safeDuration > 0 ? marker.durationSec / safeDuration : 0,
          ),
        })),
    [heatmap, safeDuration],
  );

  const seekFromClientX = (clientX: number): void => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || safeDuration <= 0) return;
    const ratio = clamp01((clientX - rect.left) / rect.width);
    setHoverRatio(ratio);
    onSeek(ratio * safeDuration);
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers may not support capture; scrubbing still works.
    }
    setScrubbing(true);
    seekFromClientX(event.clientX);
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect && rect.width > 0) {
      setHoverRatio(clamp01((event.clientX - rect.left) / rect.width));
    }
    if (isScrubbing) seekFromClientX(event.clientX);
  };

  const handlePointerUp = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    setScrubbing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ): void => {
    const step = event.shiftKey ? 30 : 5;
    let nextTime: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      nextTime = currentTime + step;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      nextTime = currentTime - step;
    } else if (event.key === "Home") {
      nextTime = 0;
    } else if (event.key === "End") {
      nextTime = safeDuration;
    }

    if (nextTime === null) return;
    event.preventDefault();
    onSeek(Math.min(Math.max(nextTime, 0), safeDuration));
  };

  const hoverTime =
    hoverRatio !== null ? hoverRatio * safeDuration : 0;

  return (
    <div className={cn("select-none", className)}>
      <div
        ref={trackRef}
        role="slider"
        aria-label={t.timeline.sliderAria}
        aria-valuemin={0}
        aria-valuemax={Math.round(safeDuration)}
        aria-valuenow={Math.round(currentTime)}
        aria-valuetext={t.timeline.valueText
          .replace("MM", formatDuration(currentTime))
          .replace("NN", formatDuration(safeDuration))}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={() => {
          if (!isScrubbing) setHoverRatio(null);
        }}
        onKeyDown={handleKeyDown}
        className="group/timeline relative h-10 w-full cursor-pointer touch-none sm:h-12"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-end gap-px sm:gap-[2px]"
        >
          {bars.map((bar, index) => {
            const played = bar.ratio <= progress;
            const isHype = bar.emotion === "hype";
            const color = bar.emotion
              ? EMOTION_COLOR[bar.emotion]
              : "rgba(255, 255, 255, 0.22)";

            return (
              <span
                key={index}
                className="flex-1 transition-[opacity,background-color] duration-150"
                style={{
                  height: `${bar.height * 100}%`,
                  backgroundColor: color,
                  opacity: played
                    ? bar.emotion === "sponsor"
                      ? 0.55
                      : 1
                    : 0.3,
                  boxShadow:
                    played && isHype
                      ? "0 0 9px -1px var(--neon-warning)"
                      : undefined,
                }}
              />
            );
          })}
        </div>

        {matchedTimestamps.map((timestamp, index) => {
          if (safeDuration <= 0 || timestamp < 0 || timestamp > safeDuration) return null;
          const ratio = clamp01(timestamp / safeDuration);
          return (
            <span
              key={`${timestamp}-${index}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-1 z-10 w-1 -translate-x-1/2 rounded-full bg-[var(--neon-primary)]"
              style={{ left: `${ratio * 100}%`, boxShadow: "0 0 8px var(--neon-primary), 0 0 18px color-mix(in srgb, var(--neon-primary) 65%, transparent)" }}
            />
          );
        })}

        {sponsorBands.map((band) => (
          <span
            key={band.id}
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-y-0 border-x border-white/15",
              sponsorShield ? "opacity-75" : "opacity-40",
            )}
            style={{
              left: `${band.start * 100}%`,
              width: `${Math.max(band.width * 100, 0.6)}%`,
            }}
          >
            <span className="block h-full w-full bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.16)_0px,rgba(255,255,255,0.16)_1px,transparent_1px,transparent_5px)]" />
          </span>
        ))}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 z-20 w-px bg-white"
          style={{
            left: `${progress * 100}%`,
            boxShadow: "0 0 10px var(--neon-primary)",
          }}
        >
          <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 bg-white" />
        </span>

        {hoverRatio !== null ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-7 z-30 -translate-x-1/2 border border-white/15 bg-[var(--bg-void)]/90 px-1.5 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-white/70 backdrop-blur-sm"
            style={{ left: `${hoverRatio * 100}%` }}
          >
            {formatDuration(hoverTime)}
          </span>
        ) : null}
      </div>

      <div className="mt-1 hidden items-center justify-between gap-3 font-mono text-[8px] uppercase tracking-[0.14em] text-white/30 sm:flex">
        <span className="tabular-nums text-white/45">
          {formatDuration(currentTime)}
        </span>

        <div className="hidden items-center gap-3 sm:flex">
          {LEGEND.map((emotion) => (
            <span key={emotion} className="flex items-center gap-1.5">
              <span
                className="size-1"
                style={{ backgroundColor: EMOTION_COLOR[emotion] }}
              />
              {t.timeline[EMOTION_LABEL[emotion]]}
            </span>
          ))}
        </div>

        <span className="tabular-nums">
          -{formatDuration(Math.max(0, safeDuration - currentTime))}
        </span>
      </div>
    </div>
  );
}
