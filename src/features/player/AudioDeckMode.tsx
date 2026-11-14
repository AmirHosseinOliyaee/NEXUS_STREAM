"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { AudioLines } from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { cn, formatDuration } from "@/lib/utils";
import type { VideoEntity } from "@/types/schema";

const EQ_BARS = 26;

const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

export interface AudioDeckModeProps {
  video: VideoEntity;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
}

/**
 * Cassette / visualizer mode. The underlying <video> keeps playing audio while
 * this deck covers it; the transcript follows a nominal-time projection so it
 * stays aligned with any mock media length.
 */
export function AudioDeckMode({
  video,
  currentTime,
  duration,
  isPlaying,
}: AudioDeckModeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLParagraphElement>(null);

  const progress = duration > 0 ? clamp01(currentTime / duration) : 0;
  const nominalTime = progress * video.durationSec;

  const activeIndex = useMemo(() => {
    let index = 0;
    video.transcript.forEach((segment, segmentIndex) => {
      if (segment.timeSec <= nominalTime) index = segmentIndex;
    });
    return index;
  }, [nominalTime, video.transcript]);

  useEffect(() => {
    const container = scrollRef.current;
    const active = activeRef.current;
    if (!container || !active) return;

    const target = Math.max(
      0,
      active.offsetTop - container.clientHeight * 0.32,
    );
    container.scrollTo({ top: target, behavior: "smooth" });
  }, [activeIndex]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col gap-3 overflow-hidden bg-[var(--bg-void)]/95 px-4 pb-28 pt-4 backdrop-blur-md sm:px-5 sm:pb-28 sm:pt-5">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-2.5">
        <div className="flex items-center gap-2">
          <AudioLines className="size-3.5 text-[var(--neon-primary)]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/45">
            Audio deck // side A
          </span>
        </div>
        <HudBadge
          tone="primary"
          variant="ghost"
          size="sm"
          dot
          pulse={isPlaying}
        >
          {isPlaying ? "Playing" : "Paused"}
        </HudBadge>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:grid-rows-1">
        <div className="flex min-h-0 flex-col justify-between gap-3">
          <div className="relative mx-auto grid size-28 place-items-center sm:size-36">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 bg-cover bg-center blur-xl"
              style={{
                backgroundColor: "#0b0f18",
                backgroundImage: `url(${video.thumbnailUrl})`,
              }}
              animate={
                isPlaying
                  ? { opacity: [0.16, 0.36, 0.16], scale: [1, 1.08, 1] }
                  : { opacity: 0.12, scale: 1 }
              }
              transition={{
                duration: 2.2,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut",
              }}
            />

            <motion.div
              className="relative grid size-full place-items-center overflow-hidden border border-white/15 bg-[#0b0f18] cyber-chamfer-sm"
              style={{
                backgroundImage: `linear-gradient(150deg, ${video.dominantColorHex}55, rgba(7, 8, 13, 0.85)), url(${video.thumbnailUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              animate={
                isPlaying ? { scale: [1, 1.025, 1] } : { scale: 1 }
              }
              transition={{
                duration: 1.4,
                repeat: isPlaying ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              <span className="absolute inset-0 bg-[var(--bg-void)]/35" />

              <div className="relative flex items-center gap-3">
                {[0, 1].map((reel) => (
                  <motion.div
                    key={reel}
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={
                      isPlaying
                        ? {
                            duration: 3.6 + reel * 0.5,
                            repeat: Infinity,
                            ease: "linear",
                          }
                        : { duration: 0.2 }
                    }
                    className="relative size-9 rounded-full border border-white/35 bg-[var(--bg-void)]/60"
                  >
                    <span className="absolute inset-1.5 rounded-full border border-white/15" />
                    <span className="absolute inset-2.5 rounded-full bg-[repeating-conic-gradient(from_0deg,rgba(255,255,255,0.35)_0deg,rgba(255,255,255,0.35)_8deg,transparent_8deg,transparent_30deg)]" />
                    <span className="absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--neon-primary)]/80" />
                  </motion.div>
                ))}
                <span className="absolute left-1/2 top-1/2 h-px w-3 -translate-x-1/2 bg-white/20" />
              </div>

              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[7px] uppercase tracking-[0.3em] text-white/30">
                Nexus // Tape 09
              </span>
            </motion.div>
          </div>

          <div className="flex h-8 items-end gap-1" aria-hidden="true">
            {Array.from({ length: EQ_BARS }, (_, index) => (
              <motion.span
                key={index}
                className="flex-1 origin-bottom bg-[var(--neon-primary)]/60"
                style={{ height: `${20 + ((index * 37) % 68)}%` }}
                animate={
                  isPlaying ? { scaleY: [0.35, 1, 0.55] } : { scaleY: 0.22 }
                }
                transition={{
                  duration: 0.8 + (index % 5) * 0.16,
                  repeat: isPlaying ? Infinity : 0,
                  repeatType: "mirror",
                  delay: index * 0.03,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.07] pt-2 font-mono text-[8px] uppercase tracking-[0.14em] text-white/30">
            <span className="tabular-nums text-white/50">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>
            <span>{video.transcript.length} segments</span>
          </div>
        </div>

        <div className="flex min-h-0 flex-col border border-white/[0.06] bg-white/[0.015] cyber-chamfer-sm">
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-3 py-2">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">
              Neural transcript
            </span>
            <span className="font-mono text-[8px] tabular-nums text-white/25">
              {formatDuration(nominalTime)}
            </span>
          </div>

          <div
            ref={scrollRef}
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
          >
            {video.transcript.map((segment, index) => {
              const isActive = index === activeIndex;
              return (
                <p
                  key={`${segment.timeSec}-${index}`}
                  ref={isActive ? activeRef : undefined}
                  className={cn(
                    "border-l-2 px-2.5 py-1.5 font-mono text-[10px] leading-relaxed transition-colors duration-200",
                    isActive
                      ? "border-[var(--neon-primary)] bg-[var(--neon-primary)]/[0.07] text-white/85"
                      : "border-transparent text-white/30",
                  )}
                >
                  <span className="mr-2 text-[8px] tabular-nums text-white/25">
                    {formatDuration(segment.timeSec)}
                  </span>
                  {segment.text}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
