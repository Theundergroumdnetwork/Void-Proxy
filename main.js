const WISP_SERVER = "wss://wisp.mercurywork.shop/";

let scramjetReady = false;

async function initScramjet() {
  if (typeof ScramjetFrame !== "undefined") {
    scramjetReady = true;
    console.log("✅ Scramjet is ready");
    return;
  }

  console.log("Waiting for Scramjet to load...");
  setTimeout(initScramjet, 800); // retry
}

function navigateTo(url) {
  if (!url) return;
  if (!url.startsWith("http")) url = "https://" + url;

  if (!scramjetReady || typeof ScramjetFrame === "undefined") {
    alert("Scramjet is still initializing...\nPlease wait 2-3 seconds and try again.");
    return;
  }

  try {
    const frame = new ScramjetFrame({
      transport: "wisp",
      wisp: WISP_SERVER,
      codec: "plain"
    });

    frame.navigate(url);
    frame.attach(document.body);   // Opens full overlay
  } catch (err) {
    console.error(err);
    window.open(url, "_blank");
  }
}

// Handle Enter key on input
document.getElementById("urlInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    navigateTo(e.target.value.trim());
  }
});

// Initialize when page loads
window.addEventListener("load", () => {
  initScramjet();
});
