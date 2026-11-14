import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export type HudTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "neutral";

export type HudBadgeVariant = "soft" | "solid" | "outline" | "ghost";
export type HudBadgeSize = "sm" | "md";

const SIZE_CLASS: Record<HudBadgeSize, string> = {
  sm: "h-5 px-2 text-[9px] tracking-[0.16em]",
  md: "h-6 px-2.5 text-[10px] tracking-[0.18em]",
};

export interface HudBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: HudTone;
  variant?: HudBadgeVariant;
  size?: HudBadgeSize;
  /** Show the telemetry dot glyph. */
  dot?: boolean;
  /** Animate the dot with a radar ping (implies `dot`). */
  pulse?: boolean;
  icon?: ReactNode;
}

/**
 * Monospace telemetry badge for live status, durations, categories and match
 * scores. Tone maps onto the neon tokens via `--badge-accent`.
 */
export function HudBadge({
  tone = "primary",
  variant = "soft",
  size = "md",
  dot = false,
  pulse = false,
  icon,
  className,
  children,
  ...props
}: HudBadgeProps) {
  const showDot = dot || pulse;

  return (
    <span
      data-tone={tone}
      data-variant={variant}
      className={cn(
        "hud-badge font-mono font-medium uppercase leading-none [&_svg]:size-3",
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {icon}
        </span>
      ) : null}

      {showDot ? (
        <span aria-hidden="true" className="relative flex size-1.5 shrink-0">
          {pulse ? (
            <span className="hud-dot-ping absolute inline-flex size-full animate-ping rounded-full bg-[var(--badge-accent)] opacity-75 motion-reduce:animate-none" />
          ) : null}
          <span className="hud-dot relative inline-flex size-1.5 rounded-full bg-[var(--badge-accent)]" />
        </span>
      ) : null}

      <span className="relative">{children}</span>
    </span>
  );
}
