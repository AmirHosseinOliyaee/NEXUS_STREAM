# NEXUS STREAM

A Cyber-HUD tactical video streaming PWA built with Next.js 15, React 19, and Tailwind CSS v4. The application includes a ranked home feed, a video player, client-side persistence, and a shared design system.

## Technology stack

- **Framework:** Next.js 15 App Router and React 19
- **Language:** TypeScript 5.9 with strict compiler settings
- **Styling:** Tailwind CSS v4 and a custom Cyber-HUD token and utility layer
- **Motion and icons:** Framer Motion and Lucide React
- **State and data:** Zustand, TanStack Query, and Dexie-backed IndexedDB
- **Typography:** Self-hosted Space Grotesk, JetBrains Mono, and Inter variable fonts

## Getting started

Requirements: Node.js 20.9 or newer and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build
pnpm start
pnpm typecheck
```

The project uses pnpm's `node-linker=hoisted` strategy (see `.npmrc`) for Windows compatibility.

## Application routes

- `/` — ranked video feed with adjustable recommendation weights and a responsive bento grid
- `/watch/[id]` — video playback, metadata, and signal intelligence for a video

The application is populated with local sample records and media URLs. IndexedDB is initialized from the bundled seed data when the database is first created.

## Design system

Design tokens are defined in `src/app/globals.css`.

| Token | Value | Role |
| :--- | :--- | :--- |
| `--bg-void` | `#07080D` | Carbon-matte base surface |
| `--bg-hud` | `rgba(14, 17, 26, 0.78)` | Translucent glass panels |
| `--bg-elevated` | `#131722` | Bento cards and modules |
| `--neon-primary` | `#00F0FF` | Primary accent |
| `--neon-secondary` | `#BC13FE` | Secondary accent |
| `--neon-success` | `#00FF66` | Success telemetry |
| `--neon-warning` | `#FFB800` | Warning and highlight accent |
| `--neon-danger` | `#FF0055` | Live status and destructive actions |

Utility classes include `.cyber-chamfer-sm`, `.cyber-chamfer-lg`, `.cyber-glass`, `.neon-glow`, `.bg-carbon-grid`, `.hud-scanlines`, and `.bg-checker`.

## Main modules

- `src/components/ui/` — reusable Cyber-HUD cards, buttons, badges, sliders, and video cards
- `src/components/layout/` — telemetry bar, command wheel, queue drawer, and navigation dock
- `src/features/home/` — ranked bento video grid
- `src/features/player/` — video player, audio deck mode, and emotional timeline
- `src/features/equalizer/` — recommendation algorithm controls
- `src/services/db.ts` — Dexie IndexedDB schema and seed data
- `src/services/api-client.ts` — client-side data access
- `src/stores/` — application, player, and queue state
- `src/types/schema.ts` — domain entities and related types
- `src/lib/` — formatting, class-name, and haptics utilities
