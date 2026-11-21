import { useMemo } from "react";

import { useAppStore } from "@/stores/useAppStore";

/** Interface languages shipped with the HUD shell. */
export type Locale = "en" | "fa";

/** Writing direction derived from the locale, applied to `<html dir>`. */
export type Direction = "ltr" | "rtl";

export const DEFAULT_LOCALE: Locale = "en";

export const SUPPORTED_LOCALES: readonly Locale[] = ["en", "fa"];

/** Short chip labels used by the telemetry-bar language switch. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: "EN",
  fa: "FA",
};

export interface Dictionary {
  readonly topBar: {
    readonly brandHome: string;
    readonly searchOpen: string;
    readonly searchPlaceholder: string;
    readonly searchDialog: string;
    readonly searchClose: string;
    readonly searchInput: string;
    readonly searchInputPlaceholder: string;
    readonly searchResults: string;
    readonly searchEmptyTitle: string;
    readonly searchEmptyHint: string;
    readonly searchHintToggle: string;
    readonly searchHintPlay: string;
    readonly searchHits: string;
    readonly statusPing: string;
    readonly statusLive: string;
    readonly dimensionLabel: string;
    readonly dimensionTitle: string;
    readonly studioLabel: string;
    readonly studioTitle: string;
    readonly profileLabel: string;
    readonly localeSwitch: string;
    readonly localeSwitchTitle: string;
  };
  readonly dock: {
    readonly navigation: string;
    readonly activeSuffix: string;
    readonly home: string;
    readonly dimension: string;
    readonly lounge: string;
    readonly profile: string;
  };
  readonly equalizer: {
    readonly title: string;
    readonly subtitle: string;
    readonly chronoPure: string;
    readonly nukeReset: string;
    readonly axisMix: string;
    readonly noveltyLabel: string;
    readonly noveltyHint: string;
    readonly depthLabel: string;
    readonly depthHint: string;
    readonly hypeLabel: string;
    readonly hypeHint: string;
    readonly bypassNotice: string;
    readonly footerAxes: string;
    readonly footerEngaged: string;
    readonly footerOnline: string;
  };
  readonly player: {
    readonly play: string;
    readonly pause: string;
    readonly mute: string;
    readonly unmute: string;
    readonly volume: string;
    readonly shieldOff: string;
    readonly shieldOn: string;
    readonly shieldChip: string;
    readonly audioDeck: string;
    readonly audioChip: string;
    readonly holoShow: string;
    readonly holoHide: string;
    readonly holoChip: string;
    readonly clip: string;
    readonly clipChip: string;
    readonly fullscreenEnter: string;
    readonly fullscreenExit: string;
    readonly sponsorBypassed: string;
    readonly signalStandby: string;
    readonly localFeed: string;
    readonly offline: string;
    readonly loungeCta: string;
  };
  readonly miniPlayer: {
    readonly region: string;
    readonly nowPlaying: string;
    readonly play: string;
    readonly pause: string;
    readonly audioActive: string;
    readonly returnToWatch: string;
    readonly close: string;
    readonly dragHint: string;
  };
  readonly profile: {
    readonly watchDnaTitle: string;
    readonly watchDnaSubtitle: string;
    readonly watchDnaBadge: string;
    readonly trophyTitle: string;
    readonly trophySubtitle: string;
    readonly blacklistTitle: string;
    readonly blacklistSubtitle: string;
    readonly blacklistBadge: string;
    readonly channels: string;
    readonly keywords: string;
    readonly identityKicker: string;
    readonly identityTitle: string;
    readonly verified: string;
    readonly switchPlayer: string;
    readonly switchPlayerAria: string;
    readonly totalXp: string;
    readonly nextLevel: string;
    readonly creatorStudio: string;
    readonly privateId: string;
    readonly unlocked: string;
    readonly watchTime: string;
    readonly watchShare: string;
    readonly dnaAria: string;
    readonly channelPlaceholder: string;
    readonly keywordPlaceholder: string;
    readonly add: string;
    readonly remove: string;
    readonly removeAria: string;
    readonly noChannels: string;
    readonly noKeywords: string;
    readonly rankingNote: string;
    readonly identityRecord: string;
    readonly openStudio: string;
    readonly loadingAria: string;
    readonly unavailable: string;
    readonly channelFallback: string;
    readonly rarityCommon: string;
    readonly rarityRare: string;
    readonly rarityLegendary: string;
  };
  readonly dimension: {
    readonly loading: string;
    readonly emptyTitle: string;
    readonly emptyBody: string;
    readonly feedAria: string;
    readonly title: string;
    readonly subtitle: string;
    readonly live: string;
    readonly prev: string;
    readonly next: string;
    readonly navTitle: string;
    readonly navBody: string;
    readonly teleportTitle: string;
    readonly teleportBody: string;
    readonly loungeTitle: string;
    readonly holdTeleport: string;
    readonly syncing: string;
    readonly holdAria: string;
    readonly views: string;
  };
  readonly home: {
    readonly kicker: string;
    readonly title: string;
    readonly subtitle: string;
    readonly feedOnline: string;
    readonly feedOffline: string;
    readonly signalCount: string;
    readonly modeChrono: string;
    readonly modeAdaptive: string;
    readonly statusSyncing: string;
    readonly statusSyncLost: string;
    readonly uplinkUnavailable: string;
    readonly matrixTitle: string;
    readonly matrixAria: string;
    readonly matrixReranking: string;
    readonly matrixNodes: string;
    readonly footerLabel: string;
    readonly footerStats: string;
    readonly skeleton: string;
    readonly errorTitle: string;
    readonly retry: string;
  };
  readonly studio: {
    readonly kicker: string;
    readonly index: string;
    readonly title: string;
    readonly subtitle: string;
    readonly uplinkBadge: string;
    readonly retentionTitle: string;
    readonly retentionSubtitle: string;
    readonly legendRetention: string;
    readonly legendHype: string;
    readonly signalCheckTitle: string;
    readonly signalCheckSubtitle: string;
    readonly publishTitle: string;
    readonly analyticsAria: string;
    readonly kpiTotalViews: string;
    readonly kpiTotalViewsSuffix: string;
    readonly kpiTotalViewsChange: string;
    readonly kpiRetention: string;
    readonly kpiRetentionSuffix: string;
    readonly kpiRetentionChange: string;
    readonly kpiHype: string;
    readonly kpiHypeSuffix: string;
    readonly kpiHypeChange: string;
    readonly kpiViewers: string;
    readonly kpiViewersSuffix: string;
    readonly kpiViewersChange: string;
    readonly chartAria: string;
    readonly seriesRetention: string;
    readonly seriesHype: string;
    readonly metricPublished: string;
    readonly metricViews: string;
    readonly metricDuration: string;
    readonly metricHype: string;
    readonly analyticsNote: string;
    readonly minutes: string;
    readonly uploadTitle: string;
    readonly uploadBody: string;
    readonly uploadBadge: string;
    readonly fieldTitle: string;
    readonly fieldTitlePlaceholder: string;
    readonly fieldCategory: string;
    readonly fieldDescription: string;
    readonly fieldDescriptionPlaceholder: string;
    readonly fieldRuntime: string;
    readonly fieldRuntimeAria: string;
    readonly uploadNote: string;
    readonly publishing: string;
    readonly publish: string;
    readonly noticePublished: string;
    readonly noticeFailed: string;
    readonly simulatorNote: string;
    readonly footerTelemetry: string;
    readonly footerCatalog: string;
    readonly categoryTech: string;
    readonly categoryGaming: string;
    readonly categoryScience: string;
    readonly categoryMusic: string;
    readonly categoryCyberculture: string;
    readonly categoryDesign: string;
  };
  readonly lounge: {
    readonly connecting: string;
    readonly title: string;
    readonly roomSuffix: string;
    readonly syncLocked: string;
    readonly online: string;
    readonly live: string;
    readonly nowInLounge: string;
    readonly djPrefix: string;
    readonly rotateCrown: string;
    readonly reactions: string;
    readonly reactionAria: string;
    readonly reactionCount: string;
    readonly queueTitle: string;
    readonly queued: string;
    readonly queueEmpty: string;
    readonly votes: string;
    readonly vote: string;
    readonly queueAdded: string;
    readonly chatTitle: string;
    readonly present: string;
    readonly inRoom: string;
    readonly host: string;
    readonly coViewer: string;
    readonly messageLabel: string;
    readonly messagePlaceholder: string;
    readonly send: string;
  };
  readonly watch: {
    readonly back: string;
    readonly node: string;
    readonly formatFallback: string;
    readonly notFound: string;
    readonly clip: string;
    readonly subscribers: string;
    readonly views: string;
    readonly signalIntel: string;
    readonly markers: string;
    readonly scoreNovelty: string;
    readonly scoreDepth: string;
    readonly scoreHype: string;
    readonly loadingAria: string;
    readonly errorTitle: string;
    readonly retry: string;
    readonly returnHome: string;
  };
  readonly comments: {
    readonly sectionAria: string;
    readonly title: string;
    readonly count: string;
    readonly tabsAria: string;
    readonly tabMeme: string;
    readonly tabDeepDive: string;
    readonly tabTimestamp: string;
    readonly loading: string;
    readonly error: string;
    readonly empty: string;
    readonly upvote: string;
    readonly removeUpvote: string;
  };
  readonly queue: {
    readonly panelAria: string;
    readonly title: string;
    readonly clear: string;
    readonly empty: string;
    readonly hint: string;
    readonly onDeck: string;
    readonly removeAria: string;
    readonly slot: string;
    readonly bay: string;
    readonly toggleAria: string;
    readonly trigger: string;
  };
  readonly pwa: {
    readonly ready: string;
    readonly readyTitle: string;
    readonly install: string;
    readonly installTitle: string;
  };
  readonly wheel: {
    readonly dialogAria: string;
    readonly close: string;
    readonly caption: string;
    readonly playNext: string;
    readonly share: string;
    readonly pip: string;
    readonly audioDeck: string;
  };
  readonly clipper: {
    readonly title: string;
    readonly subtitle: string;
    readonly close: string;
    readonly waveformAria: string;
    readonly fallbackCaption: string;
    readonly copied: string;
    readonly copy: string;
    readonly shareReady: string;
  };
  readonly scrub: {
    readonly sectionAria: string;
    readonly placeholder: string;
    readonly inputAria: string;
    readonly clear: string;
    readonly matches: string;
    readonly noMatches: string;
    readonly prev: string;
    readonly next: string;
  };
  readonly timeline: {
    readonly sliderAria: string;
    readonly valueText: string;
    readonly hype: string;
    readonly funny: string;
    readonly shock: string;
    readonly insight: string;
    readonly sponsor: string;
  };
  readonly holo: {
    readonly aria: string;
  };
}

const en: Dictionary = {
  topBar: {
    brandHome: "Nexus Stream home",
    searchOpen: "Open neural search",
    searchPlaceholder: "Neural search",
    searchDialog: "Neural search",
    searchClose: "Close neural search",
    searchInput: "Search the neural catalog",
    searchInputPlaceholder: "Search titles, transcripts, channels...",
    searchResults: "Search results",
    searchEmptyTitle: "No signal found",
    searchEmptyHint: "Try a transcript phrase or channel handle",
    searchHintToggle: "toggle",
    searchHintPlay: "play",
    searchHits: "hits",
    statusPing: "Ping 12ms",
    statusLive: "Live",
    dimensionLabel: "Toggle dimension shift",
    dimensionTitle: "Dimension shift",
    studioLabel: "Open Creator Studio",
    studioTitle: "Creator Studio",
    profileLabel: "Open player profile",
    localeSwitch: "Switch interface language",
    localeSwitchTitle: "Interface language",
  },
  dock: {
    navigation: "Primary navigation",
    activeSuffix: ", active",
    home: "Home",
    dimension: "Dimension",
    lounge: "Lounge",
    profile: "Profile",
  },
  equalizer: {
    title: "Algorithm equalizer",
    subtitle: "Novelty · depth · hype",
    chronoPure: "Chrono-pure",
    nukeReset: "Nuke reset",
    axisMix: "Axis mix",
    noveltyLabel: "Familiar / Uncharted",
    noveltyHint: "Novelty bias",
    depthLabel: "Deep / Quick",
    depthHint: "Complexity bias",
    hypeLabel: "Chill / Hype",
    hypeHint: "Energy bias",
    bypassNotice: "Ranking bypassed — strict chronological feed",
    footerAxes: "3 axes / realtime re-rank",
    footerEngaged: "Chrono-pure engaged",
    footerOnline: "Ranking engine online",
  },
  player: {
    play: "Play video",
    pause: "Pause video",
    mute: "Mute",
    unmute: "Unmute",
    volume: "Volume",
    shieldOff: "Enable sponsor shield",
    shieldOn: "Disable sponsor shield",
    shieldChip: "Shield",
    audioDeck: "Toggle audio deck",
    audioChip: "Audio",
    holoShow: "Show holo-comments",
    holoHide: "Hide holo-comments",
    holoChip: "Holo",
    clip: "Create a 15-second clip (C)",
    clipChip: "Clip",
    fullscreenEnter: "Enter fullscreen",
    fullscreenExit: "Exit fullscreen",
    sponsorBypassed: "Sponsor bypassed",
    signalStandby: "Signal standby",
    localFeed: "Local feed",
    offline: "Offline",
    loungeCta: "Watch together in Cyber-Lounge",
  },
  miniPlayer: {
    region: "Magnetic mini-player",
    nowPlaying: "Now playing",
    play: "Resume playback",
    pause: "Pause playback",
    audioActive: "Audio deck active",
    returnToWatch: "Return to watch",
    close: "Close mini-player",
    dragHint: "Drag to reposition",
  },
  profile: {
    watchDnaTitle: "Watch DNA",
    watchDnaSubtitle: "Six-axis taste profile / share of watch time",
    watchDnaBadge: "6 AXES",
    trophyTitle: "Trophy vault",
    trophySubtitle: "Signal earned / NN unlocks",
    blacklistTitle: "Blacklist console",
    blacklistSubtitle:
      "Keep channels and phrases out of your ranked feed. Changes persist on this device.",
    blacklistBadge: "Local filter",
    channels: "Channels",
    keywords: "Keywords",
    identityKicker: "Player identity / account",
    identityTitle: "Player ID",
    verified: "Verified player",
    switchPlayer: "Switch seeded player",
    switchPlayerAria: "Switch seeded player profile",
    totalXp: "total XP",
    nextLevel: "Next level",
    creatorStudio: "Creator Studio",
    privateId: "Private ID",
    unlocked: "Unlocked NN",
    watchTime: "Watch time",
    watchShare: "Watch share",
    dnaAria: "Watch DNA radar chart for NN",
    channelPlaceholder: "Channel handle or ID",
    keywordPlaceholder: "Phrase or keyword",
    add: "Add",
    remove: "Remove",
    removeAria: "Remove NN from blacklist",
    noChannels: "No channels suppressed.",
    noKeywords: "No keywords suppressed.",
    rankingNote: "Feed ranking excludes matching channels and title/description phrases",
    identityRecord: "Identity record / NN",
    openStudio: "Open Studio",
    loadingAria: "Loading player profile",
    unavailable: "Player identity unavailable.",
    channelFallback: "Channel ID",
    rarityCommon: "Standard",
    rarityRare: "Rare",
    rarityLegendary: "Legendary",
  },
  dimension: {
    loading: "Synchronizing vertical stream…",
    emptyTitle: "No short signals",
    emptyBody: "The Hyper-Feed has no clips available. Return to the matrix and try again.",
    feedAria: "Dimension Shift short-form feed",
    title: "Dimension Shift",
    subtitle: "Vertical Hyper-Feed · NN signals",
    live: "Live stream",
    prev: "Previous short",
    next: "Next short",
    navTitle: "Navigate the feed",
    navBody: "Swipe, scroll, or use ↑ / ↓ (J / K) to move between clips.",
    teleportTitle: "Teleport to source",
    teleportBody: "Hold the time node for 800ms to open the long-form source at its exact clip timestamp.",
    loungeTitle: "Cyber-Lounge",
    holdTeleport: "Hold to teleport",
    syncing: "syncing",
    holdAria: "Hold 800 milliseconds to teleport to the parent video timestamp",
    views: "views",
  },
  home: {
    kicker: "Home matrix / Phase 04",
    title: "Signal feed",
    subtitle:
      "Ranked in real time by your algorithm mix. Move a fader and the matrix re-sorts.",
    feedOnline: "Feed online",
    feedOffline: "Feed offline",
    signalCount: "NN signals",
    modeChrono: "Chrono-pure",
    modeAdaptive: "Adaptive mix",
    statusSyncing: "Syncing",
    statusSyncLost: "Sync lost",
    uplinkUnavailable: "Uplink unavailable",
    matrixTitle: "Bento matrix",
    matrixAria: "Ranked video matrix",
    matrixReranking: "Re-ranking",
    matrixNodes: "NN nodes",
    footerLabel: "Nexus Stream / Home matrix",
    footerStats: "NN / MM signals",
    skeleton: "Loading ranked feed",
    errorTitle: "Feed sync failed",
    retry: "Retry uplink",
  },
  studio: {
    kicker: "Creator network",
    index: "Studio 01",
    title: "Creator Studio",
    subtitle:
      "Your channel’s signal, shaped into usable telemetry. Uploads publish directly to your local Home feed.",
    uplinkBadge: "Studio uplink online",
    retentionTitle: "Retention / hype telemetry",
    retentionSubtitle: "Illustrative 10-minute creator sample",
    legendRetention: "Retention",
    legendHype: "Hype pulse",
    signalCheckTitle: "Signal check",
    signalCheckSubtitle: "Catalog pulse",
    publishTitle: "Publish a signal",
    analyticsAria: "Channel analytics overview",
    kpiTotalViews: "Total views",
    kpiTotalViewsSuffix: "views",
    kpiTotalViewsChange: "Lifetime catalog",
    kpiRetention: "Average retention",
    kpiRetentionSuffix: "%",
    kpiRetentionChange: "Across recent uploads",
    kpiHype: "Hype index",
    kpiHypeSuffix: "/100",
    kpiHypeChange: "Catalog mean",
    kpiViewers: "Unique viewers",
    kpiViewersSuffix: "players",
    kpiViewersChange: "Estimated from view telemetry",
    chartAria: "Illustrative retention and hype telemetry chart over ten minutes",
    seriesRetention: "Retention %",
    seriesHype: "Hype index",
    metricPublished: "Published signals",
    metricViews: "Avg. views / signal",
    metricDuration: "Avg. signal duration",
    metricHype: "Mean hype score",
    analyticsNote:
      "Analytics shown here are derived from the locally seeded catalog. Retention telemetry is a labeled sample until real playback data is connected.",
    minutes: "NN min",
    uploadTitle: "Publish a signal",
    uploadBody:
      "Simulated upload. The saved video is inserted into IndexedDB and appears in Home.",
    uploadBadge: "Dexie / local",
    fieldTitle: "Signal title",
    fieldTitlePlaceholder: "Name your transmission",
    fieldCategory: "Category",
    fieldDescription: "Description",
    fieldDescriptionPlaceholder: "What will viewers discover?",
    fieldRuntime: "Runtime",
    fieldRuntimeAria: "Video runtime in seconds",
    uploadNote:
      "A generated thumbnail and demo video source will be attached for the simulator.",
    publishing: "Publishing",
    publish: "Publish",
    noticePublished: "“NN” published to the Home signal feed.",
    noticeFailed: "Upload failed. The local library could not be updated.",
    simulatorNote:
      "This simulator does not upload a file or transmit content externally. It adds metadata to this browser’s local catalog.",
    footerTelemetry: "Nexus creator telemetry",
    footerCatalog: "Local catalog / NN signals",
    categoryTech: "Tech",
    categoryGaming: "Gaming",
    categoryScience: "Science",
    categoryMusic: "Music",
    categoryCyberculture: "Cyberculture",
    categoryDesign: "Design",
  },
  lounge: {
    connecting: "Connecting to lounge stream…",
    title: "Cyber-Lounge",
    roomSuffix: "Shared watch room",
    syncLocked: "Sync locked · 14ms",
    online: "4 online",
    live: "ROOM LIVE",
    nowInLounge: "Now in the lounge",
    djPrefix: "DJ",
    rotateCrown: "rotate crown",
    reactions: "Room reactions",
    reactionAria: "Send NN reaction",
    reactionCount: "NN reactions",
    queueTitle: "DJ queue",
    queued: "NN queued",
    queueEmpty: "Queue is open. Add a long-form signal for the room.",
    votes: "NN votes",
    vote: "Vote",
    queueAdded: "NN added to the DJ queue.",
    chatTitle: "Room chat",
    present: "4 present",
    inRoom: "In the room",
    host: "host / DJ",
    coViewer: "co-viewer",
    messageLabel: "Message the room",
    messagePlaceholder: "Message the room…",
    send: "Send message",
  },
  watch: {
    back: "Back to matrix",
    node: "Watch node",
    formatFallback: "signal",
    notFound: "Video not found",
    clip: "Clip",
    subscribers: "subscribers",
    views: "views",
    signalIntel: "Signal intel",
    markers: "NN markers",
    scoreNovelty: "Novelty",
    scoreDepth: "Depth",
    scoreHype: "Hype",
    loadingAria: "Loading video",
    errorTitle: "Signal lost",
    retry: "Retry uplink",
    returnHome: "Return to matrix",
  },
  comments: {
    sectionAria: "Holo-comments discussion matrix",
    title: "Holo-comments",
    count: "NN signals",
    tabsAria: "Comment categories",
    tabMeme: "Meme",
    tabDeepDive: "Deep Dive",
    tabTimestamp: "Timestamp",
    loading: "Resolving signals",
    error: "Discussion feed unavailable",
    empty: "No signals in this category yet",
    upvote: "Upvote comment by",
    removeUpvote: "Remove upvote from comment by",
  },
  queue: {
    panelAria: "Cartridge queue",
    title: "Cartridge queue",
    clear: "Clear queue",
    empty: "No cartridges loaded",
    hint: "Right-click the HUD for commands",
    onDeck: "On deck",
    removeAria: "Remove NN from queue",
    slot: "Slot NN",
    bay: "Cartridge bay",
    toggleAria: "Toggle cartridge queue, NN items",
    trigger: "Queue",
  },
  pwa: {
    ready: "PWA READY",
    readyTitle: "Offline shell cached",
    install: "INSTALL APP",
    installTitle: "Install NEXUS STREAM",
  },
  wheel: {
    dialogAria: "Radial command wheel",
    close: "Close command wheel",
    caption: "Command wheel",
    playNext: "Play next",
    share: "Share",
    pip: "PiP",
    audioDeck: "Audio deck",
  },
  clipper: {
    title: "Glitch clipper",
    subtitle: "15-second neural extract",
    close: "Close clipper",
    waveformAria: "Selected clip waveform",
    fallbackCaption: "A moment worth replaying.",
    copied: "Clip link copied",
    copy: "Copy clip link",
    shareReady: "Share link ready to paste",
  },
  scrub: {
    sectionAria: "Neural transcript search",
    placeholder: "Search transcript…",
    inputAria: "Search transcript",
    clear: "Clear transcript search",
    matches: "MM / NN MATCHES",
    noMatches: "0 MATCHES",
    prev: "Previous transcript match",
    next: "Next transcript match",
  },
  timeline: {
    sliderAria: "Video timeline",
    valueText: "MM of NN",
    hype: "Hype",
    funny: "Funny",
    shock: "Shock",
    insight: "Insight",
    sponsor: "Sponsor",
  },
  holo: {
    aria: "Time-anchored holo-comments",
  },
};

const fa: Dictionary = {
  topBar: {
    brandHome: "خانه‌ی نکسوس استریم",
    searchOpen: "بازکردن جست‌وجوی عصبی",
    searchPlaceholder: "جست‌وجوی عصبی",
    searchDialog: "جست‌وجوی عصبی",
    searchClose: "بستن جست‌وجوی عصبی",
    searchInput: "جست‌وجو در کاتالوگ عصبی",
    searchInputPlaceholder: "عنوان، رونوشت یا کانال را جست‌وجو کن...",
    searchResults: "نتایج جست‌وجو",
    searchEmptyTitle: "سیگنالی پیدا نشد",
    searchEmptyHint: "یک عبارت از رونوشت یا شناسه‌ی کانال را امتحان کن",
    searchHintToggle: "تغییر",
    searchHintPlay: "پخش",
    searchHits: "نتیجه",
    statusPing: "پینگ ۱۲ میلی‌ثانیه",
    statusLive: "زنده",
    dimensionLabel: "تغییر جابه‌جایی بعد",
    dimensionTitle: "جابه‌جایی بعد",
    studioLabel: "بازکردن استودیوی سازنده",
    studioTitle: "استودیوی سازنده",
    profileLabel: "بازکردن پروفایل بازیکن",
    localeSwitch: "تغییر زبان رابط",
    localeSwitchTitle: "زبان رابط",
  },
  dock: {
    navigation: "ناوبری اصلی",
    activeSuffix: "، فعال",
    home: "خانه",
    dimension: "بعد",
    lounge: "لانژ",
    profile: "پروفایل",
  },
  equalizer: {
    title: "اکولایزر الگوریتم",
    subtitle: "نوآوری · عمق · هیجان",
    chronoPure: "کرونو-خالص",
    nukeReset: "بازنشانی کامل",
    axisMix: "ترکیب محورها",
    noveltyLabel: "آشنا / ناشناخته",
    noveltyHint: "بایاس نوآوری",
    depthLabel: "عمیق / سریع",
    depthHint: "بایاس پیچیدگی",
    hypeLabel: "آرام / هیجانی",
    hypeHint: "بایاس انرژی",
    bypassNotice: "رتبه‌بندی دور زده شد — فید زمانی مطلق",
    footerAxes: "۳ محور / رتبه‌بندی زنده",
    footerEngaged: "کرونو-خالص فعال",
    footerOnline: "موتور رتبه‌بندی آنلاین",
  },
  player: {
    play: "پخش ویدیو",
    pause: "توقف ویدیو",
    mute: "بی‌صدا",
    unmute: "باصدا",
    volume: "صدا",
    shieldOff: "روشن‌کردن سپر اسپانسر",
    shieldOn: "خاموش‌کردن سپر اسپانسر",
    shieldChip: "سپر",
    audioDeck: "تغییر به حالت صوتی",
    audioChip: "صدا",
    holoShow: "نمایش هولو-کامنت‌ها",
    holoHide: "پنهان‌کردن هولو-کامنت‌ها",
    holoChip: "هولو",
    clip: "ساخت کلیپ ۱۵ ثانیه‌ای (C)",
    clipChip: "کلیپ",
    fullscreenEnter: "ورود به تمام‌صفحه",
    fullscreenExit: "خروج از تمام‌صفحه",
    sponsorBypassed: "اسپانسر دور زده شد",
    signalStandby: "انتظار سیگنال",
    localFeed: "فید محلی",
    offline: "آفلاین",
    loungeCta: "تماشای گروهی در سایبر-لانژ",
  },
  miniPlayer: {
    region: "مینی‌پلیر مغناطیسی",
    nowPlaying: "در حال پخش",
    play: "ادامه‌ی پخش",
    pause: "توقف پخش",
    audioActive: "حالت صوتی فعال",
    returnToWatch: "بازگشت به تماشا",
    close: "بستن مینی‌پلیر",
    dragHint: "برای جابه‌جایی بکش",
  },
  profile: {
    watchDnaTitle: "دی‌ان‌ای تماشا",
    watchDnaSubtitle: "پروفایل سلیقه‌ی شش‌محوره / سهم زمان تماشا",
    watchDnaBadge: "۶ محور",
    trophyTitle: "گنجینه‌ی جام‌ها",
    trophySubtitle: "سیگنال کسب‌شده / بازشدن‌های NN",
    blacklistTitle: "کنسول لیست سیاه",
    blacklistSubtitle:
      "کانال‌ها و عبارت‌ها را از فید رتبه‌بندی‌شده بیرون نگه دار. تغییرات روی همین دستگاه می‌ماند.",
    blacklistBadge: "فیلتر محلی",
    channels: "کانال‌ها",
    keywords: "کلیدواژه‌ها",
    identityKicker: "هویت بازیکن / حساب",
    identityTitle: "شناسه‌ی بازیکن",
    verified: "بازیکن تأییدشده",
    switchPlayer: "تغییر بازیکن نمونه",
    switchPlayerAria: "تغییر پروفایل بازیکن نمونه",
    totalXp: "امتیاز کل",
    nextLevel: "سطح بعدی",
    creatorStudio: "استودیوی سازنده",
    privateId: "شناسه‌ی خصوصی",
    unlocked: "بازشده در NN",
    watchTime: "زمان تماشا",
    watchShare: "سهم تماشا",
    dnaAria: "نمودار راداری دی‌ان‌ای تماشا برای NN",
    channelPlaceholder: "شناسه یا نام کانال",
    keywordPlaceholder: "عبارت یا کلیدواژه",
    add: "افزودن",
    remove: "حذف",
    removeAria: "حذف NN از لیست سیاه",
    noChannels: "هیچ کانالی مسدود نشده است.",
    noKeywords: "هیچ کلیدواژه‌ای مسدود نشده است.",
    rankingNote: "رتبه‌بندی فید، کانال‌ها و عبارت‌های عنوان/توضیحات منطبق را حذف می‌کند",
    identityRecord: "رکورد هویت / NN",
    openStudio: "بازکردن استودیو",
    loadingAria: "در حال بارگذاری پروفایل بازیکن",
    unavailable: "هویت بازیکن در دسترس نیست.",
    channelFallback: "شناسه‌ی کانال",
    rarityCommon: "استاندارد",
    rarityRare: "کمیاب",
    rarityLegendary: "افسانه‌ای",
  },
  dimension: {
    loading: "در حال همگام‌سازی استریم عمودی…",
    emptyTitle: "هیچ سیگنال کوتاهی موجود نیست",
    emptyBody: "هایپر-فید هیچ کلیپی ندارد. به ماتریس برگرد و دوباره تلاش کن.",
    feedAria: "فید کوتاه جابه‌جایی بُعد",
    title: "جابه‌جایی بُعد",
    subtitle: "هایپر-فید عمودی · NN سیگنال",
    live: "استریم زنده",
    prev: "کلیپ کوتاه قبلی",
    next: "کلیپ کوتاه بعدی",
    navTitle: "پیمایش در فید",
    navBody: "بکش، اسکرول کن، یا با ↑ / ↓ (J / K) بین کلیپ‌ها جابه‌جا شو.",
    teleportTitle: "تلپورت به منبع",
    teleportBody: "گره‌ی زمان را ۸۰۰ میلی‌ثانیه نگه دار تا منبع بلند در همان لحظه‌ی دقیق کلیپ باز شود.",
    loungeTitle: "سایبر-لانژ",
    holdTeleport: "نگه دار تا تلپورت",
    syncing: "همگام‌سازی",
    holdAria: "۸۰۰ میلی‌ثانیه نگه دار تا به زمان ویدیوی والد تلپورت کنی",
    views: "بازدید",
  },
  home: {
    kicker: "ماتریس خانه / فاز ۰۴",
    title: "فید سیگنال",
    subtitle:
      "به‌صورت زنده با ترکیب الگوریتم تو رتبه‌بندی می‌شود. یک فیدر را جابه‌جا کن تا ماتریس دوباره مرتب شود.",
    feedOnline: "فید آنلاین",
    feedOffline: "فید آفلاین",
    signalCount: "NN سیگنال",
    modeChrono: "کرونو-خالص",
    modeAdaptive: "ترکیب تطبیقی",
    statusSyncing: "همگام‌سازی",
    statusSyncLost: "قطع همگام‌سازی",
    uplinkUnavailable: "اتصال در دسترس نیست",
    matrixTitle: "ماتریس بنتو",
    matrixAria: "ماتریس ویدیوهای رتبه‌بندی‌شده",
    matrixReranking: "رتبه‌بندی مجدد",
    matrixNodes: "NN گره",
    footerLabel: "نکسوس استریم / ماتریس خانه",
    footerStats: "NN / MM سیگنال",
    skeleton: "در حال بارگذاری فید رتبه‌بندی‌شده",
    errorTitle: "همگام‌سازی فید شکست خورد",
    retry: "تلاش مجدد اتصال",
  },
  studio: {
    kicker: "شبکه‌ی سازندگان",
    index: "استودیو ۰۱",
    title: "استودیوی سازنده",
    subtitle:
      "سیگنال کانال تو، شکل‌گرفته به تلمتری قابل استفاده. انتشارها مستقیم در فید خانه‌ی محلی منتشر می‌شوند.",
    uplinkBadge: "اتصال استودیو برقرار است",
    retentionTitle: "تلمتری نگه‌داشت / هیجان",
    retentionSubtitle: "نمونه‌ی نمایشی ۱۰ دقیقه‌ای سازنده",
    legendRetention: "نگه‌داشت",
    legendHype: "پالس هیجان",
    signalCheckTitle: "بررسی سیگنال",
    signalCheckSubtitle: "پالس کاتالوگ",
    publishTitle: "انتشار یک سیگنال",
    analyticsAria: "نمای کلی تحلیل کانال",
    kpiTotalViews: "کل بازدیدها",
    kpiTotalViewsSuffix: "بازدید",
    kpiTotalViewsChange: "کل عمر کاتالوگ",
    kpiRetention: "میانگین نگه‌داشت",
    kpiRetentionSuffix: "٪",
    kpiRetentionChange: "در انتشارهای اخیر",
    kpiHype: "شاخص هیجان",
    kpiHypeSuffix: "/۱۰۰",
    kpiHypeChange: "میانگین کاتالوگ",
    kpiViewers: "بینندگان یکتا",
    kpiViewersSuffix: "بازیکن",
    kpiViewersChange: "برآورد از تلمتری بازدید",
    chartAria: "نمودار نمایشی تلمتری نگه‌داشت و هیجان در ده دقیقه",
    seriesRetention: "نگه‌داشت ٪",
    seriesHype: "شاخص هیجان",
    metricPublished: "سیگنال‌های منتشرشده",
    metricViews: "میانگین بازدید / سیگنال",
    metricDuration: "میانگین مدت سیگنال",
    metricHype: "میانگین امتیاز هیجان",
    analyticsNote:
      "تحلیل‌های اینجا از کاتالوگ محلی بذرپاشی‌شده استخراج شده‌اند. تلمتری نگه‌داشت تا اتصال داده‌ی واقعی پخش، یک نمونه‌ی برچسب‌خورده است.",
    minutes: "NN دقیقه",
    uploadTitle: "انتشار یک سیگنال",
    uploadBody:
      "بارگذاری شبیه‌سازی‌شده. ویدیوی ذخیره‌شده در IndexedDB درج می‌شود و در خانه ظاهر می‌شود.",
    uploadBadge: "Dexie / محلی",
    fieldTitle: "عنوان سیگنال",
    fieldTitlePlaceholder: "انتشارت را نام‌گذاری کن",
    fieldCategory: "دسته‌بندی",
    fieldDescription: "توضیحات",
    fieldDescriptionPlaceholder: "بینندگان چه چیزی کشف خواهند کرد؟",
    fieldRuntime: "مدت زمان",
    fieldRuntimeAria: "مدت زمان ویدیو به ثانیه",
    uploadNote:
      "برای شبیه‌ساز، یک تصویر بندانگشتی تولیدی و منبع ویدیوی نمایشی پیوست می‌شود.",
    publishing: "در حال انتشار",
    publish: "انتشار",
    noticePublished: "«NN» در فید سیگنال خانه منتشر شد.",
    noticeFailed: "بارگذاری شکست خورد. کتابخانه‌ی محلی به‌روز نشد.",
    simulatorNote:
      "این شبیه‌ساز فایلی بارگذاری نمی‌کند و محتوایی به بیرون ارسال نمی‌کند. فقط فراداده به کاتالوگ محلی این مرورگر اضافه می‌کند.",
    footerTelemetry: "تلمتری سازنده‌ی نکسوس",
    footerCatalog: "کاتالوگ محلی / NN سیگنال",
    categoryTech: "فناوری",
    categoryGaming: "گیمینگ",
    categoryScience: "علم",
    categoryMusic: "موسیقی",
    categoryCyberculture: "سایبرکالچر",
    categoryDesign: "طراحی",
  },
  lounge: {
    connecting: "در حال اتصال به استریم لانژ…",
    title: "سایبر-لانژ",
    roomSuffix: "اتاق تماشای مشترک",
    syncLocked: "همگام‌سازی قفل · ۱۴ میلی‌ثانیه",
    online: "۴ نفر آنلاین",
    live: "اتاق زنده",
    nowInLounge: "اکنون در لانژ",
    djPrefix: "دی‌جی",
    rotateCrown: "چرخش تاج",
    reactions: "واکنش‌های اتاق",
    reactionAria: "ارسال واکنش NN",
    reactionCount: "NN واکنش",
    queueTitle: "صف دی‌جی",
    queued: "NN در صف",
    queueEmpty: "صف باز است. یک سیگنال بلند برای اتاق اضافه کن.",
    votes: "NN رأی",
    vote: "رأی",
    queueAdded: "NN به صف دی‌جی اضافه شد.",
    chatTitle: "گفت‌وگوی اتاق",
    present: "۴ نفر حاضر",
    inRoom: "در اتاق",
    host: "میزبان / دی‌جی",
    coViewer: "هم‌بیننده",
    messageLabel: "پیام به اتاق",
    messagePlaceholder: "پیام به اتاق…",
    send: "ارسال پیام",
  },
  watch: {
    back: "بازگشت به ماتریس",
    node: "گره‌ی تماشا",
    formatFallback: "سیگنال",
    notFound: "ویدیو پیدا نشد",
    clip: "کلیپ",
    subscribers: "دنبال‌کننده",
    views: "بازدید",
    signalIntel: "اطلاعات سیگنال",
    markers: "NN نشانگر",
    scoreNovelty: "نوآوری",
    scoreDepth: "عمق",
    scoreHype: "هیجان",
    loadingAria: "در حال بارگذاری ویدیو",
    errorTitle: "سیگنال از دست رفت",
    retry: "تلاش مجدد اتصال",
    returnHome: "بازگشت به ماتریس",
  },
  comments: {
    sectionAria: "ماتریس گفت‌وگوی هولو-کامنت‌ها",
    title: "هولو-کامنت‌ها",
    count: "NN سیگنال",
    tabsAria: "دسته‌بندی‌های کامنت",
    tabMeme: "میم",
    tabDeepDive: "کالبدشکافی",
    tabTimestamp: "برچسب زمانی",
    loading: "در حال بازیابی سیگنال‌ها",
    error: "فید گفت‌وگو در دسترس نیست",
    empty: "هنوز هیچ سیگنالی در این دسته نیست",
    upvote: "رأی مثبت به کامنت",
    removeUpvote: "حذف رأی مثبت از کامنت",
  },
  queue: {
    panelAria: "صف کارتریج",
    title: "صف کارتریج",
    clear: "پاک‌کردن صف",
    empty: "هیچ کارتریجی بارگذاری نشده",
    hint: "برای فرمان‌ها روی HUD راست‌کلیک کن",
    onDeck: "در نوبت",
    removeAria: "حذف NN از صف",
    slot: "اسلات NN",
    bay: "خلیج کارتریج",
    toggleAria: "تغییر صف کارتریج، NN آیتم",
    trigger: "صف",
  },
  pwa: {
    ready: "PWA آماده",
    readyTitle: "پوسته‌ی آفلاین ذخیره شد",
    install: "نصب اپلیکیشن",
    installTitle: "نصب نکسوس استریم",
  },
  wheel: {
    dialogAria: "چرخ فرمان شعاعی",
    close: "بستن چرخ فرمان",
    caption: "چرخ فرمان",
    playNext: "پخش بعدی",
    share: "هم‌رسانی",
    pip: "پنجره‌ی شناور",
    audioDeck: "حالت صوتی",
  },
  clipper: {
    title: "برش‌دهنده‌ی گلیچ",
    subtitle: "استخراج عصبی ۱۵ ثانیه‌ای",
    close: "بستن برش‌دهنده",
    waveformAria: "موج‌نمای کلیپ انتخاب‌شده",
    fallbackCaption: "لحظه‌ای که ارزش دوباره دیدن دارد.",
    copied: "لینک کلیپ کپی شد",
    copy: "کپی لینک کلیپ",
    shareReady: "لینک هم‌رسانی آماده‌ی چسباندن است",
  },
  scrub: {
    sectionAria: "جست‌وجوی عصبی در رونوشت",
    placeholder: "جست‌وجو در رونوشت…",
    inputAria: "جست‌وجوی رونوشت",
    clear: "پاک‌کردن جست‌وجوی رونوشت",
    matches: "MM / NN تطابق",
    noMatches: "هیچ تطابقی",
    prev: "تطابق قبلی در رونوشت",
    next: "تطابق بعدی در رونوشت",
  },
  timeline: {
    sliderAria: "خط زمانی ویدیو",
    valueText: "MM از NN",
    hype: "هیجان",
    funny: "خنده",
    shock: "شوک",
    insight: "بینش",
    sponsor: "اسپانسر",
  },
  holo: {
    aria: "هولو-کامنت‌های زمان‌محور",
  },
};

const DICTIONARIES: Record<Locale, Dictionary> = { en, fa };

/** Resolve the dictionary for a locale without touching React state. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** `fa` renders right-to-left; every other locale renders left-to-right. */
export function directionFor(locale: Locale): Direction {
  return locale === "fa" ? "rtl" : "ltr";
}

/** Type guard for values coming from storage or the URL. */
export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "fa";
}

export interface I18n {
  readonly locale: Locale;
  readonly dir: Direction;
  readonly isRtl: boolean;
  readonly t: Dictionary;
  readonly setLocale: (locale: Locale) => void;
  readonly toggleLocale: () => void;
}

/**
 * Reactive access to the interface dictionary. Components re-render whenever
 * the persisted locale changes, including after hydration from localStorage.
 */
export function useI18n(): I18n {
  const locale = useAppStore((state) => state.locale);
  const setLocale = useAppStore((state) => state.setLocale);
  const toggleLocale = useAppStore((state) => state.toggleLocale);

  return useMemo(
    () => ({
      locale,
      dir: directionFor(locale),
      isRtl: locale === "fa",
      t: getDictionary(locale),
      setLocale,
      toggleLocale,
    }),
    [locale, setLocale, toggleLocale],
  );
}
