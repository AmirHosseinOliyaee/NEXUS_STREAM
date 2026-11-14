import type { HTMLAttributes, Ref } from "react";

import { cn } from "@/lib/utils";
import type { CssVariables } from "@/types/css";

export type CyberChamfer = "sm" | "lg";
export type CyberSurface = "elevated" | "glass";

const CHAMFER_CLASS: Record<CyberChamfer, string> = {
  sm: "cyber-chamfer-sm",
  lg: "cyber-chamfer-lg",
};

export interface CyberCardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  /** Any CSS color / var() used for the border, brackets and hover glow. */
  accent?: string;
  /** 8px or 16px corner cut. */
  chamfer?: CyberChamfer;
  /** Opaque tactical surface or translucent HUD glass. */
  surface?: CyberSurface;
  /** Enables the accent border + neon glow on hover/focus. */
  interactive?: boolean;
  /** Renders the L-shaped HUD brackets on the two straight corners. */
  brackets?: boolean;
}

/**
 * Chamfered tactical container. Borders, corner brackets and the hover glow
 * all inherit the `accent` prop so a card can instantly retint with a video's
 * dominant color.
 */
export function CyberCard({
  ref,
  accent = "var(--neon-primary)",
  chamfer = "sm",
  surface = "elevated",
  interactive = false,
  brackets = true,
  className,
  style,
  children,
  ...props
}: CyberCardProps) {
  const chamferClass = CHAMFER_CLASS[chamfer];

  return (
    <div
      ref={ref}
      data-interactive={interactive}
      className={cn(
        "cyber-card group/card relative isolate flex flex-col p-5",
        className,
      )}
      style={{ ...style, "--card-accent": accent } as CssVariables}
      {...props}
    >
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 border transition-colors duration-300",
          chamferClass,
          surface === "glass"
            ? "cyber-glass"
            : "border-white/[0.08] bg-elevated",
          interactive &&
            "group-hover/card:border-[var(--card-accent)] focus-within:border-[var(--card-accent)]",
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),transparent_42%)]",
          chamferClass,
        )}
      />

      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-0 -z-10 h-px w-1/3 bg-gradient-to-r from-[var(--card-accent)] to-transparent opacity-50 transition-opacity duration-300",
          interactive && "group-hover/card:opacity-100",
        )}
      />

      {brackets ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10"
        >
          <span className="cyber-card__bracket absolute left-0 top-0 size-3.5 border-l border-t border-[var(--card-accent)]" />
          <span className="cyber-card__bracket absolute bottom-0 right-0 size-3.5 border-b border-r border-[var(--card-accent)]" />
        </div>
      ) : null}

      {children}
    </div>
  );
}
