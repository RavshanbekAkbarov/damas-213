// Birinchi kirganda "ilovani o'rnating" oynasi. Ikkala sahifa ham ishlatadi.
// title: oyna sarlavhasi, videoId: YouTube video ID (bo'sh bo'lsa tugma chiqmaydi)
export function setupInstall({ title, videoId = "", storageKey = "installSeen" }) {
  const installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  let seen = false;
  try { seen = localStorage.getItem(storageKey) === "1"; } catch (e) {}

  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");
  if (installed || seen) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div id="install" class="install">
      <div class="install-box">
        <b style="font-size:18px">📲 ${title}</b>
        <span>Keyin har safar bosh ekrandan ilova kabi ochasiz.</span>
        <button id="installBtn" class="main" hidden>📲 Oʻrnatish</button>
        <ol id="iosSteps" hidden>
          <li>Pastdagi <b>⬆️ Ulashish</b> tugmasini bosing</li>
          <li><b>«Bosh ekranga»</b> (Add to Home Screen) ni tanlang</li>
        </ol>
        <span id="otherSteps" hidden>Chrome menyusi <b>⋮</b> → <b>«Bosh ekranga qoʻshish»</b></span>
        <button id="videoBtn" ${videoId ? "" : "hidden"}>▶️ Videoda koʻrish</button>
        <div id="video"></div>
        <button id="laterBtn">Keyinroq</button>
      </div>
    </div>`);

  const $ = id => document.getElementById(id);
  if (/iphone|ipad/i.test(navigator.userAgent)) $("iosSteps").hidden = false;
  else $("otherSteps").hidden = false;

  // Android Chrome: bitta tugma bilan o'rnatish
  let installEvent = null;
  addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); installEvent = e;
    $("installBtn").hidden = false; $("otherSteps").hidden = true;
  });
  $("installBtn").onclick = async () => {
    if (!installEvent) return;
    installEvent.prompt();
    await installEvent.userChoice;
    close();
  };

  $("videoBtn").onclick = () => {
    $("video").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1"
      allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    $("videoBtn").hidden = true;
  };

  $("laterBtn").onclick = close;
  function close() {
    $("install").remove();
    try { localStorage.setItem(storageKey, "1"); } catch (e) {}
  }
}
