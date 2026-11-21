"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";

import { useI18n } from "@/lib/i18n";
import { formatDuration } from "@/lib/utils";
import type { HoloCommentEntity } from "@/types/schema";

export interface HoloCommentsOverlayProps {
  comments: HoloCommentEntity[];
  currentTime: number;
  enabled: boolean;
}

/** Floating time-locked audience signals over the video viewport. */
export function HoloCommentsOverlay({ comments, currentTime, enabled }: HoloCommentsOverlayProps) {
  const { t } = useI18n();
  const activeComments = useMemo(
    () => comments.filter((comment) => Math.abs(comment.videoTimestampSec - currentTime) <= 3).slice(0, 4),
    [comments, currentTime],
  );

  return (
    <div aria-live="polite" aria-label={t.holo.aria} className="pointer-events-none absolute inset-x-0 top-12 z-[8] flex max-h-[48%] flex-col items-start gap-2 overflow-hidden px-3 sm:top-16 sm:px-5">
      <AnimatePresence initial={false}>
        {enabled
          ? activeComments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, x: -16, filter: "blur(5px)" }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, x: 12, filter: "blur(4px)" }}
                transition={{ duration: 0.2, delay: index * 0.035 }}
                className="flex max-w-[min(88%,34rem)] items-center gap-2 border border-white/15 bg-[var(--bg-void)]/80 px-2 py-1.5 text-white shadow-[0_8px_24px_-14px_rgba(0,0,0,0.9)] backdrop-blur-md cyber-chamfer-sm"
              >
                <img src={comment.author.avatarUrl} alt="" className="size-7 shrink-0 rounded-full border border-white/20 object-cover" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em]">
                    <span className="truncate text-[var(--neon-primary)]">{comment.author.handle}</span>
                    <span className="shrink-0 text-white/40">{formatDuration(comment.videoTimestampSec)}</span>
                  </div>
                  <p className="line-clamp-2 text-[10px] leading-snug text-white/85">{comment.content}</p>
                </div>
              </motion.div>
            ))
          : null}
      </AnimatePresence>
    </div>
  );
}
