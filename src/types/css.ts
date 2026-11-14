import type { CSSProperties } from "react";

/**
 * `CSSProperties` extended with custom-property keys so design-system
 * components can pass `--token` variables without casts scattered across the
 * codebase.
 */
export type CssVariables = CSSProperties &
  Record<`--${string}`, string | number>;
