"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { LayoutGrid, RefreshCw, TriangleAlert } from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { NeonButton } from "@/components/ui/NeonButton";
import { AlgorithmEqualizer } from "@/features/equalizer/AlgorithmEqualizer";
import { BentoVideoGrid } from "@/features/home/BentoVideoGrid";
import { apiClient } from "@/services/api-client";
import { useAppStore } from "@/stores/useAppStore";
import type { EqualizerWeights } from "@/types/schema";

/** Faders update instantly; the ranked query settles after a short idle beat. */
const RERANK_DEBOUNCE_MS = 240;

export default function HomePage() {
  const equalizerWeights = useAppStore((state) => state.equalizerWeights);
  const [rankedWeights, setRankedWeights] =
    useState<EqualizerWeights>(equalizerWeights);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setRankedWeights(equalizerWeights),
      RERANK_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [equalizerWeights]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["videos", rankedWeights],
    queryFn: () => apiClient.getVideos(rankedWeights),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

  const videos = data ?? [];
  const signalCount = videos.length;
  const mode = equalizerWeights.chronoPure ? "Chrono-pure" : "Adaptive mix";
  const feedStatus = isFetching ? "Syncing" : isError ? "Sync lost" : mode;
  const errorMessage =
    error instanceof Error ? error.message : "Uplink unavailable";

  return (
    <div className="relative isolate mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[460px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--neon-primary) 10%, transparent), transparent 66%)",
        }}
      />

      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[var(--neon-primary)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.34em] text-[var(--neon-primary)]">
              Home matrix / Phase 04
            </span>
          </div>
          <h1 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-semibold uppercase leading-[0.9] tracking-[-0.02em] text-white">
            Signal feed
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/45">
            Ranked in real time by your algorithm mix. Move a fader and the
            matrix re-sorts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <HudBadge
            tone={isError ? "danger" : "success"}
            variant="ghost"
            size="sm"
            dot
            pulse={!isError}
          >
            {isError ? "Feed offline" : "Feed online"}
          </HudBadge>
          <HudBadge tone="neutral" variant="ghost" size="sm">
            {signalCount.toString().padStart(2, "0")} signals
          </HudBadge>
          <HudBadge
            tone={isError ? "danger" : "primary"}
            variant="ghost"
            size="sm"
            dot
            pulse={isFetching}
          >
            {feedStatus}
          </HudBadge>
        </div>
      </header>

      <div className="mt-6">
        <AlgorithmEqualizer />
      </div>

      <div className="mt-8" aria-busy={isFetching}>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] pb-3">
          <div className="flex items-center gap-2">
            <LayoutGrid className="size-3.5 text-[var(--neon-primary)]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-white/40">
              Bento matrix
            </span>
          </div>
          <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
            {isFetching ? "Re-ranking" : `${signalCount} nodes`}
          </span>
        </div>

        <div className="mt-4">
          {isLoading ? (
            <FeedSkeleton />
          ) : isError && videos.length === 0 ? (
            <FeedError
              message={errorMessage}
              onRetry={() => {
                void refetch();
              }}
            />
          ) : (
            <BentoVideoGrid videos={videos} />
          )}
        </div>
      </div>

      <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
        <span className="flex items-center gap-2">
          <span className="size-1 bg-[var(--neon-primary)]" />
          Nexus Stream / Home matrix
        </span>
        <span>
          {mode} / {signalCount} signals
        </span>
      </footer>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div role="status" aria-label="Loading ranked feed">
      <span className="sr-only">Loading ranked feed</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-1 gap-4 md:auto-rows-[320px] md:grid-cols-2 lg:grid-cols-3"
      >
        <div className="relative min-h-[320px] overflow-hidden border border-white/[0.06] bg-elevated/40 cyber-chamfer-lg md:col-span-2 md:row-span-2">
          <div className="absolute inset-0 bg-carbon-grid opacity-70" />
          <div className="absolute inset-0 animate-pulse bg-[linear-gradient(120deg,rgba(255,255,255,0.035),transparent_60%)]" />
          <div className="absolute inset-x-5 bottom-5 space-y-3">
            <div className="h-2 w-24 bg-white/[0.07]" />
            <div className="h-5 w-2/3 bg-white/[0.08]" />
            <div className="h-2 w-1/2 bg-white/[0.05]" />
          </div>
        </div>

        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="relative min-h-[260px] overflow-hidden border border-white/[0.06] bg-elevated/40 cyber-chamfer-sm md:min-h-0"
          >
            <div className="absolute inset-0 bg-carbon-grid opacity-60" />
            <div className="absolute inset-0 animate-pulse bg-white/[0.02]" />
            <div className="absolute inset-x-4 bottom-4 space-y-2">
              <div className="h-2 w-3/4 bg-white/[0.07]" />
              <div className="h-2 w-1/2 bg-white/[0.05]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FeedError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="cyber-glass flex flex-col items-center gap-3 border border-[var(--neon-danger)]/25 px-6 py-14 text-center cyber-chamfer-lg">
      <span className="grid size-11 place-items-center border border-[var(--neon-danger)]/40 bg-[var(--neon-danger)]/10 cyber-chamfer-sm">
        <TriangleAlert className="size-5 text-[var(--neon-danger)]" />
      </span>
      <p className="font-display text-[11px] uppercase tracking-[0.24em] text-white/65">
        Feed sync failed
      </p>
      <p className="max-w-sm font-mono text-[9px] leading-relaxed text-white/35">
        {message}
      </p>
      <NeonButton
        variant="ghost"
        size="sm"
        leftIcon={<RefreshCw />}
        onClick={onRetry}
      >
        Retry uplink
      </NeonButton>
    </div>
  );
}
