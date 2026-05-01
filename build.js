import { cpSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, "dist");
const nm = resolve(__dirname, "node_modules");

// Clean dist
if (existsSync(dist)) {
  rmSync(dist, { recursive: true, force: true });
}
mkdirSync(dist, { recursive: true });

// Copy public files to dist
cpSync(resolve(__dirname, "public"), dist, { recursive: true });

// Scramjet dist files
const scramjetDist = resolve(nm, "@mercuryworkshop/scramjet/dist");
mkdirSync(resolve(dist, "scram"), { recursive: true });
cpSync(scramjetDist, resolve(dist, "scram"), { recursive: true });

// libcurl-transport dist files
const libcurlDist = resolve(nm, "@mercuryworkshop/libcurl-transport/dist");
mkdirSync(resolve(dist, "libcurl"), { recursive: true });
cpSync(libcurlDist, resolve(dist, "libcurl"), { recursive: true });

// bare-mux dist files
const baremuxDist = resolve(nm, "@mercuryworkshop/bare-mux/dist");
mkdirSync(resolve(dist, "baremux"), { recursive: true });
cpSync(baremuxDist, resolve(dist, "baremux"), { recursive: true });

console.log("Build complete! Static files are in ./dist/");
console.log("Deploy the dist/ directory to Netlify, Vercel, or GitHub Pages.");
