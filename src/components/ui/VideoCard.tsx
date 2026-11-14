"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";
import { Play, ShieldCheck } from "lucide-react";

import { CyberCard } from "@/components/ui/CyberCard";
import { HudBadge } from "@/components/ui/HudBadge";
import {
  cn,
  formatCompactNumber,
  formatDuration,
  formatRelativeTime,
} from "@/lib/utils";
import type { CssVariables } from "@/types/css";
import type { VideoEntity } from "@/types/schema";

export interface VideoCardProps {
  video: VideoEntity;
  /** Promotes the card to the bento hero treatment (larger media + synopsis). */
  featured?: boolean;
  className?: string;
}

/**
 * Tactical video module. Hovering arms the neon accent glow and scales the
 * thumbnail as a holographic preview readiness cue.
 */
export function VideoCard({
  video,
  featured = false,
  className,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const titleId = useId();

  const isLive = video.format === "live";
  const isShort = video.format === "short";

  return (
    <motion.article
      aria-labelledby={titleId}
      initial="rest"
      animate="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={
        { "--neon-primary": video.dominantColorHex } as CssVariables
      }
      className={cn(
        "h-full transition-shadow duration-300",
        isHovered && "neon-glow",
      )}
    >
      <CyberCard
        accent={video.dominantColorHex}
        chamfer={featured ? "lg" : "sm"}
        interactive
        className={cn("h-full overflow-hidden p-0", className)}
      >
        <div className="relative flex h-full min-h-0 flex-col">
          <div className="relative aspect-video w-full shrink-0 overflow-hidden border-b border-white/[0.06] md:aspect-auto md:min-h-0 md:flex-1">
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[#0b0f18]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `linear-gradient(155deg, ${video.dominantColorHex}4d, rgba(7, 8, 13, 0.75))`,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center"
            >
              <div className="flex flex-col items-center gap-2.5">
                <span
                  className={cn(
                    "grid place-items-center border border-white/10 bg-white/[0.02] cyber-chamfer-sm",
                    featured ? "size-20" : "size-12",
                  )}
                >
                  <span
                    className={cn(
                      "font-display font-bold uppercase tracking-[0.14em] text-white/20",
                      featured ? "text-3xl" : "text-lg",
                    )}
                  >
                    {video.channel.name.charAt(0)}
                  </span>
                </span>
                <span className="font-mono text-[7px] uppercase tracking-[0.28em] text-white/15">
                  Signal // {video.category}
                </span>
              </div>
            </div>

            <motion.div
              variants={{
                rest: { scale: 1 },
                hover: { scale: 1.055 },
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${video.thumbnailUrl})`,
              }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, ${video.dominantColorHex}33, transparent 58%)`,
              }}
            />

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-carbon-grid opacity-20"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[var(--bg-void)] via-[var(--bg-void)]/10 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 hud-scanlines opacity-10"
            />

            <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap items-center gap-1.5">
              {featured ? (
                <HudBadge tone="primary" variant="solid" size="sm">
                  Featured
                </HudBadge>
              ) : null}
              {isLive ? (
                <HudBadge tone="danger" variant="solid" size="sm" pulse>
                  Live
                </HudBadge>
              ) : null}
              {isShort ? (
                <HudBadge tone="warning" variant="ghost" size="sm">
                  Short
                </HudBadge>
              ) : null}
            </div>

            <div className="absolute bottom-2.5 right-2.5 z-10">
              <HudBadge
                tone="neutral"
                variant="ghost"
                size="sm"
                className="border-white/15 bg-[var(--bg-void)]/80 text-white/80 backdrop-blur-sm"
              >
                {formatDuration(video.durationSec)}
              </HudBadge>
            </div>

            <motion.div
              aria-hidden="true"
              variants={{
                rest: { opacity: 0, scale: 0.88 },
                hover: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
            >
              <span
                className="grid size-11 place-items-center border bg-[var(--bg-void)]/55 backdrop-blur-md cyber-chamfer-sm"
                style={{
                  borderColor: `${video.dominantColorHex}99`,
                  color: video.dominantColorHex,
                  boxShadow: `0 0 26px -6px ${video.dominantColorHex}`,
                }}
              >
                <Play className="size-4 fill-current" />
              </span>
            </motion.div>
          </div>

          <div
            className={cn(
              "flex shrink-0 flex-col",
              featured ? "p-4 sm:p-5" : "p-3.5",
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  "shrink-0 border border-white/15 bg-cover bg-center cyber-chamfer-sm",
                  featured ? "size-6" : "size-5",
                )}
                style={{
                  backgroundColor: "#0b0f18",
                  backgroundImage: `linear-gradient(140deg, ${video.dominantColorHex}55, #0b0f18), url(${video.channel.avatarUrl})`,
                }}
              />

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate font-mono text-[9px] uppercase tracking-[0.16em] text-white/50">
                    {video.channel.name}
                  </span>
                  {video.channel.isVerified ? (
                    <ShieldCheck className="size-3 shrink-0 text-[var(--neon-success)]" />
                  ) : null}
                </span>
                {featured ? (
                  <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">
                    {video.channel.handle}
                  </span>
                ) : null}
              </span>

              <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
                {formatRelativeTime(video.publishedAt)}
              </span>
            </div>

            <h3
              id={titleId}
              className={cn(
                "font-display font-semibold uppercase text-white/90",
                featured
                  ? "mt-3 line-clamp-2 text-lg leading-snug tracking-[0.01em] sm:text-xl lg:text-2xl"
                  : "mt-2.5 line-clamp-2 text-[14px] leading-snug tracking-[0.02em]",
              )}
            >
              {video.title}
            </h3>

            {featured ? (
              <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-white/40 sm:text-sm">
                {video.description}
              </p>
            ) : null}

            <div className="mt-auto flex items-center justify-between gap-3 pt-3 font-mono text-[9px] uppercase tracking-[0.14em] text-white/30">
              <span className="tabular-nums">
                {formatCompactNumber(video.viewsCount)} views
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1"
                  style={{ backgroundColor: video.dominantColorHex }}
                />
                <span className="text-white/25">{video.category}</span>
              </span>
            </div>
          </div>
        </div>
      </CyberCard>
    </motion.article>
  );
}
