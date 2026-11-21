"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Crosshair } from "lucide-react";
import Link from "next/link";

import { VideoCard } from "@/components/ui/VideoCard";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { VideoEntity } from "@/types/schema";

export interface BentoVideoGridProps {
  videos: VideoEntity[];
}

/**
 * Asymmetric Home Matrix. The highest-ranked video becomes the hero module and
 * every re-rank animates through shared layout physics.
 */
export function BentoVideoGrid({ videos }: BentoVideoGridProps) {
  const { t } = useI18n();

  if (videos.length === 0) {
    return <EmptyMatrix />;
  }

  return (
    <motion.section
      layout
      aria-label={t.home.matrixAria}
      className="grid grid-cols-1 gap-4 md:auto-rows-[320px] md:grid-cols-2 lg:grid-cols-3"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {videos.map((video, index) => {
          const isHero = index === 0;

          return (
            <motion.div
              key={video.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              className={cn(
                "min-h-0",
                isHero && "md:col-span-2 md:row-span-2",
              )}
            >
              <Link
                href={`/watch/${video.id}`}
                className="block h-full"
                aria-label={`Watch ${video.title}`}
              >
                <VideoCard video={video} featured={isHero} />
              </Link>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.section>
  );
}

function EmptyMatrix() {
  return (
    <div className="cyber-glass flex flex-col items-center gap-3 border border-white/[0.07] px-6 py-16 text-center cyber-chamfer-lg">
      <span className="grid size-12 place-items-center border border-white/10 bg-white/[0.02] cyber-chamfer-sm">
        <Crosshair className="size-5 text-white/30" />
      </span>
      <p className="font-display text-[11px] uppercase tracking-[0.26em] text-white/60">
        No signals in this mix
      </p>
      <p className="max-w-xs font-mono text-[9px] uppercase leading-relaxed tracking-[0.12em] text-white/25">
        Move a fader or engage nuke reset to repopulate the matrix
      </p>
    </div>
  );
}
