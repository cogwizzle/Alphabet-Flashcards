/**
 * Sound: plays a recorded clip when there is one, and otherwise has the
 * device's speech voice say the words. Parts play one after another, and a
 * new call stops whatever was playing.
 *
 * The first part always starts inside the call, with no waiting first,
 * because iOS only plays sound that starts during a tap.
 *
 * @module sound
 */

import { clipUrl } from "./recordings.js"

/**
 * One thing to say: a recorded clip if it exists, else the words.
 *
 * @typedef {object} Part
 * @property {string} [clip] The key of a recording to play.
 * @property {string} [text] Words for the speech voice, when there is no clip.
 */

/** @type {SpeechSynthesisVoice | undefined} */
let voice

/**
 * Set once the chosen voice has failed: from then on the browser picks the
 * voice. Some systems list voices that can't actually speak.
 */
let useDefaultVoice = false

/**
 * The utterance being spoken. Safari can drop an utterance that nothing
 * refers to before it ends, and then its end event never comes.
 *
 * @type {SpeechSynthesisUtterance | undefined}
 */
let utterance

/** One audio element for every clip, so iOS unlocks it once and reuses it. */
const player = new Audio()

/** Ends the clip playing now, if any. */
let endClip = () => {}

/** Counts calls to say(), so an older one knows it was replaced. */
let turn = 0

/**
 * Called when the browser refuses to speak, with its reason.
 *
 * @type {(reason: string) => void}
 */
let onProblem = () => {}

/**
 * Get ready to speak: pick a voice and say where to report problems.
 *
 * @param {(reason: string) => void} report Shows a problem to the person.
 */
export function setUpSound(report) {
  onProblem = report
  if (!("speechSynthesis" in window)) return
  pickVoice()
  speechSynthesis.addEventListener("voiceschanged", pickVoice)
}

/** Pick a clear English voice, preferring the iPad's default US voice. */
function pickVoice() {
  const voices = speechSynthesis.getVoices()
  const english = voices.filter((v) =>
    v.lang.replace("_", "-").startsWith("en"),
  )
  voice =
    english.find((v) => v.name === "Samantha") ??
    english.find(
      (v) => v.lang.replace("_", "-") === "en-US" && v.localService,
    ) ??
    english.find((v) => v.lang.replace("_", "-") === "en-US") ??
    english[0]
}

/** Stop any clip or speech that is playing. */
export function hush() {
  turn += 1
  stopPlaying()
}

/** Stop the sound itself, without replacing the current turn. */
function stopPlaying() {
  endClip()
  player.pause()
  // Safari can drop words spoken straight after a cancel, so only cancel
  // when something is actually being said.
  if (
    "speechSynthesis" in window &&
    (speechSynthesis.speaking || speechSynthesis.pending)
  ) {
    speechSynthesis.cancel()
  }
}

/**
 * Say some parts in order, stopping anything already playing.
 *
 * @param {(Part | string)[]} parts Clips or words; a string is just words.
 * @returns {Promise<void>} Settles when done, or when another call replaces it.
 */
export async function say(parts) {
  turn += 1
  const mine = turn
  stopPlaying()
  for (const part of parts) {
    if (mine !== turn) return
    const { clip, text } = typeof part === "string" ? { text: part } : part
    const url = clip ? clipUrl(clip) : undefined
    if (url) await playClip(url)
    else if (text) await speakText(text)
  }
}

/**
 * Play a recording to its end.
 *
 * @param {string} url The clip's URL.
 * @returns {Promise<void>} Settles when it ends, fails or is stopped.
 */
function playClip(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(done, 8000)
    /** Settle once, however the clip finished. */
    function done() {
      clearTimeout(timer)
      player.onended = null
      player.onerror = null
      endClip = () => {}
      resolve()
    }
    endClip = done
    player.onended = done
    player.onerror = done
    player.src = url
    player.play().catch(done)
  })
}

/**
 * Have the speech voice say some words.
 *
 * @param {string} text The words.
 * @returns {Promise<void>} Settles when they are said, fail or are stopped.
 */
function speakText(text) {
  if (!("speechSynthesis" in window)) {
    onProblem("no speech support")
    return Promise.resolve()
  }
  if (!voice) pickVoice()
  const chosen = useDefaultVoice ? undefined : voice
  return new Promise((resolve) => {
    // Some browsers never report the end, so don't wait forever.
    const timer = setTimeout(done, 1500 + text.length * 300)
    /** Settle once, whichever comes first. */
    function done() {
      clearTimeout(timer)
      resolve()
    }
    const said = new SpeechSynthesisUtterance(text)
    if (chosen) said.voice = chosen
    said.lang = chosen?.lang ?? "en-US"
    said.rate = 0.8
    said.pitch = 1.1
    said.onend = done
    said.onerror = (event) => {
      // Stopping speech on purpose reports an error too; that's fine.
      if (event.error === "interrupted" || event.error === "canceled") {
        done()
        return
      }
      // The chosen voice may be the problem: try again with the default.
      if (chosen && event.error !== "not-allowed") {
        useDefaultVoice = true
        clearTimeout(timer)
        speakText(text).then(resolve)
        return
      }
      onProblem(event.error)
      done()
    }
    utterance = said
    speechSynthesis.speak(utterance)
  })
}
