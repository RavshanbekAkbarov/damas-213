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

export function adHtml(ad) {
  const safeLink = /^(https?:|tel:)/.test(ad.link || "") ? ad.link : "#";
  return `
    <div class="e-row">
      ${ad.image ? `<img class="e-img" src="${esc(ad.image)}" alt="">` : ""}
      <div class="e-text">
        <small>${ad.isDefault ? "Reklama joyi" : "Reklama"}</small>
        <b>${esc(ad.title)}</b>
        ${ad.sub ? `<span>${esc(ad.sub)}</span>` : ""}
      </div>
      <a class="e-btn" data-id="${esc(ad.id || "")}" href="${esc(safeLink)}" target="_blank" rel="noopener">${esc(ad.btnText || "Batafsil")}</a>
    </div>
    ${ad.isDefault ? "" : `<a class="e-cta" href="${TELEGRAM}" target="_blank" rel="noopener">📢 Reklama joylash uchun bosing</a>`}`;
}
