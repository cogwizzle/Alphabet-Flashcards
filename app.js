/**
 * ABC Flash Cards: a card for each letter, and a game to find a letter by its
 * name or its sound. Every sound starts from a tap, because iOS only lets a
 * page speak after the person has touched it.
 *
 * @module app
 */

import { LETTERS } from "./letters.js"

/** @typedef {import("./letters.js").Letter} Letter */
/** @typedef {"cards" | "find"} Mode */
/** @typedef {"upper" | "lower"} Case */

const STORAGE_KEY = "abc-flashcards"
const CHOICES = 4
const STARS_PER_ROUND = 10

/**
 * @typedef {object} State
 * @property {Mode} mode Which screen is showing.
 * @property {Case} letterCase Whether letters show big (ABC) or small (abc).
 * @property {number} index The card showing, as an index into LETTERS.
 */

/** @type {State} */
const state = { mode: "cards", letterCase: "upper", index: 0, ...load() }

/**
 * Read the saved settings. Storage can be missing or blocked, so any failure
 * just means starting fresh.
 *
 * @returns {Partial<State>} The settings that were saved, if any.
 */
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
    /** @type {Partial<State>} */
    const out = {}
    if (saved.mode === "cards" || saved.mode === "find") out.mode = saved.mode
    if (saved.letterCase === "upper" || saved.letterCase === "lower") {
      out.letterCase = saved.letterCase
    }
    if (Number.isInteger(saved.index) && LETTERS[saved.index]) {
      out.index = saved.index
    }
    return out
  } catch {
    return {}
  }
}

/** Save the settings so the app opens where it was left. */
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Not saving is fine: the app still works.
  }
}

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

/* ---------- Speech ---------- */

/** @type {SpeechSynthesisVoice | undefined} */
let voice

/** Pick a clear English voice, preferring the iPad's default US voice. */
function pickVoice() {
  if (!("speechSynthesis" in window)) return
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

/**
 * Utterances being spoken. Safari can drop an utterance that nothing refers
 * to before it ends, and then its end event never comes.
 *
 * @type {SpeechSynthesisUtterance[]}
 */
let speaking = []

/**
 * Say some words, one after another, stopping anything already being said.
 * Resolves when the last one finishes. Some browsers never report the end,
 * so it also resolves after a generous wait.
 *
 * @param {string[]} parts The words to say, each with a short pause after.
 * @returns {Promise<void>} Settles when speaking is done.
 */
function speak(parts) {
  if (!("speechSynthesis" in window)) return Promise.resolve()
  // Safari can drop words spoken straight after a cancel, so only cancel
  // when something is actually being said.
  if (speechSynthesis.speaking || speechSynthesis.pending) {
    speechSynthesis.cancel()
  }
  if (!voice) pickVoice()
  return new Promise((resolve) => {
    const fallback = setTimeout(finish, 1500 + parts.length * 1200)
    /** Settle once, whichever comes first. */
    function finish() {
      clearTimeout(fallback)
      resolve()
    }
    speaking = parts.map((text, i) => {
      const utterance = new SpeechSynthesisUtterance(text)
      if (voice) utterance.voice = voice
      utterance.lang = voice?.lang ?? "en-US"
      utterance.rate = 0.8
      utterance.pitch = 1.1
      if (i === parts.length - 1) {
        utterance.onend = finish
        utterance.onerror = finish
      }
      return utterance
    })
    for (const utterance of speaking) speechSynthesis.speak(utterance)
  })
}

/**
 * The words that teach a letter's sound: the sound twice, then the word.
 *
 * @param {Letter} item The letter.
 * @returns {string[]} What to say.
 */
function soundParts(item) {
  return [item.sound, item.sound, item.word]
}

/* ---------- Shared display ---------- */

/**
 * The letter as it shows on screen, big or small.
 *
 * @param {Letter} item The letter.
 * @returns {string} The letter in the chosen case.
 */
function shown(item) {
  if (state.letterCase === "lower") return item.letter.toLowerCase()
  return item.letter
}

/**
 * Re-theme the page in the letter's own color, around the color wheel.
 *
 * @param {number} index The letter's index into LETTERS.
 */
function setHue(index) {
  const hue = Math.round((index * 360) / LETTERS.length + 260) % 360
  document.documentElement.style.setProperty("--ms-hue", String(hue))
}

/**
 * Replay a CSS animation on an element.
 *
 * @param {HTMLElement} el The element.
 * @param {string} name The class that runs the animation.
 */
function pulse(el, name) {
  el.classList.remove(name)
  void el.offsetWidth
  el.classList.add(name)
}

/* ---------- Cards ---------- */

const cardLetter = byId("card-letter")
const cardPicture = byId("card-picture")
const cardEmoji = byId("card-emoji")
const cardWord = byId("card-word")
const card = byId("card")
const strip = byId("strip")

/** Show the current card. */
function renderCard() {
  const item = LETTERS[state.index]
  cardLetter.textContent = shown(item)
  cardLetter.setAttribute("aria-label", `${shown(item)}. Say the letter`)
  cardEmoji.textContent = item.picture

  // The word, with the letter that makes the sound picked out.
  const at = item.word.indexOf(item.letter.toLowerCase())
  const mark = document.createElement("b")
  mark.textContent = item.word.charAt(at)
  cardWord.replaceChildren(
    item.word.slice(0, at),
    mark,
    item.word.slice(at + 1),
  )
  cardPicture.setAttribute("aria-label", `${item.word}. Say the sound`)

  setHue(state.index)
  for (const button of strip.querySelectorAll("button")) {
    const current = Number(button.dataset.index) === state.index
    button.setAttribute("aria-current", String(current))
    button.textContent = shown(LETTERS[Number(button.dataset.index)])
    if (current) button.scrollIntoView({ block: "nearest", inline: "center" })
  }
}

/**
 * Move to another card, wrapping round at either end.
 *
 * @param {number} by How many cards to move: 1 for next, -1 for back.
 */
function step(by) {
  state.index = (state.index + by + LETTERS.length) % LETTERS.length
  save()
  renderCard()
  pulse(card, by > 0 ? "in-next" : "in-prev")
}

/**
 * Jump straight to a card.
 *
 * @param {number} index The letter's index into LETTERS.
 */
function goTo(index) {
  state.index = index
  save()
  renderCard()
  pulse(card, "in-next")
}

cardLetter.addEventListener("click", () => {
  pulse(cardLetter, "bounce")
  speak([LETTERS[state.index].name])
})

cardPicture.addEventListener("click", () => {
  pulse(cardEmoji, "bounce")
  speak(soundParts(LETTERS[state.index]))
})

for (const button of document.querySelectorAll("[data-step]")) {
  if (!(button instanceof HTMLElement)) continue
  button.addEventListener("click", () => step(Number(button.dataset.step)))
}

LETTERS.forEach((item, index) => {
  const button = document.createElement("button")
  button.type = "button"
  button.dataset.index = String(index)
  button.setAttribute("aria-label", item.letter)
  button.addEventListener("click", () => {
    goTo(index)
    speak([item.name])
  })
  strip.append(button)
})

// Swipe the card sideways to change letters.
/** @type {{ x: number, y: number } | undefined} */
let swipeStart
let suppressClick = false
card.addEventListener("pointerdown", (event) => {
  swipeStart = { x: event.clientX, y: event.clientY }
})
card.addEventListener("pointerup", (event) => {
  if (!swipeStart) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = undefined
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    suppressClick = true
    step(dx < 0 ? 1 : -1)
  }
})
card.addEventListener("pointercancel", () => {
  swipeStart = undefined
})

// A swipe that ends on a button should not also press it.
card.addEventListener(
  "click",
  (event) => {
    if (!suppressClick) return
    suppressClick = false
    event.stopPropagation()
    event.preventDefault()
  },
  true,
)

/* ---------- Find it ---------- */

const findPrompt = byId("find-prompt")
const findPromptText = byId("find-prompt-text")
const findChoices = byId("find-choices")
const findStars = byId("find-stars")

/**
 * @typedef {object} Round
 * @property {Letter} target The letter to find.
 * @property {"name" | "sound"} ask Whether the question says its name or its sound.
 * @property {Letter[]} choices The letters to choose from, target included.
 */

/** @type {Round | undefined} */
let round
let stars = 0
/** @type {Letter | undefined} */
let lastTarget

/**
 * Shuffle a copy of a list.
 *
 * @template T
 * @param {T[]} list The list.
 * @returns {T[]} A shuffled copy.
 */
function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Letters that say the same sound (C and K) can't both be choices, or a
 * sound question would have two right answers.
 *
 * @param {Letter} a One letter.
 * @param {Letter} b Another letter.
 * @returns {boolean} Whether they sound the same.
 */
function soundsAlike(a, b) {
  return a.sound === b.sound
}

/**
 * Make a question: a letter to find, and others to choose from.
 *
 * @param {"name" | "sound"} ask Whether to say the letter's name or sound.
 * @returns {Round} The question.
 */
function makeRound(ask) {
  const pool = LETTERS.filter((item) => item !== lastTarget)
  const target = pool[Math.floor(Math.random() * pool.length)]
  lastTarget = target
  const others = shuffle(
    LETTERS.filter((item) => item !== target && !soundsAlike(item, target)),
  ).slice(0, CHOICES - 1)
  return { target, ask, choices: shuffle([target, ...others]) }
}

/** Start a new question and say it. */
function newRound() {
  round = makeRound(Math.random() < 0.5 ? "name" : "sound")
  renderRound()
  askQuestion()
}

/** Show the choices for the current question. */
function renderRound() {
  if (!round) return
  const current = round
  findPromptText.textContent =
    current.ask === "name"
      ? "Find the letter I say"
      : "Find the letter that says…"
  const buttons = current.choices.map((item) => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "choice"
    button.textContent = shown(item)
    button.dataset.letter = item.letter
    button.addEventListener("click", () => choose(button, item))
    return button
  })
  findChoices.replaceChildren(...buttons)
  setHue(LETTERS.indexOf(current.target))
}

/** Say the current question. */
function askQuestion() {
  if (!round) return
  pulse(findPrompt, "bounce")
  if (round.ask === "name") speak(["Find", round.target.name])
  else speak(["Which letter says", round.target.sound, round.target.sound])
}

/**
 * Answer the question with a letter.
 *
 * @param {HTMLButtonElement} button The choice tapped.
 * @param {Letter} item Its letter.
 */
async function choose(button, item) {
  if (!round || button.disabled) return
  const target = round.target
  if (item !== target) {
    button.disabled = true
    pulse(button, "wrong")
    await speak([`That's ${item.name}.`, "Try again!"])
    return
  }

  for (const other of findChoices.querySelectorAll("button")) {
    other.disabled = true
  }
  button.classList.add("right")
  stars += 1
  renderStars()
  const done = stars >= STARS_PER_ROUND
  await speak([
    done ? "You did it! Ten stars!" : "Yes!",
    `${target.name} says`,
    ...soundParts(target),
  ])
  if (done) stars = 0
  // Leave the page alone if the game was switched off while speaking.
  if (state.mode === "find" && round?.target === target) {
    renderStars()
    newRound()
  }
}

/** Show the stars earned so far. */
function renderStars() {
  findStars.textContent = "⭐".repeat(stars)
  findStars.setAttribute("aria-label", `${stars} of ${STARS_PER_ROUND} stars`)
}

findPrompt.addEventListener("click", askQuestion)

/* ---------- Mode and case ---------- */

/** Show the chosen screen and keep the toggles in step with the state. */
function render() {
  for (const button of document.querySelectorAll("[data-mode]")) {
    if (!(button instanceof HTMLElement)) continue
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.mode === state.mode),
    )
  }
  for (const button of document.querySelectorAll("[data-case]")) {
    if (!(button instanceof HTMLElement)) continue
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.case === state.letterCase),
    )
  }
  document.documentElement.dataset.case = state.letterCase
  byId("cards").hidden = state.mode !== "cards"
  byId("find").hidden = state.mode !== "find"
  strip.hidden = state.mode !== "cards"
  if (state.mode === "cards") renderCard()
}

for (const button of document.querySelectorAll("[data-mode]")) {
  if (!(button instanceof HTMLElement)) continue
  button.addEventListener("click", () => {
    const mode = button.dataset.mode
    if (mode !== "cards" && mode !== "find") return
    if (mode === state.mode) return
    window.speechSynthesis?.cancel()
    state.mode = mode
    save()
    render()
    if (mode === "find") {
      stars = 0
      renderStars()
      newRound()
    }
  })
}

for (const button of document.querySelectorAll("[data-case]")) {
  if (!(button instanceof HTMLElement)) continue
  button.addEventListener("click", () => {
    const letterCase = button.dataset.case
    if (letterCase !== "upper" && letterCase !== "lower") return
    state.letterCase = letterCase
    save()
    render()
    if (state.mode === "find") {
      for (const choice of findChoices.querySelectorAll("button")) {
        const item = LETTERS.find((l) => l.letter === choice.dataset.letter)
        if (item) choice.textContent = shown(item)
      }
    }
  })
}

// Keyboard arrows, for a parent at a laptop.
document.addEventListener("keydown", (event) => {
  if (state.mode !== "cards") return
  if (event.key === "ArrowRight") step(1)
  if (event.key === "ArrowLeft") step(-1)
})

/* ---------- Start ---------- */

if ("speechSynthesis" in window) {
  pickVoice()
  speechSynthesis.addEventListener("voiceschanged", pickVoice)
}

render()
if (state.mode === "find") {
  // Nothing can be said before the first tap, so show the question quietly.
  round = makeRound("name")
  renderRound()
  findPromptText.textContent = "Tap to hear"
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Offline support is a bonus; the app works without it.
  })
}
