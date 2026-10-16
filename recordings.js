/**
 * Recordings: a grown-up's own voice saying each letter's name and sound,
 * kept on this device in IndexedDB. They load into memory when the app
 * starts, so a tap can play one straight away (iOS only plays audio that
 * starts inside the tap itself, with no waiting first).
 *
 * @module recordings
 */

/** @typedef {"name" | "sound"} ClipKind */

const DB_NAME = "abc-flashcards"
const STORE = "clips"

/**
 * Playable URLs of the saved clips, by key.
 *
 * @type {Map<string, string>}
 */
const urls = new Map()

/**
 * The key a clip is saved under.
 *
 * @param {string} letter The uppercase letter.
 * @param {ClipKind} kind Whether it is the letter's name or its sound.
 * @returns {string} The key.
 */
export function clipKey(letter, kind) {
  return `${letter}:${kind}`
}

/**
 * Open the database, creating it the first time.
 *
 * @returns {Promise<IDBDatabase>} The open database.
 */
function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => request.result.createObjectStore(STORE)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Run one request against the clip store.
 *
 * @template T
 * @param {IDBTransactionMode} mode Read only, or read and write.
 * @param {(store: IDBObjectStore) => IDBRequest<T>} run Makes the request.
 * @returns {Promise<T>} The request's result.
 */
async function withStore(mode, run) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const request = run(db.transaction(STORE, mode).objectStore(STORE))
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Load every saved clip into memory. Storage can be missing (a private
 * window, for one); then there are just no recordings.
 *
 * @returns {Promise<void>} Settles when the clips are ready.
 */
export async function loadClips() {
  try {
    const keys = await withStore("readonly", (store) => store.getAllKeys())
    for (const key of keys) {
      const blob = await withStore("readonly", (store) => store.get(key))
      if (typeof key === "string" && blob instanceof Blob) {
        urls.set(key, URL.createObjectURL(blob))
      }
    }
  } catch {
    // No storage: the app falls back to the speech voice.
  }
}

/**
 * The playable URL of a clip, if one is saved.
 *
 * @param {string} key The clip's key.
 * @returns {string | undefined} Its URL, or undefined.
 */
export function clipUrl(key) {
  return urls.get(key)
}

/**
 * Save a clip, replacing any saved before.
 *
 * @param {string} key The clip's key.
 * @param {Blob} blob The recorded audio.
 * @returns {Promise<void>} Settles when it is saved.
 */
export async function saveClip(key, blob) {
  await withStore("readwrite", (store) => store.put(blob, key))
  const old = urls.get(key)
  if (old) URL.revokeObjectURL(old)
  urls.set(key, URL.createObjectURL(blob))
}

/**
 * Delete a clip, so the speech voice says that part again.
 *
 * @param {string} key The clip's key.
 * @returns {Promise<void>} Settles when it is gone.
 */
export async function deleteClip(key) {
  await withStore("readwrite", (store) => store.delete(key))
  const old = urls.get(key)
  if (old) URL.revokeObjectURL(old)
  urls.delete(key)
}

/**
 * Whether this browser can record from the microphone.
 *
 * @returns {boolean} Whether recording works here.
 */
export function canRecord() {
  return (
    typeof MediaRecorder !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia)
  )
}

/**
 * The audio format to record in: WebM in Chrome, MP4 in Safari, each one
 * the browser can also play back.
 *
 * @returns {string} A MIME type, or "" to let the browser choose.
 */
export function recordingType() {
  const types = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? ""
}
