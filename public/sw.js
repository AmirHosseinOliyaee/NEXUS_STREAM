/* NEXUS STREAM // offline shell
 * Dependency-free service worker.
 *
 * Strategy
 *  - Navigation requests ........ network-first, cached shell fallback, then an
 *                                 inline offline HUD document.
 *  - Build/static assets ........ stale-while-revalidate (hash-stable files).
 *  - Mock media ................. cache-first so the bundled demo feed survives
 *                                 a dropped uplink (range requests bypass).
 *  - Everything else ............ straight to the network; never intercepted.
 */

const VERSION = "nexus-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;
const MEDIA_CACHE = `${VERSION}-media`;

const SHELL_URLS = ["/", "/manifest.json"];
const MEDIA_URLS = ["/mocks/nexus-sample.mp4"];

const OFFLINE_DOCUMENT = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#07080D" />
<title>Signal lost // NEXUS STREAM</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; }
  body {
    display: grid;
    place-items: center;
    background: #07080D;
    color: #E7F6FF;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    background-image:
      linear-gradient(rgba(0, 240, 255, 0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 240, 255, 0.055) 1px, transparent 1px);
    background-size: 44px 44px;
    padding: 24px;
  }
  .panel {
    width: min(420px, 100%);
    border: 1px solid rgba(0, 240, 255, 0.28);
    background: rgba(10, 16, 26, 0.82);
    padding: 28px 24px;
    clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  }
  .kicker {
    margin: 0 0 10px;
    font-size: 9px;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: rgba(0, 240, 255, 0.65);
  }
  h1 {
    margin: 0 0 12px;
    font-size: 20px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  p {
    margin: 0 0 22px;
    font-size: 11px;
    line-height: 1.8;
    letter-spacing: 0.06em;
    color: rgba(231, 246, 255, 0.55);
  }
  a {
    display: inline-block;
    padding: 11px 18px;
    border: 1px solid rgba(0, 240, 255, 0.5);
    color: #00F0FF;
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-decoration: none;
  }
  a:focus-visible { outline: 2px solid #00F0FF; outline-offset: 3px; }
</style>
</head>
<body>
  <main class="panel">
    <p class="kicker">Nexus Stream // Offline Shell</p>
    <h1>Signal lost</h1>
    <p>The uplink dropped and this node is not in the local cache yet. Cached routes and the bundled demo feed still play.</p>
    <a href="/">Reacquire uplink</a>
  </main>
</body>
</html>`;

/* ---------------------------------------------------------------- *
 * Lifecycle
 * ---------------------------------------------------------------- */

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      const media = await caches.open(MEDIA_CACHE);

      // Cache entries independently so one 404 cannot abort the whole install.
      await Promise.all(
        SHELL_URLS.map(async (url) => {
          try {
            await shell.add(new Request(url, { cache: "reload" }));
          } catch {
            /* optional asset — ignore */
          }
        }),
      );
      await Promise.all(
        MEDIA_URLS.map(async (url) => {
          try {
            await media.add(new Request(url, { cache: "reload" }));
          } catch {
            /* optional asset — ignore */
          }
        }),
      );

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("nexus-") && !key.startsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

/* ---------------------------------------------------------------- *
 * Helpers
 * ---------------------------------------------------------------- */

const isCacheableAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname.startsWith("/assets/") ||
  /\.(?:css|js|woff2?|svg|png|jpe?g|webp|avif|ico|json)$/i.test(url.pathname);

const isMedia = (url) => url.pathname.startsWith("/mocks/");

const offlineDocument = () =>
  new Response(OFFLINE_DOCUMENT, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });

async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    const shell = await cache.match("/");
    if (shell) return shell;
    return offlineDocument();
  }
}

async function staleWhileRevalidateAsset(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone()).catch(() => undefined);
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    void network;
    return cached;
  }
  const response = await network;
  return response ?? Response.error();
}

async function cacheFirstMedia(request) {
  // Range requests must reach the network: a cached 200 body cannot satisfy them.
  if (request.headers.has("range")) {
    try {
      return await fetch(request);
    } catch {
      return Response.error();
    }
  }

  const cache = await caches.open(MEDIA_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return Response.error();
  }
}

/* ---------------------------------------------------------------- *
 * Fetch routing
 * ---------------------------------------------------------------- */

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isMedia(url)) {
    event.respondWith(cacheFirstMedia(request));
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(staleWhileRevalidateAsset(request));
  }
});
