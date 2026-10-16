/**
 * The alphabet: each letter with a picture word that starts with it. Most
 * words also start with the letter's usual sound; xylophone is the exception
 * (its x says "z"), so X teaches its "ks" sound on its own.
 *
 * What the app says for each letter is in audio/: `<letter>-name.mp3`,
 * `<letter>-sound.mp3` and `<letter>-word.mp3`.
 *
 * @module letters
 */

/**
 * @typedef {object} Letter
 * @property {string} letter The uppercase letter.
 * @property {string} sound The letter's sound, in phonetic spelling. Letters
 *   with the same sound (C and K) are never both choices in one question.
 * @property {string} word A word that shows the sound.
 * @property {string} picture An emoji of the word, or the path of an image
 *   when there is no emoji for it.
 */

/** @type {Letter[]} */
export const LETTERS = [
  { letter: "A", sound: "æ", word: "apple", picture: "🍎" },
  { letter: "B", sound: "b", word: "ball", picture: "⚽" },
  { letter: "C", sound: "k", word: "cat", picture: "🐱" },
  { letter: "D", sound: "d", word: "dog", picture: "🐶" },
  { letter: "E", sound: "ɛ", word: "egg", picture: "🥚" },
  { letter: "F", sound: "f", word: "fish", picture: "🐟" },
  { letter: "G", sound: "ɡ", word: "goat", picture: "🐐" },
  { letter: "H", sound: "h", word: "hat", picture: "🎩" },
  { letter: "I", sound: "ɪ", word: "insect", picture: "🐞" },
  { letter: "J", sound: "dʒ", word: "jellyfish", picture: "🪼" },
  { letter: "K", sound: "k", word: "kite", picture: "🪁" },
  { letter: "L", sound: "l", word: "lion", picture: "🦁" },
  { letter: "M", sound: "m", word: "moon", picture: "🌙" },
  { letter: "N", sound: "n", word: "nest", picture: "🪺" },
  { letter: "O", sound: "ɔ", word: "octopus", picture: "🐙" },
  { letter: "P", sound: "p", word: "pig", picture: "🐷" },
  { letter: "Q", sound: "kw", word: "queen", picture: "👑" },
  { letter: "R", sound: "ɹ", word: "rabbit", picture: "🐰" },
  { letter: "S", sound: "s", word: "sun", picture: "☀️" },
  { letter: "T", sound: "t", word: "turtle", picture: "🐢" },
  { letter: "U", sound: "ʌ", word: "umbrella", picture: "☂️" },
  { letter: "V", sound: "v", word: "volcano", picture: "🌋" },
  { letter: "W", sound: "w", word: "watermelon", picture: "🍉" },
  {
    letter: "X",
    sound: "ks",
    word: "xylophone",
    picture: "icons/xylophone.svg",
  },
  { letter: "Y", sound: "j", word: "yo-yo", picture: "🪀" },
  { letter: "Z", sound: "z", word: "zebra", picture: "🦓" },
]
