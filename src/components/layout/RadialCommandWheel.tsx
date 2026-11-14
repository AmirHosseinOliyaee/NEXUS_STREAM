"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AudioLines,
  PictureInPicture2,
  Share2,
  SkipForward,
  X,
  type LucideIcon,
} from "lucide-react";

import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { useQueueStore } from "@/stores/useQueueStore";

const RADIUS = 108;
const WHEEL_MARGIN = RADIUS + 58;

interface WheelAnchor {
  x: number;
  y: number;
}

interface WheelAction {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly angleDeg: number;
  readonly isActive: boolean;
  readonly run: () => void;
}

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Global tactical command wheel. Opens on right-click or a touch long-press at
 * the cursor, radiates four context actions and closes on Escape, backdrop
 * click, scroll or resize.
 */
export function RadialCommandWheel() {
  const [anchor, setAnchor] = useState<WheelAnchor | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const firstNodeRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const playNext = useQueueStore((state) => state.playNext);
  const togglePip = usePlayerStore((state) => state.togglePip);
  const toggleAudioDeck = usePlayerStore((state) => state.toggleAudioDeck);
  const isPipMode = usePlayerStore((state) => state.isPipMode);
  const audioDeckMode = usePlayerStore((state) => state.audioDeckMode);

  const shareCurrentView = useCallback(async (): Promise<void> => {
    const url = window.location.href;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "NEXUS STREAM", url });
        return;
      } catch {
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard permissions can be denied; the wheel still closes.
    }
  }, []);

  const closeWheel = useCallback((restoreFocus = true): void => {
    setAnchor(null);
    const target = lastFocusedRef.current;
    lastFocusedRef.current = null;
    if (restoreFocus) target?.focus({ preventScroll: true });
  }, []);

  const openAt = useCallback((clientX: number, clientY: number): void => {
    if (!lastFocusedRef.current && document.activeElement instanceof HTMLElement) {
      lastFocusedRef.current = document.activeElement;
    }

    const x = Math.min(
      Math.max(clientX, WHEEL_MARGIN),
      window.innerWidth - WHEEL_MARGIN,
    );
    const y = Math.min(
      Math.max(clientY, WHEEL_MARGIN),
      window.innerHeight - WHEEL_MARGIN,
    );

    setAnchor({ x, y });
    triggerHaptic("pulse");
  }, []);

  useEffect(() => {
    const handleContextMenu = (event: MouseEvent): void => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("input, textarea, [contenteditable='true']")
      ) {
        return;
      }
      if (document.querySelector('[aria-modal="true"]')) {
        event.preventDefault();
        return;
      }
      if (target instanceof Element && target.closest("[role='dialog']")) {
        return;
      }
      event.preventDefault();
      openAt(event.clientX, event.clientY);
    };

    window.addEventListener("contextmenu", handleContextMenu);
    return () => window.removeEventListener("contextmenu", handleContextMenu);
  }, [openAt]);

  useEffect(() => {
    let timer: number | null = null;
    let origin: { x: number; y: number } | null = null;

    const cancel = (): void => {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      origin = null;
    };

    const handlePointerDown = (event: PointerEvent): void => {
      if (event.pointerType !== "touch") return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("a, button, input, textarea, [role='button'], [role='dialog']")
      ) {
        return;
      }

      origin = { x: event.clientX, y: event.clientY };
      timer = window.setTimeout(() => {
        openAt(event.clientX, event.clientY);
        cancel();
      }, 500);
    };

    const handlePointerMove = (event: PointerEvent): void => {
      if (!origin) return;
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) {
        cancel();
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, {
      passive: true,
    });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("pointerup", cancel);
    window.addEventListener("pointercancel", cancel);

    return () => {
      cancel();
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cancel);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [openAt]);

  useEffect(() => {
    if (!anchor) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        closeWheel();
        return;
      }
      if (event.key !== "Tab" || !containerRef.current) return;

      const buttons = Array.from(
        containerRef.current.querySelectorAll<HTMLButtonElement>("button"),
      );
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    const dismiss = (): void => closeWheel(false);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", dismiss, true);
    window.addEventListener("resize", dismiss);

    const focusTimer = window.setTimeout(() => {
      firstNodeRef.current?.focus({ preventScroll: true });
    }, 90);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", dismiss, true);
      window.removeEventListener("resize", dismiss);
    };
  }, [anchor, closeWheel]);

  const actions: readonly WheelAction[] = [
    {
      id: "play-next",
      label: "Play next",
      icon: SkipForward,
      angleDeg: -45,
      isActive: false,
      run: () => playNext(),
    },
    {
      id: "share",
      label: "Share",
      icon: Share2,
      angleDeg: 45,
      isActive: false,
      run: () => {
        void shareCurrentView();
      },
    },
    {
      id: "pip",
      label: "PiP",
      icon: PictureInPicture2,
      angleDeg: 135,
      isActive: isPipMode,
      run: () => togglePip(),
    },
    {
      id: "audio-deck",
      label: "Audio deck",
      icon: AudioLines,
      angleDeg: 225,
      isActive: audioDeckMode,
      run: () => toggleAudioDeck(),
    },
  ];

  const runAction = (action: WheelAction): void => {
    triggerHaptic("heavy");
    action.run();
    closeWheel();
  };

  return (
    <AnimatePresence>
      {anchor ? (
        <motion.div
          key="radial-command-wheel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          className="pointer-events-none fixed inset-0 z-[70]"
        >
          <button
            type="button"
            aria-label="Close command wheel"
            onClick={() => closeWheel()}
            className="pointer-events-auto absolute inset-0 cursor-default bg-[var(--bg-void)]/35 backdrop-blur-[2px]"
            tabIndex={-1}
          />

          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Radial command wheel"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            className="pointer-events-auto absolute"
            style={{ left: anchor.x, top: anchor.y }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 -ml-[132px] -mt-[132px] size-[264px] rounded-full border border-dashed border-white/[0.07]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-0 -ml-[52px] -mt-[52px] size-[104px] rounded-full border border-white/[0.04]"
            />

            <motion.button
              type="button"
              onClick={() => closeWheel()}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              aria-label="Close command wheel"
              className="absolute left-0 top-0 -ml-[18px] -mt-[18px] grid size-9 place-items-center rounded-full border border-[var(--neon-primary)]/45 bg-[var(--bg-void)] text-[var(--neon-primary)] shadow-[0_0_26px_-6px_var(--neon-primary)]"
            >
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full border border-[var(--neon-primary)]/40"
                animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
                transition={{
                  duration: 1.9,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <X className="relative size-4" />
            </motion.button>

            <span className="absolute left-0 top-0 -ml-[60px] mt-[150px] w-[120px] text-center font-mono text-[8px] uppercase tracking-[0.24em] text-white/25">
              Command wheel
            </span>

            {actions.map((action, index) => {
              const radians = toRadians(action.angleDeg);
              const dx = Math.cos(radians) * RADIUS;
              const dy = Math.sin(radians) * RADIUS;
              const Icon = action.icon;

              return (
                <motion.button
                  key={action.id}
                  ref={index === 0 ? firstNodeRef : undefined}
                  type="button"
                  onClick={() => runAction(action)}
                  onMouseEnter={() => triggerHaptic("tick")}
                  initial={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                  animate={{ x: dx, y: dy, scale: 1, opacity: 1 }}
                  exit={{ x: 0, y: 0, scale: 0.2, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 380,
                    damping: 26,
                    delay: 0.03 * index,
                  }}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.94 }}
                  aria-label={action.label}
                  aria-pressed={action.isActive}
                  className={cn(
                    "absolute left-0 top-0 -ml-6 -mt-6 z-10 grid size-12 place-items-center rounded-full border bg-[var(--bg-hud)] backdrop-blur-md transition-colors duration-200 hover:border-[var(--neon-primary)] hover:text-[var(--neon-primary)] hover:shadow-[0_0_24px_-2px_var(--neon-primary)]",
                    action.isActive
                      ? "neon-glow text-[var(--neon-primary)]"
                      : "border-white/15 text-white/65",
                  )}
                >
                  <Icon className="size-4" />
                  {action.isActive ? (
                    <span className="absolute right-1 top-1 size-1 rounded-full bg-[var(--neon-primary)]" />
                  ) : null}
                  <span className="pointer-events-none absolute top-full mt-2 whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.16em] text-white/40">
                    {action.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
