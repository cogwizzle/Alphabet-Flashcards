# Alphabet-Flashcards

Flash card game for kids to help learn letters and sounds. It is a Progressive Web App made for touch screens: install it on an iPad or phone and it works offline.

- **Cards**: one big card per letter. Tap the letter to hear its name; tap the picture to hear its sound and a word that starts with it. Swipe or use the arrows to change letters, or tap a letter in the strip at the bottom to jump to it.
- **Find it**: the app says a letter's name or its sound, and she taps the matching letter out of four. Each right answer earns a star; ten stars is a win.
- **ABC / abc**: switches every letter between uppercase and lowercase.

The look comes from [Modern Styles](https://github.com/cogwizzle/Modern-Styles), and letters use [Andika](https://software.sil.org/andika/), a typeface made for early readers. Every word the app says is a short recorded clip in `audio/`, so it sounds the same on every device and works offline.

## Install on an iPad

1. Open the site in **Safari** (other browsers on iPad can't install web apps).
2. Tap the **Share** button, then **Add to Home Screen**, then **Add**.
3. Open it from the home screen. It runs full screen, and after the first open it works without internet.

If there's no sound, check that the iPad's silent mode is off and the volume is up.

## Run it locally

It is a plain static site with no build step. Serve the folder with any static server, for example:

```sh
npx http-server -c-1 .
```

## Publish

`.github/workflows/pages.yml` deploys the repository to GitHub Pages on every push to `main`. One-time setup: in the repository settings, under Pages, set the source to **GitHub Actions**. The site is then at <https://cogwizzle.github.io/Alphabet-Flashcards/>.

## Changing things

- Letters and picture words are in `letters.js`. Each letter's clips are `audio/<letter>-name.mp3`, `-sound.mp3` and `-word.mp3`; the phrases ("Let's play!", "Find", "Yes!" and so on) are next to them.
- When you change any file, bump `VERSION` in `sw.js`, or installed copies keep the old version.
- Icons are drawn in `icons/icon.svg`; the PNGs next to it are renders of it.

## Credits

The voice clips were made with [Piper](https://github.com/rhasspy/piper) (MIT license), using its `en_US-libritts-high` voice model. That model is trained on the [LibriTTS](https://www.openslr.org/60/) corpus, which is licensed [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Each letter sound was cut out of a longer word and trimmed, so it is a clean sound on its own.
