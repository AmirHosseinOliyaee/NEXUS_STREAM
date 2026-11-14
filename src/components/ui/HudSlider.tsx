"use client";

import { useId, type ChangeEvent } from "react";

import { cn } from "@/lib/utils";
import type { CssVariables } from "@/types/css";

const TICK_COUNT = 11;

export interface HudSliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Accent override; defaults to the reactive primary neon. */
  accent?: string;
  disabled?: boolean;
  /** Optional mono caption under the label. */
  hint?: string;
  showTicks?: boolean;
  /** Custom readout formatter; defaults to the live percentage. */
  formatValue?: (value: number, percent: number) => string;
  className?: string;
  id?: string;
}

/**
 * DJ-style cyber fader: a native range input (fully keyboard/screen-reader
 * accessible) layered over a chamfered neon track with a live `font-mono`
 * percentage readout.
 */
export function HudSlider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  accent = "var(--neon-primary)",
  disabled = false,
  hint,
  showTicks = true,
  formatValue,
  className,
  id,
}: HudSliderProps) {
  const autoId = useId();
  const sliderId = id ?? autoId;

  const range = max - min;
  const rawPercent = range > 0 ? ((value - min) / range) * 100 : 0;
  const percent = Math.min(100, Math.max(0, rawPercent));

  const readout = formatValue
    ? formatValue(value, percent)
    : `${Math.round(percent).toString().padStart(3, "0")}%`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onValueChange(Number(event.target.value));
  };

  return (
    <div
      className={cn(
        "group/fader select-none",
        disabled && "opacity-45",
        className,
      )}
      style={{ "--fader-accent": accent } as CssVariables}
    >
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <label
            htmlFor={sliderId}
            className="block font-display text-[10px] font-medium uppercase tracking-[0.24em] text-white/45 transition-colors duration-200 group-hover/fader:text-white/75"
          >
            {label}
          </label>
          {hint ? (
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-white/25">
              {hint}
            </p>
          ) : null}
        </div>

        <output
          htmlFor={sliderId}
          className="shrink-0 font-mono text-sm font-medium tabular-nums text-[var(--fader-accent)]"
        >
          {readout}
        </output>
      </div>

      <div className="relative mt-3 h-9">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/[0.1]"
        />

        <div
          aria-hidden="true"
          className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-[var(--fader-accent)]"
          style={{ width: `${percent}%` }}
        />

        {showTicks ? (
          <div aria-hidden="true" className="absolute inset-0">
            {Array.from({ length: TICK_COUNT }, (_, index) => {
              const tickPercent = (index / (TICK_COUNT - 1)) * 100;
              const isActive = tickPercent <= percent + 0.001;
              return (
                <span
                  key={index}
                  className={cn(
                    "absolute top-1/2 h-1.5 w-px -translate-x-1/2 -translate-y-1/2 transition-colors duration-150",
                    isActive
                      ? "bg-[var(--fader-accent)]/65"
                      : "bg-white/[0.12]",
                  )}
                  style={{ left: `${tickPercent}%` }}
                />
              );
            })}
          </div>
        ) : null}

        <input
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={handleChange}
          className="hud-fader absolute inset-0 z-10 h-full w-full cursor-pointer disabled:cursor-not-allowed"
        />
      </div>

      <div
        aria-hidden="true"
        className="mt-1 flex items-center gap-3 font-mono text-[9px] tracking-[0.18em] text-white/20"
      >
        <span>{min.toString().padStart(3, "0")}</span>
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span>{max.toString().padStart(3, "0")}</span>
      </div>
    </div>
  );
}
