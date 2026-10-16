/**
 * Service worker: keeps a copy of the whole app so it opens with no
 * internet. Bump VERSION whenever a file changes, so devices fetch the new
 * copy; the old one is deleted once the new one is ready.
 *
 * @module sw
 */

const VERSION = "v7"
const CACHE = `abc-flashcards-${VERSION}`
const FILES = [
  "./",
  "index.html",
  "app.css",
  "app.js",
  "letters.js",
  "manifest.webmanifest",
  "vendor/modern-styles.min.css",
  "fonts/andika-latin-400-normal.woff2",
  "fonts/andika-latin-700-normal.woff2",
  "icons/icon.svg",
  "icons/xylophone.svg",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "audio/a-name.mp3",
  "audio/a-sound.mp3",
  "audio/a-word.mp3",
  "audio/b-name.mp3",
  "audio/b-sound.mp3",
  "audio/b-word.mp3",
  "audio/c-name.mp3",
  "audio/c-sound.mp3",
  "audio/c-word.mp3",
  "audio/d-name.mp3",
  "audio/d-sound.mp3",
  "audio/d-word.mp3",
  "audio/e-name.mp3",
  "audio/e-sound.mp3",
  "audio/e-word.mp3",
  "audio/f-name.mp3",
  "audio/f-sound.mp3",
  "audio/f-word.mp3",
  "audio/find.mp3",
  "audio/g-name.mp3",
  "audio/g-sound.mp3",
  "audio/g-word.mp3",
  "audio/h-name.mp3",
  "audio/h-sound.mp3",
  "audio/h-word.mp3",
  "audio/i-name.mp3",
  "audio/i-sound.mp3",
  "audio/i-word.mp3",
  "audio/j-name.mp3",
  "audio/j-sound.mp3",
  "audio/j-word.mp3",
  "audio/k-name.mp3",
  "audio/k-sound.mp3",
  "audio/k-word.mp3",
  "audio/l-name.mp3",
  "audio/l-sound.mp3",
  "audio/l-word.mp3",
  "audio/lets-play.mp3",
  "audio/m-name.mp3",
  "audio/m-sound.mp3",
  "audio/m-word.mp3",
  "audio/n-name.mp3",
  "audio/n-sound.mp3",
  "audio/n-word.mp3",
  "audio/o-name.mp3",
  "audio/o-sound.mp3",
  "audio/o-word.mp3",
  "audio/p-name.mp3",
  "audio/p-sound.mp3",
  "audio/p-word.mp3",
  "audio/q-name.mp3",
  "audio/q-sound.mp3",
  "audio/q-word.mp3",
  "audio/r-name.mp3",
  "audio/r-sound.mp3",
  "audio/r-word.mp3",
  "audio/s-name.mp3",
  "audio/s-sound.mp3",
  "audio/s-word.mp3",
  "audio/says.mp3",
  "audio/t-name.mp3",
  "audio/t-sound.mp3",
  "audio/t-word.mp3",
  "audio/thats.mp3",
  "audio/try-again.mp3",
  "audio/u-name.mp3",
  "audio/u-sound.mp3",
  "audio/u-word.mp3",
  "audio/v-name.mp3",
  "audio/v-sound.mp3",
  "audio/v-word.mp3",
  "audio/w-name.mp3",
  "audio/w-sound.mp3",
  "audio/w-word.mp3",
  "audio/which-says.mp3",
  "audio/x-name.mp3",
  "audio/x-sound.mp3",
  "audio/x-word.mp3",
  "audio/y-name.mp3",
  "audio/y-sound.mp3",
  "audio/y-word.mp3",
  "audio/yes.mp3",
  "audio/you-did-it.mp3",
  "audio/z-name.mp3",
  "audio/z-sound.mp3",
  "audio/z-word.mp3",
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
