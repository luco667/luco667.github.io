/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */

(async function init() {
  await registerVisit();
  await startSession();
  startHeartbeat();
  listenOnline();
  listenVisits();
  revealEmail();
})();

/* ═══════════════════════════════════════════
   INIT FIREBASE
═══════════════════════════════════════════ */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  onDisconnect,
  runTransaction
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBRj2MmECUYqeISLB-y4nR8Y0k3bv5q5g8",
  authDomain: "portfolio-60614.firebaseapp.com",
  databaseURL: "https://portfolio-60614-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "portfolio-60614",
  storageBucket: "portfolio-60614.firebasestorage.app",
  messagingSenderId: "296651632810",
  appId: "1:296651632810:web:bcbb692921ee27497ce0d3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

/* ═══════════════════════════════════════════
   IDS / SESSION
═══════════════════════════════════════════ */

const sessionId = crypto.randomUUID();

/**
 * Hash navigateur (UserAgent + dimensions)
 * Pas d'IP, compatible GitHub Pages
 */
async function getVisitorHash() {
  const raw = navigator.userAgent + screen.width + screen.height;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const onlineRef = ref(db, `analytics/online/${sessionId}`);
const sessionRef = ref(db, `analytics/sessions/${sessionId}`);
const visitsRef = ref(db, `analytics/visits_total`);

/* ═══════════════════════════════════════════
   GÉOLOCALISATION — timezone + langue + IP
   ─────────────────────────────────────────
   IP récupérée via ifconfig.me (open source).
   Combinée avec timezone IANA + langue nav.
   ⚠ Mentionner la collecte d'IP dans ta page RGPD.
═══════════════════════════════════════════ */

async function getGeoInfo() {
  let ip = null;
  try {
    const res = await fetch("https://ifconfig.me/ip", {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      ip = (await res.text()).trim();
    }
  } catch {
    // silencieux si bloqué ou offline
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const language = navigator.language || navigator.languages?.[0] || "";

  // Déduction du pays depuis le timezone IANA
  const TZ_TO_COUNTRY = {
    "Europe/Paris": "FR","Europe/London": "GB","Europe/Berlin": "DE",
    "Europe/Madrid": "ES","Europe/Rome": "IT","Europe/Amsterdam": "NL",
    "Europe/Brussels": "BE","Europe/Zurich": "CH","Europe/Vienna": "AT","Europe/Warsaw": "PL",
    "Europe/Prague": "CZ","Europe/Budapest": "HU","Europe/Bucharest": "RO","Europe/Sofia": "BG",
    "Europe/Helsinki": "FI","Europe/Stockholm": "SE","Europe/Oslo": "NO","Europe/Copenhagen": "DK",
    "Europe/Lisbon": "PT", "Europe/Athens": "GR", "Europe/Dublin": "IE", "Europe/Kiev": "UA",
    "Europe/Moscow": "RU","Europe/Istanbul": "TR","America/New_York": "US","America/Chicago": "US","America/Denver": "US",
    "America/Los_Angeles": "US","America/Toronto": "CA","America/Vancouver": "CA","America/Montreal": "CA", "America/Mexico_City": "MX", "America/Sao_Paulo": "BR",
     "America/Argentina/Buenos_Aires": "AR","America/Bogota": "CO", "America/Lima": "PE",  "America/Santiago": "CL",
    "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK", "Asia/Seoul": "KR",
    "Asia/Singapore": "SG", "Asia/Kolkata": "IN", "Asia/Dubai": "AE", "Asia/Bangkok": "TH","Asia/Jakarta": "ID",
    "Asia/Karachi": "PK","Asia/Dhaka": "BD", "Asia/Taipei": "TW",
    "Australia/Sydney": "AU", "Australia/Melbourne": "AU",
    "Australia/Perth": "AU", "Pacific/Auckland": "NZ", "Africa/Cairo": "EG", "Africa/Lagos": "NG",
    "Africa/Johannesburg": "ZA", "Africa/Nairobi": "KE", "Africa/Casablanca": "MA"
  };

  const COUNTRY_NAMES = {
    FR: "France",GB: "United Kingdom",DE: "Germany",ES: "Spain",IT: "Italy",NL: "Netherlands",
    BE: "Belgium",CH: "Switzerland",AT: "Austria",PL: "Poland",CZ: "Czech Republic",HU: "Hungary",RO: "Romania",BG: "Bulgaria",FI: "Finland",
    SE: "Sweden",NO: "Norway",
    DK: "Denmark", PT: "Portugal", GR: "Greece", IE: "Ireland",
    UA: "Ukraine",  RU: "Russia", TR: "Turkey", US: "United States",
    CA: "Canada",MX: "Mexico", BR: "Brazil", AR: "Argentina",
    CO: "Colombia", PE: "Peru",CL: "Chile", JP: "Japan",
    CN: "China",HK: "Hong Kong",  KR: "South Korea", SG: "Singapore", IN: "India",
    AE: "UAE",TH: "Thailand",ID: "Indonesia", PK: "Pakistan", BD: "Bangladesh",TW: "Taiwan",
    AU: "Australia",NZ: "New Zealand",EG: "Egypt",
    NG: "Nigeria", ZA: "South Africa", KE: "Kenya",MA: "Morocco"
  };

  const countryCode = TZ_TO_COUNTRY[timezone] || language.split("-")[1] || "??";
  const country = COUNTRY_NAMES[countryCode] || "Unknown";

  return { countryCode, country, timezone, language, ip };
}

/* ═══════════════════════════════════════════
   VISITE UNIQUE
═══════════════════════════════════════════ */

async function registerVisit() {
  const visitorHash = await getVisitorHash();
  const visitorRef = ref(db, `analytics/unique_visitors/${visitorHash}`);
  const snap = await get(visitorRef);

  if (!snap.exists()) {
    const geo = await getGeoInfo();

    await set(visitorRef, {
      firstSeen: Date.now(),
      countryCode: geo.countryCode,
      country: geo.country,
      timezone: geo.timezone,
      language: geo.language,
      ...(geo.ip && { ip: geo.ip })
    });

    await runTransaction(visitsRef, v => (v || 0) + 1);

    // Compteur agrégé par pays : analytics/geo/<countryCode>
    if (geo.countryCode !== "??") {
      const geoRef = ref(db, `analytics/geo/${geo.countryCode}`);
      await runTransaction(geoRef, v => (v || 0) + 1);
    }
  }
}

/* ═══════════════════════════════════════════
   SESSION
═══════════════════════════════════════════ */

async function startSession() {
  await set(sessionRef, { start: Date.now(), page: location.href, active: true });
  onDisconnect(sessionRef).update({ end: Date.now(), active: false });
}

/* ═══════════════════════════════════════════
   ONLINE HEARTBEAT
═══════════════════════════════════════════ */

function startHeartbeat() {
  const ping = () => set(onlineRef, { lastPing: Date.now() });
  ping();
  setInterval(ping, 8000);
  onDisconnect(onlineRef).remove();
}

/* ═══════════════════════════════════════════
   ONLINE COUNT
═══════════════════════════════════════════ */

function listenOnline() {
  onValue(ref(db, "analytics/online"), snapshot => {
    const data = snapshot.val() || {};
    const now = Date.now();
    const active = Object.values(data).filter(u => now - u.lastPing < 20000);
    const el = document.getElementById("online-count");
    if (el) {
      el.textContent = active.length;
    }
  });
}

/* ═══════════════════════════════════════════
   VISITS COUNT
═══════════════════════════════════════════ */

function listenVisits() {
  const el = document.getElementById("visits");
  onValue(visitsRef, snap => {
    if (el) {
      el.textContent = snap.val() || 0;
    }
  });
}



/* ═══════════════════════════════════════════
   EMAIL OBFUSCATION
   Le HTML porte data-user / data-domain.
   On reconstruit l'adresse ici, jamais dans le HTML brut.
═══════════════════════════════════════════ */

function revealEmail() {
  const el = document.getElementById("contact-email");
  if (!el) return;
  
  const addr = el.dataset.user + "\u0040" + el.dataset.domain;
  el.href = "mailto:" + addr;
  el.textContent = addr;
}
