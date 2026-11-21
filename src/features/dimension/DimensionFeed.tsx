"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent,
  type WheelEvent,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Clock3,
  Headphones,
  Radio,
  UsersRound,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HudBadge } from "@/components/ui/HudBadge";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { apiClient } from "@/services/api-client";
import { usePlayerStore } from "@/stores/usePlayerStore";
import type { VideoEntity } from "@/types/schema";

const HOLD_MS = 800;

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export function DimensionFeed() {
  const { t } = useI18n();
  const router = useRouter();
  const { data: shorts = [], isLoading, isError } = useQuery({
    queryKey: ["shorts-feed"],
    queryFn: () => apiClient.getShortsFeed(),
    staleTime: 60_000,
  });
  const [activeIndex, setActiveIndex] = useState(0);
  const [holding, setHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStart = useRef<number | null>(null);
  const holdRaf = useRef<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const active = shorts[activeIndex];
  const setActiveVideo = usePlayerStore((state) => state.setActiveVideo);
  const requestSeek = usePlayerStore((state) => state.requestSeek);

  const move = useCallback((delta: number) => {
    setActiveIndex((index) => Math.max(0, Math.min(shorts.length - 1, index + delta)));
  }, [shorts.length]);

  useEffect(() => {
    if (activeIndex >= shorts.length && shorts.length > 0) setActiveIndex(shorts.length - 1);
  }, [activeIndex, shorts.length]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"].includes(target.tagName))) return;
      if (["ArrowDown", "j", "J"].includes(event.key)) { event.preventDefault(); move(1); }
      if (["ArrowUp", "k", "K"].includes(event.key)) { event.preventDefault(); move(-1); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [move]);

  useEffect(() => () => {
    if (holdRaf.current !== null) window.cancelAnimationFrame(holdRaf.current);
    if (onWheel.current !== null) window.clearTimeout(onWheel.current);
  }, []);

  const stopHold = useCallback(() => {
    holdStart.current = null;
    if (holdRaf.current !== null) window.cancelAnimationFrame(holdRaf.current);
    holdRaf.current = null;
    setHolding(false);
    setHoldProgress(0);
  }, []);

  const beginHold = useCallback((video: VideoEntity) => {
    if (!video.parentLongVideoId || video.parentTimestampSec === undefined) return;
    holdStart.current = performance.now();
    setHolding(true);
    const frame = (now: number): void => {
      const started = holdStart.current;
      if (started === null) return;
      const progress = Math.min((now - started) / HOLD_MS, 1);
      setHoldProgress(progress);
      if (progress === 1) {
        holdStart.current = null;
        holdRaf.current = null;
        setHolding(false);
        triggerHaptic("heavy");
        requestSeek(video.parentTimestampSec!);
        router.push(`/watch/${video.parentLongVideoId}?t=${video.parentTimestampSec}`);
        return;
      }
      holdRaf.current = window.requestAnimationFrame(frame);
    };
    holdRaf.current = window.requestAnimationFrame(frame);
  }, [requestSeek, router]);

  const onWheel = useRef<number | null>(null);
  const handleWheel = (event: WheelEvent<HTMLElement>): void => {
    if (Math.abs(event.deltaY) < 30 || onWheel.current !== null) return;
    move(event.deltaY > 0 ? 1 : -1);
    onWheel.current = window.setTimeout(() => { onWheel.current = null; }, 420);
  };

  if (isLoading) return <div className="grid min-h-[65vh] place-items-center font-mono text-xs uppercase tracking-[0.2em] text-cyan-100/65">{t.dimension.loading}</div>;
  if (isError || shorts.length === 0) return <div role="status" className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-6 text-center"><div><h1 className="font-display text-2xl uppercase text-white">{t.dimension.emptyTitle}</h1><p className="mt-3 text-sm text-cyan-100/65">{t.dimension.emptyBody}</p></div></div>;

  return (
    <div className="mx-auto grid w-full max-w-[1240px] gap-5 px-4 pb-8 pt-3 lg:grid-cols-[minmax(0,1fr)_250px] lg:px-8">
      <section aria-label={t.dimension.feedAria} onWheel={handleWheel} className="min-w-0">
        <header className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center border border-cyan-300/35 bg-cyan-300/10 text-cyan-200"><Zap className="size-5" /></span><div><h1 className="font-display text-lg font-semibold uppercase tracking-[0.12em] text-white">{t.dimension.title}</h1><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-cyan-100/65">{t.dimension.subtitle.replace("NN", String(shorts.length))}</p></div></div>
          <HudBadge tone="success" variant="ghost" size="sm" dot>{t.dimension.live}</HudBadge>
        </header>
        <div className="mx-auto flex max-w-[720px] items-center justify-center gap-3">
          <button type="button" onClick={() => move(-1)} disabled={activeIndex === 0} aria-label={t.dimension.prev} className="hidden size-10 place-items-center border border-white/10 text-white/60 hover:border-cyan-200/50 hover:text-white disabled:opacity-30 md:grid"><ChevronUp className="size-5" /></button>
          <div className="relative h-[min(72vh,760px)] min-h-[500px] w-full max-w-[430px] overflow-hidden border border-white/10 bg-black" onTouchStart={(event: TouchEvent<HTMLDivElement>) => { const t = event.touches[0]; if (t) touchStart.current = { x: t.clientX, y: t.clientY }; }} onTouchEnd={(event: TouchEvent<HTMLDivElement>) => { const start = touchStart.current; const t = event.changedTouches[0]; touchStart.current = null; if (!start || !t) return; const dy = t.clientY - start.y; if (Math.abs(dy) > 55) move(dy < 0 ? 1 : -1); }}>
            <AnimatePresence mode="wait">
              {active ? <motion.article key={active.id} initial={{ opacity: 0, rotateX: 6, y: 24 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0, rotateX: -5, y: -20 }} transition={{ duration: 0.24 }} className="absolute inset-0 origin-center [transform-style:preserve-3d]">
                <video className="h-full w-full object-cover" src={active.videoUrl} poster={active.thumbnailUrl} muted playsInline loop autoPlay preload="metadata" aria-label={active.title} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-black/35" />
                <div className="absolute left-4 right-4 top-4 flex items-center justify-between"><HudBadge tone="warning" variant="solid" size="sm">SHORT / {active.category}</HudBadge><span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-white/75"><Radio className="size-3.5 text-rose-300" /> Hyper-Feed</span></div>
                <div className="absolute bottom-5 left-5 right-20">
                  <div className="mb-3 flex items-center gap-2"><span className="size-8 border border-white/25 bg-cover bg-center" style={{ backgroundImage: `url(${active.channel.avatarUrl})` }} /><div><p className="font-display text-[10px] uppercase tracking-[0.13em] text-white">{active.channel.name}</p><p className="font-mono text-[8px] text-cyan-100/65">{active.channel.handle}</p></div></div>
                  <h2 className="font-display text-xl font-semibold uppercase leading-tight text-white sm:text-2xl">{active.title}</h2><p className="mt-2 line-clamp-3 text-xs leading-relaxed text-white/75">{active.description}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-white/70"><span>{active.viewsCount.toLocaleString()} {t.dimension.views}</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{formatTime(active.durationSec)}</span></div>
                </div>
                <div className="absolute bottom-7 right-4 flex flex-col items-center gap-3">
                  <button type="button" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); beginHold(active); }} onPointerUp={stopHold} onPointerCancel={stopHold} onLostPointerCapture={stopHold} onContextMenu={(event) => event.preventDefault()} aria-label={t.dimension.holdAria} className="relative grid size-14 touch-none place-items-center overflow-hidden rounded-full border border-cyan-200/70 bg-black/70 text-cyan-100 transition-colors hover:bg-cyan-300/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"><span className="absolute inset-0 origin-bottom bg-cyan-300/30" style={{ transform: `scaleY(${holdProgress})` }} /><span className="relative"><Clock3 className="size-5" /></span></button>
                  <span className="max-w-[76px] text-center font-mono text-[8px] uppercase leading-relaxed text-cyan-100/80">{holding ? `${Math.round(holdProgress * 100)}% · ${t.dimension.syncing}` : t.dimension.holdTeleport}</span>
                </div>
              </motion.article> : null}
            </AnimatePresence>
          </div>
          <button type="button" onClick={() => move(1)} disabled={activeIndex >= shorts.length - 1} aria-label={t.dimension.next} className="hidden size-10 place-items-center border border-white/10 text-white/60 hover:border-cyan-200/50 hover:text-white disabled:opacity-30 md:grid"><ChevronDown className="size-5" /></button>
        </div>
        <div className="mt-3 flex justify-center gap-2 md:hidden"><button type="button" onClick={() => move(-1)} disabled={activeIndex === 0} className="grid size-10 place-items-center border border-white/10 text-white/70 disabled:opacity-30" aria-label={t.dimension.prev}><ArrowUp className="size-4" /></button><button type="button" onClick={() => move(1)} disabled={activeIndex >= shorts.length - 1} className="grid size-10 place-items-center border border-white/10 text-white/70 disabled:opacity-30" aria-label={t.dimension.next}><ArrowDown className="size-4" /></button></div>
      </section>
      <aside className="hidden space-y-4 lg:block">
        <section className="border-y border-white/10 py-4"><h2 className="font-display text-xs uppercase tracking-[0.16em] text-white">{t.dimension.navTitle}</h2><p className="mt-2 text-xs leading-relaxed text-cyan-100/65">{t.dimension.navBody}</p></section>
        <section className="border-b border-white/10 pb-4"><h2 className="font-display text-xs uppercase tracking-[0.16em] text-white">{t.dimension.teleportTitle}</h2><p className="mt-2 text-xs leading-relaxed text-cyan-100/65">{t.dimension.teleportBody}</p></section>
        <LinkLounge />
      </aside>
      <div className="lg:hidden"><LinkLounge /></div>
    </div>
  );
}

function LinkLounge() {
  const { t } = useI18n();
  return <Link href="/lounge/nexus-alpha" aria-label={t.player.loungeCta} className="flex items-center justify-between gap-3 border border-white/10 px-4 py-3 text-white/75 transition-colors hover:border-cyan-200/45 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-200"><span><span className="block font-display text-[10px] uppercase tracking-[0.15em]">{t.dimension.loungeTitle}</span><span className="mt-1 block text-[10px] text-cyan-100/65">{t.player.loungeCta}</span></span><span className="flex items-center gap-2 font-mono text-[9px] uppercase text-cyan-100/70"><UsersRound className="size-4" /><Headphones className="size-4" /></span></Link>;
}
