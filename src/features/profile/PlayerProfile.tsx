"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BadgeCheck,
  Ban,
  Check,
  ChevronDown,
  Crown,
  Fingerprint,
  LockKeyhole,
  Plus,
  Shield,
  Sparkles,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { CyberCard } from "@/components/ui/CyberCard";
import { HudBadge } from "@/components/ui/HudBadge";
import { NeonButton } from "@/components/ui/NeonButton";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n, type Dictionary } from "@/lib/i18n";
import { apiClient } from "@/services/api-client";
import { useAppStore } from "@/stores/useAppStore";
import type { PlayerProfileEntity, TrophyRarity, VideoCategory } from "@/types/schema";

const CATEGORY_LABELS: Record<VideoCategory, keyof Dictionary["studio"]> = {
  tech: "categoryTech",
  gaming: "categoryGaming",
  science: "categoryScience",
  music: "categoryMusic",
  cyberculture: "categoryCyberculture",
  design: "categoryDesign",
};

const RARITY_STYLE: Record<TrophyRarity, { label: keyof Dictionary["profile"]; color: string; icon: typeof Trophy }> = {
  common: { label: "rarityCommon", color: "#9ca3af", icon: BadgeCheck },
  rare: { label: "rarityRare", color: "#00f0ff", icon: Shield },
  legendary: { label: "rarityLegendary", color: "#ffb800", icon: Crown },
};

const PROFILE_SWITCHES = ["netrunner-01", "vanta"] as const;

export function PlayerProfile({ handle }: { handle: string }) {
  const { t } = useI18n();
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile", handle],
    queryFn: () => apiClient.getProfileByHandle(handle),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-10 sm:px-6"><div role="status" className="h-80 animate-pulse border border-white/10 bg-elevated/60 cyber-chamfer-lg" aria-label={t.profile.loadingAria} /></main>;
  }
  if (isError || !profile) {
    return <main className="mx-auto max-w-6xl px-4 pb-28 pt-10 sm:px-6"><p role="alert" className="border border-[var(--neon-danger)]/30 p-6 font-mono text-sm text-[var(--neon-danger)]">{t.profile.unavailable}</p></main>;
  }
  return <ProfileContent profile={profile} />;
}

function ProfileContent({ profile }: { profile: PlayerProfileEntity }) {
  const [selectedHandle, setSelectedHandle] = useState(profile.handle.replace(/^@/, ""));
  const [channelInput, setChannelInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const blacklistedChannels = useAppStore((state) => state.blacklistedChannels);
  const blacklistedKeywords = useAppStore((state) => state.blacklistedKeywords);
  const blacklistChannel = useAppStore((state) => state.blacklistChannel);
  const whitelistChannel = useAppStore((state) => state.whitelistChannel);
  const blacklistKeyword = useAppStore((state) => state.blacklistKeyword);
  const whitelistKeyword = useAppStore((state) => state.whitelistKeyword);
  const { t } = useI18n();
  const { data: videos = [] } = useQuery({
    queryKey: ["videos", "blacklist-console"],
    queryFn: () => apiClient.getVideos(),
    staleTime: 30_000,
  });

  const channels = useMemo(() => {
    const unique = new Map<string, { id: string; handle: string; name: string }>();
    for (const video of videos) unique.set(video.channel.id, video.channel);
    return Array.from(unique.values());
  }, [videos]);
  const currentXp = profile.xp % 1000;
  const xpProgress = (currentXp / 1000) * 100;

  function submitChannel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = channelInput.trim().replace(/^@/, "").toLocaleLowerCase();
    const match = channels.find((channel) =>
      channel.id.toLocaleLowerCase() === query || channel.handle.replace(/^@/, "").toLocaleLowerCase() === query,
    );
    if (match) {
      blacklistChannel(match.id);
      triggerHaptic("pulse");
      setChannelInput("");
    }
  }

  function submitKeyword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!keywordInput.trim()) return;
    blacklistKeyword(keywordInput);
    triggerHaptic("pulse");
    setKeywordInput("");
  }

  return (
    <main className="relative isolate mx-auto w-full max-w-[1280px] px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px]" style={{ background: `radial-gradient(ellipse at 12% 8%, ${profile.auraColorHex}22, transparent 55%)` }} />
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--neon-primary)]"><span className="h-px w-7 bg-current" />{t.profile.identityKicker}</div>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-white sm:text-4xl">{t.profile.identityTitle}</h1>
        </div>
        <label className="flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-white/45">
          <UserRound className="size-3.5 text-[var(--neon-primary)]" />
          <span className="sr-only">{t.profile.switchPlayer}</span>
          <select value={selectedHandle} onChange={(event) => { setSelectedHandle(event.target.value); window.location.href = `/profile/${event.target.value}`; }} className="max-w-36 bg-transparent text-white/75 outline-none" aria-label={t.profile.switchPlayerAria}>
            {PROFILE_SWITCHES.map((item) => <option key={item} value={item} className="bg-elevated">{item === "netrunner-01" ? "Netrunner 01" : "Vanta"}</option>)}
          </select>
          <ChevronDown className="size-3" />
        </label>
      </header>

      <section className="relative overflow-hidden border border-white/10 bg-elevated/55 p-5 cyber-chamfer-lg sm:p-7" aria-labelledby="identity-name">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 w-2/3 opacity-[0.08]" style={{ background: `radial-gradient(ellipse at 85% 40%, ${profile.auraColorHex}, transparent 60%)` }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative grid size-24 shrink-0 place-items-center border border-white/15 bg-black/30 cyber-chamfer-lg sm:size-28" style={{ boxShadow: `0 0 36px -12px ${profile.auraColorHex}` }}>
            <div className="absolute inset-2 border border-dashed opacity-35 cyber-chamfer-sm" style={{ borderColor: profile.auraColorHex }} />
            <Fingerprint className="size-11" style={{ color: profile.auraColorHex }} strokeWidth={1.2} />
            <span className="absolute -bottom-2 border border-white/10 bg-[var(--bg-void)] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.2em] text-white/50">ID / {profile.id.slice(-4)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2"><HudBadge tone="primary" variant="ghost" size="sm" dot>{t.profile.verified}</HudBadge><span className="font-mono text-[9px] uppercase tracking-[0.18em] text-white/30">{profile.titleBadge}</span></div>
            <h2 id="identity-name" className="mt-3 font-display text-4xl font-bold uppercase leading-none tracking-tight text-white sm:text-5xl">{profile.displayName}</h2>
            <p className="mt-2 font-mono text-xs tracking-[0.14em] text-white/45">{profile.handle}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
              <div><span className="font-display text-2xl font-semibold text-white">LVL {profile.level.toString().padStart(2, "0")}</span><span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">{profile.xp.toLocaleString()} {t.profile.totalXp}</span></div>
              <div className="min-w-48 flex-1 basis-48">
                <div className="mb-1.5 flex justify-between font-mono text-[8px] uppercase tracking-[0.15em] text-white/35"><span>{t.profile.nextLevel}</span><span>{currentXp} / 1,000 XP</span></div>
                <div className="h-1.5 overflow-hidden bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${xpProgress}%` }} transition={{ duration: 0.7 }} className="h-full" style={{ backgroundColor: profile.auraColorHex, boxShadow: `0 0 12px ${profile.auraColorHex}` }} /></div>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-row gap-2 md:flex-col">
            <Link href="/studio"><NeonButton size="sm" leftIcon={<Sparkles />}>{t.profile.creatorStudio}</NeonButton></Link>
            <HudBadge tone="success" variant="ghost" size="sm" icon={<LockKeyhole />}>{t.profile.privateId}</HudBadge>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <CyberCard className="min-h-[360px]" accent={profile.auraColorHex}>
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-semibold uppercase text-white">{t.profile.watchDnaTitle}</h2><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">{t.profile.watchDnaSubtitle}</p></div><HudBadge tone="primary" variant="ghost" size="sm">{t.profile.watchDnaBadge}</HudBadge></div>
          <div className="mt-3 min-h-[270px] flex-1" role="img" aria-label={t.profile.dnaAria.replace("NN", profile.displayName)}>
            <ResponsiveContainer width="100%" height="100%" minHeight={270}>
              <RadarChart data={profile.watchDna} outerRadius="72%">
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis dataKey="category" tickFormatter={(value: VideoCategory) => t.studio[CATEGORY_LABELS[value]]} tick={{ fill: "rgba(255,255,255,0.58)", fontSize: 10, fontFamily: "monospace" }} />
                <PolarRadiusAxis angle={30} domain={[0, 40]} tick={false} axisLine={false} />
                <Radar name={t.profile.watchTime} dataKey="percentage" stroke={profile.auraColorHex} fill={profile.auraColorHex} fillOpacity={0.24} strokeWidth={2} />
                <Tooltip contentStyle={{ background: "#10141d", border: "1px solid rgba(255,255,255,.14)", color: "white", fontFamily: "monospace", fontSize: 11 }} formatter={(value) => [`${value}%`, t.profile.watchShare]} labelFormatter={(label) => t.studio[CATEGORY_LABELS[label as VideoCategory]]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 grid grid-cols-3 gap-2">{profile.watchDna.map((slice) => <li key={slice.category} className="flex items-center justify-between border-t border-white/[0.07] pt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-white/45"><span>{t.studio[CATEGORY_LABELS[slice.category]]}</span><span className="text-white/75">{slice.percentage}%</span></li>)}</ul>
        </CyberCard>

        <CyberCard className="min-h-[360px]" accent="#ffb800">
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-semibold uppercase text-white">{t.profile.trophyTitle}</h2><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-white/35">{t.profile.trophySubtitle.replace("NN", profile.trophies.length.toString().padStart(2, "0"))}</p></div><Trophy className="size-5 text-[#ffb800]" /></div>
          <div className="mt-5 space-y-3">
            {profile.trophies.map((trophy, index) => {
              const style = RARITY_STYLE[trophy.rarity];
              const Icon = style.icon;
              return <motion.article key={trophy.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="relative flex items-start gap-3 border border-white/[0.08] bg-black/15 p-3 cyber-chamfer-sm" style={{ borderLeftColor: style.color, borderLeftWidth: 2 }}>
                <span className="grid size-10 shrink-0 place-items-center bg-white/[0.04] cyber-chamfer-sm" style={{ color: style.color }}><Icon className="size-4" /></span>
                <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="font-display text-sm font-semibold uppercase text-white/90">{trophy.title}</span><span className="font-mono text-[8px] uppercase tracking-[0.15em]" style={{ color: style.color }}>{t.profile[style.label]}</span></span><span className="mt-1 block text-xs leading-relaxed text-white/40">{trophy.description}</span><span className="mt-2 block font-mono text-[8px] uppercase tracking-[0.12em] text-white/25">{t.profile.unlocked.replace("NN", new Date(trophy.unlockedAt).toLocaleDateString())}</span></span>
              </motion.article>;
            })}
          </div>
        </CyberCard>
      </div>

      <section className="mt-5" aria-labelledby="blacklist-heading">
        <CyberCard accent="#ff0055" className="gap-0">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="blacklist-heading" className="font-display text-lg font-semibold uppercase text-white">{t.profile.blacklistTitle}</h2><p className="mt-1 text-xs text-white/40">{t.profile.blacklistSubtitle}</p></div><HudBadge tone="danger" variant="ghost" size="sm" icon={<Ban />}>{t.profile.blacklistBadge}</HudBadge></div>
          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45"><UserRound className="size-3.5 text-[var(--neon-primary)]" />{t.profile.channels}</h3>
              <form onSubmit={submitChannel} className="flex gap-2"><input value={channelInput} onChange={(event) => setChannelInput(event.target.value)} list="known-channels" placeholder={t.profile.channelPlaceholder} className="min-w-0 flex-1 border border-white/10 bg-black/25 px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/25 focus:border-[var(--neon-primary)]/50 focus:outline-none" aria-label={t.profile.channelPlaceholder} /><datalist id="known-channels">{channels.map((channel) => <option key={channel.id} value={channel.handle}>{channel.name}</option>)}</datalist><NeonButton type="submit" size="sm" aria-label={t.profile.add} disabled={!channelInput.trim()} leftIcon={<Plus />}>{t.profile.add}</NeonButton></form>
              <ul className="mt-3 space-y-2">{blacklistedChannels.length === 0 ? <li className="border border-dashed border-white/10 p-3 font-mono text-[9px] text-white/30">{t.profile.noChannels}</li> : blacklistedChannels.map((id) => {
                const channel = channels.find((item) => item.id === id);
                return <li key={id} className="flex items-center gap-3 border border-white/[0.07] px-3 py-2"><span className="min-w-0 flex-1"><span className="block truncate text-xs text-white/75">{channel?.name ?? t.profile.channelFallback}</span><span className="block truncate font-mono text-[9px] text-white/30">{channel?.handle ?? id}</span></span><button type="button" onClick={() => { whitelistChannel(id); triggerHaptic("tick"); }} className="flex min-h-9 items-center gap-1.5 px-2 font-mono text-[8px] uppercase text-white/45 hover:text-[var(--neon-success)]" aria-label={t.profile.removeAria.replace("NN", channel?.name ?? id)}><X className="size-3" />{t.profile.remove}</button></li>;
              })}</ul>
            </div>
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-white/45"><LockKeyhole className="size-3.5 text-[var(--neon-secondary)]" />{t.profile.keywords}</h3>
              <form onSubmit={submitKeyword} className="flex gap-2"><input value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} placeholder={t.profile.keywordPlaceholder} className="min-w-0 flex-1 border border-white/10 bg-black/25 px-3 py-2.5 font-mono text-xs text-white placeholder:text-white/25 focus:border-[var(--neon-secondary)]/50 focus:outline-none" aria-label={t.profile.keywordPlaceholder} /><NeonButton type="submit" size="sm" aria-label={t.profile.add} disabled={!keywordInput.trim()} leftIcon={<Plus />}>{t.profile.add}</NeonButton></form>
              <ul className="mt-3 flex flex-wrap gap-2">{blacklistedKeywords.length === 0 ? <li className="w-full border border-dashed border-white/10 p-3 font-mono text-[9px] text-white/30">{t.profile.noKeywords}</li> : blacklistedKeywords.map((keyword) => <li key={keyword} className="flex items-center gap-1.5 border border-[var(--neon-secondary)]/25 bg-[var(--neon-secondary)]/[0.05] px-2 py-1.5 font-mono text-[9px] text-white/65"><span>{keyword}</span><button type="button" onClick={() => { whitelistKeyword(keyword); triggerHaptic("tick"); }} className="grid size-6 place-items-center text-white/35 hover:text-white" aria-label={t.profile.removeAria.replace("NN", keyword)}><X className="size-3" /></button></li>)}</ul>
            </div>
          </div>
          <div className="mt-5 flex items-center gap-2 border-t border-white/[0.07] pt-3 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25"><Check className="size-3 text-[var(--neon-success)]" />{t.profile.rankingNote}</div>
        </CyberCard>
      </section>
      <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-4 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25"><span>{t.profile.identityRecord.replace("NN", profile.handle)}</span><Link href="/studio" className="inline-flex items-center gap-1.5 text-[var(--neon-primary)] hover:text-white">{t.profile.openStudio} <ArrowUpRight className="size-3" /></Link></footer>
    </main>
  );
}
