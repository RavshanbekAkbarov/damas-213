// Foydalanish statistikasi: kim onlayn, kuniga necha kishi, reklama ko'rishlar
import { ref, set, onDisconnect, increment, update } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db } from "./config.js";

// "2026-10-23" ko'rinishidagi bugungi sana (telefonning mahalliy vaqti bo'yicha)
export const dayKey = (date = new Date()) => date.toLocaleDateString("en-CA");

// Foydalanuvchini "onlayn" deb belgilaymiz; ilova yopilsa Firebase o'zi o'chiradi
export function trackUser(uid, role) {
  const me = ref(db, "online/" + uid);
  set(me, { role, since: Date.now() });
  onDisconnect(me).remove();
  set(ref(db, `stats/daily/${dayKey()}/${uid}`), true); // bir kunda bir marta sanaladi
}

// Reklama ko'rildi yoki bosildi: +1 (bir sessiyada bitta reklama bir marta sanaladi)
const seen = new Set();
export function countAdView(adId) {
  if (!adId || seen.has(adId)) return;
  seen.add(adId);
  update(ref(db), { [`stats/adViews/${adId}/${dayKey()}`]: increment(1) });
}
export function countAdClick(adId) {
  if (adId) update(ref(db), { [`stats/adClicks/${adId}/${dayKey()}`]: increment(1) });
}
