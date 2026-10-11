# Image search — Advanced JavaScript homework 03

A Vite application using Axios, Pixabay, iziToast, SimpleLightbox and an adapted
[css-loader](https://github.com/vineethtrv/css-loader) indicator.

## Run locally

Requires Node.js 22.12 or newer.

1. Run `npm ci`.
2. Copy `.env.example` to `.env` in the repository root (next to `package.json`).
3. Get your own key from [Pixabay](https://pixabay.com/api/docs/) and set
   `VITE_PIXABAY_API_KEY` in `.env`.
4. Run `npm run dev` and open the URL shown by Vite.

Vite explicitly loads environment files from the repository root, although its
HTML/source root is `src`. Restart Vite after changing `.env` or its configuration.
For `npm run preview`, rebuild with `npm run build` first: environment values are
embedded at build time.
Without a key, searches display a configuration
error without sending an invalid HTTP request. Do not commit `.env`.
Vite embeds `VITE_` values in the browser bundle, so the deployed Pixabay key is
visible to visitors; it is not a server-side secret.

## Structure

- `src/index.html`: search form, loader and gallery container.
- `src/main.js`: submit handling, validation, notifications and promise handlers.
- `src/js/pixabay-api.js`: Axios request returning response data.
- `src/js/render-functions.js`: gallery rendering and SimpleLightbox instance.
- `src/css/`: page styles and the adapted css-loader indicator.
- `src/img/`: favicon.
- `assets/css-loader-LICENSE.txt`: license for the loader.

The query is trimmed, empty searches are rejected, previous results are cleared,
and the submit button is disabled during requests to prevent overlapping searches.
The loader is hidden on success and failure. Gallery cards are inserted in one DOM
operation and the lightbox is refreshed after rendering.
The CommonJS SimpleLightbox bundle exposes its constructor through `.default`
with Vite 8. Vite also maps `global` to the standard `globalThis` because the
library references the Node.js global name in browser code. This transpiled
bundle supports `refresh()`; the native ESM bundle calls a class constructor
without `new` inside that method.

## Validation

```sh
npm run format
npm run format:check
npx playwright install chromium
npm test
npm run build
npm run preview
```

Browser tests build and serve the production app with a dummy test key and
intercept Pixabay requests with fixtures; they do not need a real key or consume
API quota. Run `npm run build` with your real key again before deploying.
Tests check query parameters, loading, empty/failed
responses, gallery replacement, escaping, lightbox refresh and browser console
errors/warnings. A real API search still needs your valid Pixabay key.

## GitHub Pages and submission

1. Push this project to the `main` branch.
2. Add your key as the repository Actions secret `VITE_PIXABAY_API_KEY`
   (Settings → Secrets and variables → Actions).
3. In Settings → Pages choose **GitHub Actions** as the build/deployment source.
4. Run **Deploy to GitHub Pages**, or push a new commit to `main`.
5. Wait for a successful deployment and verify a real search and the lightbox.

Submission links:

- Source: https://github.com/makandriival/goit-advancedjs-hw-03
- Expected Pages URL (only live after deployment):
  https://makandriival.github.io/goit-advancedjs-hw-03/

To download the repository ZIP on GitHub, open the source link, select
**Code → Download ZIP**, and attach that ZIP with both links in the LMS.
Alternatively, after committing the source, generate it locally:

```sh
git archive --format=zip --prefix=goit-advancedjs-hw-03/ \
  -o goit-advancedjs-hw-03.zip HEAD
```

The source archive excludes dependencies, build output and local API credentials.
