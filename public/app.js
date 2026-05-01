"use strict";

const form = document.getElementById("proxy-form");
const input = document.getElementById("proxy-input");
const searchEngine = document.getElementById("proxy-search-engine");
const errorContainer = document.getElementById("error-container");
const errorMsg = document.getElementById("error-msg");
const errorCode = document.getElementById("error-code");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
  files: {
    wasm: "/scram/scramjet.wasm.wasm",
    all: "/scram/scramjet.all.js",
    sync: "/scram/scramjet.sync.js",
  },
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

function showError(message, code) {
  errorContainer.style.display = "block";
  errorMsg.textContent = message;
  errorCode.textContent = code || "";
}

function hideError() {
  errorContainer.style.display = "none";
  errorMsg.textContent = "";
  errorCode.textContent = "";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideError();

  try {
    await registerSW();
  } catch (err) {
    showError("Failed to register service worker.", err.toString());
    throw err;
  }

  const url = search(input.value, searchEngine.value);

  // Build the Wisp URL — use the current host for self-hosted,
  // or configure an external Wisp server for static deployments
  let wispUrl =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/wisp/";

  // Check for a configured external Wisp server
  if (
    typeof window.__VOID_WISP_URL === "string" &&
    window.__VOID_WISP_URL.length > 0
  ) {
    wispUrl = window.__VOID_WISP_URL;
  }

  try {
    if ((await connection.getTransport()) !== "/libcurl/index.mjs") {
      await connection.setTransport("/libcurl/index.mjs", [
        { websocket: wispUrl },
      ]);
    }
  } catch (err) {
    showError("Failed to set up transport.", err.toString());
    throw err;
  }

  const frame = scramjet.createFrame();
  frame.frame.id = "proxy-frame";
  document.body.appendChild(frame.frame);
  frame.go(url);
});

// Focus the input on page load
input.focus();
