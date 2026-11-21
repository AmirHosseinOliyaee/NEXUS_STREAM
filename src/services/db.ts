import Dexie, { type Table } from "dexie";

import type {
  ChannelSummary,
  HoloCommentEntity,
  PlayerProfileEntity,
  VideoEntity,
} from "@/types/schema";

const DB_NAME = "nexus-stream";

/* ------------------------------------------------------------------ *
 * Channels
 * ------------------------------------------------------------------ */

const CHANNELS = {
  synthwave: {
    id: "chan-synthwave-labs",
    handle: "@synthwavelabs",
    name: "Synthwave Labs",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=160&h=160&q=80",
    subscribersCount: 2_480_000,
    isVerified: true,
  },
  neonDrift: {
    id: "chan-neon-drift",
    handle: "@neondrift",
    name: "Neon Drift Esports",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=facearea&facepad=2&w=160&h=160&q=80",
    subscribersCount: 8_930_000,
    isVerified: true,
  },
  signalDecay: {
    id: "chan-signal-decay",
    handle: "@signaldecay",
    name: "Signal Decay",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=160&h=160&q=80",
    subscribersCount: 684_000,
    isVerified: false,
  },
  chromeAtlas: {
    id: "chan-chrome-atlas",
    handle: "@chromeatlas",
    name: "Chrome Atlas",
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=160&h=160&q=80",
    subscribersCount: 1_120_000,
    isVerified: true,
  },
} satisfies Record<string, ChannelSummary>;

/* ------------------------------------------------------------------ *
 * Video seed
 * ------------------------------------------------------------------ */

const SEED_VIDEOS: VideoEntity[] = [
  {
    id: "vid-gpu-graveyard",
    title: "The GPU Graveyard: Reviving 2003's Fastest Cryptominer",
    description:
      "Three dead flagship GPUs pulled from a Shenzhen e-waste lot, one undocumented firmware, and zero schematics. Board-level teardown, a shunt mod that should not work, and a benchmark nobody asked for.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1280&h=720&q=80",
    dominantColorHex: "#00F0FF",
    durationSec: 1284,
    viewsCount: 1_284_000,
    publishedAt: "2026-10-18T14:30:00.000Z",
    format: "long",
    channel: CHANNELS.synthwave,
    category: "tech",
    complexityScore: 88,
    noveltyScore: 72,
    hypeScore: 41,
    heatmap: [
      {
        id: "mark-gpu-01",
        timestampSec: 64,
        durationSec: 18,
        intensity: 62,
        emotion: "insight",
        label: "Firmware checksum reveal",
      },
      {
        id: "mark-gpu-02",
        timestampSec: 212,
        durationSec: 26,
        intensity: 88,
        emotion: "hype",
        label: "First boot on bench supply",
      },
      {
        id: "mark-gpu-03",
        timestampSec: 388,
        durationSec: 22,
        intensity: 71,
        emotion: "funny",
        label: "Thermal paste crime scene",
      },
      {
        id: "mark-gpu-04",
        timestampSec: 512,
        durationSec: 30,
        intensity: 54,
        emotion: "insight",
        label: "Shunt mod explained",
      },
      {
        id: "mark-gpu-05",
        timestampSec: 740,
        durationSec: 25,
        intensity: 93,
        emotion: "shock",
        label: "Capacitor pop",
      },
      {
        id: "mark-gpu-06",
        timestampSec: 903,
        durationSec: 60,
        intensity: 38,
        emotion: "sponsor",
        label: "PCBWay sponsor break",
      },
      {
        id: "mark-gpu-07",
        timestampSec: 1040,
        durationSec: 28,
        intensity: 78,
        emotion: "hype",
        label: "Benchmark spike",
      },
      {
        id: "mark-gpu-08",
        timestampSec: 1190,
        durationSec: 20,
        intensity: 66,
        emotion: "insight",
        label: "Final verdict",
      },
    ],
    transcript: [
      {
        timeSec: 0,
        text: "Three GPUs. One Shenzhen lot. Zero documentation.",
      },
      {
        timeSec: 64,
        text: "This is the firmware checksum that started the whole rabbit hole.",
      },
      {
        timeSec: 212,
        text: "First boot on a bench supply, and it actually posts.",
      },
      {
        timeSec: 388,
        text: "That is not thermal paste. That is thermal crime.",
      },
      {
        timeSec: 512,
        text: "The shunt mod is deceptively simple: one resistor, two pads.",
      },
      {
        timeSec: 740,
        text: "There goes a capacitor. We are down one memory channel.",
      },
      {
        timeSec: 903,
        text: "Today's sponsor, PCBWay, cut these replacement boards in 48 hours.",
      },
      {
        timeSec: 1040,
        text: "Power draw is up 38 percent, but the hash rate is nostalgic.",
      },
      {
        timeSec: 1190,
        text: "Final verdict: the past is slow, loud, and completely worth it.",
      },
    ],
  },
  {
    id: "vid-neon-drift-finals",
    title: "NEON DRIFT // Grand Finals — Last Lap, One Pixel",
    description:
      "The 2077 Night City Invitational came down to a 0.03 second gap at the line. Full telemetry, rider comms, and a frame-by-frame breakdown of the overtake that closed the season.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1280&h=720&q=80",
    dominantColorHex: "#FF0055",
    durationSec: 642,
    viewsCount: 8_420_000,
    publishedAt: "2026-11-01T20:00:00.000Z",
    format: "long",
    channel: CHANNELS.neonDrift,
    category: "gaming",
    complexityScore: 34,
    noveltyScore: 58,
    hypeScore: 94,
    heatmap: [
      {
        id: "mark-drift-01",
        timestampSec: 12,
        durationSec: 16,
        intensity: 46,
        emotion: "insight",
        label: "Track layout breakdown",
      },
      {
        id: "mark-drift-02",
        timestampSec: 48,
        durationSec: 20,
        intensity: 72,
        emotion: "hype",
        label: "Formation lap",
      },
      {
        id: "mark-drift-03",
        timestampSec: 118,
        durationSec: 24,
        intensity: 84,
        emotion: "shock",
        label: "Deliberate bump at the apex",
      },
      {
        id: "mark-drift-04",
        timestampSec: 202,
        durationSec: 18,
        intensity: 58,
        emotion: "funny",
        label: "Pit wall panic",
      },
      {
        id: "mark-drift-05",
        timestampSec: 344,
        durationSec: 30,
        intensity: 90,
        emotion: "hype",
        label: "Gap closes to three hundredths",
      },
      {
        id: "mark-drift-06",
        timestampSec: 512,
        durationSec: 42,
        intensity: 100,
        emotion: "hype",
        label: "The overtake",
      },
      {
        id: "mark-drift-07",
        timestampSec: 588,
        durationSec: 24,
        intensity: 76,
        emotion: "funny",
        label: "Crowd invades the track",
      },
      {
        id: "mark-drift-08",
        timestampSec: 620,
        durationSec: 20,
        intensity: 68,
        emotion: "insight",
        label: "Season close",
      },
    ],
    transcript: [
      {
        timeSec: 0,
        text: "Night City Invitational. Grand final. One lap left.",
      },
      {
        timeSec: 48,
        text: "Same chassis, completely different gearing on the two bikes.",
      },
      {
        timeSec: 118,
        text: "That is a deliberate bump on the apex, and race control is watching.",
      },
      {
        timeSec: 202,
        text: "The pit wall calls it: no more tire changes, ride it to the line.",
      },
      {
        timeSec: 344,
        text: "Three hundredths of a second. That is the gap.",
      },
      {
        timeSec: 512,
        text: "Frame by frame, the overtake happens entirely in the braking zone.",
      },
      {
        timeSec: 588,
        text: "The crowd is already on the track.",
      },
      {
        timeSec: 620,
        text: "And that is how you close a season.",
      },
    ],
  },
  {
    id: "vid-silent-server",
    title: "Inside the Silent Server: 48 Hours in a Tier-IV Data Center",
    description:
      "No windows, no logos, no cameras. A rare overnight pass inside a certified Tier-IV facility, from the pressurized corridors to the moment the generators take the load.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1280&h=720&q=80",
    dominantColorHex: "#00FF66",
    durationSec: 2210,
    viewsCount: 412_000,
    publishedAt: "2026-09-27T09:00:00.000Z",
    format: "long",
    channel: CHANNELS.signalDecay,
    category: "cyberculture",
    complexityScore: 74,
    noveltyScore: 86,
    hypeScore: 18,
    heatmap: [
      {
        id: "mark-server-01",
        timestampSec: 95,
        durationSec: 30,
        intensity: 52,
        emotion: "insight",
        label: "Tier-IV certification explained",
      },
      {
        id: "mark-server-02",
        timestampSec: 310,
        durationSec: 26,
        intensity: 44,
        emotion: "insight",
        label: "Pressurized corridors",
      },
      {
        id: "mark-server-03",
        timestampSec: 620,
        durationSec: 34,
        intensity: 61,
        emotion: "shock",
        label: "The UPS hum",
      },
      {
        id: "mark-server-04",
        timestampSec: 940,
        durationSec: 28,
        intensity: 57,
        emotion: "insight",
        label: "Dual-feed redundancy",
      },
      {
        id: "mark-server-05",
        timestampSec: 1300,
        durationSec: 40,
        intensity: 48,
        emotion: "insight",
        label: "One fiber pair, 40 percent of traffic",
      },
      {
        id: "mark-server-06",
        timestampSec: 1680,
        durationSec: 36,
        intensity: 82,
        emotion: "shock",
        label: "Generators take the load",
      },
      {
        id: "mark-server-07",
        timestampSec: 1980,
        durationSec: 30,
        intensity: 35,
        emotion: "insight",
        label: "Hour forty-eight",
      },
      {
        id: "mark-server-08",
        timestampSec: 2140,
        durationSec: 40,
        intensity: 30,
        emotion: "insight",
        label: "Closing thought",
      },
    ],
    transcript: [
      {
        timeSec: 0,
        text: "This building has no windows and no company logo.",
      },
      {
        timeSec: 95,
        text: "Tier-IV certification means 99.995 percent uptime.",
      },
      {
        timeSec: 310,
        text: "These corridors are pressurized to keep particulate out.",
      },
      {
        timeSec: 620,
        text: "The hum is not cooling. It is the UPS room next door.",
      },
      {
        timeSec: 940,
        text: "Every rack has two feeds, two breakers, and zero excuses.",
      },
      {
        timeSec: 1300,
        text: "A single fiber pair carries 40 percent of this wing's traffic.",
      },
      {
        timeSec: 1680,
        text: "The lights go red when the generators take the load.",
      },
      {
        timeSec: 1980,
        text: "Forty-eight hours in, the only sound is the fans.",
      },
      {
        timeSec: 2140,
        text: "Nobody films the machines that keep the internet boring.",
      },
    ],
  },
  {
    id: "vid-synthwave-patch-09",
    title: "SYNTHWAVE_PATCH_09 — Live Modular Set from Substation 12",
    description:
      "A 63-minute transmission recorded inside a decommissioned substation. No laptops, no backing tracks, one 7/8 sequence and a field recording from a reactor hall.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1280&h=720&q=80",
    dominantColorHex: "#BC13FE",
    durationSec: 3812,
    viewsCount: 96_400,
    publishedAt: "2026-11-08T21:15:00.000Z",
    format: "live",
    channel: CHANNELS.chromeAtlas,
    category: "music",
    complexityScore: 52,
    noveltyScore: 91,
    hypeScore: 77,
    heatmap: [
      {
        id: "mark-synth-01",
        timestampSec: 120,
        durationSec: 45,
        intensity: 48,
        emotion: "insight",
        label: "Patch architecture",
      },
      {
        id: "mark-synth-02",
        timestampSec: 480,
        durationSec: 60,
        intensity: 63,
        emotion: "hype",
        label: "7/8 sequence enters",
      },
      {
        id: "mark-synth-03",
        timestampSec: 900,
        durationSec: 50,
        intensity: 57,
        emotion: "insight",
        label: "Every cable is a voice",
      },
      {
        id: "mark-synth-04",
        timestampSec: 1450,
        durationSec: 55,
        intensity: 74,
        emotion: "hype",
        label: "Filter opens",
      },
      {
        id: "mark-synth-05",
        timestampSec: 1980,
        durationSec: 60,
        intensity: 69,
        emotion: "funny",
        label: "Reactor hall field recording",
      },
      {
        id: "mark-synth-06",
        timestampSec: 2540,
        durationSec: 45,
        intensity: 58,
        emotion: "insight",
        label: "No laptops on stage",
      },
      {
        id: "mark-synth-07",
        timestampSec: 3010,
        durationSec: 40,
        intensity: 80,
        emotion: "hype",
        label: "Crowd in the signal chain",
      },
      {
        id: "mark-synth-08",
        timestampSec: 3550,
        durationSec: 90,
        intensity: 66,
        emotion: "insight",
        label: "Last transmission",
      },
    ],
    transcript: [
      {
        timeSec: 0,
        text: "We are broadcasting from a decommissioned substation.",
      },
      {
        timeSec: 120,
        text: "This patch is built around a single 7/8 sequence.",
      },
      {
        timeSec: 480,
        text: "Here it comes. Listen to the room change shape.",
      },
      {
        timeSec: 900,
        text: "Every cable in this rack is a voice.",
      },
      {
        timeSec: 1450,
        text: "The filter opens up and the room starts to breathe.",
      },
      {
        timeSec: 1980,
        text: "That drone is a field recording from the reactor hall.",
      },
      {
        timeSec: 2540,
        text: "No laptops on stage. Only hardware.",
      },
      {
        timeSec: 3010,
        text: "The crowd is part of the signal chain now.",
      },
      {
        timeSec: 3550,
        text: "Last transmission. Thanks for listening.",
      },
    ],
  },
  {
    id: "vid-short-overtake",
    title: "That 0.03s Overtake, Frame by Frame",
    description:
      "The exact braking zone from the Night City final, slowed down and annotated. Full telemetry breakdown in the long-form.",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=720&h=1280&q=80",
    dominantColorHex: "#FFB800",
    durationSec: 38,
    viewsCount: 2_100_000,
    publishedAt: "2026-11-02T18:40:00.000Z",
    format: "short",
    parentLongVideoId: "vid-neon-drift-finals",
    parentTimestampSec: 512,
    channel: CHANNELS.neonDrift,
    category: "gaming",
    complexityScore: 28,
    noveltyScore: 44,
    hypeScore: 99,
    heatmap: [
      {
        id: "mark-short-01",
        timestampSec: 4,
        durationSec: 4,
        intensity: 60,
        emotion: "insight",
        label: "The gap",
      },
      {
        id: "mark-short-02",
        timestampSec: 12,
        durationSec: 6,
        intensity: 94,
        emotion: "hype",
        label: "Braking point",
      },
      {
        id: "mark-short-03",
        timestampSec: 24,
        durationSec: 6,
        intensity: 100,
        emotion: "shock",
        label: "The overtake",
      },
      {
        id: "mark-short-04",
        timestampSec: 33,
        durationSec: 5,
        intensity: 48,
        emotion: "insight",
        label: "Long-form bridge",
      },
    ],
    transcript: [
      { timeSec: 0, text: "Three hundredths of a second." },
      { timeSec: 12, text: "Braking point, frame by frame." },
      { timeSec: 24, text: "That is the overtake." },
      { timeSec: 33, text: "Full breakdown in the long-form." },
    ],
  },
];

const createShortSeed = (
  id: string,
  title: string,
  description: string,
  parentId: string,
  parentTimestampSec: number,
  dominantColorHex: string,
  thumbnailUrl: string,
  durationSec: number,
  viewsCount: number,
): VideoEntity => {
  const parent = SEED_VIDEOS.find((video) => video.id === parentId);
  if (!parent) throw new Error(`Short seed parent not found: ${parentId}`);

  return {
    ...parent,
    id,
    title,
    description,
    thumbnailUrl,
    dominantColorHex,
    durationSec,
    viewsCount,
    publishedAt: "2026-11-10T16:30:00.000Z",
    format: "short",
    parentLongVideoId: parent.id,
    parentTimestampSec,
    heatmap: [
      { id: `${id}-mark-1`, timestampSec: 3, durationSec: 5, intensity: 62, emotion: "insight", label: "Setup" },
      { id: `${id}-mark-2`, timestampSec: Math.floor(durationSec * 0.48), durationSec: 6, intensity: 96, emotion: "hype", label: "Peak moment" },
      { id: `${id}-mark-3`, timestampSec: Math.floor(durationSec * 0.78), durationSec: 5, intensity: 72, emotion: "funny", label: "Aftershock" },
    ],
    transcript: [
      { timeSec: 0, text: description },
      { timeSec: Math.floor(durationSec * 0.48), text: `The moment from ${parent.title}.` },
    ],
  };
};

const EXTRA_SHORTS: VideoEntity[] = [
  createShortSeed(
    "vid-short-reactor",
    "The Reactor Hall Goes Quiet",
    "A sudden silence inside the Tier-IV generator room, cut from the overnight facility transmission.",
    "vid-silent-server",
    1180,
    "#00FF66",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=720&h=1280&q=80",
    32,
    684_000,
  ),
  createShortSeed(
    "vid-short-substation",
    "One Cable, Seven Beats",
    "A modular synth patch locks into an odd-time sequence beneath the substation lights.",
    "vid-synthwave-patch-09",
    480,
    "#BC13FE",
    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=720&h=1280&q=80",
    41,
    392_000,
  ),
];

/* ------------------------------------------------------------------ *
 * Comment seed
 * ------------------------------------------------------------------ */

const SEED_COMMENTS: HoloCommentEntity[] = [
  {
    id: "cmt-drift-01",
    videoId: "vid-neon-drift-finals",
    author: {
      name: "Frame Perfect",
      handle: "@frameperfect",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
      badge: "Frame Analyst",
    },
    content:
      "THAT OVERTAKE WAS NOT LEGAL AND I WILL BE STUDYING IT FOR A WEEK",
    videoTimestampSec: 512,
    category: "meme",
    upvotes: 18_420,
    createdAt: "2026-11-02T08:12:00.000Z",
  },
  {
    id: "cmt-drift-02",
    videoId: "vid-neon-drift-finals",
    author: {
      name: "Kite",
      handle: "@kite_telemetry",
      avatarUrl:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
      badge: "Telemetry",
    },
    content:
      "Freeze at 08:32 and watch the front wheel tuck before the bump. Race control had no choice but to let it stand.",
    videoTimestampSec: 512,
    category: "deep_dive",
    upvotes: 6_210,
    createdAt: "2026-11-02T09:40:00.000Z",
  },
  {
    id: "cmt-drift-03",
    videoId: "vid-neon-drift-finals",
    author: {
      name: "Mara Vex",
      handle: "@maravex",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    },
    content: "09:48 — the crowd surge is the real highlight.",
    videoTimestampSec: 588,
    category: "timestamp",
    upvotes: 2_340,
    createdAt: "2026-11-02T11:05:00.000Z",
  },
  {
    id: "cmt-gpu-01",
    videoId: "vid-gpu-graveyard",
    author: {
      name: "paste_crimes",
      handle: "@pastecrimes",
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    },
    content: "thermal crime is a lifestyle",
    videoTimestampSec: 388,
    category: "meme",
    upvotes: 9_870,
    createdAt: "2026-10-18T16:22:00.000Z",
  },
  {
    id: "cmt-gpu-02",
    videoId: "vid-gpu-graveyard",
    author: {
      name: "Solder & Sons",
      handle: "@solderandsons",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
      badge: "Hardware",
    },
    content:
      "Shunt mod starts at 08:32 for anyone skipping. The two-pad trick is the whole video.",
    videoTimestampSec: 512,
    category: "timestamp",
    upvotes: 3_120,
    createdAt: "2026-10-18T17:02:00.000Z",
  },
  {
    id: "cmt-gpu-03",
    videoId: "vid-gpu-graveyard",
    author: {
      name: "Ada L.",
      handle: "@ada_l",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    },
    content:
      "The sponsor break is actually useful this time. Board list is pinned in the description.",
    videoTimestampSec: 903,
    category: "deep_dive",
    upvotes: 1_480,
    createdAt: "2026-10-18T19:44:00.000Z",
  },
  {
    id: "cmt-server-01",
    videoId: "vid-silent-server",
    author: {
      name: "Rack Unit",
      handle: "@rackunit",
      avatarUrl:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
      badge: "Infra",
    },
    content:
      "The dual-feed detail is the whole film. Redundancy is boring right until it is not.",
    videoTimestampSec: 940,
    category: "deep_dive",
    upvotes: 2_760,
    createdAt: "2026-09-27T12:10:00.000Z",
  },
  {
    id: "cmt-server-02",
    videoId: "vid-silent-server",
    author: {
      name: "vanta",
      handle: "@vanta",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    },
    content: "Generators taking load at 28:00 is oddly terrifying.",
    videoTimestampSec: 1680,
    category: "timestamp",
    upvotes: 890,
    createdAt: "2026-09-27T14:35:00.000Z",
  },
  {
    id: "cmt-synth-01",
    videoId: "vid-synthwave-patch-09",
    author: {
      name: "Ana Tension",
      handle: "@ana.tension",
      avatarUrl:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
      badge: "Deep Diver",
    },
    content:
      "The drone at 33:00 is a reactor hall recording, confirmed by the artist in the pinned post.",
    videoTimestampSec: 1980,
    category: "timestamp",
    upvotes: 1_020,
    createdAt: "2026-11-09T10:18:00.000Z",
  },
  {
    id: "cmt-short-01",
    videoId: "vid-short-overtake",
    author: {
      name: "Mara Vex",
      handle: "@maravex",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80",
    },
    content: "This is the 0.03s clip I sent to my group chat six times.",
    videoTimestampSec: 12,
    category: "meme",
    upvotes: 4_400,
    createdAt: "2026-11-02T21:06:00.000Z",
  },
];

/* ------------------------------------------------------------------ *
 * Profile seed
 * ------------------------------------------------------------------ */

const SEED_PROFILES: PlayerProfileEntity[] = [
  {
    id: "profile-nyx",
    handle: "@netrunner-01",
    displayName: "NYX",
    titleBadge: "Signal Runner",
    level: 27,
    xp: 14_820,
    auraColorHex: "#00F0FF",
    watchDna: [
      { category: "tech", percentage: 31 },
      { category: "gaming", percentage: 27 },
      { category: "cyberculture", percentage: 18 },
      { category: "science", percentage: 12 },
      { category: "design", percentage: 8 },
      { category: "music", percentage: 4 },
    ],
    trophies: [
      {
        id: "tr-chrono-pure",
        title: "Chrono-Pure",
        description:
          "Watched 24 hours of feed without accepting a single recommendation.",
        icon: "clock-3",
        rarity: "legendary",
        unlockedAt: "2026-09-12T18:40:00.000Z",
      },
      {
        id: "tr-night-diver",
        title: "Night Diver",
        description: "Finished a 36-minute deep dive in a single sitting.",
        icon: "radar",
        rarity: "rare",
        unlockedAt: "2026-09-27T23:12:00.000Z",
      },
      {
        id: "tr-first-frame",
        title: "First Frame",
        description: "Opened the player for the first time.",
        icon: "play",
        rarity: "common",
        unlockedAt: "2026-08-01T10:00:00.000Z",
      },
    ],
    blacklistedChannels: [],
    blacklistedKeywords: ["drama", "reaction"],
  },
  {
    id: "profile-vanta",
    handle: "@vanta",
    displayName: "VANTA",
    titleBadge: "Deep Diver",
    level: 41,
    xp: 39_200,
    auraColorHex: "#BC13FE",
    watchDna: [
      { category: "science", percentage: 34 },
      { category: "tech", percentage: 26 },
      { category: "cyberculture", percentage: 17 },
      { category: "design", percentage: 10 },
      { category: "music", percentage: 8 },
      { category: "gaming", percentage: 5 },
    ],
    trophies: [
      {
        id: "tr-tunnel-vision",
        title: "Tunnel Vision",
        description: "Watched three consecutive Tier-IV documentaries.",
        icon: "shield-check",
        rarity: "rare",
        unlockedAt: "2026-10-02T09:30:00.000Z",
      },
      {
        id: "tr-signal-purist",
        title: "Signal Purist",
        description: "Completed an Audio-Deck session with captions disabled.",
        icon: "audio-lines",
        rarity: "legendary",
        unlockedAt: "2026-10-21T20:15:00.000Z",
      },
    ],
    blacklistedChannels: ["chan-neon-drift"],
    blacklistedKeywords: ["clickbait", "rage", "prank"],
  },
];

/* ------------------------------------------------------------------ *
 * Database
 * ------------------------------------------------------------------ */

/**
 * IndexedDB mirror of the future PostgreSQL schema. Tables map 1:1 onto the
 * domain entities, so swapping `api-client.ts` to a NestJS transport later
 * leaves the UI untouched.
 */
export class NexusDatabase extends Dexie {
  videos!: Table<VideoEntity, string>;
  comments!: Table<HoloCommentEntity, string>;
  profiles!: Table<PlayerProfileEntity, string>;

  constructor() {
    super(DB_NAME);

    this.version(1).stores({
      videos: "id, category, format, publishedAt, viewsCount",
      comments: "id, videoId, category, videoTimestampSec, upvotes",
      profiles: "id, handle",
    });

    this.version(2)
      .stores({
        videos: "id, category, format, publishedAt, viewsCount",
        comments: "id, videoId, category, videoTimestampSec, upvotes",
        profiles: "id, handle",
      })
      .upgrade(async (transaction) => {
        await transaction.table("videos").bulkPut(EXTRA_SHORTS);
      });

    this.on("populate", () =>
      Promise.all([
        this.videos.bulkAdd([...SEED_VIDEOS, ...EXTRA_SHORTS]),
        this.comments.bulkAdd(SEED_COMMENTS),
        this.profiles.bulkAdd(SEED_PROFILES),
      ]),
    );
  }
}

export const db = new NexusDatabase();
