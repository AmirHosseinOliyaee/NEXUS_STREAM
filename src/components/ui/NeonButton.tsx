"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

import { triggerHaptic, type HapticPattern } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { CssVariables } from "@/types/css";

export type NeonButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type NeonButtonSize = "sm" | "md" | "lg";

const VARIANT_ACCENT: Record<NeonButtonVariant, string> = {
  primary: "var(--neon-primary)",
  secondary: "var(--neon-secondary)",
  danger: "var(--neon-danger)",
  ghost: "rgba(255, 255, 255, 0.72)",
};

const VARIANT_CLASS: Record<NeonButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--btn-accent)] text-[var(--bg-void)] hover:brightness-110",
  secondary:
    "border-[var(--btn-accent)]/50 bg-[var(--btn-accent)]/10 text-[var(--btn-accent)] hover:border-[var(--btn-accent)] hover:bg-[var(--btn-accent)]/20",
  danger:
    "border-[var(--btn-accent)]/55 bg-[var(--btn-accent)]/[0.04] text-[var(--btn-accent)] hover:border-[var(--btn-accent)] hover:bg-[var(--btn-accent)]/14",
  ghost:
    "border-white/[0.14] bg-white/[0.03] text-white/65 hover:border-white/30 hover:bg-white/[0.07] hover:text-white",
};

const SIZE_CLASS: Record<NeonButtonSize, string> = {
  sm: "h-8 px-3 text-[10px] tracking-[0.16em]",
  md: "h-10 px-5 text-[11px] tracking-[0.18em]",
  lg: "h-12 px-7 text-xs tracking-[0.2em]",
};

const ICON_SIZE_CLASS: Record<NeonButtonSize, string> = {
  sm: "w-8 px-0",
  md: "w-10 px-0",
  lg: "w-12 px-0",
};

export interface NeonButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  /** Optional accent override; defaults to the variant's neon token. */
  accent?: string;
  /** Haptic pattern fired on activation. `false` disables vibration. */
  haptic?: HapticPattern | false;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Stretch to the width of the parent container. */
  fullWidth?: boolean;
  /** Square aspect for icon-only actuators. */
  iconOnly?: boolean;
}

/**
 * Tactical actuator. Chamfered geometry, variant-tinted neon glow on
 * hover/focus, and a haptic tick on every intentional activation.
 */
export const NeonButton = forwardRef<HTMLButtonElement, NeonButtonProps>(
  function NeonButton(
    {
      variant = "primary",
      size = "md",
      accent,
      haptic = "tick",
      leftIcon,
      rightIcon,
      fullWidth = false,
      iconOnly = false,
      type = "button",
      className,
      style,
      onClick,
      children,
      ...props
    },
    ref,
  ) {
    const handleClick = (event: MouseEvent<HTMLButtonElement>): void => {
      if (haptic) triggerHaptic(haptic);
      onClick?.(event);
    };

    return (
      <span
        className={cn(
          "neon-button-shell group/btn relative isolate inline-flex",
          fullWidth && "w-full",
        )}
        style={
          {
            "--btn-accent":
              accent ?? VARIANT_ACCENT[variant],
          } as CssVariables
        }
      >
        <button
          ref={ref}
          type={type}
          className={cn(
            "neon-button relative inline-flex items-center justify-center gap-2 whitespace-nowrap border font-display font-medium uppercase leading-none transition-[background-color,border-color,color,filter,opacity] duration-200 cyber-chamfer-sm disabled:cursor-not-allowed disabled:opacity-40 [&_svg]:size-3.5 [&_svg]:shrink-0",
            VARIANT_CLASS[variant],
            SIZE_CLASS[size],
            iconOnly && ICON_SIZE_CLASS[size],
            fullWidth && "w-full",
            className,
          )}
          style={style}
          onClick={handleClick}
          {...props}
        >
          {leftIcon ? (
            <span aria-hidden="true" className="relative inline-flex">
              {leftIcon}
            </span>
          ) : null}
          {children ? <span className="relative">{children}</span> : null}
          {rightIcon ? (
            <span aria-hidden="true" className="relative inline-flex">
              {rightIcon}
            </span>
          ) : null}
        </button>
      </span>
    );
  },
);
