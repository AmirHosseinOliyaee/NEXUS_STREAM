"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronUp,
  Layers,
  ListMusic,
  Play,
  Trash2,
  X,
} from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { cn, formatDuration } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";
import type { VideoEntity } from "@/types/schema";

/**
 * Bottom-right cartridge bay. Auto-opens when the first cartridge is queued,
 * closes when the queue empties, and animates removals with layout physics.
 */
export function CartridgeQueueDrawer() {
  const { t } = useI18n();
  const [isOpen, setOpen] = useState(false);
  const router = useRouter();

  const queue = useQueueStore((state) => state.queue);
  const currentIndex = useQueueStore((state) => state.currentIndex);
  const removeFromQueue = useQueueStore((state) => state.removeFromQueue);
  const selectTrack = useQueueStore((state) => state.selectTrack);
  const clearQueue = useQueueStore((state) => state.clearQueue);

  const playVideo = usePlayerStore((state) => state.playVideo);
  const setAmbientColor = usePlayerStore((state) => state.setAmbientColor);

  const previousLength = useRef(queue.length);

  useEffect(() => {
    if (queue.length > previousLength.current) {
      setOpen(true);
    } else if (queue.length === 0) {
      setOpen(false);
    }
    previousLength.current = queue.length;
  }, [queue.length]);

  const handlePlay = (video: VideoEntity, index: number): void => {
    selectTrack(index);
    playVideo(video.id);
    setAmbientColor(video.dominantColorHex);
    triggerHaptic("pulse");
    setOpen(false);
    router.push(`/watch/${video.id}`);
  };

  return (
    <div className="fixed bottom-24 right-3 z-40 flex flex-col items-end gap-2 sm:right-5">
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.section
            key="cartridge-queue"
            id="cartridge-queue-panel"
            aria-label={t.queue.panelAria}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 340, damping: 30 }}
            className="cyber-glass w-[min(92vw,380px)] border border-white/[0.08] cyber-chamfer-lg"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2">
                <ListMusic className="size-3.5 text-[var(--neon-primary)]" />
                <p className="font-display text-[10px] font-semibold uppercase tracking-[0.26em] text-white/80">
                  {t.queue.title}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <HudBadge tone="primary" variant="ghost" size="sm">
                  {String(queue.length).padStart(2, "0")}
                </HudBadge>
                {queue.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("heavy");
                      clearQueue();
                    }}
                    aria-label={t.queue.clear}
                    className="grid size-6 place-items-center border border-white/[0.08] text-white/30 transition-colors hover:border-[var(--neon-danger)]/50 hover:text-[var(--neon-danger)]"
                  >
                    <Trash2 className="size-3" />
                  </button>
                ) : null}
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="flex flex-col items-center gap-2.5 px-6 py-8 text-center">
                <span className="grid size-10 place-items-center border border-white/10 bg-white/[0.02] cyber-chamfer-sm">
                  <ListMusic className="size-4 text-white/25" />
                </span>
                <p className="font-display text-[10px] uppercase tracking-[0.24em] text-white/50">
                  {t.queue.empty}
                </p>
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
                  {t.queue.hint}
                </p>
              </div>
            ) : (
              <ul className="max-h-[46vh] overflow-y-auto p-2">
                <AnimatePresence initial={false}>
                  {queue.map((video, index) => {
                    const isCurrent = index === currentIndex;
                    return (
                      <motion.li
                        key={video.id}
                        layout
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div
                          className={cn(
                            "flex items-center gap-2 border-l-2 p-1.5 transition-colors duration-200",
                            isCurrent
                              ? "border-[var(--neon-primary)] bg-[var(--neon-primary)]/[0.06]"
                              : "border-transparent hover:bg-white/[0.04]",
                          )}
                        >
                          <button
                            type="button"
                            onClick={() => handlePlay(video, index)}
                            className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                          >
                            <span
                              className="relative h-10 w-16 shrink-0 overflow-hidden bg-cover bg-center cyber-chamfer-sm"
                              style={{
                                backgroundColor: "#0b0f18",
                                backgroundImage: `linear-gradient(140deg, ${video.dominantColorHex}38, rgba(7, 8, 13, 0.85)), url(${video.thumbnailUrl})`,
                              }}
                            >
                              <span className="absolute inset-0 bg-gradient-to-t from-void/85 to-transparent" />
                              {isCurrent ? (
                                <span className="absolute left-1 top-1 grid size-4 place-items-center bg-[var(--neon-primary)] text-[var(--bg-void)]">
                                  <Play className="size-2 fill-current" />
                                </span>
                              ) : null}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-[10px] uppercase tracking-[0.05em] text-white/85">
                                {video.title}
                              </span>
                              <span className="mt-1 flex min-w-0 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-white/35">
                                <span className="shrink-0 tabular-nums">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="text-white/15">·</span>
                                <span className="truncate">
                                  {video.channel.handle}
                                </span>
                                {isCurrent ? (
                                  <span className="shrink-0 text-[var(--neon-primary)]">
                                    {t.queue.onDeck}
                                  </span>
                                ) : null}
                                <span className="ml-auto shrink-0 tabular-nums text-white/45">
                                  {formatDuration(video.durationSec)}
                                </span>
                              </span>
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic("tick");
                              removeFromQueue(video.id);
                            }}
                            aria-label={t.queue.removeAria.replace("NN", video.title)}
                            className="grid size-6 shrink-0 place-items-center text-white/25 transition-colors hover:text-[var(--neon-danger)]"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-2.5">
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
                {t.queue.slot.replace(
                  "NN",
                  String(currentIndex + 1).padStart(2, "0"),
                )}
              </span>
              <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
                {t.queue.bay}
              </span>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => {
          triggerHaptic("tick");
          setOpen((open) => !open);
        }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.97 }}
        aria-expanded={isOpen}
        aria-controls="cartridge-queue-panel"
        aria-label={t.queue.toggleAria.replace("NN", String(queue.length))}
        className="cyber-glass flex h-10 items-center gap-2.5 border border-white/[0.09] px-3 cyber-chamfer-sm"
      >
        <Layers className="size-3.5 text-[var(--neon-primary)]" />
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
          {t.queue.trigger}
        </span>
        <span className="font-mono text-[10px] tabular-nums text-[var(--neon-primary)]">
          {String(queue.length).padStart(2, "0")}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          <ChevronUp className="size-3.5 text-white/30" />
        </motion.span>
      </motion.button>
    </div>
  );
}
