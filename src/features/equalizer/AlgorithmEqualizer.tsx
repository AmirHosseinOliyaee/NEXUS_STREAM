"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";

import { CyberCard } from "@/components/ui/CyberCard";
import { HudSlider } from "@/components/ui/HudSlider";
import { NeonButton } from "@/components/ui/NeonButton";
import { triggerHaptic } from "@/lib/haptics";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  useAppStore,
  type EqualizerWeightKey,
} from "@/stores/useAppStore";

interface FaderSpec {
  readonly key: EqualizerWeightKey;
  readonly labelKey: "noveltyLabel" | "depthLabel" | "hypeLabel";
  readonly hintKey: "noveltyHint" | "depthHint" | "hypeHint";
  readonly accent: string;
}

const FADERS: readonly FaderSpec[] = [
  {
    key: "novelty",
    labelKey: "noveltyLabel",
    hintKey: "noveltyHint",
    accent: "var(--neon-primary)",
  },
  {
    key: "depth",
    labelKey: "depthLabel",
    hintKey: "depthHint",
    accent: "var(--neon-secondary)",
  },
  {
    key: "hype",
    labelKey: "hypeLabel",
    hintKey: "hypeHint",
    accent: "var(--neon-warning)",
  },
];

const NEUTRAL_WEIGHT = 50;

/**
 * Algorithm Equalizer control deck. Desktop renders a three-fader horizontal
 * deck; mobile collapses it behind a compact mix readout.
 */
export function AlgorithmEqualizer() {
  const weights = useAppStore((state) => state.equalizerWeights);
  const setEqualizerWeight = useAppStore((state) => state.setEqualizerWeight);
  const toggleChronoPure = useAppStore((state) => state.toggleChronoPure);
  const { t } = useI18n();

  const [isDeckOpen, setDeckOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isChronoPure = weights.chronoPure;

  useEffect(() => {
    if (!isDeckOpen) return;
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [isDeckOpen]);

  const handleChronoToggle = (): void => {
    triggerHaptic("tick");
    toggleChronoPure();
  };

  const handleNukeReset = (): void => {
    setEqualizerWeight("novelty", NEUTRAL_WEIGHT);
    setEqualizerWeight("depth", NEUTRAL_WEIGHT);
    setEqualizerWeight("hype", NEUTRAL_WEIGHT);
    if (isChronoPure) toggleChronoPure();
    triggerHaptic("heavy");
  };

  return (
    <CyberCard
      ref={panelRef}
      surface="glass"
      chamfer="lg"
      accent="var(--neon-primary)"
      className="scroll-mt-24 p-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid size-8 place-items-center border border-[var(--neon-primary)]/40 bg-[var(--neon-primary)]/10 cyber-chamfer-sm">
            <SlidersHorizontal className="size-4 text-[var(--neon-primary)]" />
          </span>
          <div>
            <h2 className="font-display text-[11px] font-semibold uppercase tracking-[0.28em] text-white/85">
              {t.equalizer.title}
            </h2>
            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/30">
              {t.equalizer.subtitle}
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={isChronoPure}
            onClick={handleChronoToggle}
            className={cn(
              "group flex h-8 items-center gap-2.5 border px-2.5 cyber-chamfer-sm transition-colors duration-200",
              isChronoPure
                ? "border-[var(--neon-primary)]/45 bg-[var(--neon-primary)]/[0.08]"
                : "border-white/[0.08] bg-white/[0.02] hover:border-white/20",
            )}
          >
            <span
              className={cn(
                "font-mono text-[8px] uppercase tracking-[0.16em] transition-colors duration-200",
                isChronoPure
                  ? "text-[var(--neon-primary)]"
                  : "text-white/45 group-hover:text-white/70",
              )}
            >
              {t.equalizer.chronoPure}
            </span>
            <span
              className={cn(
                "relative h-4 w-8 border transition-colors duration-200",
                isChronoPure
                  ? "border-[var(--neon-primary)]/60 bg-[var(--neon-primary)]/15"
                  : "border-white/15 bg-white/[0.04]",
              )}
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className={cn(
                  "absolute top-0.5 size-2.5",
                  isChronoPure
                    ? "left-[18px] bg-[var(--neon-primary)]"
                    : "left-0.5 bg-white/35",
                )}
              />
            </span>
          </button>

          <NeonButton
            variant="danger"
            size="sm"
            leftIcon={<RotateCcw />}
            haptic={false}
            onClick={handleNukeReset}
          >
            {t.equalizer.nukeReset}
          </NeonButton>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          triggerHaptic("tick");
          setDeckOpen((open) => !open);
        }}
        aria-expanded={isDeckOpen}
        aria-controls="equalizer-deck"
        className="flex w-full items-center gap-2 border-t border-white/[0.07] px-4 py-2.5 md:hidden"
      >
        <SlidersHorizontal className="size-3.5 text-[var(--neon-primary)]" />
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-white/40">
          {t.equalizer.axisMix}
        </span>
        <span className="ml-auto font-mono text-[9px] tabular-nums text-white/55">
          {weights.novelty} / {weights.depth} / {weights.hype}
        </span>
        <motion.span
          animate={{ rotate: isDeckOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="grid place-items-center"
        >
          <ChevronDown className="size-3.5 text-white/30" />
        </motion.span>
      </button>

      <div
        id="equalizer-deck"
        className={cn(
          "grid gap-5 border-t border-white/[0.07] px-4 py-4 sm:px-5 sm:py-5 md:grid-cols-3",
          isDeckOpen ? "grid" : "hidden md:grid",
        )}
      >
        {FADERS.map((fader) => (
          <HudSlider
            key={fader.key}
            label={t.equalizer[fader.labelKey]}
            hint={t.equalizer[fader.hintKey]}
            accent={fader.accent}
            value={weights[fader.key]}
            disabled={isChronoPure}
            className={isChronoPure ? "opacity-70" : undefined}
            onValueChange={(value) => setEqualizerWeight(fader.key, value)}
          />
        ))}

        {isChronoPure ? (
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--neon-primary)]/70 md:col-span-3">
            {t.equalizer.bypassNotice}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2.5 sm:px-5">
        <span className="font-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
          {t.equalizer.footerAxes}
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.16em]",
            isChronoPure ? "text-[var(--neon-primary)]" : "text-white/25",
          )}
        >
          <span
            className={cn(
              "size-1",
              isChronoPure ? "bg-[var(--neon-primary)]" : "bg-white/25",
            )}
          />
          {isChronoPure
            ? t.equalizer.footerEngaged
            : t.equalizer.footerOnline}
        </span>
      </div>
    </CyberCard>
  );
}
