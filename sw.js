/**
 * Service worker: keeps a copy of the whole app so it opens with no
 * internet. Bump VERSION whenever a file changes, so devices fetch the new
 * copy; the old one is deleted once the new one is ready.
 *
 * @module sw
 */

const VERSION = "v5"
const CACHE = `abc-flashcards-${VERSION}`
const FILES = [
  "./",
  "index.html",
  "app.css",
  "app.js",
  "letters.js",
  "recorder.js",
  "recordings.js",
  "sound.js",
  "manifest.webmanifest",
  "vendor/modern-styles.min.css",
  "fonts/andika-latin-400-normal.woff2",
  "fonts/andika-latin-700-normal.woff2",
  "icons/icon.svg",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("abc-flashcards-") && key !== CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// Cache first: the app is small and fixed, so the saved copy is always right
// for its version.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(
    caches
      .match(event.request, { ignoreSearch: true })
      .then((hit) => hit ?? fetch(event.request)),
  )
})
