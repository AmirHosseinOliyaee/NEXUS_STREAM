"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";

import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { cn, formatDuration } from "@/lib/utils";
import type { TranscriptSegment } from "@/types/schema";

export interface AiNeuralScrubbingProps {
  transcript: TranscriptSegment[];
  onMatchesChange: (timestamps: number[]) => void;
  onSeek: (seconds: number) => void;
  className?: string;
}

/** Transcript search that steers the active media clock to each match. */
export function AiNeuralScrubbing({
  transcript,
  onMatchesChange,
  onSeek,
  className,
}: AiNeuralScrubbingProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return normalized
      ? transcript.filter((segment) =>
          segment.text.toLocaleLowerCase().includes(normalized),
        )
      : [];
  }, [query, transcript]);

  const currentMatch = matches.length > 0 ? matches[activeIndex % matches.length] : undefined;

  const setSearch = (value: string): void => {
    setQuery(value);
    setActiveIndex(0);
  };

  const syncTimelineMatches = (value: string): void => {
    const normalized = value.trim().toLocaleLowerCase();
    onMatchesChange(
      normalized
        ? transcript
            .filter((segment) => segment.text.toLocaleLowerCase().includes(normalized))
            .map((segment) => segment.timeSec)
        : [],
    );
  };

  const navigate = (direction: -1 | 1): void => {
    if (matches.length === 0) return;
    const nextIndex = (activeIndex + direction + matches.length) % matches.length;
    setActiveIndex(nextIndex);
    const segment = matches[nextIndex];
    if (!segment) return;
    onSeek(segment.timeSec);
    triggerHaptic("tick");
  };

  return (
    <section
      aria-label={t.scrub.sectionAria}
      className={cn("border border-white/[0.08] bg-[var(--bg-void)]/70 px-3 py-2.5 cyber-chamfer-sm", className)}
    >
      <div className="flex items-center gap-2">
        <Search aria-hidden="true" className="size-3.5 shrink-0 text-[var(--neon-primary)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => { setSearch(event.target.value); syncTimelineMatches(event.target.value); }}
          placeholder={t.scrub.placeholder}
          aria-label={t.scrub.inputAria}
          className="min-w-0 flex-1 bg-transparent font-mono text-[10px] text-white outline-none placeholder:text-white/35"
        />
        {query ? (
          <button type="button" onClick={() => { setSearch(""); onMatchesChange([]); }} aria-label={t.scrub.clear} className="text-white/45 hover:text-white">
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>
      {query ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/[0.07] pt-2">
          <span aria-live="polite" className="font-mono text-[9px] tabular-nums text-white/55">
            {matches.length > 0
              ? t.scrub.matches
                  .replace("MM", String(Math.min(activeIndex + 1, matches.length)))
                  .replace("NN", String(matches.length))
              : t.scrub.noMatches}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" disabled={matches.length === 0} onClick={() => navigate(-1)} aria-label={t.scrub.prev} className="grid size-7 place-items-center border border-white/10 text-white/60 transition hover:border-[var(--neon-primary)] hover:text-[var(--neon-primary)] disabled:opacity-30">
              <ChevronLeft className="size-3.5" />
            </button>
            <button type="button" disabled={matches.length === 0} onClick={() => navigate(1)} aria-label={t.scrub.next} className="grid size-7 place-items-center border border-white/10 text-white/60 transition hover:border-[var(--neon-primary)] hover:text-[var(--neon-primary)] disabled:opacity-30">
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      ) : null}
      {currentMatch ? (
        <p className="mt-2 line-clamp-2 border-l border-[var(--neon-primary)]/70 pl-2 font-mono text-[9px] leading-relaxed text-white/55">
          <span className="mr-2 text-[var(--neon-primary)]">{formatDuration(currentMatch.timeSec)}</span>
          {currentMatch.text}
        </p>
      ) : null}
    </section>
  );
}
