/**
 * The alphabet: each letter with a picture word that starts with its most
 * common sound. `name` and `sound` are spellings the speech voice reads as
 * the letter's name and its sound; tune them here if a voice says one wrong.
 *
 * @module letters
 */

/**
 * @typedef {object} Letter
 * @property {string} letter The uppercase letter.
 * @property {string} name A spelling the voice reads as the letter's name.
 * @property {string} sound A spelling the speech voice reads as the sound.
 * @property {string} word A word that shows the sound.
 * @property {string} picture An emoji of the word.
 */

/** @type {Letter[]} */
export const LETTERS = [
  { letter: "A", name: "ay", sound: "aah", word: "apple", picture: "🍎" },
  { letter: "B", name: "bee", sound: "buh", word: "ball", picture: "⚽" },
  { letter: "C", name: "see", sound: "kuh", word: "cat", picture: "🐱" },
  { letter: "D", name: "dee", sound: "duh", word: "dog", picture: "🐶" },
  { letter: "E", name: "ee", sound: "eh", word: "egg", picture: "🥚" },
  { letter: "F", name: "eff", sound: "fuh", word: "fish", picture: "🐟" },
  { letter: "G", name: "jee", sound: "guh", word: "goat", picture: "🐐" },
  { letter: "H", name: "aitch", sound: "huh", word: "hat", picture: "🎩" },
  { letter: "I", name: "eye", sound: "ih", word: "insect", picture: "🐞" },
  { letter: "J", name: "jay", sound: "juh", word: "jellyfish", picture: "🪼" },
  { letter: "K", name: "kay", sound: "kuh", word: "kite", picture: "🪁" },
  { letter: "L", name: "el", sound: "luh", word: "lion", picture: "🦁" },
  { letter: "M", name: "em", sound: "mmm", word: "moon", picture: "🌙" },
  { letter: "N", name: "en", sound: "nnn", word: "nest", picture: "🪺" },
  { letter: "O", name: "oh", sound: "ah", word: "octopus", picture: "🐙" },
  { letter: "P", name: "pee", sound: "puh", word: "pig", picture: "🐷" },
  { letter: "Q", name: "cue", sound: "kwuh", word: "queen", picture: "👑" },
  { letter: "R", name: "ar", sound: "ruh", word: "rabbit", picture: "🐰" },
  { letter: "S", name: "ess", sound: "sss", word: "sun", picture: "☀️" },
  { letter: "T", name: "tee", sound: "tuh", word: "turtle", picture: "🐢" },
  { letter: "U", name: "you", sound: "uh", word: "umbrella", picture: "☂️" },
  { letter: "V", name: "vee", sound: "vuh", word: "volcano", picture: "🌋" },
  {
    letter: "W",
    name: "double you",
    sound: "wuh",
    word: "watermelon",
    picture: "🍉",
  },
  { letter: "X", name: "ex", sound: "ks", word: "fox", picture: "🦊" },
  { letter: "Y", name: "why", sound: "yuh", word: "yo-yo", picture: "🪀" },
  { letter: "Z", name: "zee", sound: "zzz", word: "zebra", picture: "🦓" },
]
