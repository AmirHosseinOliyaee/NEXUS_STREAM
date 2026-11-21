"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly prompt: () => Promise<void>;
  readonly userChoice: Promise<{
    readonly outcome: "accepted" | "dismissed";
    readonly platform: string;
  }>;
}

export type PwaStatus = "unsupported" | "registering" | "ready" | "failed";

export interface PwaState {
  /** Lifecycle of the service worker controlling the offline shell. */
  readonly status: PwaStatus;
  /** True while a controllable install prompt is available in this session. */
  readonly canInstall: boolean;
  /** Registers the worker once, then exposes the deferred install prompt. */
  readonly promptInstall: () => void;
}

const SW_PATH = "/sw.js";

/* -------------------------------------------------------------------------
 * Module-level singleton
 * The bar, the profile and the provider all ask for the same worker; keeping
 * the state outside React guarantees exactly one registration per page load.
 * ---------------------------------------------------------------------- */

let status: PwaStatus = "registering";
let installEvent: BeforeInstallPromptEvent | null = null;
let started = false;

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getStatusSnapshot(): PwaStatus {
  return status;
}

function getInstallSnapshot(): boolean {
  return installEvent !== null;
}

function getServerStatusSnapshot(): PwaStatus {
  return "registering";
}

function getServerInstallSnapshot(): boolean {
  return false;
}

function setStatus(next: PwaStatus): void {
  if (status === next) return;
  status = next;
  emit();
}

function setInstallEvent(next: BeforeInstallPromptEvent | null): void {
  if (installEvent === next) return;
  installEvent = next;
  emit();
}

/**
 * Registers the dependency-free service worker and harvests the browser's
 * deferred install prompt. Every step is defensive: private-mode restrictions,
 * missing SW support and registration failures all degrade to a silent no-op
 * rather than a console error the user cannot act on.
 */
function ensureStarted(): void {
  if (started) return;
  if (typeof window === "undefined") return;
  started = true;

  if (!("serviceWorker" in navigator)) {
    setStatus("unsupported");
    return;
  }

  const { protocol, hostname } = window.location;
  const isSecureOrigin =
    protocol === "https:" || hostname === "localhost" || hostname === "127.0.0.1";

  if (!isSecureOrigin) {
    setStatus("unsupported");
    return;
  }

  const register = async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.register(SW_PATH, {
        scope: "/",
      });
      await navigator.serviceWorker.ready;
      setStatus(registration.active ? "ready" : "registering");
    } catch {
      setStatus("failed");
    }
  };

  void register();

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    setStatus("ready");
  });

  window.addEventListener("beforeinstallprompt", (event: Event) => {
    event.preventDefault();
    setInstallEvent(event as BeforeInstallPromptEvent);
  });

  window.addEventListener("appinstalled", () => {
    setInstallEvent(null);
  });
}

function runInstallPrompt(): void {
  const pending = installEvent;
  if (!pending) return;

  void pending
    .prompt()
    .then(() => pending.userChoice)
    .then((choice) => {
      if (choice.outcome === "accepted") setInstallEvent(null);
    })
    .catch(() => undefined);
}

/**
 * Shared PWA state: worker lifecycle plus the optional install affordance.
 * Safe to call from any number of components — registration happens once.
 */
export function useServiceWorker(): PwaState {
  useEffect(() => {
    ensureStarted();
  }, []);

  const currentStatus = useSyncExternalStore(
    subscribe,
    getStatusSnapshot,
    getServerStatusSnapshot,
  );

  const canInstall = useSyncExternalStore(
    subscribe,
    getInstallSnapshot,
    getServerInstallSnapshot,
  );

  const promptInstall = useCallback((): void => {
    runInstallPrompt();
  }, []);

  return { status: currentStatus, canInstall, promptInstall };
}
