import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a duration in seconds as `MM:SS`, or `HH:MM:SS` once it reaches an
 * hour. Non-finite and negative inputs collapse to `00:00`.
 */
export function formatDuration(sec: number): string {
  const safeSec = Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : 0;

  const hours = Math.floor(safeSec / 3600);
  const minutes = Math.floor((safeSec % 3600) / 60);
  const seconds = safeSec % 60;
  const pad = (value: number): string => value.toString().padStart(2, "0");

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

interface CompactUnit {
  readonly threshold: number;
  readonly suffix: "K" | "M" | "B";
}

const COMPACT_UNITS: readonly CompactUnit[] = [
  { threshold: 1_000_000_000, suffix: "B" },
  { threshold: 1_000_000, suffix: "M" },
  { threshold: 1_000, suffix: "K" },
];

/**
 * Format a count using compact notation (`842`, `1.2K`, `3.4M`, `1.1B`).
 * Uses deterministic rounding so server and client render identical output.
 */
export function formatCompactNumber(num: number): string {
  if (!Number.isFinite(num)) return "0";

  const sign = num < 0 ? "-" : "";
  const absolute = Math.abs(num);

  for (const unit of COMPACT_UNITS) {
    if (absolute >= unit.threshold) {
      const scaled = Math.round((absolute / unit.threshold) * 10) / 10;
      const value = Number.isInteger(scaled)
        ? scaled.toFixed(0)
        : scaled.toFixed(1);
      return `${sign}${value}${unit.suffix}`;
    }
  }

  return `${sign}${Math.round(absolute)}`;
}

const RELATIVE_UNITS: readonly {
  readonly seconds: number;
  readonly suffix: string;
}[] = [
  { seconds: 31_536_000, suffix: "Y" },
  { seconds: 2_592_000, suffix: "MO" },
  { seconds: 86_400, suffix: "D" },
  { seconds: 3_600, suffix: "H" },
  { seconds: 60, suffix: "M" },
];

/**
 * Compact relative timestamp (`JUST NOW`, `18M AGO`, `2D AGO`, `3MO AGO`).
 * Deterministic for a given `now`, so it can be tested or pinned.
 */
export function formatRelativeTime(
  isoDate: string,
  now: number = Date.now(),
): string {
  const timestamp = Date.parse(isoDate);
  if (!Number.isFinite(timestamp)) return "UNKNOWN";

  const elapsedSeconds = Math.max(0, Math.floor((now - timestamp) / 1000));

  for (const unit of RELATIVE_UNITS) {
    if (elapsedSeconds >= unit.seconds) {
      return `${Math.floor(elapsedSeconds / unit.seconds)}${unit.suffix} AGO`;
    }
  }

  return "JUST NOW";
}
