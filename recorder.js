/**
 * The recording screen: a grown-up records each letter's name and sound in
 * their own voice, to play instead of the speech voice. One recording runs
 * at a time, and stops by itself after a few seconds.
 *
 * @module recorder
 */

import { LETTERS } from "./letters.js"
import {
  canRecord,
  clipKey,
  clipUrl,
  deleteClip,
  recordingType,
  saveClip,
} from "./recordings.js"
import { hush, say } from "./sound.js"

/** @typedef {import("./recordings.js").ClipKind} ClipKind */

const MAX_SECONDS = 4

/**
 * Find an element that the page is known to have.
 *
 * @param {string} id The element's id.
 * @returns {HTMLElement} The element.
 */
function byId(id) {
  const el = document.getElementById(id)
  if (!el) throw new Error(`Missing #${id}`)
  return el
}

const dialog = byId("recorder")
const list = byId("recorder-list")
const problem = byId("recorder-problem")

/** @type {MediaStream | undefined} */
let stream

/**
 * The recording in progress.
 *
 * @type {{ key: string, recorder: MediaRecorder, timer: number } | undefined}
 */
let active

/**
 * Show a problem at the top of the screen.
 *
 * @param {string} message What went wrong, and what to do about it.
 */
function showProblem(message) {
  problem.textContent = message
  problem.hidden = false
}

/**
 * Make a small button.
 *
 * @param {string} label The text on it.
 * @param {string} name Its name for screen readers.
 * @param {() => void} onClick What a tap does.
 * @returns {HTMLButtonElement} The button.
 */
function button(label, name, onClick) {
  const el = document.createElement("button")
  el.type = "button"
  el.textContent = label
  el.setAttribute("aria-label", name)
  el.addEventListener("click", onClick)
  return el
}

/**
 * The controls for one clip: record, play and delete.
 *
 * @param {import("./letters.js").Letter} item The letter.
 * @param {ClipKind} kind Its name or its sound.
 * @returns {HTMLElement} The row of controls.
 */
function clipRow(item, kind) {
  const key = clipKey(item.letter, kind)
  const saved = Boolean(clipUrl(key))
  const recording = active?.key === key
  const what = kind === "name" ? "name" : "sound"

  const row = document.createElement("div")
  row.className = "rec-clip"
  row.dataset.key = key

  const label = document.createElement("span")
  label.className = "rec-label"
  if (kind === "name") {
    label.textContent = "Name"
  } else {
    label.append("Sound, as in ")
    const word = document.createElement("b")
    word.textContent = item.word
    label.append(word)
  }

  let recordLabel = "● Record"
  if (recording) recordLabel = "■ Stop"
  else if (saved) recordLabel = "● Redo"
  const record = button(
    recordLabel,
    `Record the ${what} of ${item.letter}`,
    () => toggleRecording(key),
  )
  record.className = recording ? "rec-record is-recording" : "rec-record"

  const play = button("▶", `Play the ${what} of ${item.letter}`, () => {
    say([{ clip: key }])
  })
  play.disabled = !saved || recording

  const remove = button("✕", `Delete the ${what} of ${item.letter}`, () => {
    deleteClip(key).then(() => refresh(key))
  })
  remove.disabled = !saved || recording

  row.append(label, record, play, remove)
  return row
}

/** Build the list of every letter's controls. */
function renderList() {
  const items = LETTERS.map((item) => {
    const li = document.createElement("li")
    li.className = "rec-letter"
    const letter = document.createElement("span")
    letter.className = "rec-glyph"
    letter.textContent = `${item.letter}${item.letter.toLowerCase()}`
    li.append(letter, clipRow(item, "name"), clipRow(item, "sound"))
    return li
  })
  list.replaceChildren(...items)
}

/**
 * Redraw the controls for one clip after it changes.
 *
 * @param {string} key The clip's key.
 */
function refresh(key) {
  const old = list.querySelector(`[data-key="${key}"]`)
  const [letter, kind] = key.split(":")
  const item = LETTERS.find((l) => l.letter === letter)
  if (!old || !item || (kind !== "name" && kind !== "sound")) return
  old.replaceWith(clipRow(item, kind))
}

/**
 * Start recording a clip, or stop if it is the one recording.
 *
 * @param {string} key The clip's key.
 */
async function toggleRecording(key) {
  const wasThis = active?.key === key
  stopRecording()
  if (wasThis) return
  hush()
  try {
    stream ??= await navigator.mediaDevices.getUserMedia({ audio: true })
  } catch {
    showProblem(
      "The microphone isn't allowed. Allow it for this site in the browser's settings, then try again.",
    )
    return
  }
  const type = recordingType()
  const recorder = new MediaRecorder(
    stream,
    type ? { mimeType: type } : undefined,
  )
  /** @type {Blob[]} */
  const chunks = []
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data)
  }
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: recorder.mimeType || type })
    if (blob.size > 0) {
      try {
        await saveClip(key, blob)
      } catch {
        showProblem("That recording couldn't be saved on this device.")
      }
    }
    refresh(key)
  }
  recorder.start()
  active = {
    key,
    recorder,
    timer: window.setTimeout(stopRecording, MAX_SECONDS * 1000),
  }
  refresh(key)
}

/** Stop the recording in progress, which saves it. */
function stopRecording() {
  if (!active) return
  const { recorder, timer, key } = active
  active = undefined
  clearTimeout(timer)
  if (recorder.state !== "inactive") recorder.stop()
  refresh(key)
}

/** Let go of the microphone, so the browser stops showing it in use. */
function releaseMicrophone() {
  stopRecording()
  for (const track of stream?.getTracks() ?? []) track.stop()
  stream = undefined
}

/** Wire up the button that opens the screen, and the screen itself. */
export function setUpRecorder() {
  byId("open-recorder").addEventListener("click", () => {
    hush()
    problem.hidden = true
    if (!canRecord()) {
      showProblem(
        "This browser can't record sound, so the speech voice is used.",
      )
    }
    renderList()
    if (dialog instanceof HTMLDialogElement) dialog.showModal()
  })
  byId("close-recorder").addEventListener("click", () => {
    if (dialog instanceof HTMLDialogElement) dialog.close()
  })
  dialog.addEventListener("close", () => {
    releaseMicrophone()
    hush()
  })
}
