# Void Proxy

A starry Scramjet-powered web proxy shell. Runs locally **and** deploys to Netlify or Vercel with no code changes needed.

---

## Local development

```bash
node server.js
```

Then open `http://localhost:4141`. No `npm install` required.

---

## Deploy to Netlify

1. Push this folder to a GitHub / GitLab repo.
2. In the Netlify dashboard → **Add new site → Import an existing project**.
3. Set:
   - **Build command**: *(leave blank — no build step)*
   - **Publish directory**: `public`
4. Click **Deploy**. Netlify picks up `netlify.toml` automatically.

Or deploy instantly with the CLI:

```bash
npm install -g netlify-cli
netlify deploy --prod --dir public
```

Package routes (`/scramjet/`, `/baremux/`, etc.) are handled by the **Netlify Edge Function** in `netlify/functions/pkg.mjs`, which proxies assets from jsDelivr on demand.

---

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in the Vercel dashboard. No build settings needed.
3. Click **Deploy**. Vercel picks up `vercel.json` automatically.

Or deploy with the CLI:

```bash
npm install -g vercel
vercel --prod
```

Package routes are handled by the **Vercel Serverless Function** in `api/pkg/[...path].js`.

---

## Project structure

```
void-proxy/
├── public/                        # Your static UI (index.html, sw.js, etc.)
├── netlify/
│   └── functions/
│       └── pkg.mjs                # Netlify Edge Function — CDN proxy
├── api/
│   └── pkg/
│       └── [...path].js           # Vercel Serverless Function — CDN proxy
├── server.js                      # Local Node.js server (unchanged)
├── netlify.toml                   # Netlify config & redirect rules
├── vercel.json                    # Vercel routing config
└── package.json
```

---

## Notes

- **`public/`** is where your `index.html`, service worker (`sw.js`), and any other static assets live. Drop them in there as usual.
- Scramjet support depends on the target website. Some sites may still block proxy traffic, require CAPTCHAs, or restrict embedded sessions.
- Both serverless functions have no external dependencies — they use the platform's built-in `fetch`.
