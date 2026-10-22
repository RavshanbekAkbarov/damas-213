// Jonli xarita: pitaklar, yo'ldagi Damaslar va kutayotgan yo'lovchilar.
// Yo'lovchi ham, haydovchi ham shu bir xil xaritani ishlatadi.
import { ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db, CAP, PITAKS, queueAt } from "./config.js";

const VAN = `<img src="damas-marker.png" alt="Damas">`;
const icon = (html, anchor = [20, 12]) => L.divIcon({ className: "", html, iconAnchor: anchor });

// opts.myPaxId(): yo'lovchining o'z belgisi ("Siz")
// opts.myDriverId: haydovchining o'z Damasi
// opts.onUpdate(drivers, passengers, stats): har yangilanishda chaqiriladi
export function liveMap(elementId, opts = {}) {
  const map = L.map(elementId).fitBounds([PITAKS.qishloq.at, PITAKS.fargona.at], { padding: [40, 40] });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "© OpenStreetMap"
  }).addTo(map);

  const pitakMarkers = {};
  for (const key in PITAKS) {
    pitakMarkers[key] = L.marker(PITAKS[key].at, { zIndexOffset: 1000 }).addTo(map).bindPopup("");
  }

  let drivers = {}, passengers = {};
  const roadMarkers = {}, paxMarkers = {};
  onValue(ref(db, "drivers"), snap => { drivers = snap.val() || {}; render(); });
  onValue(ref(db, "passengers"), snap => { passengers = snap.val() || {}; render(); });
  setInterval(render, 30000); // stikerlar vaqt o'tishi bilan o'zgarishi uchun

  function render() {
    const now = Date.now();

    // 1) Pitaklar va navbat
    let pitakCount = 0;
    for (const key in PITAKS) {
      const q = queueAt(drivers, key);
      pitakCount += q.length;
      pitakMarkers[key].setIcon(icon(`<div class="pitak">🅿️ ${q.length}</div>`));
      const list = q.map(([, d], i) =>
        `${i + 1}. <b>${d.name}</b> ${d.people}/${CAP} · <span style="user-select:all">${d.phone}</span>`).join("<br>");
      pitakMarkers[key].setPopupContent(`<b>${PITAKS[key].name}</b><br>${list || "Hozir Damas yoʻq"}`);
    }

    // 2) Yo'ldagi Damaslar
    const road = Object.entries(drivers).filter(([, d]) => d.status === "road" && d.lat);
    sync(roadMarkers, road, (id, d) => {
      const stale = now - (d.updatedAt || 0) > 5 * 60000;
      const cls = stale ? "stale" : d.people >= CAP ? "full" : "";
      const me = id === opts.myDriverId ? " me" : "";
      const html = `<div class="van${stale ? " old" : ""}${me}">${VAN}<span class="damas ${cls}">${d.people}/${CAP}</span></div>`;
      const ago = Math.round((now - (d.updatedAt || 0)) / 60000);
      const popup = `<b>${d.name}</b><br>📞 <span style="user-select:all">${d.phone}</span><br>Boʻsh joy: ${CAP - d.people}` +
                    `<br><small>${ago < 1 ? "hozir yangilandi" : ago + " daq oldin"}</small>`;
      if (!roadMarkers[id]) roadMarkers[id] = L.marker([d.lat, d.lng]).addTo(map).bindPopup("");
      roadMarkers[id].setLatLng([d.lat, d.lng]).setIcon(icon(html)).setPopupContent(popup);
    });

    // 3) Kutayotgan yo'lovchilar (40 daqiqadan eskisi o'chadi)
    const waiting = Object.entries(passengers).filter(([id, p]) => {
      const old = now - p.since > 40 * 60000;
      if (old) remove(ref(db, "passengers/" + id));
      return !old;
    });
    sync(paxMarkers, waiting, (id, p) => {
      const min = Math.floor((now - p.since) / 60000);
      const mood = min < 5 ? "ok" : min < 15 ? "mid" : "late";
      const emoji = { ok: "🙂", mid: "😐", late: "😡" }[mood];
      const mine = opts.myPaxId && id === opts.myPaxId() ? "<b>Siz</b><br>" : "";
      if (!paxMarkers[id]) paxMarkers[id] = L.marker([p.lat, p.lng]).addTo(map).bindPopup("");
      paxMarkers[id].setIcon(icon(`<div class="pax ${mood}">${emoji}</div>`, [12, 12]))
        .setPopupContent(`${mine}Kutyapti: ${min} daqiqa`);
    });

    opts.onUpdate?.(drivers, passengers, { waiting: waiting.length, road: road.length, pitak: pitakCount });
  }

  // Belgilarni yangilaydi: yangilarini qo'shadi, yo'qolganlarini o'chiradi
  function sync(markers, items, draw) {
    const ids = new Set(items.map(([id]) => id));
    for (const id in markers) if (!ids.has(id)) { map.removeLayer(markers[id]); delete markers[id]; }
    items.forEach(([id, item]) => draw(id, item));
  }

  return map;
}
