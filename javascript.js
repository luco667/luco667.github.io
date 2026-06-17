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

/* ═══════════════════════════════════════════
   MATRIX RAIN
═══════════════════════════════════════════ */

const canvas = document.getElementById("matrix");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const CHARS = "スシシャリノリサーモンマグロエビアボカドキュウリワサビショウユガリマキギリタテ1234567890><{}[]|/\\\\";

  let cols, drops, fontSize;

  function initMatrix() {
    fontSize = 14;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -100);
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "Minecraft", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * fontSize;

      if (y > 0 && y < canvas.height) {
        ctx.fillStyle = "#ccffcc";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "#00ff41";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 4;
      }

      ctx.fillText(char, i * fontSize, y);
      ctx.shadowBlur = 0;

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5;
    }
  }

  initMatrix();
  window.addEventListener("resize", initMatrix);
  setInterval(drawMatrix, 40);
}

/* ═══════════════════════════════════════════
   WORK EXPERIENCE — SCROLL INFINI
═══════════════════════════════════════════ */

const track = document.querySelector(".work-track");

if (track) {
  let x = 0, isDown = false, startX = 0;
  const speed = 0.6;
  let loopWidth = track.scrollWidth / 2;

  track.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.clientX - x;
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", e => {
    if (!isDown) return;
    x = e.clientX - startX;
    normalizeLoop();
    track.style.transform = `translateX(${x}px)`;
  });

  window.addEventListener("mouseup", stopDrag);

  track.addEventListener("touchstart", e => {
    isDown = true;
    startX = e.touches[0].clientX - x;
  }, { passive: false });

  window.addEventListener("touchmove", e => {
    if (!isDown) return;
    e.preventDefault();
    x = e.touches[0].clientX - startX;
    normalizeLoop();
    track.style.transform = `translateX(${x}px)`;
  }, { passive: false });

  window.addEventListener("touchend", stopDrag);

  function stopDrag() {
    isDown = false;
    track.style.cursor = "grab";
  }

  function normalizeLoop() {
    if (x <= -loopWidth) {
      x += loopWidth;
    }
    if (x >= 0) {
      x -= loopWidth;
    }
  }

  function animate() {
    if (!isDown) {
      x -= speed;
      normalizeLoop();
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    loopWidth = track.scrollWidth / 2;
  });
  animate();
}

/* ═══════════════════════════════════════════ TERMINAL TYPEWRITER (querySelector version) ═══════════════════════════════════════════ */
const LINES = [
  "> initializing profile...",
  "",
  "> status : Open to opportunities",
  "> interests : design, web security, reverse engineering, continuous learning",
  "> education : Baccalaureate in Science and Technology of Industry and Sustainable Development, and studies in Optical Eyewear BTS and BTS CIEL Option B (Electronics and Networks).",
  "> hobbies : nature, art, literature, cinema, music, animation, science",
  "",
  "> system ready_"
];

const output = document.getElementById("terminal-output");

let index = 0;

/* mémoire position scroll */
let lockedScrollY = window.scrollY;

function lockScroll() {
  lockedScrollY = window.scrollY;
}

function restoreScroll() {
  window.scrollTo(0, lockedScrollY);
}

function addLine(text) {

  lockScroll(); // on mémorise la position actuelle

  const div = document.createElement("div");
  div.className = "line";
  div.textContent = text;

  output.appendChild(div);

  requestAnimationFrame(() => {
    restoreScroll(); // on empêche tout déplacement visuel
  });
}

/* ajout des lignes */
setInterval(() => {
  if (index >= LINES.length) return;

  addLine(LINES[index++]);

}, 1200);

/* sécurité iOS/scroll manuel */
window.addEventListener("scroll", () => {
  restoreScroll();
}, { passive: true });
/* ═══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════════════════ */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - 60) {
      current = sec.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}, { passive: true });

/* ═══════════════════════════════════════════
   PROJECTS DATABASE
═══════════════════════════════════════════ */

const PROJECTS = [
  {
    category: "developpement",
    icon: "◈",
    color: "#00ff41",
    projects: [
      {
        name: "Web Language",
        desc: "All projects in language for the Web.",
        tags: ["javascript", "wasm", "html", "css"],
        link: "Projects/Javascript_Language/Js.html",
        status: "done",
        date: "2023"
      },
      {
        name: "C Language",
        desc: "All projects in C.",
        tags: ["C", "SDL3", "MinGW", "embscripte"],
        link: "Projects/Language_C/Language_C.html",
        status: "done",
        date: "2024"
      }
    ]
  },
  {
    category: "electronics",
    icon: "◆",
    color: "#00ccff",
    projects: [
      {
        name: "Mini Piano PCB",
        desc: "",
        tags: ["KiCad", "PCB", "Hertz"],
        status: "wip",
        date: "2024"
      },
      {
        name: "Arroseur PCB",
        desc: "",
        tags: ["KiCad", "PCB", "STM32"],
        status: "wip",
        date: "2025"
      },
      {
        name: "Etiquette PCB",
        desc: "",
        tags: ["Kicad", "CODE39"],
        link: "https://github.com/luco667",
        status: "wip",
        date: "2026"
      }
    ]
  },
  {
    category: "cybersecurity",
    icon: "⬢",
    color: "#ffcc00",
    projects: [
      {
        name: "Empty",
        desc: "",
        tags: [],
        link: "",
        status: "wip",
        date: "2026"
      }
    ]
  },
  {
    category: "network",
    icon: "▣",
    color: "#ff4466",
    projects: [
      {
        name: "Proxy",
        desc: "Routeur proxy anti-pub.",
        tags: ["OSI"],
        status: "wip",
        date: "2026"
      }
    ]
  },
  {
    category: "miscellaneous",
    icon: "⧉",
    color: "#812bd5",
    projects: [
      {
        name: "Empty",
        desc: "",
        tags: [],
        link: "https://github.com/luco667",
        status: "wip",
        date: "2026"
      }
    ]
  }
];

/* ═══════════════════════════════════════════
   PROJECTS RENDERER — DOM manuel, anti-XSS
═══════════════════════════════════════════ */

(function renderProjects() {
  const STATUS_LABEL = Object.freeze({
    done: { text: "done", color: "#00ff41" },
    wip: { text: "in progress", color: "#ffcc00" },
    archived: { text: "archived", color: "#888" }
  });

  function el(tag, props = {}, text = "") {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class") {
        node.className = v;
      } else if (k === "style") {
        Object.assign(node.style, v);
      } else {
        node.setAttribute(k, v);
      }
    });
    if (text) {
      node.textContent = text;
    }
    return node;
  }

  const section = document.querySelector("#projects");
  if (!section) return;

  const grid = el("div", { class: "projects-grid" });

  PROJECTS.forEach(cat => {
    const card = el("div", { class: "cat-card" });
    card.style.setProperty("--cat-color", cat.color);
    card.dataset.category = cat.category;

    const header = el("div", { class: "cat-header" });
    const icon = el("span", { class: "cat-icon" });
    icon.textContent = cat.icon;
    const name = el("div", { class: "cat-name" });
    name.textContent = `./${cat.category}/`;
    header.appendChild(icon);
    header.appendChild(name);

    const count = cat.projects.length;
    const counter = el("div", { class: `cat-count${count > 0 ? " has-projects" : ""}` });
    counter.textContent = count > 0 ? `${count} project${count > 1 ? "s" : ""}` : "empty";

    card.appendChild(header);
    card.appendChild(counter);

    card.addEventListener("click", () => {
      document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      openModal(cat);
    });

    grid.appendChild(card);
  });

  section.appendChild(grid);

  const overlay = el("div", { id: "proj-overlay" });
  const modal = el("div", { id: "proj-modal" });
  const mHeader = el("div", { class: "modal-header" });
  const modalTitle = el("div", { id: "modal-title", class: "modal-title" });
  const closeBtn = el("button", { class: "modal-close", id: "modal-close", "aria-label": "Fermer" });
  closeBtn.textContent = "✕";
  const modalBody = el("div", { class: "modal-body", id: "modal-body" });

  mHeader.appendChild(modalTitle);
  mHeader.appendChild(closeBtn);
  modal.appendChild(mHeader);
  modal.appendChild(modalBody);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      closeModal();
    }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeModal();
    }
  });
  modalBody.addEventListener("wheel", e => e.stopPropagation(), { passive: true });

  function openModal(cat) {
    overlay.style.setProperty("--modal-color", cat.color);
    modalTitle.textContent = `> ${cat.icon} ${cat.category}/`;
    modalBody.replaceChildren();

    if (cat.projects.length === 0) {
      const empty = el("div", { class: "empty-state" });
      empty.textContent = "> no projects yet_";
      modalBody.appendChild(empty);
    } else {
      cat.projects.forEach(p => {
        const s = p.status ? STATUS_LABEL[p.status] : null;
        const item = el("div", { class: "proj-item" });

        const top = el("div", { class: "proj-top" });
        const nameDiv = el("div", { class: "proj-name" });
        nameDiv.appendChild(document.createTextNode("> "));

        if (p.link && isSafeUrl(p.link)) {
          const a = el("a", { href: p.link, target: "_blank", rel: "noopener noreferrer", referrerpolicy: "no-referrer" });
          a.textContent = p.name;
          nameDiv.appendChild(a);
        } else {
          nameDiv.appendChild(document.createTextNode(p.name));
        }

        const meta = el("div", { class: "proj-meta" });
        if (p.date) {
          const d = el("span", { class: "proj-date" });
          d.textContent = p.date;
          meta.appendChild(d);
        }
        if (s) {
          const sp = el("span", { class: "proj-status" });
          sp.style.color = s.color;
          sp.style.borderColor = s.color + "33";
          sp.textContent = s.text;
          meta.appendChild(sp);
        }

        top.appendChild(nameDiv);
        top.appendChild(meta);

        const desc = el("div", { class: "proj-desc" });
        desc.textContent = p.desc;

        item.appendChild(top);
        item.appendChild(desc);

        if (p.tags && p.tags.length > 0) {
          const tagsDiv = el("div", { class: "proj-tags" });
          p.tags.forEach(t => {
            if (!t) return;
            const tag = el("span", { class: "proj-tag" });
            tag.textContent = "#" + t;
            tagsDiv.appendChild(tag);
          });
          item.appendChild(tagsDiv);
        }

        modalBody.appendChild(item);
      });
    }

    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    document.querySelectorAll(".cat-card").forEach(c => c.classList.remove("active"));
  }

  function isSafeUrl(url) {
    try {
      const u = new URL(url, location.origin);
      return u.protocol === "https:" || u.protocol === "http:";
    } catch {
      return /^[^:]*$/.test(url);
    }
  }
})();
