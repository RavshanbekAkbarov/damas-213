// Umumiy sozlamalar: ikkala sahifa (yo'lovchi va haydovchi) shu faylni ishlatadi
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAM6SDtTK3vlD-d6Fyhj8maP9DXkhqXhVY",
  authDomain: "damas-213.firebaseapp.com",
  databaseURL: "https://damas-213-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "damas-213",
  storageBucket: "damas-213.firebasestorage.app",
  messagingSenderId: "312315539032",
  appId: "1:312315539032:web:3b2ffb911b2e37df13e42d"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

// Haydovchi logini: "akmal" → "akmal@213damas.uz" (haqiqiy pochta shart emas)
export const loginToEmail = login => login.trim().toLowerCase() + "@213damas.uz";

export const CAP = 7; // Damasdagi o'rinlar

export const PITAKS = {
  qishloq: { name: "Qishloq pitak", at: [40.42364, 71.57170] },
  fargona: { name: "Fargʻona pitak (Alisherka oldi)", at: [40.39056, 71.78561] }
};

// Pitakdagi navbat: birinchi kelgan birinchi turadi
export function queueAt(drivers, pitakKey) {
  return Object.entries(drivers)
    .filter(([, d]) => d.status === "pitak" && d.pitak === pitakKey)
    .sort((a, b) => a[1].queuedAt - b[1].queuedAt);
}
