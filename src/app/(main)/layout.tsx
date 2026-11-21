import type { ReactNode } from "react";

import { CartridgeQueueDrawer } from "@/components/layout/CartridgeQueueDrawer";
import { CyberOrbDock } from "@/components/layout/CyberOrbDock";
import { RadialCommandWheel } from "@/components/layout/RadialCommandWheel";
import { TopTelemetryBar } from "@/components/layout/TopTelemetryBar";
import { MagneticMiniPlayer } from "@/features/player/MagneticMiniPlayer";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative min-h-screen bg-[var(--bg-void)]">
      <TopTelemetryBar />

      <main className="relative min-h-screen bg-[var(--bg-void)] bg-carbon-grid pb-32 pt-24 sm:pt-28">
        {children}
      </main>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-32 bg-gradient-to-t from-[var(--bg-void)] via-[var(--bg-void)]/80 to-transparent"
      />

      <CyberOrbDock />
      <MagneticMiniPlayer />
      <RadialCommandWheel />
      <CartridgeQueueDrawer />
    </div>
  );
}
