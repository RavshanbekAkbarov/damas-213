// Reklama bloki: yo'lovchi sahifasi va admin oldindan ko'rishi shu kodni ishlatadi
export const TELEGRAM = "https://t.me/RavshanAkbarov";

// Faol reklama bo'lmaganda chiqadigan taklif matnlari
export const DEFAULT_ADS = [
  { title: "Sizning reklamangiz shu yerda boʻlishi mumkin",
    sub: "Damas kutayotgan har bir yoʻlovchi bu ekranni koʻradi" },
  { title: "Doʻkoningizni 5 ta qishloqqa tanishtiring",
    sub: "Oqboʻyra, Oqtepa, Mullaqayragʻoch, Oyimcha va Fargʻona yoʻli" },
  { title: "Usta, toʻyxona yoki doʻkonmisiz?",
    sub: "Mijozlaringiz har kuni Damasni shu ilovadan kutadi" },
  { title: "Qishloqdoshlaringiz har kuni shu yerga qaraydi",
    sub: "Reklama narxini bilish uchun yozing" }
].map(ad => ({ ...ad, btnText: "✈️ Aloqaga chiqing", link: TELEGRAM, isDefault: true }));

// HTML belgilarini zararsizlantirish (matn kod sifatida ishlab ketmasligi uchun)
const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// "+998 90 123 45 67" → "tel:+998901234567", "@dokon" → "https://t.me/dokon"
export function normalizeLink(link) {
  link = link.trim();
  if (/^\+?[\d\s()-]{7,}$/.test(link)) return "tel:" + link.replace(/[^\d+]/g, "");
  if (link.startsWith("@")) return "https://t.me/" + link.slice(1);
  if (!/^(https?:|tel:)/.test(link)) return "https://" + link;
  return link;
}

// Reklama hozir ko'rsatiladimi: yoqilgan va bugun muddat ichida
export function adStatus(ad, today) {
  if (!ad.active) return "paused";
  if (ad.start && today < ad.start) return "waiting";
  if (ad.end && today > ad.end) return "ended";
  return "running";
}

// YouTube havolasidan video ID: youtu.be/ID, watch?v=ID, shorts/ID, embed/ID
export function youtubeId(url = "") {
  const m = String(url).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/) || String(url).match(/^([\w-]{11})$/);
  return m ? m[1] : "";
}

// opts.thumb: videoni o'ynatmasdan rasm sifatida ko'rsatish (admin panel uchun)
export function adHtml(ad, opts = {}) {
  const safeLink = /^(https?:|tel:)/.test(ad.link || "") ? ad.link : "#";
  const btn = `<a class="e-btn" data-id="${esc(ad.id || "")}" href="${esc(safeLink)}" target="_blank" rel="noopener">${esc(ad.btnText || "Batafsil")} ›</a>`;

  // 1) Faqat rasm: butun joyni banner egallaydi, tugma burchakda
  if (ad.kind === "image" && ad.image) {
    return `<img class="e-banner" src="${esc(ad.image)}" alt="${esc(ad.title)}">
            <small class="e-label">Reklama</small>
            <span class="e-chip">${esc(ad.btnText || "Batafsil")} ›</span>
            <a class="e-btn e-cover" data-id="${esc(ad.id || "")}" href="${esc(safeLink)}" target="_blank" rel="noopener" aria-label="${esc(ad.title)}"></a>`;
  }

  // 2) Video yoki 3) matn (rasm/logo ixtiyoriy)
  const vid = ad.kind === "video" ? youtubeId(ad.video) : "";
  const media = vid
    ? (opts.thumb
        ? `<img class="e-video" src="https://i.ytimg.com/vi/${vid}/mqdefault.jpg" alt="">`
        : `<iframe class="e-video" src="https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=1&loop=1&playlist=${vid}&controls=0&playsinline=1&rel=0"
             allow="autoplay; encrypted-media" title="${esc(ad.title)}"></iframe>`)
    : ad.image ? `<img class="e-img" src="${esc(ad.image)}" alt="">` : "";

  return `
    <div class="e-row">
      ${media}
      <div class="e-text">
        <small class="e-small">${ad.isDefault ? "Reklama joyi" : "Reklama"}</small>
        <b>${esc(ad.title)}</b>
        <div class="e-foot">
          <span>${esc(ad.sub || "")}</span>
          ${btn}
        </div>
      </div>
    </div>`;
}
