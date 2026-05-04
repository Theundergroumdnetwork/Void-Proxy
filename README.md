# Void Proxy

Void Proxy is a starry Scramjet-powered web proxy shell using the provided background.

## Local

```bash
node server.js
```

Then open `http://localhost:4141`.

## Deploy

The static site lives in `public/`.

- GitHub Pages: push to `main`; the included workflow publishes `public/`.
- Netlify: publish directory `public`; build command `npm run build`.
- Vercel: the included `vercel.json` publishes `public`.

Scramjet support depends on the current Scramjet engine, the Wisp endpoint, and the target website. Some sites may still block proxy traffic, require CAPTCHAs, or restrict embedded sessions.
