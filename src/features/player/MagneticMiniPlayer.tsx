"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import {
  ArrowUpRight,
  AudioLines,
  GripHorizontal,
  Pause,
  Play,
  X,
} from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { useMediaSession } from "@/features/player/useMediaSession";
import { apiClient } from "@/services/api-client";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";

/** Viewport gutter kept between the HUD card and the screen edge while dragging. */
const DRAG_PADDING = 16;
/** Anchors mirrored from the card classes: `left-4` / `bottom-24`. */
const ANCHOR_LEFT = 16;
const ANCHOR_BOTTOM = 96;

interface DragBounds {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;
}

const ZERO_BOUNDS: DragBounds = { left: 0, right: 0, top: 0, bottom: 0 };

/**
 * Draggable magnetic mini-player.
 *
 * Mounted once in the main shell, so it survives route changes and keeps the
 * active transmission reachable from every surface. Dragging is bounded to the
 * viewport with a fixed gutter; momentum is disabled so the card never flings
 * off-screen or overshoots the HUD grid.
 */
export function MagneticMiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const activeVideoId = usePlayerStore((state) => state.activeVideoId);
  const isPipMode = usePlayerStore((state) => state.isPipMode);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const currentTime = usePlayerStore((state) => state.currentTime);
  const duration = usePlayerStore((state) => state.duration);
  const ambientColorHex = usePlayerStore((state) => state.ambientColorHex);
  const audioDeckMode = usePlayerStore((state) => state.audioDeckMode);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setCurrentTime = usePlayerStore((state) => state.setCurrentTime);
  const toggleAudioDeck = usePlayerStore((state) => state.toggleAudioDeck);
  const clearActiveVideo = usePlayerStore((state) => state.clearActiveVideo);

  const dragControls = useDragControls();
  const cardRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<DragBounds>(ZERO_BOUNDS);

  const watchHref = activeVideoId === null ? null : `/watch/${activeVideoId}`;
  const isOnWatchRoute =
    activeVideoId !== null && pathname === `/watch/${activeVideoId}`;

  // Visible off-route always; on-route only while the user explicitly popped
  // playback out into picture-in-picture.
  const isVisible = activeVideoId !== null && (!isOnWatchRoute || isPipMode);

  const { data: video } = useQuery({
    queryKey: ["video", activeVideoId],
    queryFn: () => {
      if (activeVideoId === null) {
        throw new Error("No active transmission");
      }
      return apiClient.getVideoById(activeVideoId);
    },
    enabled: activeVideoId !== null && isVisible,
    staleTime: 60_000,
  });

  /* -- Drag bounds, recomputed on resize while visible -------------- */
  useEffect(() => {
    if (!isVisible) return;

    const measure = (): void => {
      const element = cardRef.current;
      if (!element) return;

      const width = element.offsetWidth;
      const height = element.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      setBounds({
        left: Math.min(0, DRAG_PADDING - ANCHOR_LEFT),
        right: Math.max(0, viewportWidth - DRAG_PADDING - ANCHOR_LEFT - width),
        top: Math.min(
          0,
          DRAG_PADDING - (viewportHeight - ANCHOR_BOTTOM - height),
        ),
        bottom: Math.max(0, ANCHOR_BOTTOM - DRAG_PADDING),
      });
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [isVisible]);

  const constraints = useMemo(
    () => ({
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
    }),
    [bounds],
  );

  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo): void => {
      triggerHaptic("tick");
    },
    [],
  );

  const handleTogglePlay = useCallback((): void => {
    triggerHaptic("tick");
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  const handleToggleAudioDeck = useCallback((): void => {
    triggerHaptic("tick");
    toggleAudioDeck();
  }, [toggleAudioDeck]);

  const handleClose = useCallback((): void => {
    triggerHaptic("pulse");
    clearActiveVideo();
  }, [clearActiveVideo]);

  const handleReturn = useCallback((): void => {
    triggerHaptic("tick");
    setIsPlaying(false);
    if (watchHref) router.push(watchHref);
  }, [router, setIsPlaying, watchHref]);

  const mediaSource = useMemo(
    () =>
      video && activeVideoId !== null
        ? {
            id: video.id,
            title: video.title,
            channelName: video.channel.name,
            thumbnailUrl: video.thumbnailUrl,
            durationSec: duration > 0 ? duration : video.durationSec,
          }
        : null,
    [video, activeVideoId, duration],
  );

  const handleMediaSeek = useCallback(
    (targetSec: number): void => {
      setCurrentTime(targetSec);
      usePlayerStore.getState().requestSeek(targetSec);
    },
    [setCurrentTime],
  );

  // Only owns the OS media UI while it is the visible playback surface.
  useMediaSession(isVisible ? mediaSource : null, {
    currentTime,
    isPlaying,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onSeek: handleMediaSeek,
    // Beats the in-page player: a popped-out HUD stays the primary surface.
    priority: 1,
  });

  const progress =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <AnimatePresence>
      {isVisible && watchHref ? (
        <motion.aside
          key="magnetic-mini-player"
          ref={cardRef}
          role="region"
          aria-label={t.miniPlayer.region}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragConstraints={constraints}
          dragElastic={0.04}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.94 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          style={{
            borderColor: `${ambientColorHex}66`,
            boxShadow: `0 0 36px -18px ${ambientColorHex}, 0 18px 44px -24px rgba(0,0,0,0.9)`,
          }}
          className={cn(
            "cyber-glass fixed bottom-24 left-4 z-[70] w-[min(86vw,308px)]",
            "border bg-[var(--bg-void)]/85 cyber-chamfer-sm",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              backgroundImage: `linear-gradient(to right, transparent, ${ambientColorHex}, transparent)`,
            }}
          />

          <div className="flex items-center gap-1.5 px-2 pt-1.5">
            <button
              type="button"
              aria-label={t.miniPlayer.dragHint}
              title={t.miniPlayer.dragHint}
              onPointerDown={(event) => {
                event.preventDefault();
                dragControls.start(event);
              }}
              className="flex h-5 w-8 cursor-grab items-center justify-center rounded-sm text-white/30 transition-colors hover:text-[var(--neon-primary)] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neon-primary)]/60"
            >
              <GripHorizontal className="size-3.5" />
            </button>

            <span className="font-mono text-[8px] uppercase tracking-[0.24em] text-white/35">
              {t.miniPlayer.nowPlaying}
            </span>

            <span className="ml-auto" />

            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                isPlaying ? "animate-pulse" : "opacity-40",
              )}
              style={{ backgroundColor: ambientColorHex }}
            />

            <button
              type="button"
              onClick={handleClose}
              aria-label={t.miniPlayer.close}
              title={t.miniPlayer.close}
              className="grid size-5 place-items-center text-white/35 transition-colors hover:text-[var(--neon-danger)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neon-danger)]/60"
            >
              <X className="size-3" />
            </button>
          </div>

          <div className="flex items-stretch gap-2 px-2 pb-2 pt-1.5">
            <div
              aria-hidden="true"
              className="relative h-14 w-20 shrink-0 overflow-hidden border border-white/[0.08] cyber-chamfer-sm"
              style={{
                backgroundImage: video
                  ? `linear-gradient(150deg, ${ambientColorHex}55, rgba(7,8,13,0.72)), url(${video.thumbnailUrl})`
                  : undefined,
                backgroundColor: "#0b0f18",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {isPlaying ? (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-white/10">
                  <span
                    className="block h-full"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: ambientColorHex,
                    }}
                  />
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium leading-tight text-white">
                {video?.title ?? t.miniPlayer.nowPlaying}
              </p>
              <p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-[0.16em] text-white/40">
                {video?.channel.name ?? "—"}
              </p>

              <div className="mt-1 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? t.miniPlayer.pause : t.miniPlayer.play}
                  aria-pressed={isPlaying}
                  title={isPlaying ? t.miniPlayer.pause : t.miniPlayer.play}
                  className="grid size-6 place-items-center border border-[var(--neon-primary)]/40 bg-[var(--neon-primary)]/10 text-[var(--neon-primary)] transition-colors hover:bg-[var(--neon-primary)]/20 cyber-chamfer-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neon-primary)]/60"
                >
                  {isPlaying ? (
                    <Pause className="size-3 fill-current" />
                  ) : (
                    <Play className="size-3 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleToggleAudioDeck}
                  aria-label={t.player.audioDeck}
                  aria-pressed={audioDeckMode}
                  title={t.player.audioDeck}
                  className={cn(
                    "grid size-6 place-items-center border transition-colors cyber-chamfer-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neon-secondary)]/60",
                    audioDeckMode
                      ? "border-[var(--neon-secondary)]/55 bg-[var(--neon-secondary)]/15 text-[var(--neon-secondary)]"
                      : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white",
                  )}
                >
                  <AudioLines className="size-3" />
                </button>

                {audioDeckMode ? (
                  <HudBadge tone="secondary" variant="ghost" size="sm">
                    {t.player.audioChip}
                  </HudBadge>
                ) : null}

                <span className="ml-auto font-mono text-[8px] tabular-nums tracking-[0.08em] text-white/35">
                  {formatDuration(currentTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.06]">
            <Link
              href={watchHref}
              onClick={handleReturn}
              className="flex items-center justify-center gap-1.5 px-2 py-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-white/55 transition-colors hover:bg-[var(--neon-primary)]/10 hover:text-[var(--neon-primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--neon-primary)]/60"
            >
              {t.miniPlayer.returnToWatch}
              <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
