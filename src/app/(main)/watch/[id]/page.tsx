"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Headphones,
  Radar,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { NeonButton } from "@/components/ui/NeonButton";
import { CyberVideoPlayer } from "@/features/player/CyberVideoPlayer";
import { TabbedCommentMatrix } from "@/features/comments/TabbedCommentMatrix";
import { apiClient } from "@/services/api-client";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useI18n } from "@/lib/i18n";
import { formatCompactNumber, formatRelativeTime } from "@/lib/utils";
import type { CssVariables } from "@/types/css";
import type { VideoEntity } from "@/types/schema";

export default function WatchPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const videoId = params.id;

  const setActiveVideo = usePlayerStore((state) => state.setActiveVideo);
  const setAmbientColor = usePlayerStore((state) => state.setAmbientColor);
  const ambientColorHex = usePlayerStore((state) => state.ambientColorHex);

  const {
    data: video,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["video", videoId],
    queryFn: () => apiClient.getVideoById(videoId),
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!video?.id) return;

    if (usePlayerStore.getState().activeVideoId !== video.id) {
      setActiveVideo(video.id);
    }
    setAmbientColor(video.dominantColorHex);
    document.title = `${video.title} // NEXUS STREAM`;

    return () => {
      document.title = "NEXUS STREAM // Cyber-HUD";
    };
  }, [
    video?.id,
    video?.dominantColorHex,
    video?.title,
    setActiveVideo,
    setAmbientColor,
  ]);

  const errorMessage =
    error instanceof Error ? error.message : t.home.uplinkUnavailable;

  return (
    <div
      className="relative isolate mx-auto w-full max-w-[1440px] px-4 pb-12 pt-6 sm:px-6 lg:px-8"
      style={{ "--neon-primary": ambientColorHex } as CssVariables}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--neon-primary) 12%, transparent), transparent 68%)",
        }}
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 transition-colors hover:text-[var(--neon-primary)]"
        >
          <ArrowLeft className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
          {t.watch.back}
        </Link>

        <div className="flex items-center gap-2">
          <HudBadge tone="primary" variant="ghost" size="sm" dot>
            {t.watch.node}
          </HudBadge>
          <HudBadge tone="neutral" variant="ghost" size="sm">
            {video?.format ?? t.watch.formatFallback}
          </HudBadge>
        </div>
      </div>

      {isLoading ? (
        <WatchSkeleton />
      ) : video ? (
        <WatchContent video={video} />
      ) : (
        <WatchError
          message={isError ? errorMessage : t.watch.notFound}
          onRetry={() => {
            void refetch();
          }}
        />
      )}
    </div>
  );
}

function WatchContent({ video }: { video: VideoEntity }) {
  const requestSeek = usePlayerStore((state) => state.requestSeek);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
      <div className="min-w-0">
        <CyberVideoPlayer key={video.id} video={video} />
        <VideoMetadata video={video} />
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <TabbedCommentMatrix videoId={video.id} onSeek={requestSeek} compact />

        <SignalIntel video={video} />
      </aside>
    </div>
  );
}

function VideoMetadata({ video }: { video: VideoEntity }) {
  const { t } = useI18n();
  const scores = [
    {
      label: t.watch.scoreNovelty,
      value: video.noveltyScore,
      color: "var(--neon-primary)",
    },
    {
      label: t.watch.scoreDepth,
      value: video.complexityScore,
      color: "var(--neon-secondary)",
    },
    {
      label: t.watch.scoreHype,
      value: video.hypeScore,
      color: "var(--neon-warning)",
    },
  ] as const;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-2">
        <HudBadge tone="primary" variant="ghost" size="sm">
          {video.category}
        </HudBadge>
        <HudBadge tone="neutral" variant="ghost" size="sm">
          {video.format}
        </HudBadge>
        {video.parentLongVideoId ? (
          <HudBadge tone="warning" variant="ghost" size="sm">
            {t.watch.clip}
          </HudBadge>
        ) : null}
      </div>

      <h1 className="mt-3 font-display text-xl font-semibold uppercase leading-tight tracking-[-0.01em] text-white sm:text-2xl lg:text-3xl">
        {video.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-y border-white/[0.07] py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-9 shrink-0 border border-white/15 bg-cover bg-center cyber-chamfer-sm"
            style={{
              backgroundColor: "#0b0f18",
              backgroundImage: `linear-gradient(140deg, ${video.dominantColorHex}55, #0b0f18), url(${video.channel.avatarUrl})`,
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-display text-[11px] uppercase tracking-[0.14em] text-white/80">
                {video.channel.name}
              </span>
              {video.channel.isVerified ? (
                <ShieldCheck className="size-3 shrink-0 text-[var(--neon-success)]" />
              ) : null}
            </div>
            <p className="mt-1 truncate font-mono text-[8px] uppercase tracking-[0.14em] text-white/30">
              {video.channel.handle} ·{" "}
              {formatCompactNumber(video.channel.subscribersCount)}{" "}
              {t.watch.subscribers}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/40 sm:text-[10px]">
          <span className="tabular-nums">
            {formatCompactNumber(video.viewsCount)} {t.watch.views}
          </span>
          <span className="size-1 bg-white/20" />
          <span>{formatRelativeTime(video.publishedAt)}</span>
        </div>
      </div>

      <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/45">
        {video.description}
      </p>

      <Link
        href={`/lounge/nexus-alpha?videoId=${encodeURIComponent(video.id)}`}
        className="mt-4 inline-flex items-center gap-2 border border-cyan-200/25 px-3 py-2 font-display text-[10px] uppercase tracking-[0.14em] text-cyan-100/85 transition-colors hover:border-cyan-200/55 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"
      >
        <Headphones className="size-4" />
        {t.player.loungeCta}
      </Link>

      <div className="mt-4 flex flex-wrap gap-2">
        {scores.map((score) => (
          <HudBadge
            key={score.label}
            tone="neutral"
            variant="ghost"
            size="sm"
          >
            {score.label} {score.value}
          </HudBadge>
        ))}
      </div>
    </div>
  );
}

function SignalIntel({ video }: { video: VideoEntity }) {
  const { t } = useI18n();
  const scores = [
    {
      label: t.watch.scoreNovelty,
      value: video.noveltyScore,
      color: "var(--neon-primary)",
    },
    {
      label: t.watch.scoreDepth,
      value: video.complexityScore,
      color: "var(--neon-secondary)",
    },
    {
      label: t.watch.scoreHype,
      value: video.hypeScore,
      color: "var(--neon-warning)",
    },
  ] as const;

  return (
    <div className="cyber-glass border border-white/[0.07] cyber-chamfer-sm">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <Radar className="size-3.5 text-[var(--neon-primary)]" />
          <span className="font-display text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
            {t.watch.signalIntel}
          </span>
        </div>
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
          {t.watch.markers.replace("NN", String(video.heatmap.length))}
        </span>
      </div>

      <div className="space-y-3 p-4">
        {scores.map((score) => (
          <div key={score.label}>
            <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.14em]">
              <span className="text-white/35">{score.label}</span>
              <span className="tabular-nums text-white/60">
                {score.value.toString().padStart(3, "0")}
              </span>
            </div>
            <div className="mt-1.5 h-0.5 w-full bg-white/10">
              <div
                className="h-0.5"
                style={{
                  width: `${score.value}%`,
                  backgroundColor: score.color,
                  boxShadow: `0 0 8px ${score.color}`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WatchSkeleton() {
  const { t } = useI18n();

  return (
    <div role="status" aria-label={t.watch.loadingAria}>
      <span className="sr-only">{t.watch.loadingAria}</span>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <div>
          <div className="relative aspect-video overflow-hidden border border-white/[0.06] bg-elevated/40 cyber-chamfer-lg">
            <div className="absolute inset-0 bg-carbon-grid opacity-60" />
            <div className="absolute inset-0 animate-pulse bg-white/[0.02]" />
          </div>
          <div className="mt-5 space-y-3">
            <div className="h-3 w-24 bg-white/[0.06]" />
            <div className="h-7 w-3/4 bg-white/[0.08]" />
            <div className="h-3 w-1/2 bg-white/[0.05]" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-48 overflow-hidden border border-white/[0.06] bg-elevated/40 cyber-chamfer-sm">
            <div className="h-full w-full bg-carbon-grid opacity-60" />
          </div>
          <div className="h-36 overflow-hidden border border-white/[0.06] bg-elevated/40 cyber-chamfer-sm">
            <div className="h-full w-full bg-carbon-grid opacity-60" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WatchError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="cyber-glass flex flex-col items-center gap-3 border border-[var(--neon-danger)]/25 px-6 py-16 text-center cyber-chamfer-lg">
      <span className="grid size-11 place-items-center border border-[var(--neon-danger)]/40 bg-[var(--neon-danger)]/10 cyber-chamfer-sm">
        <TriangleAlert className="size-5 text-[var(--neon-danger)]" />
      </span>
      <p className="font-display text-[11px] uppercase tracking-[0.24em] text-white/65">
        {t.watch.errorTitle}
      </p>
      <p className="max-w-sm font-mono text-[9px] leading-relaxed text-white/35">
        {message}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <NeonButton
          variant="ghost"
          size="sm"
          leftIcon={<RefreshCw />}
          onClick={onRetry}
        >
          {t.watch.retry}
        </NeonButton>
        <Link
          href="/"
          className="inline-flex h-8 items-center border border-white/[0.12] bg-white/[0.02] px-3 font-display text-[10px] uppercase tracking-[0.16em] text-white/55 cyber-chamfer-sm transition-colors hover:text-white"
        >
          {t.watch.returnHome}
        </Link>
      </div>
    </div>
  );
}
