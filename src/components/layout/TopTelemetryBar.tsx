"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CornerDownLeft,
  Hexagon,
  Orbit,
  Search,
  Wifi,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HudBadge, type HudTone } from "@/components/ui/HudBadge";
import { triggerHaptic } from "@/lib/haptics";
import { cn, formatDuration } from "@/lib/utils";
import { apiClient } from "@/services/api-client";
import type { VideoEntity, VideoFormat } from "@/types/schema";

const FORMAT_TONE: Record<VideoFormat, HudTone> = {
  long: "neutral",
  short: "warning",
  live: "danger",
};

export function TopTelemetryBar() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDimensionShifted, setDimensionShifted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const wasSearchOpen = useRef(false);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["neural-search", "catalog"],
    queryFn: () => apiClient.getVideos(),
    enabled: isSearchOpen,
    staleTime: 5 * 60_000,
  });

  const videos = data ?? [];

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return videos.slice(0, 5);

    return videos
      .filter((video) => {
        const haystack = [
          video.title,
          video.description,
          video.channel.name,
          video.channel.handle,
          video.category,
          ...video.transcript.map((segment) => segment.text),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(needle);
      })
      .slice(0, 8);
  }, [query, videos]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
        triggerHaptic("tick");
        return;
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) {
      if (wasSearchOpen.current) {
        searchButtonRef.current?.focus({ preventScroll: true });
      }
      setQuery("");
      setActiveIndex(0);
      wasSearchOpen.current = false;
      return;
    }

    wasSearchOpen.current = true;
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(focusTimer);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSearchOpen]);

  const closeSearch = (): void => {
    setSearchOpen(false);
  };

  const playResult = (video: VideoEntity): void => {
    triggerHaptic("pulse");
    closeSearch();
    router.push(`/watch/${video.id}`);
  };

  const handleInputKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        Math.min(index + 1, Math.max(results.length - 1, 0)),
      );
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const selected = results[activeIndex];
      if (selected) playResult(selected);
    }
  };

  const toggleDimension = (): void => {
    triggerHaptic("tick");
    setDimensionShifted((shifted) => !shifted);
  };

  const trapDialogFocus = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ): void => {
    if (event.key !== "Tab") return;

    const focusable = Array.from(
      event.currentTarget.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((element) => !element.hasAttribute("disabled"));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const activeResult = results[activeIndex];

  return (
    <>
      <motion.header
        initial={{ y: -22, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4"
        style={{ filter: "drop-shadow(0 18px 28px rgba(0, 0, 0, 0.45))" }}
      >
        <div className="cyber-glass mx-auto flex h-14 max-w-[1440px] items-center gap-2 border border-white/[0.08] px-2.5 cyber-chamfer-lg sm:gap-4 sm:px-4">
          <Link
            href="/"
            aria-label="Nexus Stream home"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span
              className="relative grid size-8 place-items-center border border-[var(--neon-primary)]/45 bg-[var(--neon-primary)]/10 cyber-chamfer-sm transition-colors duration-200 group-hover:border-[var(--neon-primary)]"
              style={{ boxShadow: "0 0 18px -4px var(--neon-primary)" }}
            >
              <Hexagon
                className="size-4 text-[var(--neon-primary)]"
                strokeWidth={1.6}
              />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[13px] font-bold uppercase tracking-[0.3em] text-white">
                Nexus
              </span>
              <span className="mt-1 hidden font-mono text-[8px] uppercase tracking-[0.24em] text-white/35 sm:block">
                Stream // Hud
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 flex-1 justify-center px-1">
            <motion.button
              ref={searchButtonRef}
              type="button"
              onClick={() => {
                triggerHaptic("tick");
                setSearchOpen(true);
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              aria-label="Open neural search"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
              className="hidden h-9 w-full max-w-sm items-center gap-2 border border-white/[0.08] bg-black/20 px-3 transition-colors duration-200 cyber-chamfer-sm hover:border-[var(--neon-primary)]/40 hover:bg-[var(--neon-primary)]/[0.05] sm:flex"
            >
              <Search className="size-3.5 shrink-0 text-white/35" />
              <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/35 md:inline">
                Neural search
              </span>
              <span className="ml-auto flex shrink-0 items-center gap-1 border border-white/10 bg-white/[0.04] px-1.5 py-1 font-mono text-[8px] text-white/40">
                <Command className="size-2.5" />K
              </span>
            </motion.button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic("tick");
                setSearchOpen(true);
              }}
              aria-label="Open neural search"
              aria-haspopup="dialog"
              aria-expanded={isSearchOpen}
              className="grid size-9 place-items-center border border-white/[0.08] bg-black/20 text-white/45 cyber-chamfer-sm sm:hidden"
            >
              <Search className="size-4" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <HudBadge
              tone="success"
              variant="ghost"
              size="sm"
              icon={<Wifi />}
              className="hidden md:inline-flex"
            >
              Ping 12ms
            </HudBadge>
            <HudBadge
              tone="danger"
              variant="solid"
              size="sm"
              pulse
              className="hidden sm:inline-flex"
            >
              Live
            </HudBadge>

            <motion.button
              type="button"
              onClick={toggleDimension}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              aria-label="Toggle dimension shift"
              aria-pressed={isDimensionShifted}
              title="Dimension shift"
              className={cn(
                "relative grid size-9 place-items-center border transition-colors duration-200 cyber-chamfer-sm",
                isDimensionShifted
                  ? "border-[var(--neon-primary)]/50 bg-[var(--neon-primary)]/10"
                  : "border-white/[0.09] bg-white/[0.02] hover:border-white/25",
              )}
            >
              <Orbit
                className={cn(
                  "size-4 transition-colors duration-200",
                  isDimensionShifted
                    ? "text-[var(--neon-primary)]"
                    : "text-white/45",
                )}
              />
              {isDimensionShifted ? (
                <span className="absolute -right-0.5 -top-0.5 size-1.5 bg-[var(--neon-primary)]" />
              ) : null}
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Open player profile"
              className="relative ml-0.5 grid size-9 place-items-center border border-white/15 cyber-chamfer-sm"
              style={{
                background:
                  "conic-gradient(from 180deg, #00F0FF, #BC13FE, #FF0055, #00F0FF)",
              }}
            >
              <span className="grid size-[27px] place-items-center bg-[var(--bg-void)] font-display text-[9px] font-bold tracking-[0.08em] text-white cyber-chamfer-sm">
                NYX
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-[var(--bg-void)] bg-[var(--neon-success)]" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {isSearchOpen ? (
          <motion.div
            key="neural-search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh] sm:pt-[14vh]"
          >
            <button
              type="button"
              aria-label="Close neural search"
              onClick={closeSearch}
              className="absolute inset-0 cursor-default bg-[var(--bg-void)]/70 backdrop-blur-md"
              tabIndex={-1}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Neural search"
              onKeyDown={trapDialogFocus}
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="cyber-glass relative w-full max-w-2xl border border-white/[0.1] cyber-chamfer-lg"
            >
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3">
                <Search className="size-4 shrink-0 text-[var(--neon-primary)]" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Search titles, transcripts, channels..."
                  aria-label="Search the neural catalog"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-expanded={results.length > 0}
                  aria-controls="neural-search-results"
                  aria-activedescendant={
                    activeResult
                      ? `neural-option-${activeResult.id}`
                      : undefined
                  }
                  className="h-8 min-w-0 flex-1 bg-transparent font-mono text-[12px] tracking-[0.02em] text-white placeholder:text-white/25 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close neural search"
                  className="flex items-center gap-1.5 border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-white/40 transition-colors hover:text-white/70"
                >
                  Esc <X className="size-2.5" />
                </button>
              </div>

              <div
                id="neural-search-results"
                className="max-h-[52vh] overflow-y-auto"
              >
                {isLoading ? (
                  <div className="space-y-2 p-4">
                    {[0, 1, 2].map((row) => (
                      <motion.div
                        key={row}
                        initial={{ opacity: 0.2 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: row * 0.1,
                        }}
                        className="h-12 border border-white/[0.05] bg-white/[0.02]"
                      />
                    ))}
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                    <p className="font-display text-[10px] uppercase tracking-[0.26em] text-white/40">
                      No signal found
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-white/20">
                      Try a transcript phrase or channel handle
                    </p>
                  </div>
                ) : (
                  <ul role="listbox" aria-label="Search results">
                    {results.map((video, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <li
                          key={video.id}
                          id={`neural-option-${video.id}`}
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => playResult(video)}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 border-l-2 px-4 py-2.5 transition-colors duration-150",
                            isActive
                              ? "border-[var(--neon-primary)] bg-[var(--neon-primary)]/[0.07]"
                              : "border-transparent hover:bg-white/[0.04]",
                          )}
                        >
                          <span
                            className="relative h-10 w-16 shrink-0 overflow-hidden bg-cover bg-center cyber-chamfer-sm"
                            style={{
                              backgroundColor: "#0b0f18",
                              backgroundImage: `linear-gradient(140deg, ${video.dominantColorHex}38, rgba(7, 8, 13, 0.85)), url(${video.thumbnailUrl})`,
                            }}
                          >
                            <span className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[11px] uppercase tracking-[0.05em] text-white/85">
                              {video.title}
                            </span>
                            <span className="mt-1 block truncate font-mono text-[9px] uppercase tracking-[0.12em] text-white/35">
                              {video.channel.name} · {video.category} ·{" "}
                              {formatDuration(video.durationSec)}
                            </span>
                          </span>
                          <HudBadge
                            tone={FORMAT_TONE[video.format]}
                            variant="ghost"
                            size="sm"
                          >
                            {video.format}
                          </HudBadge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/25">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Command className="size-2.5" />K toggle
                  </span>
                  <span className="flex items-center gap-1">
                    <CornerDownLeft className="size-2.5" /> play
                  </span>
                </span>
                <span>{results.length.toString().padStart(2, "0")} hits</span>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
