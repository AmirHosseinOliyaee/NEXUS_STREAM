"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Clipboard, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { formatDuration } from "@/lib/utils";
import type { TranscriptSegment } from "@/types/schema";

export interface GlitchClipperModalProps {
  open: boolean;
  currentTime: number;
  videoId: string;
  transcript: TranscriptSegment[];
  onClose: () => void;
}

/** Creates a short shareable interval around the current playhead. */
export function GlitchClipperModal({ open, currentTime, videoId, transcript, onClose }: GlitchClipperModalProps) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const start = Math.max(0, currentTime - 15);
  const end = Math.max(start, currentTime);
  const caption = useMemo(() => {
    const nearest = transcript.reduce<TranscriptSegment | undefined>((best, segment) => {
      if (!best) return segment;
      return Math.abs(segment.timeSec - currentTime) < Math.abs(best.timeSec - currentTime) ? segment : best;
    }, undefined);
    return nearest?.text ?? t.clipper.fallbackCaption;
  }, [transcript, currentTime, t.clipper.fallbackCaption]);
  const clipUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(`/watch/${encodeURIComponent(videoId)}`, window.location.origin);
    url.searchParams.set("clip", `${Math.floor(start)}-${Math.ceil(end)}`);
    url.hash = `t=${Math.floor(start)}`;
    return url.toString();
  }, [videoId, start, end]);
  const shareText = `${caption}\n${clipUrl}`;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    closeButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onCloseRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open]);

  const copyLink = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      triggerHaptic("pulse");
    } catch {
      setCopied(false);
    }
  };

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLElement>): void => {
    if (event.key !== "Tab") return;
    const dialog = event.currentTarget;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable.item(0);
    const last = focusable.item(focusable.length - 1);
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="absolute inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.section role="dialog" aria-modal="true" aria-labelledby="clipper-title" onKeyDown={handleDialogKeyDown} initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} className="w-full max-w-md border border-[var(--neon-primary)]/40 bg-[var(--bg-hud)] p-4 shadow-[0_16px_48px_-18px_rgba(0,0,0,0.9)] cyber-chamfer-lg sm:p-5">
            <header className="flex items-start justify-between gap-3">
              <div>
                <h2 id="clipper-title" className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-white">{t.clipper.title}</h2>
                <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.14em] text-white/45">{t.clipper.subtitle}</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={t.clipper.close} className="grid size-8 place-items-center border border-white/10 text-white/55 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--neon-primary)]"><X className="size-4" /></button>
            </header>
            <div aria-label={t.clipper.waveformAria} className="mt-5 flex h-14 items-center gap-[3px] border-y border-white/[0.08] px-2">
              {Array.from({ length: 48 }, (_, index) => {
                const height = 18 + ((index * 17 + index * index * 7) % 72);
                return <span key={index} className="flex-1 bg-[var(--neon-primary)]/75" style={{ height: `${height}%`, boxShadow: index % 5 === 0 ? "0 0 7px color-mix(in srgb, var(--neon-primary) 60%, transparent)" : undefined }} />;
              })}
            </div>
            <div className="mt-3 flex items-center justify-between font-mono text-[9px] tabular-nums text-white/55"><span>{formatDuration(start)}</span><span>→</span><span>{formatDuration(end)}</span></div>
            <blockquote className="mt-4 border-l border-[var(--neon-primary)]/65 pl-3 text-[11px] leading-relaxed text-white/70">“{caption}”</blockquote>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => void copyLink()} className="col-span-2 flex min-h-10 items-center justify-center gap-2 border border-[var(--neon-primary)]/40 bg-[var(--neon-primary)]/10 px-3 font-mono text-[9px] uppercase tracking-[0.12em] text-white transition hover:bg-[var(--neon-primary)]/20">
                {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}{copied ? t.clipper.copied : t.clipper.copy}
              </button>
              <a href={`https://discord.com/channels/@me?message=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" onClick={() => triggerHaptic("tick")} className="flex min-h-10 items-center justify-center gap-2 border border-white/10 px-2 font-mono text-[8px] uppercase tracking-[0.08em] text-white/65 hover:border-white/25 hover:text-white"><MessageCircle className="size-3.5" />Discord</a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(clipUrl)}&text=${encodeURIComponent(caption)}`} target="_blank" rel="noreferrer" onClick={() => triggerHaptic("tick")} className="flex min-h-10 items-center justify-center gap-2 border border-white/10 px-2 font-mono text-[8px] uppercase tracking-[0.08em] text-white/65 hover:border-white/25 hover:text-white"><Send className="size-3.5" />Telegram</a>
            </div>
            {copied ? <p role="status" className="mt-3 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--neon-primary)]">{t.clipper.shareReady}</p> : null}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
