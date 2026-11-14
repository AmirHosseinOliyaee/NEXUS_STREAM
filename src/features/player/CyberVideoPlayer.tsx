"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  Crosshair,
  Maximize,
  Minimize,
  Pause,
  Play,
  ShieldCheck,
  ShieldOff,
  Volume2,
  VolumeX,
} from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { AudioDeckMode } from "@/features/player/AudioDeckMode";
import { EmotionalPulseTimeline } from "@/features/player/EmotionalPulseTimeline";
import { triggerHaptic } from "@/lib/haptics";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { CssVariables } from "@/types/css";
import type { VideoEntity } from "@/types/schema";

export interface CyberVideoPlayerProps {
  video: VideoEntity;
}

/** Bundled tactical clip used when a remote mock URL is unavailable. */
const LOCAL_MOCK_FEED = "/mocks/nexus-sample.mp4";

interface ControlButtonProps {
  label: string;
  onClick: () => void;
  children: ReactNode;
  active?: boolean;
  pressed?: boolean;
  className?: string;
}

function ControlButton({
  label,
  onClick,
  children,
  active = false,
  pressed,
  className,
}: ControlButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      className={cn(
        "flex h-8 items-center gap-1.5 border px-2 font-mono text-[8px] uppercase tracking-[0.14em] transition-colors duration-200 cyber-chamfer-sm",
        active
          ? "border-[var(--neon-primary)]/55 bg-[var(--neon-primary)]/10 text-[var(--neon-primary)]"
          : "border-white/[0.08] bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

/**
 * Tactical playback engine: custom chrome, ambient glow, emotional scrubber,
 * sponsor bypass and the audio-deck mode, all synchronized with the player
 * store and a precise HTMLVideoElement ref.
 */
export function CyberVideoPlayer({ video }: CyberVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const lastSkippedRef = useRef<string | null>(null);

  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const volume = usePlayerStore((state) => state.volume);
  const audioDeckMode = usePlayerStore((state) => state.audioDeckMode);
  const setIsPlaying = usePlayerStore((state) => state.setIsPlaying);
  const setVolume = usePlayerStore((state) => state.setVolume);
  const setCurrentTimeStore = usePlayerStore((state) => state.setCurrentTime);
  const setDurationStore = usePlayerStore((state) => state.setDuration);
  const toggleAudioDeck = usePlayerStore((state) => state.toggleAudioDeck);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(video.durationSec);
  const [sponsorShield, setSponsorShield] = useState(true);
  const [sponsorNotice, setSponsorNotice] = useState(false);
  const [isFullscreen, setFullscreen] = useState(false);
  const [useLocalFeed, setUseLocalFeed] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [hasMediaError, setHasMediaError] = useState(false);

  const videoSource = useLocalFeed ? LOCAL_MOCK_FEED : video.videoUrl;

  const durationScale =
    video.durationSec > 0 ? duration / video.durationSec : 1;

  const scaledHeatmap = useMemo(
    () =>
      video.heatmap.map((marker) => ({
        ...marker,
        timestampSec: marker.timestampSec * durationScale,
        durationSec: marker.durationSec * durationScale,
      })),
    [video.heatmap, durationScale],
  );

  const sponsorMarkers = useMemo(
    () => scaledHeatmap.filter((marker) => marker.emotion === "sponsor"),
    [scaledHeatmap],
  );

  useEffect(() => {
    setCurrentTime(0);
    setDuration(video.durationSec);
    setCurrentTimeStore(0);
    setDurationStore(video.durationSec);
    lastSkippedRef.current = null;
    setSponsorNotice(false);
    setUseLocalFeed(false);
    setHasFrame(false);
    setHasMediaError(false);
  }, [
    video.id,
    video.durationSec,
    setCurrentTimeStore,
    setDurationStore,
  ]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    if (isPlaying) {
      if (element.paused) {
        void element.play().catch(() => {
          setIsPlaying(false);
        });
      }
    } else if (!element.paused) {
      element.pause();
    }
  }, [isPlaying, setIsPlaying]);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    element.volume = volume;
    element.muted = volume === 0;
  }, [volume]);

  useEffect(() => {
    const onChange = (): void => {
      setFullscreen(document.fullscreenElement === shellRef.current);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
      setIsPlaying(false);
    };
  }, [setIsPlaying]);

  const handleSeek = useCallback(
    (seconds: number, resetShieldGuard = false): void => {
      const element = videoRef.current;
      const maxDuration = duration > 0 ? duration : video.durationSec;
      const target = Math.min(Math.max(seconds, 0), maxDuration);

      if (element) {
        try {
          element.currentTime = target;
        } catch {
          // Ignore seeks attempted before the media has metadata.
        }
      }

      setCurrentTime(target);
      setCurrentTimeStore(target);
      if (resetShieldGuard) lastSkippedRef.current = null;
    },
    [duration, video.durationSec, setCurrentTimeStore],
  );

  useEffect(() => {
    if (!sponsorShield) {
      lastSkippedRef.current = null;
      return;
    }

    const activeMarker = sponsorMarkers.find(
      (marker) =>
        currentTime >= marker.timestampSec &&
        currentTime < marker.timestampSec + marker.durationSec,
    );

    if (!activeMarker) {
      lastSkippedRef.current = null;
      return;
    }

    if (lastSkippedRef.current === activeMarker.id) return;
    lastSkippedRef.current = activeMarker.id;

    const target = Math.min(
      activeMarker.timestampSec + activeMarker.durationSec + 0.15,
      duration,
    );
    handleSeek(target);
    triggerHaptic("pulse");
    setSponsorNotice(true);
  }, [currentTime, sponsorShield, sponsorMarkers, duration, handleSeek]);

  useEffect(() => {
    if (!sponsorNotice) return;
    const timeout = window.setTimeout(() => setSponsorNotice(false), 2600);
    return () => window.clearTimeout(timeout);
  }, [sponsorNotice]);

  const handleTogglePlay = useCallback((): void => {
    triggerHaptic("tick");
    const element = videoRef.current;
    if (element?.ended) {
      handleSeek(0, true);
    }
    setIsPlaying(!isPlaying);
  }, [handleSeek, isPlaying, setIsPlaying]);

  const handleToggleMute = (): void => {
    triggerHaptic("tick");
    setVolume(volume === 0 ? 0.8 : 0);
  };

  const handleToggleShield = (): void => {
    triggerHaptic("tick");
    lastSkippedRef.current = null;
    setSponsorShield((armed) => !armed);
  };

  const handleToggleAudioDeck = (): void => {
    triggerHaptic("tick");
    toggleAudioDeck();
  };

  const handleToggleFullscreen = useCallback((): void => {
    triggerHaptic("tick");
    const shell = shellRef.current;
    if (!shell) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined);
      return;
    }

    if (typeof shell.requestFullscreen === "function") {
      void shell.requestFullscreen().catch(() => undefined);
    }
  }, []);

  const handleLoadedMetadata = (): void => {
    const element = videoRef.current;
    if (!element) return;

    const mediaDuration =
      Number.isFinite(element.duration) && element.duration > 0
        ? element.duration
        : video.durationSec;

    setDuration(mediaDuration);
    setDurationStore(mediaDuration);
    element.volume = volume;
  };

  const handleTimeUpdate = (): void => {
    const element = videoRef.current;
    if (!element) return;
    setCurrentTime(element.currentTime);
    setCurrentTimeStore(element.currentTime);
  };

  const handleVolumeChange = (): void => {
    const element = videoRef.current;
    if (!element) return;
    setVolume(element.volume);
  };

  const handleMediaError = (): void => {
    if (!useLocalFeed) {
      setUseLocalFeed(true);
      setHasFrame(false);
      return;
    }
    setHasMediaError(true);
  };

  const handleEnded = (): void => {
    setIsPlaying(false);
    setCurrentTime(duration);
    setCurrentTimeStore(duration);
  };

  return (
    <div
      ref={shellRef}
      className="player-shell relative isolate"
      style={{ boxShadow: "0 0 44px -20px var(--neon-primary)" }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-2 -z-10 bg-[var(--neon-primary)] blur-3xl"
        animate={{
          opacity: isPlaying ? [0.12, 0.24, 0.12] : 0.07,
        }}
        transition={
          isPlaying
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.4 }
        }
      />

      <div className="player-frame cyber-chamfer-lg relative overflow-hidden border border-white/10 bg-[#05060a]">
        <div
          className={cn(
            "player-media relative w-full overflow-hidden",
            audioDeckMode
              ? "min-h-[560px] lg:aspect-video lg:min-h-0"
              : "aspect-video",
          )}
        >
          <video
            ref={videoRef}
            src={videoSource}
            poster={video.thumbnailUrl}
            preload="metadata"
            playsInline
            onClick={handleTogglePlay}
            onLoadedMetadata={handleLoadedMetadata}
            onLoadedData={() => setHasFrame(true)}
            onDurationChange={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onVolumeChange={handleVolumeChange}
            onError={handleMediaError}
            aria-label={video.title}
            className={cn(
              "h-full w-full cursor-pointer object-cover",
              audioDeckMode && "pointer-events-none opacity-0",
            )}
          />

          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 z-[2] overflow-hidden transition-opacity duration-500",
              hasFrame ? "opacity-0" : "opacity-100",
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundColor: "#0b0f18",
                backgroundImage: `linear-gradient(150deg, ${video.dominantColorHex}55, rgba(7, 8, 13, 0.65)), url(${video.thumbnailUrl})`,
              }}
            />
            <div className="absolute inset-0 bg-[var(--bg-void)]/35" />
            <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
              <HudBadge tone="neutral" variant="ghost" size="sm">
                Signal standby
              </HudBadge>
              {useLocalFeed ? (
                <HudBadge tone="primary" variant="ghost" size="sm">
                  Local feed
                </HudBadge>
              ) : null}
              {hasMediaError ? (
                <HudBadge tone="danger" variant="ghost" size="sm">
                  Offline
                </HudBadge>
              ) : null}
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <Crosshair className="size-16 text-white/[0.08]" />
            </div>
          </div>

          {audioDeckMode ? (
            <AudioDeckMode
              video={video}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
            />
          ) : null}

          <AnimatePresence>
            {!isPlaying && !audioDeckMode ? (
              <motion.div
                key="paused-overlay"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
              >
                <span
                  className="grid size-16 place-items-center border border-white/25 bg-[var(--bg-void)]/55 text-white backdrop-blur-md cyber-chamfer-sm"
                  style={{
                    boxShadow: "0 0 32px -8px var(--neon-primary)",
                  }}
                >
                  <Play className="size-6 fill-current" />
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {sponsorNotice ? (
              <motion.div
                key="sponsor-notice"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="pointer-events-none absolute left-3 top-3 z-30"
              >
                <HudBadge tone="warning" variant="solid" size="sm" pulse>
                  Sponsor bypassed
                </HudBadge>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[var(--bg-void)]/95 via-[var(--bg-void)]/65 to-transparent px-2 pb-2 pt-6 sm:px-3 sm:pb-3 sm:pt-10">
            <EmotionalPulseTimeline
              currentTime={currentTime}
              duration={duration}
              onSeek={(seconds) => handleSeek(seconds, true)}
              heatmap={scaledHeatmap}
              sponsorShield={sponsorShield}
            />

            <div className="cyber-glass mt-1 flex items-center gap-1.5 border border-white/[0.08] px-2 py-1.5 cyber-chamfer-sm">
              <ControlButton
                label={isPlaying ? "Pause video" : "Play video"}
                onClick={handleTogglePlay}
                active={isPlaying}
                className="px-2.5"
              >
                {isPlaying ? (
                  <Pause className="size-3.5 fill-current" />
                ) : (
                  <Play className="size-3.5 fill-current" />
                )}
              </ControlButton>

              <ControlButton
                label={volume === 0 ? "Unmute" : "Mute"}
                onClick={handleToggleMute}
                active={volume === 0}
                pressed={volume === 0}
              >
                {volume === 0 ? (
                  <VolumeX className="size-3.5" />
                ) : (
                  <Volume2 className="size-3.5" />
                )}
              </ControlButton>

              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                aria-label="Volume"
                className="volume-fader hidden md:block"
                style={
                  {
                    "--volume": `${Math.round(volume * 100)}%`,
                  } as CssVariables
                }
              />

              <span className="ml-1 shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] tabular-nums text-white/55 sm:text-[10px]">
                {formatDuration(currentTime)}
                <span className="mx-1 text-white/20">/</span>
                {formatDuration(duration)}
              </span>

              <span className="ml-auto" />

              <ControlButton
                label={
                  sponsorShield ? "Disable sponsor shield" : "Enable sponsor shield"
                }
                onClick={handleToggleShield}
                active={sponsorShield}
                pressed={sponsorShield}
              >
                {sponsorShield ? (
                  <ShieldCheck className="size-3.5" />
                ) : (
                  <ShieldOff className="size-3.5" />
                )}
                <span className="hidden xl:inline">Shield</span>
              </ControlButton>

              <ControlButton
                label="Toggle audio deck"
                onClick={handleToggleAudioDeck}
                active={audioDeckMode}
                pressed={audioDeckMode}
              >
                <AudioLines className="size-3.5" />
                <span className="hidden xl:inline">Audio</span>
              </ControlButton>

              <ControlButton
                label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                onClick={handleToggleFullscreen}
                active={isFullscreen}
                pressed={isFullscreen}
              >
                {isFullscreen ? (
                  <Minimize className="size-3.5" />
                ) : (
                  <Maximize className="size-3.5" />
                )}
              </ControlButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
