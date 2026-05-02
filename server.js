import http from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 4141);
const packageCache = new Map();
const packageRoutes = {
  "/scramjet/": {
    name: "@mercuryworkshop/scramjet",
    version: "2.0.2-alpha",
    base: "dist"
  },
  "/controller/": {
    name: "@mercuryworkshop/scramjet-controller",
    version: "0.0.9",
    base: "dist"
  },
  "/libcurl/": {
    name: "@mercuryworkshop/libcurl-transport",
    version: "2.0.5",
    base: "dist"
  },
  "/baremux/": {
    name: "@mercuryworkshop/bare-mux",
    version: "2.1.9",
    base: "dist"
  },
  "/epoxy/": {
    name: "@mercuryworkshop/epoxy-transport",
    version: "3.0.1",
    base: "dist"
  }
};

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm"
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream"
  });
  createReadStream(filePath).pipe(res);
}

async function servePackageAsset(req, res, route, config) {
  const asset = req.url.split("?")[0].replace(route, "");
  const target = `https://cdn.jsdelivr.net/npm/${config.name}@${config.version}/${config.base}/${asset}`;
  const cacheKey = `${config.name}@${config.version}/${config.base}/${asset}`;

  if (!/^[\w./-]+$/.test(asset)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Missing package asset");
    return;
  }

  if (!packageCache.has(cacheKey)) {
    const response = await fetch(target);

    if (!response.ok) {
      res.writeHead(response.status, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(`Could not load package asset: ${asset}`);
      return;
    }

    packageCache.set(cacheKey, Buffer.from(await response.arrayBuffer()));
  }

  const ext = path.extname(asset).toLowerCase();
  res.writeHead(200, {
    "Content-Type": contentTypes[ext] || "application/octet-stream",
    "Cache-Control": "public, max-age=3600"
  });
  res.end(packageCache.get(cacheKey));
}

function safePublicPath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  return path.join(publicDir, normalized);
}

const server = http.createServer(async (req, res) => {
  for (const [route, config] of Object.entries(packageRoutes)) {
    if (req.url.startsWith(route)) {
      try {
        await servePackageAsset(req, res, route, config);
      } catch (error) {
        res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(`Package CDN fetch failed: ${error.message}`);
      }
      return;
    }
  }

  try {
    const requestedPath = req.url === "/" ? "/index.html" : req.url;
    const filePath = safePublicPath(requestedPath);
    const info = existsSync(filePath) ? await stat(filePath) : null;

    if (info?.isFile()) {
      sendFile(res, filePath);
      return;
    }

    sendFile(res, path.join(publicDir, "index.html"));
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Void Proxy server error: ${error.message}`);
  }
});

server.listen(port, () => {
  console.log(`Void Proxy is running at http://localhost:${port}`);
});
