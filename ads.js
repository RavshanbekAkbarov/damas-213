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

export function adHtml(ad) {
  const safeLink = /^(https?:|tel:)/.test(ad.link || "") ? ad.link : "#";
  return `
    ${ad.image ? `<img class="ad-img" src="${esc(ad.image)}" alt="">` : ""}
    <div class="ad-text">
      <small>${ad.isDefault ? "Reklama joyi" : "Reklama"}</small>
      <b>${esc(ad.title)}</b>
      ${ad.sub ? `<span>${esc(ad.sub)}</span>` : ""}
    </div>
    <a class="ad-btn" href="${esc(safeLink)}" target="_blank" rel="noopener">${esc(ad.btnText || "Batafsil")}</a>`;
}
