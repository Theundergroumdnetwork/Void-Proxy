# VOID Proxy

A modern web proxy powered by [Scramjet](https://github.com/MercuryWorkshop/scramjet) with a sleek purple theme. Designed to be fully static and deployable to **Netlify**, **Vercel**, and **GitHub Pages**.

## Features

- **Scramjet Backend** — High-performance interception-based proxy engine
- **Modern Purple UI** — Clean, responsive design with animated effects
- **Static Deployment** — Build once, deploy anywhere as static files
- **Encrypted Transport** — Uses libcurl-transport for secure browsing
- **Service Worker Based** — No server-side rendering required

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Build static files
npm run build

# Start the dev server (includes Wisp server for local testing)
npm start
```

Open `http://localhost:8080` in your browser.

### Deploy to Netlify

1. Push this repo to GitHub
2. Connect to Netlify
3. Build command: `npm install && npm run build`
4. Publish directory: `dist`

### Deploy to Vercel

1. Push this repo to GitHub
2. Import to Vercel
3. It will auto-detect settings from `vercel.json`

### Deploy to GitHub Pages

1. Run `npm run build` locally
2. Push the `dist/` folder contents to a `gh-pages` branch
3. Enable GitHub Pages in repo settings

## Static Deployment Notes

When deployed to static hosting (Netlify, Vercel, GitHub Pages), the proxy frontend runs entirely in the browser via Service Workers. However, you need an external **Wisp server** for the transport layer to proxy requests.

### Configuring an External Wisp Server

Add this script tag before the app scripts in `index.html`:

```html
<script>window.__VOID_WISP_URL = "wss://your-wisp-server.example.com/wisp/";</script>
```

Or set it in a `config.js` file that loads before `app.js`.

The local dev server (`npm start`) includes a built-in Wisp server, so no external server is needed for local development.

## Architecture

```
public/          → Static frontend files (HTML, CSS, JS)
├── index.html   → Main page with purple VOID theme
├── style.css    → Modern purple theme styles
├── app.js       → Scramjet controller & proxy logic
├── sw.js        → Service worker for request interception
├── search.js    → URL/search query parsing
└── register-sw.js → Service worker registration

build.js         → Copies Scramjet/libcurl/bare-mux from node_modules to dist/
server.js        → Local dev server with Wisp support
netlify.toml     → Netlify deployment config
vercel.json      → Vercel deployment config
```

## Tech Stack

- [Scramjet](https://github.com/MercuryWorkshop/scramjet) — Web proxy engine
- [libcurl-transport](https://github.com/MercuryWorkshop/libcurl-transport) — Encrypted transport
- [bare-mux](https://github.com/MercuryWorkshop/bare-mux) — Transport multiplexer
- [wisp-js](https://github.com/MercuryWorkshop/wisp-js) — WebSocket proxy protocol

## License

AGPL-3.0 (inherits from Scramjet)
