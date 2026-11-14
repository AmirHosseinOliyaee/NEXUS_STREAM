"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  Home,
  Library,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { triggerHaptic } from "@/lib/haptics";
import { cn } from "@/lib/utils";

type DockSlotId = "home" | "discover" | "library" | "hyper";

interface DockSlot {
  readonly id: DockSlotId;
  readonly label: string;
  readonly icon: LucideIcon;
}

const SLOTS: readonly DockSlot[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "library", label: "Library", icon: Library },
  { id: "hyper", label: "Hyper", icon: Zap },
];

/**
 * User-owned four-slot navigation dock. The upload action intentionally does
 * not live here — creator tools stay isolated in the Studio route so the thumb
 * zone belongs to the viewer.
 */
export function CyberOrbDock() {
  const [activeId, setActiveId] = useState<DockSlotId>("home");

  return (
    <motion.nav
      aria-label="Primary navigation"
      initial={{ y: 90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-50 -translate-x-1/2"
      style={{ filter: "drop-shadow(0 22px 32px rgba(0, 0, 0, 0.55))" }}
    >
      <div className="cyber-glass cyber-chamfer-sm relative flex items-center gap-1 border border-white/[0.09] p-1.5 backdrop-blur-xl">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-primary)]/45 to-transparent"
        />

        {SLOTS.map((slot) => {
          const isActive = slot.id === activeId;
          const Icon = slot.icon;

          return (
            <motion.button
              key={slot.id}
              type="button"
              onClick={() => {
                triggerHaptic("tick");
                setActiveId(slot.id);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.94 }}
              aria-pressed={isActive}
              aria-label={`${slot.label}${isActive ? ", active" : ""}`}
              className={cn(
                "group relative flex h-14 w-[62px] flex-col items-center justify-center gap-1.5 cyber-chamfer-sm transition-colors duration-200 sm:w-[70px]",
                isActive
                  ? "text-[var(--neon-primary)]"
                  : "text-white/45 hover:text-white/80",
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="cyber-dock-active"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 border border-[var(--neon-primary)]/35 bg-[var(--neon-primary)]/[0.08]"
                  style={{ boxShadow: "0 0 18px -6px var(--neon-primary)" }}
                />
              ) : null}

              {isActive ? (
                <motion.span
                  layoutId="cyber-dock-rail"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute -top-1.5 left-1/2 h-0.5 w-7 -translate-x-1/2 bg-[var(--neon-primary)]"
                  style={{ boxShadow: "0 0 10px var(--neon-primary)" }}
                />
              ) : null}

              <motion.span
                className="relative z-10 grid place-items-center"
                whileHover={{ scale: 1.12 }}
              >
                <Icon
                  className="size-[18px]"
                  strokeWidth={isActive ? 2 : 1.7}
                  style={
                    isActive
                      ? { filter: "drop-shadow(0 0 5px var(--neon-primary))" }
                      : undefined
                  }
                />
              </motion.span>

              <span
                className={cn(
                  "relative z-10 font-mono text-[8px] uppercase tracking-[0.16em] transition-colors duration-200",
                  isActive ? "text-[var(--neon-primary)]" : "text-white/35",
                )}
              >
                {slot.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
