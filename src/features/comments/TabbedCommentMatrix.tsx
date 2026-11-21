"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ArrowUp, Clock3, LoaderCircle, MessageSquareText } from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { cn, formatCompactNumber, formatDuration } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import type { CommentCategory } from "@/types/schema";

const TABS: readonly {
  id: CommentCategory;
  labelKey: "tabMeme" | "tabDeepDive" | "tabTimestamp";
}[] = [
  { id: "meme", labelKey: "tabMeme" },
  { id: "deep_dive", labelKey: "tabDeepDive" },
  { id: "timestamp", labelKey: "tabTimestamp" },
];

export interface TabbedCommentMatrixProps {
  videoId: string;
  onSeek?: (seconds: number) => void;
  compact?: boolean;
}

/** Category-filtered discussion stream backed by the holo-comment API. */
export function TabbedCommentMatrix({ videoId, onSeek, compact = false }: TabbedCommentMatrixProps) {
  const { t } = useI18n();
  const [category, setCategory] = useState<CommentCategory>("meme");
  const [upvoted, setUpvoted] = useState<Set<string>>(() => new Set());
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const { data: comments = [], isLoading, isError } = useQuery({
    queryKey: ["holo-comments", videoId],
    queryFn: () => apiClient.getHoloComments(videoId),
    staleTime: 60_000,
  });
  const visible = comments.filter((comment) => comment.category === category);
  const selectedTabIndex = TABS.findIndex((tab) => tab.id === category);

  const handleTabKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
    const currentIndex = selectedTabIndex;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % TABS.length;
    else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = TABS.length - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = TABS[nextIndex];
    if (!nextTab) return;
    setCategory(nextTab.id);
    tabRefs.current[nextIndex]?.focus();
  };

  const vote = (id: string): void => {
    setUpvoted((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    triggerHaptic("tick");
  };

  return (
    <section aria-label={t.comments.sectionAria} className={cn("cyber-glass border border-white/[0.07] cyber-chamfer-sm", compact ? "" : "min-h-[360px]")}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageSquareText className="size-3.5 text-[var(--neon-primary)]" />
          <h2 className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85">{t.comments.title}</h2>
        </div>
        <HudBadge tone="primary" variant="ghost" size="sm">{t.comments.count.replace("NN", String(comments.length))}</HudBadge>
      </div>
      <div role="tablist" aria-label={t.comments.tabsAria} className="flex border-b border-white/[0.07] px-2">
        {TABS.map((tab) => (
          <button ref={(element) => { const index = TABS.indexOf(tab); tabRefs.current[index] = element; }} key={tab.id} type="button" role="tab" id={`comment-tab-${tab.id}`} aria-controls={`comment-panel-${tab.id}`} aria-selected={category === tab.id} tabIndex={category === tab.id ? 0 : -1} onKeyDown={handleTabKeyDown} onClick={() => setCategory(tab.id)} className={cn("relative flex-1 px-1 py-3 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors sm:text-[9px]", category === tab.id ? "text-[var(--neon-primary)]" : "text-white/40 hover:text-white/75")}>
            {t.comments[tab.labelKey]}
            {category === tab.id ? <span className="absolute inset-x-2 bottom-0 h-px bg-[var(--neon-primary)] shadow-[0_0_8px_var(--neon-primary)]" /> : null}
          </button>
        ))}
      </div>
      <div id={`comment-panel-${category}`} role="tabpanel" aria-labelledby={`comment-tab-${category}`} tabIndex={0} className={cn("space-y-2 overflow-y-auto p-3 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[var(--neon-primary)]", compact ? "max-h-[460px]" : "max-h-[580px]")}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 font-mono text-[9px] uppercase tracking-[0.15em] text-white/45"><LoaderCircle className="size-3.5 animate-spin" />{t.comments.loading}</div>
        ) : isError ? (
          <p role="alert" className="py-8 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-rose-300/80">{t.comments.error}</p>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-white/40">{t.comments.empty}</p>
        ) : visible.map((comment) => {
          const voted = upvoted.has(comment.id);
          return (
            <article key={comment.id} className="border border-white/[0.07] bg-white/[0.02] p-3 cyber-chamfer-sm">
              <div className="flex items-start gap-2.5">
                <img src={comment.author.avatarUrl} alt="" className="size-8 shrink-0 rounded-full border border-white/15 object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-display text-[9px] uppercase tracking-[0.1em] text-white/85">{comment.author.name}</span>
                    <span className="font-mono text-[8px] text-white/35">{comment.author.handle}</span>
                    {comment.author.badge ? <span className="font-mono text-[7px] uppercase text-[var(--neon-secondary)]">{comment.author.badge}</span> : null}
                  </div>
                  <p className="mt-1.5 whitespace-pre-wrap text-[11px] leading-relaxed text-white/70">{comment.content}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <button type="button" onClick={() => { onSeek?.(comment.videoTimestampSec); triggerHaptic("tick"); }} className="inline-flex items-center gap-1 font-mono text-[8px] tabular-nums text-white/40 transition hover:text-[var(--neon-primary)]">
                      <Clock3 className="size-3" />{formatDuration(comment.videoTimestampSec)}
                    </button>
                    <button type="button" aria-pressed={voted} aria-label={`${voted ? t.comments.removeUpvote : t.comments.upvote} ${comment.author.name}`} onClick={() => vote(comment.id)} className={cn("inline-flex items-center gap-1 font-mono text-[8px] tabular-nums transition", voted ? "text-[var(--neon-primary)]" : "text-white/40 hover:text-white/75")}>
                      <ArrowUp className="size-3" />{formatCompactNumber(comment.upvotes + (voted ? 1 : 0))}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
