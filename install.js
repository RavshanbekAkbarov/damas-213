// "Ilovani o'rnating" oynasi va doimiy o'rnatish tugmasi. Ikkala sahifa ham ishlatadi.
// title: oyna sarlavhasi, buttonId: sahifadagi o'rnatish tugmasi, videoId: YouTube video (ixtiyoriy)
const REMIND_AFTER = 3 * 24 * 3600 * 1000;   // "Keyinroq" bosilsa, 3 kundan keyin yana chiqadi

export function setupInstall({ title, buttonId, videoId = "", storageKey = "installSeen" }) {
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js");

  const installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (installed) return;                       // allaqachon ilova sifatida ochilgan

  // Android Chrome: brauzer o'rnatishga tayyor bo'lganda shu hodisani beradi
  let installEvent = null;
  addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); installEvent = e;
    const btn = document.getElementById("installBtn");
    if (btn) { btn.hidden = false; document.getElementById("otherSteps").hidden = true; }
  });
  addEventListener("appinstalled", () => { remember(Infinity); close(); headerBtn && (headerBtn.hidden = true); });

  // Doimiy tugma
  const headerBtn = buttonId && document.getElementById(buttonId);
  if (headerBtn) { headerBtn.hidden = false; headerBtn.onclick = open; }

  // Avtomatik ko'rsatish: hech qachon yopilmagan yoki 3 kun o'tgan bo'lsa
  let hideUntil = 0;
  try { hideUntil = +localStorage.getItem(storageKey) || 0; } catch (e) {}
  if (Date.now() > hideUntil) open();

  function remember(ms) {
    try { localStorage.setItem(storageKey, ms === Infinity ? "9e15" : String(Date.now() + ms)); } catch (e) {}
  }

  function open() {
    if (document.getElementById("install")) return;
    document.body.insertAdjacentHTML("beforeend", `
      <div id="install" class="install">
        <div class="install-box">
          <b style="font-size:18px">📲 ${title}</b>
          <span>Keyin har safar bosh ekrandan ilova kabi ochasiz.</span>
          <button id="installBtn" class="main" ${installEvent ? "" : "hidden"}>📲 Oʻrnatish</button>
          <ol id="iosSteps" hidden>
            <li>Pastdagi <b>⬆️ Ulashish</b> tugmasini bosing</li>
            <li><b>«Bosh ekranga»</b> (Add to Home Screen) ni tanlang</li>
          </ol>
          <span id="otherSteps" ${installEvent ? "hidden" : ""}>Brauzer menyusi <b>⋮</b> → <b>«Bosh ekranga qoʻshish»</b> yoki <b>«Ilovani oʻrnatish»</b></span>
          <button id="videoBtn" ${videoId ? "" : "hidden"}>▶️ Videoda koʻrish</button>
          <div id="video"></div>
          <button id="laterBtn">Keyinroq</button>
        </div>
      </div>`);

    const $ = id => document.getElementById(id);
    if (/iphone|ipad/i.test(navigator.userAgent)) { $("iosSteps").hidden = false; $("otherSteps").hidden = true; }

    $("installBtn").onclick = async () => {
      if (!installEvent) return;
      installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      installEvent = null;
      if (outcome === "accepted") remember(Infinity);
      close();
    };
    $("videoBtn").onclick = () => {
      $("video").innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1"
        allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
      $("videoBtn").hidden = true;
    };
    $("laterBtn").onclick = () => { remember(REMIND_AFTER); close(); };
  }

  function close() { document.getElementById("install")?.remove(); }
}
