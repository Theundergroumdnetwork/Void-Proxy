const form = document.getElementById("proxy-form");
const toolbarForm = document.getElementById("toolbar-form");
const address = document.getElementById("address");
const toolbarAddress = document.getElementById("toolbar-address");
const launch = document.getElementById("launch");
const browser = document.getElementById("browser");
const frameWrap = document.getElementById("frame-wrap");
const home = document.getElementById("home");
const back = document.getElementById("back");
const forward = document.getElementById("forward");
const reload = document.getElementById("reload");
const fullscreen = document.getElementById("fullscreen");
const status = document.getElementById("status");

const APP_VERSION = "void-proxy-scramjet-v2-controller";
const BASE_URL = new URL("./", document.baseURI);
let controller;
let frame;
let frameElement;
let currentUrl = "";
const historyStack = [];
let historyIndex = -1;

async function clearOldServiceWorkersOnce() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (localStorage.getItem("voidProxyVersion") === APP_VERSION) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));
  localStorage.setItem("voidProxyVersion", APP_VERSION);
  location.reload();
}

function normalizeInput(value) {
  const input = value.trim();

  if (!input) {
    return "";
  }

  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(input)) {
    return `https://${input}`;
  }

  return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
}

function setCurrentUrl(url) {
  currentUrl = url;
  toolbarAddress.value = url;
}

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle("is-error", isError);
}

async function waitForGlobals() {
  for (let i = 0; i < 100; i += 1) {
    if (window.$scramjet && window.$scramjetController) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error("Scramjet scripts did not load.");
}

async function waitForServiceWorkerControl(registration, timeoutMs = 10000) {
  if (navigator.serviceWorker.controller) {
    return navigator.serviceWorker.controller;
  }

  const controllerChanged = new Promise((resolve) => {
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      () => resolve(navigator.serviceWorker.controller),
      { once: true }
    );
  });

  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve(registration.active), timeoutMs);
  });

  await navigator.serviceWorker.ready;
  return Promise.race([controllerChanged, timeout]);
}

async function createTransport() {
  try {
    const module = await import(new URL("libcurl/index.mjs", BASE_URL).href);
    const LibcurlClient = module.default;
    return new LibcurlClient({ wisp: "wss://wisp.mercurywork.shop/" });
  } catch (libcurlError) {
    console.warn("Libcurl transport failed, falling back to Epoxy.", libcurlError);
    const module = await import(new URL("epoxy/index.mjs", BASE_URL).href);
    const EpoxyClient = module.default;
    return new EpoxyClient({ wisp: "wss://wisp.mercurywork.shop/" });
  }
}

async function initController() {
  if (controller) {
    return controller;
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("This browser does not support service workers.");
  }

  setStatus("Starting Scramjet...");
  await waitForGlobals();

  const registration = await navigator.serviceWorker.register(new URL("sw.js", BASE_URL).href, {
    scope: BASE_URL.pathname,
    updateViaCache: "none"
  });
  await registration.update();

  const serviceworker = await waitForServiceWorkerControl(registration);

  if (!serviceworker) {
    throw new Error("Scramjet service worker did not activate. Refresh once and try again.");
  }

  const { Controller } = window.$scramjetController;
  const transport = await createTransport();

  controller = new Controller({
    serviceworker,
    transport,
    scramjetConfig: window.$scramjet.defaultConfigDev
  });

  await controller.wait();
  setStatus("");
  return controller;
}

async function ensureFrame() {
  await initController();

  if (frame) {
    return frame;
  }

  frameElement = document.createElement("iframe");
  frameElement.title = "Void Proxy browser";
  frameElement.referrerPolicy = "no-referrer";
  frameWrap.replaceChildren(frameElement);
  frame = controller.createFrame(frameElement);
  return frame;
}

async function navigate(rawUrl, push = true) {
  const url = normalizeInput(rawUrl);

  if (!url) {
    return;
  }

  try {
    setStatus("Opening...");
    const activeFrame = await ensureFrame();
    launch.classList.add("is-hidden");
    browser.classList.remove("is-hidden");
    setCurrentUrl(url);

    if (push) {
      historyStack.splice(historyIndex + 1);
      historyStack.push(url);
      historyIndex = historyStack.length - 1;
    }

    activeFrame.go(url);
    setStatus("");
  } catch (error) {
    setStatus(error.message || "Void Proxy could not open that site.", true);
    console.error(error);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  navigate(address.value);
});

toolbarForm.addEventListener("submit", (event) => {
  event.preventDefault();
  navigate(toolbarAddress.value);
});

document.querySelectorAll("[data-url]").forEach((button) => {
  button.addEventListener("click", () => navigate(button.dataset.url));
});

home.addEventListener("click", () => {
  browser.classList.add("is-hidden");
  launch.classList.remove("is-hidden");
  address.focus();
});

back.addEventListener("click", () => {
  if (historyIndex <= 0) {
    return;
  }

  historyIndex -= 1;
  navigate(historyStack[historyIndex], false);
});

forward.addEventListener("click", () => {
  if (historyIndex >= historyStack.length - 1) {
    return;
  }

  historyIndex += 1;
  navigate(historyStack[historyIndex], false);
});

reload.addEventListener("click", () => {
  if (historyIndex >= 0) {
    navigate(historyStack[historyIndex], false);
  } else if (frameElement) {
    frameElement.contentWindow?.location.reload();
  }
});

fullscreen.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await browser.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

window.addEventListener("load", async () => {
  await clearOldServiceWorkersOnce();
  address.focus();
});
