"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleHelp,
  Clock3,
  Eye,
  Flame,
  Gauge,
  Play,
  Plus,
  Radio,
  Signal,
  Sparkles,
  UploadCloud,
  UsersRound,
  WandSparkles,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { CyberCard } from "@/components/ui/CyberCard";
import { HudBadge } from "@/components/ui/HudBadge";
import { NeonButton } from "@/components/ui/NeonButton";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { db } from "@/services/db";
import type { VideoCategory } from "@/types/schema";

const RETENTION = [
  { minute: "0:00", retention: 100, hype: 18 },
  { minute: "1:00", retention: 82, hype: 38 },
  { minute: "2:00", retention: 77, hype: 52 },
  { minute: "3:00", retention: 69, hype: 45 },
  { minute: "4:00", retention: 67, hype: 73 },
  { minute: "5:00", retention: 58, hype: 61 },
  { minute: "6:00", retention: 54, hype: 86 },
  { minute: "7:00", retention: 48, hype: 70 },
  { minute: "8:00", retention: 43, hype: 58 },
  { minute: "9:00", retention: 38, hype: 78 },
  { minute: "10:00", retention: 35, hype: 64 },
];

const CATEGORY_OPTIONS: {
  value: VideoCategory;
  labelKey:
    | "categoryTech"
    | "categoryGaming"
    | "categoryScience"
    | "categoryMusic"
    | "categoryCyberculture"
    | "categoryDesign";
}[] = [
  { value: "tech", labelKey: "categoryTech" },
  { value: "gaming", labelKey: "categoryGaming" },
  { value: "science", labelKey: "categoryScience" },
  { value: "music", labelKey: "categoryMusic" },
  { value: "cyberculture", labelKey: "categoryCyberculture" },
  { value: "design", labelKey: "categoryDesign" },
];

interface UploadFields {
  title: string;
  description: string;
  category: VideoCategory;
  duration: number;
}

export function CreatorStudio() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<VideoCategory>("tech");
  const [duration, setDuration] = useState(420);
  const [notice, setNotice] = useState("");
  const { data: catalog = [] } = useQuery({
    queryKey: ["videos", "studio"],
    queryFn: async () => db.videos.toArray(),
    staleTime: 30_000,
  });
  const mutation = useMutation({
    mutationFn: async (fields: UploadFields) => {
      const id = `upload-${Date.now().toString(36)}`;
      const cleanedTitle = fields.title.trim();
      const color = category === "gaming" ? "#ff0055" : category === "music" ? "#bc13fe" : "#00f0ff";
      const video = {
        id,
        title: cleanedTitle,
        description: fields.description.trim(),
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&h=720&q=80",
        dominantColorHex: color,
        durationSec: fields.duration,
        viewsCount: 0,
        publishedAt: new Date().toISOString(),
        format: "long" as const,
        channel: {
          id: "chan-nyx-studio",
          handle: "@netrunner-01",
          name: "NYX Studio",
          avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=facearea&facepad=2&w=160&h=160&q=80",
          subscribersCount: 128_400,
          isVerified: true,
        },
        category: fields.category,
        complexityScore: 55,
        noveltyScore: 68,
        hypeScore: 64,
        heatmap: [
          { id: `${id}-mark-1`, timestampSec: Math.min(45, fields.duration / 4), durationSec: 12, intensity: 72, emotion: "insight" as const, label: "Opening signal" },
          { id: `${id}-mark-2`, timestampSec: Math.floor(fields.duration * 0.62), durationSec: 18, intensity: 88, emotion: "hype" as const, label: "Peak moment" },
        ],
        transcript: [],
      };
      await db.videos.add(video);
      return video;
    },
    onSuccess: async (video) => {
      setTitle("");
      setDescription("");
      setNotice(t.studio.noticePublished.replace("NN", video.title));
      triggerHaptic("pulse");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["videos"] }),
        queryClient.invalidateQueries({ queryKey: ["neural-search"] }),
        queryClient.invalidateQueries({ queryKey: ["videos", "studio"] }),
      ]);
    },
    onError: () => setNotice(t.studio.noticeFailed),
  });

  const aggregate = useMemo(() => {
    const views = catalog.reduce((sum, video) => sum + video.viewsCount, 0);
    const viewsPerVideo = catalog.length ? views / catalog.length : 0;
    const avgHype = catalog.length
      ? Math.round(catalog.reduce((sum, video) => sum + video.hypeScore, 0) / catalog.length)
      : 0;
    return { views, viewsPerVideo, avgHype };
  }, [catalog]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    mutation.mutate({ title, description, category, duration });
  }

  return (
    <main className="relative isolate mx-auto w-full max-w-[1280px] px-4 pb-32 pt-8 sm:px-6 lg:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[440px]" style={{ background: "radial-gradient(ellipse at 78% 5%, rgba(188,19,254,.11), transparent 58%)" }} />
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[var(--neon-secondary)]"><span className="h-px w-7 bg-current" />{t.studio.kicker} / {t.studio.index}</div>
          <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-white sm:text-4xl">{t.studio.title}</h1>
          <p className="mt-2 max-w-xl text-sm text-white/45">{t.studio.subtitle}</p>
        </div>
        <HudBadge tone="success" variant="ghost" size="sm" dot pulse>{t.studio.uplinkBadge}</HudBadge>
      </header>

      <section aria-label={t.studio.analyticsAria} className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard label={t.studio.kpiTotalViews} value={aggregate.views} suffix={t.studio.kpiTotalViewsSuffix} change={t.studio.kpiTotalViewsChange} icon={Eye} accent="#00f0ff" />
        <KpiCard label={t.studio.kpiRetention} value="58" suffix={t.studio.kpiRetentionSuffix} change={t.studio.kpiRetentionChange} icon={Activity} accent="#bc13fe" />
        <KpiCard label={t.studio.kpiHype} value={aggregate.avgHype} suffix={t.studio.kpiHypeSuffix} change={t.studio.kpiHypeChange} icon={Flame} accent="#ffb800" />
        <KpiCard label={t.studio.kpiViewers} value={Math.round(aggregate.viewsPerVideo * 0.63)} suffix={t.studio.kpiViewersSuffix} change={t.studio.kpiViewersChange} icon={UsersRound} accent="#00e676" />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <CyberCard className="min-h-[400px]" accent="#bc13fe">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="font-display text-lg font-semibold uppercase text-white">{t.studio.retentionTitle}</h2><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-white/35">{t.studio.retentionSubtitle}</p></div>
            <div className="flex gap-3 font-mono text-[8px] uppercase tracking-[0.12em]"><span className="inline-flex items-center gap-1.5 text-[var(--neon-primary)]"><i className="size-1.5 bg-current" />{t.studio.legendRetention}</span><span className="inline-flex items-center gap-1.5 text-[var(--neon-secondary)]"><i className="size-1.5 bg-current" />{t.studio.legendHype}</span></div>
          </div>
          <div className="mt-5 min-h-[290px] flex-1" role="img" aria-label={t.studio.chartAria}>
            <ResponsiveContainer width="100%" height="100%" minHeight={290}>
              <AreaChart data={RETENTION} margin={{ top: 8, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="retention-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#00f0ff" stopOpacity={0.25} /><stop offset="95%" stopColor="#00f0ff" stopOpacity={0} /></linearGradient>
                  <linearGradient id="hype-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#bc13fe" stopOpacity={0.18} /><stop offset="95%" stopColor="#bc13fe" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="minute" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "rgba(255,255,255,.3)", fontSize: 9, fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#10141d", border: "1px solid rgba(255,255,255,.14)", color: "white", fontFamily: "monospace", fontSize: 10 }} />
                <Area type="monotone" dataKey="retention" name={t.studio.seriesRetention} stroke="#00f0ff" strokeWidth={2} fill="url(#retention-fill)" />
                <Area type="monotone" dataKey="hype" name={t.studio.seriesHype} stroke="#bc13fe" strokeWidth={2} fill="url(#hype-fill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CyberCard>

        <CyberCard className="gap-0" accent="#00f0ff">
          <div className="flex items-start justify-between gap-2"><div><h2 className="font-display text-lg font-semibold uppercase text-white">{t.studio.signalCheckTitle}</h2><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/35">{t.studio.signalCheckSubtitle}</p></div><Radio className="size-4 text-[var(--neon-primary)]" /></div>
          <div className="mt-5 divide-y divide-white/[0.07]">
            <MetricRow icon={Play} label={t.studio.metricPublished} value={catalog.length.toString().padStart(2, "0")} />
            <MetricRow icon={BarChart3} label={t.studio.metricViews} value={Math.round(aggregate.viewsPerVideo).toLocaleString()} />
            <MetricRow icon={Clock3} label={t.studio.metricDuration} value={formatMinutes(catalog, t.studio.minutes)} />
            <MetricRow icon={Gauge} label={t.studio.metricHype} value={`${aggregate.avgHype} / 100`} />
          </div>
          <div className="mt-auto border-t border-white/[0.07] pt-4"><p className="text-xs leading-relaxed text-white/40">{t.studio.analyticsNote}</p></div>
        </CyberCard>
      </div>

      <section className="mt-5" aria-labelledby="upload-heading">
        <CyberCard accent="#00f0ff">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex items-center gap-2"><UploadCloud className="size-4 text-[var(--neon-primary)]" /><h2 id="upload-heading" className="font-display text-lg font-semibold uppercase text-white">{t.studio.publishTitle}</h2></div><p className="mt-1 text-xs text-white/40">{t.studio.uploadBody}</p></div><HudBadge tone="neutral" variant="ghost" size="sm">{t.studio.uploadBadge}</HudBadge></div>
          <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="block"><span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">{t.studio.fieldTitle}</span><input required maxLength={110} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t.studio.fieldTitlePlaceholder} className="w-full border border-white/10 bg-black/25 px-3 py-3 text-sm text-white placeholder:text-white/25 focus:border-[var(--neon-primary)]/50 focus:outline-none" /></label>
            <label className="block"><span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">{t.studio.fieldCategory}</span><select value={category} onChange={(event) => setCategory(event.target.value as VideoCategory)} className="w-full border border-white/10 bg-[#0a0d13] px-3 py-3 text-sm text-white focus:border-[var(--neon-primary)]/50 focus:outline-none">{CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{t.studio[option.labelKey]}</option>)}</select></label>
            <label className="block md:col-span-2"><span className="mb-1.5 block font-mono text-[9px] uppercase tracking-[0.16em] text-white/40">{t.studio.fieldDescription}</span><textarea rows={3} maxLength={800} value={description} onChange={(event) => setDescription(event.target.value)} placeholder={t.studio.fieldDescriptionPlaceholder} className="w-full resize-y border border-white/10 bg-black/25 px-3 py-3 text-sm text-white placeholder:text-white/25 focus:border-[var(--neon-primary)]/50 focus:outline-none" /></label>
            <label className="block"><span className="mb-1.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.16em] text-white/40"><span>{t.studio.fieldRuntime}</span><span className="text-white/70">{formatDurationValue(duration)}</span></span><input type="range" min={60} max={3600} step={30} value={duration} onChange={(event) => setDuration(Number(event.target.value))} className="w-full accent-[var(--neon-primary)]" aria-label={t.studio.fieldRuntimeAria} /></label>
            <div className="flex items-end justify-between gap-3"><p className="max-w-xs text-[10px] leading-relaxed text-white/30">{t.studio.uploadNote}</p><NeonButton type="submit" disabled={!title.trim() || mutation.isPending} leftIcon={mutation.isPending ? <Signal className="animate-pulse" /> : <ArrowDownToLine />}>{mutation.isPending ? t.studio.publishing : t.studio.publish}</NeonButton></div>
          </form>
          {notice ? <p role="status" className="mt-4 flex items-center gap-2 border border-[var(--neon-success)]/20 bg-[var(--neon-success)]/[0.04] px-3 py-2.5 text-xs text-white/75"><Check className="size-4 text-[var(--neon-success)]" />{notice}</p> : null}
          <div className="mt-4 flex items-start gap-2 border-t border-white/[0.07] pt-3 text-[10px] leading-relaxed text-white/30"><CircleHelp className="mt-0.5 size-3 shrink-0" />{t.studio.simulatorNote}</div>
        </CyberCard>
      </section>
      <footer className="mt-7 flex items-center justify-between border-t border-white/[0.07] pt-4 font-mono text-[8px] uppercase tracking-[0.16em] text-white/25"><span className="inline-flex items-center gap-1.5"><WandSparkles className="size-3" />{t.studio.footerTelemetry}</span><span>{t.studio.footerCatalog.replace("NN", String(catalog.length))}</span></footer>
    </main>
  );
}

function KpiCard({ label, value, suffix, change, icon: Icon, accent }: { label: string; value: number | string; suffix: string; change: string; icon: typeof Eye; accent: string }) {
  return <CyberCard className="min-h-36 p-4 sm:p-5" accent={accent}>
    <div className="flex items-start justify-between gap-2"><span className="font-mono text-[8px] uppercase tracking-[0.15em] text-white/40 sm:text-[9px]">{label}</span><Icon className="size-4 shrink-0" style={{ color: accent }} /></div>
    <div className="mt-auto pt-5"><p className="font-display text-2xl font-semibold tabular-nums text-white sm:text-3xl">{typeof value === "number" ? value.toLocaleString() : value}<span className="ml-1.5 font-mono text-[9px] font-normal uppercase tracking-[0.12em] text-white/35">{suffix}</span></p><p className="mt-1 flex items-center gap-1 font-mono text-[8px] text-white/30"><ArrowUpRight className="size-2.5 text-[var(--neon-success)]" />{change}</p></div>
  </CyberCard>;
}

function MetricRow({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return <div className="flex items-center gap-3 py-3"><span className="grid size-8 place-items-center bg-white/[0.04] text-[var(--neon-primary)] cyber-chamfer-sm"><Icon className="size-3.5" /></span><span className="min-w-0 flex-1 text-xs text-white/45">{label}</span><span className="font-mono text-[10px] text-white/80">{value}</span></div>;
}

function formatMinutes(videos: { durationSec: number }[], template: string) {
  if (!videos.length) return template.replace("NN", "0");
  return template.replace(
    "NN",
    String(
      Math.round(
        videos.reduce((sum, video) => sum + video.durationSec, 0) /
          videos.length /
          60,
      ),
    ),
  );
}

function formatDurationValue(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
