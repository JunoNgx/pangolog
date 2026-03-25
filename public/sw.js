const version = new URL(self.location.href).searchParams.get("v") ?? "dev";
const CACHE_NAME = `pangolog-${version}`;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) =>
                cache.addAll([
                    "/",
                    "/log",
                    "/summary",
                    "/settings",
                    "/recurring",
                    "/help",
                    "/terms",
                    "/privacy",
                ]),
            ),
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== "GET" || url.origin !== self.location.origin) return;

    // Never cache API routes
    if (url.pathname.startsWith("/api/")) return;

    // Cache-first for Next.js static assets (content-addressed, immutable)
    if (url.pathname.startsWith("/_next/static/")) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, response.clone()));
                    return response;
                });
            }),
        );
        return;
    }

    // Network-first for page navigations, fall back to cache
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, response.clone()));
                    return response;
                })
                .catch(
                    () =>
                        caches.match(request) ??
                        caches.match("/"),
                ),
        );
    }
});
