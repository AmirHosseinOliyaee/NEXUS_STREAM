/**
 * Safe PWA haptics wrapper around the Web Vibration API.
 *
 * SSR-safe, feature-detected, and automatically suppressed for users who ask
 * for reduced motion — vibration is motion felt through the hand.
 */

export type HapticPattern = "tick" | "pulse" | "heavy";

const VIBRATION_PATTERNS: Readonly<Record<HapticPattern, number | number[]>> = {
  /** Crisp confirmation for taps, swatches and icon buttons. */
  tick: 12,
  /** Double-beat used when committing a state change. */
  pulse: [18, 40, 18],
  /** Heavy thud for destructive actions such as Nuke Reset. */
  heavy: 55,
};

/** Whether the current browser can physically vibrate. */
export function isHapticsSupported(): boolean {
  return (
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function"
  );
}

/**
 * Fire a haptic pattern. Returns `true` when the vibration request was
 * accepted, `false` on SSR, unsupported hardware, reduced motion or a
 * browser refusal.
 */
export function triggerHaptic(pattern: HapticPattern = "tick"): boolean {
  if (typeof window === "undefined" || !isHapticsSupported()) return false;

  // Browsers silently block vibration without transient user activation; skip
  // the call entirely so programmatic updates never log an intervention.
  if (!navigator.userActivation?.isActive) return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (prefersReducedMotion) return false;

  try {
    return navigator.vibrate(VIBRATION_PATTERNS[pattern]);
  } catch {
    return false;
  }
}
