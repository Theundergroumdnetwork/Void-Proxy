const BARE_SERVER = "https://bare.benro.dev/";   // Good public bare server

document.getElementById("urlInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    let url = this.value.trim();
    if (!url) return;

    if (!url.startsWith("http")) {
      url = "https://" + url;
    }

    // Ultraviolet encoding (standard way)
    const encodedUrl = encodeURIComponent(url);
    const proxyUrl = `/uv/service/${encodedUrl}`;

    window.location.href = proxyUrl;
  }
});
