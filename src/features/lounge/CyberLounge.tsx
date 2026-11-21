"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Crown,
  Headphones,
  MessageCircle,
  Plus,
  Send,
  ShieldCheck,
  UsersRound,
  Vote,
  Wifi,
  Zap,
} from "lucide-react";

import { HudBadge } from "@/components/ui/HudBadge";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { apiClient } from "@/services/api-client";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { VideoEntity } from "@/types/schema";

const INITIAL_MESSAGES = [
  { id: "m1", name: "VANTA", color: "#BC13FE", text: "Sync feels impossibly tight tonight." },
  { id: "m2", name: "KAI//0", color: "#00F0FF", text: "Rewind that last pass, please." },
  { id: "m3", name: "NYX", color: "#FFB800", text: "Queue has a new signal." },
];
const REACTIONS = ["⚡", "🔥", "🤯", "💀", "🚀"] as const;

interface QueueEntry { video: VideoEntity; votes: number; }

export function CyberLounge({ roomId }: { roomId: string }) {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const requestedVideoId = searchParams.get("videoId");
  const { data: videos = [] } = useQuery({ queryKey: ["lounge-catalog"], queryFn: () => apiClient.getVideos(), staleTime: 60_000 });
  const video = videos.find((entry) => entry.id === requestedVideoId) ?? videos.find((entry) => entry.format === "long") ?? videos[0];
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draft, setDraft] = useState("");
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [votedIds, setVotedIds] = useState<string[]>([]);
  const [djName, setDjName] = useState("NYX");
  const [notice, setNotice] = useState("");
  const playVideo = usePlayerStore((state) => state.playVideo);

  const queueCandidates = useMemo(() => videos.filter((entry) => entry.id !== video?.id && entry.format !== "short"), [videos, video?.id]);
  const addQueue = (entry: VideoEntity): void => {
    if (queue.some((queued) => queued.video.id === entry.id)) return;
    setQueue((current) => [...current, { video: entry, votes: 0 }]);
    setNotice(t.lounge.queueAdded.replace("NN", entry.title));
    triggerHaptic("tick");
  };
  const voteFor = (id: string): void => {
    if (votedIds.includes(id)) return;
    setVotedIds((current) => [...current, id]);
    setQueue((current) => current.map((entry) => entry.video.id === id ? { ...entry, votes: entry.votes + 1 } : entry));
    triggerHaptic("tick");
  };
  const sendMessage = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current.slice(-19), { id: `m-${Date.now()}`, name: "YOU", color: "#00F0FF", text }]);
    setDraft("");
  };

  if (!video) return <div className="mx-auto max-w-4xl px-5 py-20 text-center text-cyan-100/70">{t.lounge.connecting}</div>;

  const roomLabel = roomId.replaceAll("-", " ");

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 pb-12 pt-4 sm:px-6 lg:px-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div><h1 className="font-display text-2xl font-semibold uppercase tracking-[0.08em] text-white sm:text-3xl">{t.lounge.title}</h1><p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-100/65">{roomLabel} · {t.lounge.roomSuffix}</p></div>
        <div className="flex flex-wrap items-center gap-2"><HudBadge tone="success" variant="ghost" size="sm" dot><Wifi className="size-3" /> {t.lounge.syncLocked}</HudBadge><HudBadge tone="neutral" variant="ghost" size="sm"><UsersRound className="size-3" /> {t.lounge.online}</HudBadge></div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
        <section className="min-w-0">
          <div className="relative aspect-video overflow-hidden border border-white/10 bg-black cyber-chamfer-lg">
            <video key={video.id} className="h-full w-full object-cover" src={video.videoUrl} poster={video.thumbnailUrl} controls playsInline preload="metadata" onPlay={() => playVideo(video.id)} aria-label={video.title} />
            <div className="absolute left-4 top-4 pointer-events-none"><HudBadge tone="danger" variant="solid" size="sm" pulse><span className="size-1.5 rounded-full bg-white" /> {t.lounge.live}</HudBadge></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-4">
            <div className="min-w-0"><p className="font-mono text-[9px] uppercase tracking-[0.16em] text-cyan-100/60">{t.lounge.nowInLounge}</p><h2 className="mt-1 truncate font-display text-lg font-semibold uppercase text-white">{video.title}</h2></div>
            <button type="button" onClick={() => { setDjName((current) => current === "NYX" ? "VANTA" : "NYX"); triggerHaptic("tick"); }} className="inline-flex items-center gap-2 border border-amber-200/25 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-amber-100/85 hover:border-amber-200/50"><Crown className="size-4" /> {t.lounge.djPrefix}: {djName} · {t.lounge.rotateCrown}</button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2"><Zap className="size-4 text-cyan-200" /><span className="font-display text-[10px] uppercase tracking-[0.15em] text-white/80">{t.lounge.reactions}</span></div>
            <div className="flex flex-wrap gap-2">{REACTIONS.map((reaction) => <button key={reaction} type="button" aria-label={t.lounge.reactionAria.replace("NN", reaction)} onClick={() => { setReactionCounts((counts) => ({ ...counts, [reaction]: (counts[reaction] ?? 0) + 1 })); triggerHaptic("tick"); }} className="min-w-14 border border-white/10 px-2 py-2 text-sm hover:border-cyan-200/45" title={t.lounge.reactionCount.replace("NN", String(reactionCounts[reaction] ?? 0))}>{reaction}<span className="ml-1 font-mono text-[9px] text-cyan-100/55">{reactionCounts[reaction] ?? 0}</span></button>)}</div>
          </div>
          <div className="mt-7 border-t border-white/10 pt-4"><div className="mb-3 flex items-center gap-2"><Headphones className="size-4 text-cyan-200" /><h2 className="font-display text-xs uppercase tracking-[0.14em] text-white">{t.lounge.queueTitle}</h2><span className="font-mono text-[9px] text-white/45">{t.lounge.queued.replace("NN", String(queue.length))}</span></div>
            {queue.length === 0 ? <p className="border-b border-white/10 py-4 text-xs text-cyan-100/60">{t.lounge.queueEmpty}</p> : <ol className="divide-y divide-white/10">{queue.toSorted((a, b) => b.votes - a.votes).map((entry) => <li key={entry.video.id} className="flex items-center gap-3 py-3"><span className="min-w-0 flex-1"><span className="block truncate text-xs text-white/85">{entry.video.title}</span><span className="mt-1 block font-mono text-[9px] text-white/50">{t.lounge.votes.replace("NN", String(entry.votes))}</span></span><button type="button" onClick={() => voteFor(entry.video.id)} disabled={votedIds.includes(entry.video.id)} className="inline-flex items-center gap-1 border border-white/10 px-2 py-1.5 font-mono text-[9px] uppercase text-cyan-100/80 hover:border-cyan-200/45 disabled:text-white/35"><Vote className="size-3.5" />{votedIds.includes(entry.video.id) ? <Check className="size-3" /> : t.lounge.vote}</button></li>)}</ol>}
            <div className="mt-2 flex flex-wrap gap-2">{queueCandidates.slice(0, 3).map((candidate) => <button key={candidate.id} type="button" onClick={() => addQueue(candidate)} className="inline-flex min-w-0 max-w-full items-center gap-1.5 border border-white/10 px-2.5 py-2 text-left text-[10px] text-white/70 hover:border-cyan-200/40"><Plus className="size-3 shrink-0 text-cyan-200" /><span className="truncate">{candidate.title}</span></button>)}</div>
          </div>
        </section>

        <aside className="grid min-h-[540px] grid-rows-[auto_1fr_auto] border-y border-white/10 xl:max-h-[720px]">
          <div className="flex items-center justify-between border-b border-white/10 py-3"><div className="flex items-center gap-2"><MessageCircle className="size-4 text-cyan-200" /><h2 className="font-display text-xs uppercase tracking-[0.14em] text-white">{t.lounge.chatTitle}</h2></div><span className="font-mono text-[9px] text-white/45">{t.lounge.present}</span></div>
          <div className="space-y-4 overflow-y-auto py-4">{messages.map((message) => <article key={message.id} className="text-xs leading-relaxed"><h3 className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: message.color }}>{message.name}</h3><p className="text-white/75">{message.text}</p></article>)}<div className="border-t border-white/10 pt-3"><p className="mb-3 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-cyan-100/60"><ShieldCheck className="size-3.5" /> {t.lounge.inRoom}</p><div className="space-y-2 text-[10px] text-white/70"><p>● NYX <span className="text-amber-100/70">· {t.lounge.host}</span></p><p>● VANTA <span className="text-cyan-100/65">· {t.lounge.coViewer}</span></p><p>● KAI//0 <span className="text-cyan-100/65">· {t.lounge.coViewer}</span></p><p>● YOU <span className="text-cyan-100/65">· {t.lounge.coViewer}</span></p></div></div></div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 py-3"><label className="sr-only" htmlFor="lounge-message">{t.lounge.messageLabel}</label><input id="lounge-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={240} placeholder={t.lounge.messagePlaceholder} className="min-w-0 flex-1 border border-white/10 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:border-cyan-200/45 focus:outline-none"/><button type="submit" disabled={!draft.trim()} aria-label={t.lounge.send} className="grid size-9 place-items-center border border-cyan-200/30 text-cyan-100 hover:bg-cyan-300/10 disabled:opacity-40"><Send className="size-4" /></button></form>
        </aside>
      </div>
      <p role="status" aria-live="polite" className="sr-only">{notice}</p>
    </div>
  );
}
