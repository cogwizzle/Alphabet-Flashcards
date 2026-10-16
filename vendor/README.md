# Vendored files

`modern-styles.min.css` is the built stylesheet from [Modern Styles](https://github.com/cogwizzle/Modern-Styles), copied here so the app works offline and needs no build step.

Built from commit `482724fddc460b551404966b881014b9cf8f3682` with `node scripts/build.js`.

To update it, build Modern Styles and copy `dist/modern-styles.min.css` over this file, then bump `VERSION` in `sw.js` so installed copies pick it up.
