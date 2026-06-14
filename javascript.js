/* ═══════════════════════════════════════════
   INIT GGSTATIC
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

/* ═══════════════════════════════════════════
   INIT FIREBASE
═══════════════════════════════════════════ */

const firebaseConfig = {
  apiKey:            "AIzaSyBRj2MmECUYqeISLB-y4nR8Y0k3bv5q5g8",
  authDomain:        "portfolio-60614.firebaseapp.com",
  databaseURL:       "https://portfolio-60614-default-rtdb.europe-west1.firebasedatabase.app",
  projectId:         "portfolio-60614",
  storageBucket:     "portfolio-60614.firebasestorage.app",
  messagingSenderId: "296651632810",
  appId:             "1:296651632810:web:bcbb692921ee27497ce0d3"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

/* ═══════════════════════════════════════════
   IDS / SESSION
═══════════════════════════════════════════ */

const sessionId = crypto.randomUUID();

/** Hash navigateur (UserAgent + dimensions) — pas d'IP, compatible GitHub Pages */
async function getVisitorHash() {
  const raw = navigator.userAgent + screen.width + screen.height;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

const onlineRef  = ref(db, `analytics/online/${sessionId}`);
const sessionRef = ref(db, `analytics/sessions/${sessionId}`);
const visitsRef  = ref(db, `analytics/visits_total`);

/* ═══════════════════════════════════════════
   GÉOLOCALISATION — timezone + langue + IP
   ─────────────────────────────────────────
   IP récupérée via ifconfig.me (open source).
   Combinée avec timezone IANA + langue nav.
   ⚠ Mentionner la collecte d'IP dans ta page RGPD.
═══════════════════════════════════════════ */

async function getGeoInfo() {
  // Récupération IP via ifconfig.me
  let ip = null;
  try {
    const res = await fetch("https://ifconfig.me/ip", {
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) ip = (await res.text()).trim();
  } catch {
    // silencieux si bloqué ou offline
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const language = navigator.language || navigator.languages?.[0] || "";

  // Déduction du pays depuis le timezone IANA (Europe/Paris → FR, etc.)
  const TZ_TO_COUNTRY = {
    "Europe/Paris":"FR","Europe/London":"GB","Europe/Berlin":"DE",
    "Europe/Madrid":"ES","Europe/Rome":"IT","Europe/Amsterdam":"NL",
    "Europe/Brussels":"BE","Europe/Zurich":"CH","Europe/Vienna":"AT",
    "Europe/Warsaw":"PL","Europe/Prague":"CZ","Europe/Budapest":"HU",
    "Europe/Bucharest":"RO","Europe/Sofia":"BG","Europe/Helsinki":"FI",
    "Europe/Stockholm":"SE","Europe/Oslo":"NO","Europe/Copenhagen":"DK",
    "Europe/Lisbon":"PT","Europe/Athens":"GR","Europe/Dublin":"IE",
    "Europe/Kiev":"UA","Europe/Moscow":"RU","Europe/Istanbul":"TR",
    "America/New_York":"US","America/Chicago":"US","America/Denver":"US",
    "America/Los_Angeles":"US","America/Toronto":"CA","America/Vancouver":"CA",
    "America/Montreal":"CA","America/Mexico_City":"MX","America/Sao_Paulo":"BR",
    "America/Argentina/Buenos_Aires":"AR","America/Bogota":"CO",
    "America/Lima":"PE","America/Santiago":"CL",
    "Asia/Tokyo":"JP","Asia/Shanghai":"CN","Asia/Hong_Kong":"HK",
    "Asia/Seoul":"KR","Asia/Singapore":"SG","Asia/Kolkata":"IN",
    "Asia/Dubai":"AE","Asia/Bangkok":"TH","Asia/Jakarta":"ID",
    "Asia/Karachi":"PK","Asia/Dhaka":"BD","Asia/Taipei":"TW",
    "Australia/Sydney":"AU","Australia/Melbourne":"AU","Australia/Perth":"AU",
    "Pacific/Auckland":"NZ","Africa/Cairo":"EG","Africa/Lagos":"NG",
    "Africa/Johannesburg":"ZA","Africa/Nairobi":"KE","Africa/Casablanca":"MA",
  };

  const COUNTRY_NAMES = {
    FR:"France",GB:"United Kingdom",DE:"Germany",ES:"Spain",IT:"Italy",
    NL:"Netherlands",BE:"Belgium",CH:"Switzerland",AT:"Austria",PL:"Poland",
    CZ:"Czech Republic",HU:"Hungary",RO:"Romania",BG:"Bulgaria",FI:"Finland",
    SE:"Sweden",NO:"Norway",DK:"Denmark",PT:"Portugal",GR:"Greece",IE:"Ireland",
    UA:"Ukraine",RU:"Russia",TR:"Turkey",US:"United States",CA:"Canada",
    MX:"Mexico",BR:"Brazil",AR:"Argentina",CO:"Colombia",PE:"Peru",CL:"Chile",
    JP:"Japan",CN:"China",HK:"Hong Kong",KR:"South Korea",SG:"Singapore",
    IN:"India",AE:"UAE",TH:"Thailand",ID:"Indonesia",PK:"Pakistan",
    BD:"Bangladesh",TW:"Taiwan",AU:"Australia",NZ:"New Zealand",
    EG:"Egypt",NG:"Nigeria",ZA:"South Africa",KE:"Kenya",MA:"Morocco",
  };

  const countryCode = TZ_TO_COUNTRY[timezone] || language.split("-")[1] || "??";
  const country     = COUNTRY_NAMES[countryCode] || "Unknown";

  return { countryCode, country, timezone, language, ip };
}

/* ═══════════════════════════════════════════
   VISITE UNIQUE
═══════════════════════════════════════════ */

async function registerVisit() {
  const visitorHash = await getVisitorHash();
  const visitorRef  = ref(db, `analytics/unique_visitors/${visitorHash}`);
  const snap        = await get(visitorRef);

  if (!snap.exists()) {
    const geo = await getGeoInfo();

    await set(visitorRef, {
      firstSeen: Date.now(),
      countryCode: geo.countryCode,
      country:     geo.country,
      timezone:    geo.timezone,
      language:    geo.language,
      ...(geo.ip && { ip: geo.ip }),
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
    const data   = snapshot.val() || {};
    const now    = Date.now();
    const active = Object.values(data).filter(u => now - u.lastPing < 20000);
    const el     = document.getElementById("online-count");
    if (el) el.textContent = active.length;
  });
}

/* ═══════════════════════════════════════════
   VISITS COUNT
═══════════════════════════════════════════ */

function listenVisits() {
  const el = document.getElementById("visits");
  onValue(visitsRef, snap => { if (el) el.textContent = snap.val() || 0; });
}

/* ═══════════════════════════════════════════
   EMAIL OBFUSCATION
   Le HTML porte data-user / data-domain.
   On reconstruit l'adresse ici, jamais dans le HTML brut.
═══════════════════════════════════════════ */

function revealEmail() {
  const el = document.getElementById("contact-email");
  if (!el) return;
  const addr     = el.dataset.user + "\u0040" + el.dataset.domain;
  el.href        = "mailto:" + addr;
  el.textContent = addr;
}

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
   MATRIX RAIN
═══════════════════════════════════════════ */

const canvas = document.getElementById("matrix");
const ctx    = canvas.getContext("2d");

const CHARS = "スシシャリノリサーモンマグロエビアボカドキュウリワサビショウユガリマキギリタテ1234567890><{}[]|/\\\\";

let cols, drops, fontSize;

function initMatrix() {
  fontSize      = 14;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols          = Math.floor(canvas.width / fontSize);
  drops         = Array.from({ length: cols }, () => Math.random() * -100);
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px "Minecraft", monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const y    = drops[i] * fontSize;

    if (y > 0 && y < canvas.height) {
      ctx.fillStyle   = "#ccffcc";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur  = 8;
    } else {
      ctx.fillStyle   = "#00ff41";
      ctx.shadowColor = "#00ff41";
      ctx.shadowBlur  = 4;
    }

    ctx.fillText(char, i * fontSize, y);
    ctx.shadowBlur = 0;

    if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 0.5;
  }
}

initMatrix();
window.addEventListener("resize", initMatrix);
setInterval(drawMatrix, 40);

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
    if (x <= -loopWidth) x += loopWidth;
    if (x >= 0)          x -= loopWidth;
  }

  function animate() {
    if (!isDown) {
      x -= speed;
      normalizeLoop();
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => { loopWidth = track.scrollWidth / 2; });
  animate();
}

/* ═══════════════════════════════════════════
   TERMINAL TYPEWRITER
═══════════════════════════════════════════ */

const LINES = [
  "> initializing profile...",
  "",
  "> status     : Open to opportunities",
  "> interests  : design, web security, reverse engineering, continuous learning",
  "> education  : Baccalaureate in Science and Technology of Industry and Sustainable Development, and studies in Optical Eyewear BTS and BTS CIEL Option B (Electronics and Networks).",
  "> hobbies    : nature, art, literature, cinema, music, animation, science",
  "",
  "> system ready_"
];

const output = document.getElementById("terminal-output");

let lineIndex = 0;
let charIndex = 0;
const term = document.getElementById("terminal");

function typeLine() {
  if (lineIndex >= LINES.length) return;

  const line = document.createElement("div");
  line.classList.add("line");

  const text = document.createElement("span");

  const cursor = document.createElement("span");
  cursor.classList.add("cursor");

  line.append(text, cursor);
  output.appendChild(line);

  const currentLine = LINES[lineIndex];

  function typeChar() {
    if (charIndex < currentLine.length) {
      text.textContent += currentLine[charIndex++];
      setTimeout(typeChar, 18 + Math.random() * 35);
      return;
    }

    cursor.remove();

    lineIndex++;
    charIndex = 0;

    setTimeout(typeLine, 110);
  }

  typeChar();
}

window.addEventListener("load", () => {
  setTimeout(typeLine, 600);
});

function printLine(text) {
  const oldScroll = window.scrollY;
  term.textContent += text + "\n";
  window.scrollTo(0, oldScroll);


  const atBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 5;

  term.textContent += text + "\n";

  if (atBottom) {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "instant"
    });
  }
}
/* ═══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════════════════ */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => { if (scrollY >= sec.offsetTop - 60) current = sec.id; });
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
      { name: "Web Language", desc: "All projects in language for the Web.", tags: ["javascript", "wasm", "html", "css"], link: "Projects/Javascript_Language/Js.html", status: "done", date: "2023" },
	    { name: "C Language", desc: "All projects in C.", tags: ["C", "SDL3", "MinGW","embscripte"], link: "Projects/Language_C/Language_C.html", status: "done", date: "2024" },
    ],
  },
  {
    category: "electronics",
    icon: "◆",
    color: "#00ccff",
    projects: [
      { name: "Arroseur PCB", desc: "", tags: ["KiCad", "PCB", "STM32"], status: "wip", date: "2025" },
      { name: "Etiquette PCB", desc: "", tags: ["Kicad", "CODE39"], link: "https://github.com/luco667", status: "wip", date: "2026" },
    ],
  },
  {
    category: "cybersecurity",
    icon: "⬢",
    color: "#ffcc00",
    projects: [
      { name: "Empty", desc: "", tags: [], link: "", status: "wip", date: "2026" },
    ],
  },
  {
    category: "network",
    icon: "▣",
    color: "#ff4466",
    projects: [
      { name: "Proxy", desc: "Routeur proxy anti-pub.", tags: ["OSI"], status: "wip", date: "2026" },
    ],
  },
  {
    category: "miscellaneous",
    icon: "⧉",
    color: "#812bd5",
    projects: [
      { name: "Empty", desc: "", tags: [], link: "https://github.com/luco667", status: "wip", date: "2026" },
    ],
  },
];

/* ═══════════════════════════════════════════
   PROJECTS RENDERER — DOM manuel, anti-XSS
═══════════════════════════════════════════ */

(function renderProjects() {

  const STATUS_LABEL = Object.freeze({
    done:     { text: "done",        color: "#00ff41" },
    wip:      { text: "in progress", color: "#ffcc00" },
    archived: { text: "archived",    color: "#888"    },
  });

  function el(tag, props = {}, text = "") {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (k === "class")       node.className = v;
      else if (k === "style")  Object.assign(node.style, v);
      else                     node.setAttribute(k, v);
    });
    if (text) node.textContent = text;
    return node;
  }

  const style = el("style");
  style.textContent = `
    .projects-scroll { overflow-x:auto; overflow-y:visible; scrollbar-width:none; margin-left:-4px; margin-right:-4px; }
    .projects-scroll::-webkit-scrollbar { display:none; }
    .cat-card { min-width:250px; max-width:250px; border:1px solid rgba(0,255,65,0.2); background:rgba(0,10,0,0.75); padding:20px; cursor:pointer; transition:all 0.22s; position:relative; overflow:hidden; backdrop-filter:blur(6px); flex-shrink:0; }
    .cat-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,var(--cat-color,#00ff41) 0%,transparent 60%); opacity:0; transition:opacity 0.3s; }
    .cat-card:hover::before { opacity:0.07; }
    .cat-card:hover { border-color:var(--cat-color,#00ff41); box-shadow:0 0 20px color-mix(in srgb,var(--cat-color,#00ff41) 20%,transparent); transform:translateY(-2px); }
    .cat-card.active { border-color:var(--cat-color,#00ff41); box-shadow:0 0 24px color-mix(in srgb,var(--cat-color,#00ff41) 30%,transparent),inset 0 0 20px rgba(255,255,255,0.02); background:rgba(0,255,65,0.05); }
    .cat-header { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .cat-icon { font-size:1.4rem; color:var(--cat-color,#00ff41); text-shadow:0 0 10px var(--cat-color,#00ff41); line-height:1; }
    .cat-name { font-family:'Minecraft',monospace; font-size:.88rem; letter-spacing:.14em; color:var(--cat-color,#00ff41); line-height:1; }
    .cat-count { font-size:0.72rem; color:#444; margin-top:6px; letter-spacing:0.1em; }
    .cat-count.has-projects { color:#666; }
    #proj-overlay { position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.88); backdrop-filter:blur(8px); opacity:0; pointer-events:none; transition:opacity 0.25s; }
    #proj-overlay.open { opacity:1; pointer-events:all; }
    #proj-modal { background:#020d02; border:1px solid var(--modal-color,#00ff41); box-shadow:0 0 50px color-mix(in srgb,var(--modal-color,#00ff41) 18%,transparent); width:min(700px,92vw); max-height:80vh; overflow:hidden; display:flex; flex-direction:column; transform:translateY(14px); transition:transform 0.25s; }
    #proj-overlay.open #proj-modal { transform:translateY(0); }
    .modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 28px; border-bottom:1px solid rgba(255,255,255,0.06); flex-shrink:0; background:#020d02; }
    .modal-title { font-family:'Minecraft',monospace; font-size:1.6rem; color:var(--modal-color,#00ff41); text-shadow:0 0 12px var(--modal-color,#00ff41); letter-spacing:0.1em; }
    .modal-close { background:none; border:1px solid rgba(255,255,255,0.15); color:#666; font-family:'Minecraft',monospace; font-size:1rem; width:32px; height:32px; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; }
    .modal-close:hover { border-color:var(--modal-color,#00ff41); color:var(--modal-color,#00ff41); }
    .modal-body { padding:24px 28px; display:flex; flex-direction:column; gap:14px; overflow-y:auto; }
    .proj-item { font-family:'Minecraft',monospace; border:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.02); padding:18px 20px; transition:all 0.2s; }
    .proj-item:hover { border-color:color-mix(in srgb,var(--modal-color,#00ff41) 35%,transparent); background:rgba(255,255,255,0.03); }
    .proj-top { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:8px; }
    .proj-name { font-family:'Minecraft',monospace; font-size:0.95rem; color:var(--modal-color,#00ff41); letter-spacing:0.05em; }
    .proj-name a { color:inherit; text-decoration:none; }
    .proj-name a:hover { text-decoration:underline; }
    .proj-meta { display:flex; align-items:center; gap:10px; flex-shrink:0; }
    .proj-date { font-size:0.72rem; color:#444; letter-spacing:0.1em; }
    .proj-status { font-size:0.7rem; letter-spacing:0.12em; padding:2px 8px; border:1px solid; }
    .proj-desc { font-size:0.83rem; color:#556655; line-height:1.7; margin-bottom:10px; }
    .proj-tags { display:flex; flex-wrap:wrap; gap:6px; }
    .proj-tag { font-size:0.7rem; color:#445544; border:1px solid #1a2e1a; padding:2px 8px; letter-spacing:0.08em; }
    .empty-state { text-align:center; padding:40px; color:#333; font-size:0.85rem; letter-spacing:0.1em; }
    .modal-body::-webkit-scrollbar { width:4px; }
    .modal-body::-webkit-scrollbar-track { background:transparent; }
    .modal-body::-webkit-scrollbar-thumb { background:#1a3a1a; }
    @media (max-width:500px) { #proj-modal { max-height:90vh; } }
  `;
  document.head.appendChild(style);

  const section = document.querySelector("#projects");
  if (!section) return;

  const grid = el("div", { class: "projects-grid" });

  PROJECTS.forEach(cat => {
    const card = el("div", { class: "cat-card" });
    card.style.setProperty("--cat-color", cat.color);
    card.dataset.category = cat.category;

    const header  = el("div", { class: "cat-header" });
    const icon    = el("span", { class: "cat-icon" });
    icon.textContent = cat.icon;
    const name    = el("div", { class: "cat-name" });
    name.textContent = `./${cat.category}/`;
    header.appendChild(icon);
    header.appendChild(name);

    const count   = cat.projects.length;
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

  const overlay    = el("div", { id: "proj-overlay" });
  const modal      = el("div", { id: "proj-modal" });
  const mHeader    = el("div", { class: "modal-header" });
  const modalTitle = el("div", { id: "modal-title", class: "modal-title" });
  const closeBtn   = el("button", { class: "modal-close", id: "modal-close", "aria-label": "Fermer" });
  closeBtn.textContent = "✕";
  const modalBody  = el("div", { class: "modal-body", id: "modal-body" });

  mHeader.appendChild(modalTitle);
  mHeader.appendChild(closeBtn);
  modal.appendChild(mHeader);
  modal.appendChild(modalBody);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
  modalBody.addEventListener("wheel", e => e.stopPropagation(), { passive: true });

  function openModal(cat) {
    overlay.style.setProperty("--modal-color", cat.color);
    modalTitle.textContent = `> ${cat.icon} ${cat.category}/`;
    modalBody.innerHTML = "";

    if (cat.projects.length === 0) {
      const empty = el("div", { class: "empty-state" });
      empty.textContent = "> no projects yet_";
      modalBody.appendChild(empty);
    } else {
      cat.projects.forEach(p => {
        const s    = p.status ? STATUS_LABEL[p.status] : null;
        const item = el("div", { class: "proj-item" });

        const top     = el("div", { class: "proj-top" });
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
          sp.style.color       = s.color;
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


/**
	@license

	Copyright (c) 2010 uxebu Consulting Ltd. & Co. KG
	Copyright (c) 2010 David Aurelio
	All rights reserved.

	Redistribution and use in source and binary forms, with or without
	modification, are permitted provided that the following conditions are met:

	1. Redistributions of source code must retain the above copyright
	   notice, this list of conditions and the following disclaimer.
	2. Redistributions in binary form must reproduce the above copyright
	   notice, this list of conditions and the following disclaimer in the
	   documentation and/or other materials provided with the distribution.

	THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
	AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
	ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
	LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
	CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
	SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
	INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
	CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
	ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
	POSSIBILITY OF SUCH DAMAGE.
*/
var TouchScroll = (function(){
	//
	//	SCROLLER CONFIGURATION
	//
	var config = {
		// the minimum move distance to trigger scrolling (in pixels)
		threshold: 5,

		// minimum scroll handle size
		scrollHandleMinSize: 25,

		// flicking detection and configuration
		flicking: {
			// longest duration between last touchmove and the touchend event to trigger flicking
			triggerThreshold: 150,

			// the friction factor (per milisecond).
			// This factor is used to precalculate the flick length. Lower numbers
			// make flicks decelerate earlier.
			friction: 0.998,

			// minimum speed needed before the animation stop (px/ms)
			// This value is used to precalculate the flick length. Larger numbers
			// lead to shorter flicking lengths and durations
			minSpeed: 0.15,

			// the timing function for flicking animinations (control points for a cubic bezier curve)
			timingFunc: [0, 0.3, 0.6, 1]
		},

		// bouncing configuration
		elasticity: {
			// factor for the bounce length while dragging
			factorDrag: 0.5,

			// factor for the bounce length while flicking
			factorFlick: 0.2,

			// maximum bounce (in px) when flicking
			max: 100
		},

		// snap back configuration
		snapBack: {
			// the timing function for snap back animations (control points for a cubic bezier curve)
			// when bouncing out before, the first control point is overwritten to achieve a smooth
			// transition between bounce and snapback.
			timingFunc: [0.4, 0, 1, 1],

			// default snap back time
			defaultTime: 400,

			// whether the snap back effect always uses the default time or
			// uses the bounce out time.
			alwaysDefaultTime: true
		}
	};

	//
	//	FEATURE DETECTION
	//
	/* Determine touch events support */
	var hasTouchSupport = (function(){
		if("createTouch" in document){ // True on the iPhone
			return true;
		}
		try{
			var event = document.createEvent("TouchEvent"); // Should throw an error if not supported
			return !!event.initTouchEvent; // Check for existance of initialization method
		}catch(error){
			return false;
		}
	}());

	/*
		In some older versions of Android, WebKitCSSMatrix is broken and does
		not parse a "matrix" directive properly.
	*/
	var parsesMatrixCorrectly = (function(){
		var m = new WebKitCSSMatrix("matrix(1, 0, 0, 1, -20, -30)");
		return m.e == -20 && m.f == -30;
	}());

	//
	// FEATURE BASED CODE BRANCHING
	//

	/* Define event names */
	var events;
	if(hasTouchSupport){
		events = {
			start: "touchstart",
			move: "touchmove",
			end: "touchend",
			cancel: "touchcancel"
		};
	}else{
		events = {
			start: "mousedown",
			move: "mousemove",
			end: "mouseup",
			cancel: "touchcancel" // unnecessary here
		};
	}

	var getMatrixFromNode;
	if(parsesMatrixCorrectly){
		getMatrixFromNode = function(/*HTMLElement*/node){ /*WebKitCSSMatrix*/
			var doc = node.ownerDocument,
				transform = window.getComputedStyle(node).webkitTransform;

			return new WebKitCSSMatrix(transform);
		}
	}else{
		var reMatrix = /matrix\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*\,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/;
		getMatrixFromNode = function(/*HTMLElement*/node){ /*WebKitCSSMatrix*/
			var doc = node.ownerDocument,
				transform = window.getComputedStyle(node).webkitTransform,
				matrix = new WebKitCSSMatrix(),
				match = reMatrix.exec(transform);

			if(match){
				matrix.e = match[1];
				matrix.f = match[2];
			}

			return matrix;
		}
	}

	//
	// UTILITY FUNCTIONS
	//
	function setTransitionProperty(/*HTMLElement*/node){
		node.style.webkitTransformStyle = "preserve-3d";
		node.style.webkitTransitionProperty = "-webkit-transform";
	};

	function applyMatrixToNode(/*HTMLElement*/node,
	                           /*WebKitCSSMatrix*/matrix,
	                           /*String?*/duration,
	                           /*String?*/timingFunc){
		var s = node.style;
		if(duration != null){
			s.webkitTransitionDuration = duration + "";
		}
		if(timingFunc != null){
			s.webkitTransitionTimingFunction = timingFunc + "";
		}

		// This is twice as fast as than directly assigning the matrix
		// to the style property (maybe because no function call is involved?).
		node.style.webkitTransform = "translate(" + matrix.e + "px, " + matrix.f + "px)";
	}

	function getMatrixFromEvent(event){ /*WebKitCSSMatrix*/
		if(event.touches && event.touches.length){
			event = event.touches[0];
		}

		var matrix = new WebKitCSSMatrix;
		matrix.e = event.pageX;
		matrix.f = event.pageY;

		return matrix;
	};

	function roundMatrix(/*WebKitCSSMatrix*/matrix){ /*WebKitCSSMatrix*/
		matrix.e = Math.round(matrix.e);
		matrix.f = Math.round(matrix.f);
		return matrix;
	}

	// A DOM node to clone for scrollbars
	var scrollbarsTemplate = document.createElement("div");
	scrollbarsTemplate.innerHTML = [
		'<div class="touchScrollTrack touchScrollTrackX">',
			'<div class="touchScrollHandle"></div>',
		'</div>',
		'<div class="touchScrollTrack touchScrollTrackY">',
			'<div class="touchScrollHandle"></div>',
		'</div>'
	].join("");

/*
	=== TOUCH CONTROLLER ======================================================
	Does the actual work.

	The event handling is divided into two parts:
	The scroller constructor tracks "move", "end", and "cancel" events and
	delegates them to the currently active scroller, if any.

	Every single scroller only listens for the "start" event on its outer node,
	and sets itself as the currently active scroller.
*/

/*
	Every object with a "handleEvent" method can be registered as DOM Level 2
	event listener. On event, the method is called on the registered object.
*/
TouchScroll.handleEvent = function handleEvent(event){
	var currentScroller = TouchScroll.prototype.currentScroller;
	if(currentScroller){
		currentScroller.handleEvent(event);
	}else if(event.type === events.move){ // always cancel move events at this point
		event.preventDefault();
	}
};

/*
	Listening to end, move, and cancel event.
	Event listening takesplace during bubbling, so other scripts can cancel
	scrolling by simply stopping event propagation.
*/
document.addEventListener(events.move, TouchScroll.handleEvent, false);
document.addEventListener(events.end, TouchScroll.handleEvent, false);
document.addEventListener(events.cancel, TouchScroll.handleEvent, false);

/**
	Constructor for scrollers.

	@constructor
	@param {HTMLElement} scrollElement The node to make scrollable
	@param {Object} [options] Options for the scroller- Known options are
		elastic {Boolean} whether the scroller bounces
*/
function TouchScroll(/*HTMLElement*/scrollElement, /*Object*/options){
	options = options || {};
	this.elastic = !!options.elastic,
	this.snapToGrid = !!options.snapToGrid;

	this.containerSize = null;
	this.maxSegments = {e: 1, f: 1};
	this.currentSegment = {e: 0, f: 0};

	// references to scroll div elements
	this.scrollers = {
		container: scrollElement,
		outer: /*HTMLElement*/null,
		inner: /*HTMLElement*/null,
		e: /*HTMLElement*/null,
		f: /*HTMLElement*/null
	};

	// Whether the scroller scrolls
	this._scrolls = {e: false, f: false};

	// The minimal scroll values (fully scrolled to the bottom/right)
	// Object with attributes "e" and "f"
	this._scrollMin = {e: false, f: false};

	// References DOM nodes for scrollbar tracks and handles.
	// Gets set up by "_initDom"
	//	{
	//		container: HTMLElement,
	//		handles:{e: HTMLElement, f: HTMLElement},
	//		maxOffsets: {e: Number, f: Number}, -> maximum offsets for the handles
	//		offsetRatios: {e: Number, f: Number}, -> Ratio of scroller offset to handle offset
	//		sizes: {e: Number, f: Number}, -> handle sizes
	//		tracks: {e: HTMLElement, f: HTMLElement},
	//	}
	this._scrollbars = null,


	/* ---- SCROLLER STATE ---- */

	this._isScrolling = false;

	this._startEvent = null;

	// the current scroller offset
	this._currentOffset = new WebKitCSSMatrix();

	// Events tracked during a move action
	// [ {timeStamp: Number, matrix: WebKitCSSMatrix} ]
	// The last two events get tracked.
	this._trackedEvents = /*Array*/null;

	// Keeps track whether flicking is active
	this._flicking = {e: false, f: false};

	// Queued bounces
	this._bounces = {e: null, f: null};

	// Animation timeouts
	// This implementation uses timeouts for combined animations,
	// because the webkitTransitionEnd event fires late on iPhone 3G
	this._animationTimeouts = {e: [], f: []};

	this._initDom();
	this.setupScroller();
}

TouchScroll.prototype = {
	// references the currently active scroller
	// static property!
	currentScroller: null,

	// Maps event types to method names.
	handlerNames: {
		resize: "setupScroller",
		orientationchange: "setupScroller",
		webkitTransitionEnd: "onTransitionEnd",
		DOMSubtreeModified: "setupScroller",

		touchstart: "onTouchStart",
		mousedown: "onTouchStart",
		touchmove: "onTouchMove",
		mousemove: "onTouchMove",
		touchend: "onTouchEnd",
		mouseup: "onTouchEnd",
		touchcancel: "onTouchEnd"
	},

	// Does DOM initialization needed for the scroller
	_initDom: function initDom(){
		// wrap the scroller contents with two additional <div> elements
		var innerScroller = document.createElement("div"),
			outerScroller = innerScroller.cloneNode(false),
			parentNode = this.scrollers.container;

		innerScroller.className = "touchScrollInner";
		parentNode.className += " touchScroll";

		for(var i = 0, iMax = parentNode.childNodes.length; i < iMax; i++){
			innerScroller.appendChild(parentNode.firstChild);
		}

		outerScroller.appendChild(innerScroller);
		parentNode.appendChild(outerScroller);

		this.scrollers.outer = this.scrollers.f = outerScroller;
		this.scrollers.inner = this.scrollers.e = innerScroller;

		// init scroll layers for transitions
		setTransitionProperty(outerScroller);
		setTransitionProperty(innerScroller);

		innerScroller.style.display = "inline-block";
		innerScroller.style.minWidth = "100%";
		innerScroller.style.webkitBoxSizing = "border-box";

		// add scrollbars
		var scrollbarsNode = scrollbarsTemplate.cloneNode(true),
			trackE = scrollbarsNode.querySelector(".touchScrollTrackX"),
			trackF = scrollbarsNode.querySelector(".touchScrollTrackY"),
			handleE = trackE.firstElementChild,
			handleF = trackF.firstElementChild;


		var style = scrollbarsNode.style;
		style.pointerEvents = "none"; // make clicks/touches on scrollbars "fall through"
		style.webkitTransitionProperty = "opacity";
		style.webkitTransitionDuration = "250ms";
		style.opacity = "0";

		var scrollbars = this._scrollbars = {
			container: scrollbarsNode,
			tracks: {
				e: trackE,
				f: trackF
			},
			handles: {
				e: handleE,
				f: handleF
			},
			sizes : {e: 0, f: 0}
		}

		setTransitionProperty(handleE);
		setTransitionProperty(handleF);

		parentNode.insertBefore(scrollbarsNode, outerScroller);

		/*
			Apply relative positioning to the scrolling container.
			This is needed to enable scrollbar positioning.
		*/
		if(window.getComputedStyle(parentNode).position == "static"){
			parentNode.style.position = "relative";
		}

		this.setupScroller();

		// initialize event listeners
		parentNode.addEventListener(events.start, this, false);
		outerScroller.addEventListener("webkitTransitionEnd", this, false);
		outerScroller.addEventListener("DOMSubtreeModified", this, true);
		window.addEventListener("orientationchange", this, false);
		window.addEventListener("resize", this, false);
	},

	setupScroller: function setupScroller(debug){
		var scrollContainer = this.scrollers.outer.parentNode,
			containerSize = {
				e: scrollContainer.offsetWidth,
				f: scrollContainer.offsetHeight
			},
			innerScroller = this.scrollers.inner,
			scrollerSize = {
				e: innerScroller.offsetWidth,
				f: innerScroller.offsetHeight
			},
			scrollbars = this._scrollbars,
			scrollMin = {
				e: Math.min(containerSize.e - scrollerSize.e, 0),
				f: Math.min(containerSize.f - scrollerSize.f, 0)
			};

		this.containerSize = containerSize;
		this.maxSegments = {
			e: Math.ceil(-scrollMin.e / containerSize.e),
			f: Math.ceil(-scrollMin.f / containerSize.f)
		};

		scrollbars.container.style.height = containerSize.f + "px";

		// Minimum scroll offsets
		this._scrollMin = scrollMin;
		var scrolls = this._scrolls = {
			e: scrollMin.e < 0,
			f: scrollMin.f < 0
		};

		this._doScroll = scrolls.e || scrolls.f;

		// scrollbar container class name changes if both scrollbars are visible
		scrollbars.container.className = "touchScrollBars";
		if(scrolls.e && scrolls.f){
			scrollbars.container.className += " touchScrollBarsBoth";
		}

		// hide/show scrollbars
		scrollbars.tracks.e.style.display = scrolls.e ? "" : "none";
		scrollbars.tracks.f.style.display = scrolls.f ? "" : "none";

		var scrollbarTrackSizes = {
				e: scrollbars.tracks.e.offsetWidth,
				f: scrollbars.tracks.f.offsetHeight
			};

		// calculate and apply scroll bar handle sizes
		scrollbars.sizes = {
			e: Math.round(Math.max(
				scrollbarTrackSizes.e * containerSize.e / scrollerSize.e,
				config.scrollHandleMinSize
			)),
			f: Math.round(Math.max(
				scrollbarTrackSizes.f * containerSize.f / scrollerSize.f,
				config.scrollHandleMinSize
			))
		};
		scrollbars.handles.e.style.width = scrollbars.sizes.e + "px";
		scrollbars.handles.f.style.height = scrollbars.sizes.f + "px";

		// maximum scrollbar offsets
		scrollbars.maxOffsets = {
			e: scrollbarTrackSizes.e - scrollbars.handles.e.offsetWidth,
			f: scrollbarTrackSizes.f - scrollbars.handles.f.offsetHeight
		};

		// calculate offset ratios
		// (scroller.offset * offsetratio = scrollhandle.offset)
		scrollbars.offsetRatios = {
			e: scrolls.e ? (scrollbarTrackSizes.e - scrollbars.handles.e.offsetWidth) / scrollMin.e : 0,
			f: scrolls.f ? (scrollbarTrackSizes.f - scrollbars.handles.f.offsetHeight) / scrollMin.f : 0
		};
	},

	// Standard DOM Level 2 event handler
	handleEvent: function handleEvent(event){
		var handlerName = this.handlerNames[event.type];
		if(handlerName){
			this[handlerName](event);
		}
	},

	// Handles touch start events on the scroller
	onTouchStart: function onTouchStart(event){
		if(!this._doScroll){
			return;
		}
		this.__proto__.currentScroller = this;
		this._isScrolling = false;
		this._trackedEvents = [];
		this._determineOffset();
		this._trackEvent(event);
		this._startEventTarget = event.target; // We track this to work around a bug in android, see below
		var wasAnimating = this._stopAnimations();
		this._snapBack(null, 0);
		this._startEvent = event;

		event.stopPropagation();

		/*
			If the scroller was animating, prevent the default action of the event.
			This prevents clickable elements to be activated accidentally.

			Also, we need to cancel the touchstart event to prevent android from
			queuing up move events and fire them only when the touch ends.
		*/
		//if(wasAnimating){
			event.preventDefault();
		//}

	},

	// Handles touch move events on the scroller
	onTouchMove: function onTouchMove(event){
		if(!this._doScroll){
			return;
		}

		// must be present, because touchstart fired before
		var lastEventOffset = this._trackedEvents[1].matrix,
			scrollOffset = getMatrixFromEvent(event).translate(
				-lastEventOffset.e,
				-lastEventOffset.f,
				0
			),
			isScrolling = this._isScrolling,
			doScroll = isScrolling;

		event.stopPropagation();
		event.preventDefault();

		if(!doScroll){
			var threshold = config.threshold,
			doScroll = scrollOffset.e <= -threshold || scrollOffset.e >= threshold ||
			           scrollOffset.f <= -threshold || scrollOffset.f >= threshold;
		}

		if(doScroll){
			if(!isScrolling){
				this._isScrolling = true;
				this.showScrollbars();
			}

			this._scrollBy(scrollOffset);
			this._trackEvent(event);
		}

	},

	onTouchEnd: function onTouchEnd(event){
		var startTarget = this._startEventTarget;

		if(!this._isScrolling && startTarget == event.target){
		/*
			If no scroll has been made, the touchend event should trigger
			a focus and a click (if occurring on the same node as the
			touchstart event).
			Unfortunately, we've canceled the touchstart event to work around
			a bug in android -- so we need to dispatch our own focus and
			click events.
		*/


			var node = event.target;
			while(node.nodeType != 1){
				node = node.parentNode;
			}
			var focusEvent = document.createEvent("HTMLEvents");
			focusEvent.initEvent("focus", false, false);
			node.dispatchEvent(focusEvent);
			//node.focus();

			var clickEvent = document.createEvent("MouseEvent");
			clickEvent.initMouseEvent(
				"click", //type
				true, //canBubble
				true, //cancelable
				event.view,
				1, //detail (number of clicks for mouse events)
				event.screenX,
				event.screenY,
				event.clientX,
				event.clientY,
				event.ctrlKey,
				event.altKey,
				event.shiftKey,
				event.metaKey,
				event.button,
				null// relatedTarget
			);
			node.dispatchEvent(clickEvent);
			this.hideScrollbars();
		}else if(this._isScrolling){
			var moveSpec = this._getLastMove();
			if(moveSpec.duration <= config.flicking.triggerThreshold && moveSpec.length){
			/*
				If the time between the touchend event and the last tracked
				event is below threshold, we are triggering a flick.
			*/
				var flickDuration = this._getFlickingDuration(moveSpec.speed),
					flickLength = this._getFlickingLength(moveSpec.speed, flickDuration),
					flickVector = moveSpec.matrix,
					factor = flickLength / moveSpec.length;

				flickVector.e *= factor;
				flickVector.f *= factor;

				this.startFlick(flickVector, flickDuration);
			}
		}

		if(!(this.isAnimating())){
			if(this.snapToGrid){
				this._snapBackToGrid();
			}else{
				var snappingBack = this._snapBack();
				if(!snappingBack){
					this.hideScrollbars();
				}
			}
		}
		delete this._startEventTarget;
		this._isScrolling = false;
		this.__proto__.currentScroller = null;
	},

	onTransitionEnd: function onTransitionEnd(event){
		["e", "f"].forEach(function(axis){
			if(event.target === this.scrollers[axis]){
				this._flicking[axis] = false;
			}
		}, this);

		if(!this.isAnimating()){
			this.hideScrollbars();
		}
	},

	isAnimating: function isAnimating(){
		var timeouts = this._animationTimeouts;
		var hasTimeouts = timeouts.e.length > 0 || timeouts.f.length > 0;
		var isFlicking = this._flicking.e || this._flicking.f;
		return hasTimeouts || isFlicking;
	},

	scrollBy: function scrollBy(/*Number*/x, /*Number*/y){
		this._stopAnimations();

		var matrix = new WebKitCSSMatrix();
		matrix.e = -x;
		matrix.f = -y;
		return this._scrollBy(matrix);
	},

	scrollTo: function scrollTo(x, y){
		this._stopAnimations();

		var scrollMin = this._scrollMin;
		var m = new WebKitCSSMatrix();
		m.e = Math.min(0, Math.max(scrollMin.e, -x));
		m.f = Math.min(0, Math.max(scrollMin.f, -y));

		var currentOffset = this._currentOffset;
		m.e -= currentOffset.e;
		m.f -= currentOffset.f;

		return this._scrollBy(m);
	},

	center: function center(){
		var x = -Math.round(this._scrollMin.e/2);
		var y = -Math.round(this._scrollMin.f/2);
		return this.scrollTo(x, y);
	},

	// Scrolls the layer by applying a transform matrix to it.
	//
	// As this method is called for every touchmove event, the code is rolled
	// out for both axes (leading to redundancies) to get maximum performance.
	_scrollBy: function _scrollBy(/*WebKitCSSMatrix*/matrix){
		var scrolls = this._scrolls;
		if(!scrolls.e){
			matrix.e = 0;
		}
		if(!scrolls.f){
			matrix.f = 0;
		}

		var scrollMin = this._scrollMin,
			currentOffset = this._currentOffset,
			newOffset = currentOffset.multiply(matrix),
			isOutOfBounds = {e: false, f: false}, // whether the new position is out of the scroller bounds
			scrollbarSizeSubstract = {e: 0, f: 0};

		if(this.elastic){
			var factor = config.elasticity.factorDrag,
				wasOutOfBounds = { // whether the scroller was already beyond scroll bounds
					e: currentOffset.e < scrollMin.e || currentOffset.e > 0,
					f: currentOffset.f < scrollMin.f || currentOffset.f > 0
				};

			if(wasOutOfBounds.e){
				// if out of scroll bounds, apply the elasticity factor
				newOffset.e -= matrix.e * (1 - factor);
			}
			if(wasOutOfBounds.f){
				newOffset.f -= matrix.f * (1 - factor);
			}

			if(newOffset.e < scrollMin.e || newOffset.e > 0){
				isOutOfBounds.e = true;
				scrollbarSizeSubstract.e = newOffset.e >= 0 ?
				                           newOffset.e : scrollMin.e - newOffset.e;
			}
			if(newOffset.f < scrollMin.f || newOffset.f > 0){
				isOutOfBounds.f = true;
				scrollbarSizeSubstract.f = newOffset.f >= 0 ?
				                           newOffset.f : scrollMin.f - newOffset.f;
			}

			var crossingBounds = { // whether the drag/scroll action went across scroller bounds
					e: (!wasOutOfBounds.e || !isOutOfBounds.e) && (isOutOfBounds.e || isOutOfBounds.e),
					f: (!wasOutOfBounds.f || !isOutOfBounds.f) && (isOutOfBounds.f || isOutOfBounds.f)
				};


			if(crossingBounds.e){
				/*
					If the drag went across scroll bounds, we need to apply a
					"mixed strategy": The part of the drag outside the bounds
					is mutliplicated by the elasticity factor.
				*/
				if(currentOffset.e > 0){
					newOffset.e /= factor;
				}else if(newOffset.e > 0){
					newOffset.e *= factor;
				}else if(currentOffset.e < scrollMin.e){
					newOffset.e += (scrollMin.e - currentOffset.e) / factor;
				}else if(newOffset.e < scrollMin.e){
					newOffset.e -= (scrollMin.e - newOffset.e) * factor;
				}
			}

			if(crossingBounds.f){
				if(currentOffset.f > 0){
					newOffset.f /= factor;
				}else if(newOffset.f > 0){
					newOffset.f *= factor;
				}else if(currentOffset.f < scrollMin.f){
					newOffset.f += (scrollMin.f - currentOffset.f) / factor;
				}else if(newOffset.f < scrollMin.f){
					newOffset.f -= (scrollMin.f - newOffset.f) * factor;
				}
			}
		}else{
			// Constrain scrolling to scroller bounds
			if(newOffset.e < scrollMin.e){
				newOffset.e = scrollMin.e;
			}else if(newOffset.e > 0){
				newOffset.e = 0;
			}

			if(newOffset.f < scrollMin.f){
				newOffset.f = scrollMin.f;
			}else if(newOffset.f > 0){
				newOffset.f = 0;
			}
		}

		this._currentOffset = newOffset;

		var offsetX = newOffset.translate(0, 0, 0),
			offsetY = newOffset.translate(0, 0, 0);

		offsetX.f = offsetY.e = 0;

		applyMatrixToNode(this.scrollers.e, offsetX);
		applyMatrixToNode(this.scrollers.f, offsetY);

		// scrollbar position
		var ratios = this._scrollbars.offsetRatios;
		offsetX.e *= ratios.e;
		offsetY.f *= ratios.f;

		if(isOutOfBounds.e){
			this._squeezeScrollbar("e", scrollbarSizeSubstract.e, newOffset.e < 0);
		}else{
			applyMatrixToNode(this._scrollbars.handles.e, offsetX);
		}
		if(isOutOfBounds.f){
			this._squeezeScrollbar("f", scrollbarSizeSubstract.f, newOffset.f < 0);
		}else{
			applyMatrixToNode(this._scrollbars.handles.f, offsetY);
		}
	},

	// Tracks all properties needed for scrolling
	// We're tracking only the last two events for the moment
	_trackEvent: function _trackEvent(event){
		var trackedEvents = this._trackedEvents;
		trackedEvents[0] = trackedEvents[1];
		trackedEvents[1] = {
			matrix: getMatrixFromEvent(event),
			timeStamp: event.timeStamp
		};
	},

	showScrollbars: function showScrollbars(){
		if(this.snapToGrid){
			return;
		}
		var style = this._scrollbars.container.style;
		style.webkitTransitionDuration = "";
		style.opacity = "1";
	},

	hideScrollbars: function hideScrollbars(){
		var style = this._scrollbars.container.style;
		style.webkitTransitionDuration = "250ms";
		style.opacity = "0";
	},

	_squeezeScrollbar: function _squeezeScrollbar(axis, substract, squeezeAtEnd, duration, timingFunc){
		var scrollbars = this._scrollbars;
		var handleStyle = scrollbars.handles[axis].style;

		var defaultSize = scrollbars.sizes[axis];
		var size = Math.max(defaultSize - substract, 1);

		var matrix = new WebKitCSSMatrix();
		matrix[axis] = squeezeAtEnd ? scrollbars.maxOffsets[axis] : 0;
		matrix[axis == "f" ? "d" : "a"] = size / defaultSize;

		handleStyle.webkitTransformOrigin = squeezeAtEnd ? "100% 100%" : "0 0";
		handleStyle.webkitTransitionProperty = "-webkit-transform";
		handleStyle.webkitTransform = matrix;

		if(duration){
			handleStyle.webkitTransitionDuration = duration + "ms";
			handleStyle.webkitTransitionTimingFunction = timingFunc;
			this._animationTimeouts[axis].push(setTimeout(function(){
				handleStyle.webkitTransitionDuration = "";
			}, duration));
		}else{
			handleStyle.webkitTransitionDuration = "";
		}
	},

	_determineOffset: function _determineOffset(round){
		var offsetX = getMatrixFromNode(this.scrollers.e),
			offsetY = getMatrixFromNode(this.scrollers.f),
			currentOffset = offsetX.multiply(offsetY);

		if(round){
			roundMatrix(currentOffset);
		}

		this._currentOffset = currentOffset;
	},

	_stopAnimations: function _stopAnimations(){ /*Boolean*/
		var isAnimating = false;
		var scrollbars = this._scrollbars;
		["e", "f"].forEach(function(axis){
			this.scrollers[axis].style.webkitTransitionDuration = "";
			var handle = scrollbars.handles[axis];
			handle.style.webkitTransitionDuration = "";
			setTransitionProperty(handle);
			scrollbars.tracks[axis].style.webkitBoxPack = "";


			var timeouts = this._animationTimeouts[axis];
			isAnimating = isAnimating || timeouts.length;
			timeouts.forEach(function(timeoutId){
				clearTimeout(timeoutId);
			});
			timeouts.length = 0;
		}, this);

		// if animating, we stop animations by determining the current
		// offset (rounding its values) and then setting those values
		// to the scroller by calling "scrollBy"
		this._determineOffset(true);
		this._scrollBy(new WebKitCSSMatrix());

		// deleting queued bounces
		this._bounces.e = this._bounces.f = null;

		// resetting state
		var isFlicking = this._flicking;
		isFlicking.e = isFlicking.f = false;

		return isAnimating;
	},

	_getLastMove: function _getLastMove(){
		var trackedEvents = this._trackedEvents,
			event0 = trackedEvents[0],
			event1 = trackedEvents[1];

		if(!event0){
			return {duration: 0, matrix: new WebKitCSSMatrix(), length: 0, speed: 0};
		}

		var duration = event1.timeStamp - event0.timeStamp,
			matrix = event1.matrix.multiply(event0.matrix.inverse());

		var scrolls = this._scrolls;
		if (!scrolls.e) {
			matrix.e = 0;
		}
		if (!scrolls.f) {
			matrix.f = 0;
		}
		var length = Math.sqrt(matrix.e * matrix.e + matrix.f * matrix.f);

		return {
			duration: duration, // move duration in miliseconds
			matrix: matrix, // matrix of the move
			length: length, // length of the move in pixels
			speed: length / duration // speed of the move in miliseconds
		}
	},

	// returns flicking duration in miliseconds for a given speed
	_getFlickingDuration: function _getFlickingDuration(pixelsPerMilisecond){
		/*
			The duration is computed as follows:

			variables:
				m = minimum speed before stopping = config.flicking.minSpeed
				d = duration
				s = speed = pixelsPerMilisecond
				f = friction per milisecond = config.flicking.friction

			The minimum speed is computed as follows:
					m = s * f ^ d

				// as the minimum speed is given and we need the duration we
				// can solve the equation for d:
			<=> 	d = log(m/s) / log(f)
		*/
		var duration =	Math.log(
							config.flicking.minSpeed /
							pixelsPerMilisecond
						) /
						Math.log(config.flicking.friction);

		return duration > 0 ? Math.round(duration) : 0;
	},

	_getFlickingLength: function _getFlickingLength(initialSpeed, flickDuration){
		/*
			The amount of pixels to flick is the sum of the distance covered every
			milisecond of the flicking duration.

			Because the distance is decelerated by the friction factor, the speed
			at a given time t is:

				pixelsPerMilisecond * friction^t

			and the distance covered is:

				d = distance
				s = initial speed = pixelsPerMilisecond
				t = time = duration
				f = friction per milisecond = config.flicking.friction

				d = sum of s * f^n for n between 0 and t
			<=>	d = s * (sum of f^n for n between 0 and t)

			which is a geometric series and thus can be simplified to:
				d = s *  (1 - f^(d+1)) / (1 - f)
		*/
		var factor = (1 - Math.pow(config.flicking.friction, flickDuration + 1)) / (1 - config.flicking.friction);
		return initialSpeed * factor;
	},

	startFlick: function startFlick(matrix, duration){
		if(!(duration || this.snapToGrid)){
			this._snapBack();
			return;
		}
		duration = duration || config.snapBack.defaultTime;

		var epsilon = 1 / duration, // precision for bezier computations
			points = config.flicking.timingFunc, // control points for the animation function
			timingFunc = new CubicBezier(points[0], points[1], points[2], points[3]),
			min = this._scrollMin,
			currentOffset = this._currentOffset,
			scrollbars = this._scrollbars;

		roundMatrix(matrix);
		var scrollTarget = this._currentOffset.multiply(matrix);
		var scrolls = this._scrolls;

		if(this.snapToGrid){
			var maxSegments = this.maxSegments;
			var currentSegments = this.currentSegment;
		}

		var animating = {e: true, f: true};
		["e", "f"].forEach(function(axis){
			if(!scrolls[axis]){
				animating[axis] = false;
				return;
			}
			var distance = matrix[axis],
				target = scrollTarget[axis],
				segmentFraction = 1; // the fraction of the flick distance until crossing scroller bounds

			// compute distance fraction where flicking crosses scroller bounds
			var minOffset = min[axis];
			var maxOffset = 0;
			if(this.snapToGrid){
				var containerLength = this.containerSize[axis];
				var increment = distance > 0 ? -1 : 1;
				var maxSegment = maxSegments[axis];
				var currentSegment = currentSegments[axis];
				var flickToSegment = currentSegment + increment;
				if(flickToSegment < 0){
					flickToSegment = 0;
				}else if(maxSegment < flickToSegment){
					flickToSegment = maxSegment;
				}
				this.currentSegment[axis] = flickToSegment;

				if(flickToSegment == currentSegment || !distance){
					return this._snapBack(axis, null, -currentSegment * containerLength);
				}

				maxOffset = minOffset = -flickToSegment * containerLength;
			}

			var segmentFraction, flick, bounce;
			if(this.snapToGrid){
				flick = (distance < 0 ? minOffset : maxOffset) - currentOffset[axis];
				bounce = 0;
				segmentFraction = flick / distance;
			}else{
				if(target < minOffset){
					segmentFraction = 1 - Math.max(Math.min((target - minOffset) / matrix[axis], 1), 0);
				}else if(target > maxOffset){
					segmentFraction = 1 - Math.max(Math.min((target - maxOffset) / matrix[axis], 1), 0);
				}

				flick = segmentFraction * distance;
				bounce = distance - flick;
			}

			if(!(flick || bounce)){
				animating[axis] = this._snapBack(axis);
				return;
			}

			var t = timingFunc.getTforY(segmentFraction, epsilon);
			if (t > 1) { t = 1; } else if (t < 0) { t = 0 }

			var timeFraction = timingFunc.getPointForT(t).x,
				bezierCurves = timingFunc.divideAtT(t);

			var flickTransform =  new WebKitCSSMatrix();
			flickTransform[axis] = currentOffset[axis];

			var flickDuration = timeFraction * duration;

			if(flick && timeFraction){
				this._flicking[axis] = true;

				// animate scroller
				flickTransform[axis] += flick;
				applyMatrixToNode(this.scrollers[axis], flickTransform,
				                  flickDuration + "ms", bezierCurves[0]);

				// animate scrollbars
				var scrollbarTransform = flickTransform.translate(0, 0, 0);
				scrollbarTransform[axis] *= scrollbars.offsetRatios[axis];
				applyMatrixToNode(scrollbars.handles[axis], scrollbarTransform,
				                  flickDuration + "ms", bezierCurves[0]);

			}

			if(this.elastic && bounce){
				var bounceTransform = flickTransform.translate(0, 0, 0),
					bounceTiming = bezierCurves[1];

				// Creating a smooth transition from bounce out to snap back
				bounceTiming._p2 = {
					x: 1 - config.snapBack.timingFunc[0],
					y: 1 - config.snapBack.timingFunc[1]
				};

				// limit the bounce to the configured maximum
				var bounceFactor = Math.min(
					config.elasticity.factorFlick,
					config.elasticity.max / Math.abs(bounce)
				);

				bounceTransform[axis] += bounce * bounceFactor;
				var bounceDuration = (1 - timeFraction) * duration * bounceFactor;
				this._bounces[axis] = {
					timingFunc: bounceTiming,
					duration: bounceDuration + "ms",
					matrix: bounceTransform,
					bounceLength: Math.abs(bounce * bounceFactor)
				};

				// play queued animations with timeouts, because
				// the webkitTransitionEnd event fires late on iPhone 3G
				var that = this;
				var timeouts = this._animationTimeouts[axis];
				var handle = this._sc

				timeouts.push(setTimeout(function(){
					that._playQueuedBounce(axis);
				}, flickDuration));

				timeouts.push(setTimeout(function(){
					var duration = config.snapBack.alwaysDefaultTime ? null : bounceDuration;
					that._snapBack(axis, duration);
					timeouts.length = 0; // clear timeouts
				}, flickDuration + bounceDuration));
			}
		}, this);

		if(!(animating.e || animating.f)){
			this.hideScrollbars();
		}
	},

	_playQueuedBounce: function _playQueuedBounce(axis){
		var bounce = this._bounces[axis];

		if(bounce){
			var scroller = this.scrollers[axis],
				that = this,
				matrix = bounce.matrix,
				duration = bounce.duration,
				timingFunc = bounce.timingFunc;

			applyMatrixToNode(scroller, matrix, duration, timingFunc);

			// bounce scrollbar handle
			this._squeezeScrollbar(axis, bounce.bounceLength, matrix[axis] < 0, duration, timingFunc);

			this._bounces[axis] = null;
			return true;
		}

		return false;
	},

	_snapBack: function _snapBack(/*String?*/axis, /*Number?*/duration, /*Number?*/target){ /*Boolean*/
		duration = duration != null ? duration : config.snapBack.defaultTime;
		if(axis == null){
			var snapBackE = this._snapBack("e", duration);
			var snapBackF = this._snapBack("f", duration);
			var snappingBack = snapBackE || snapBackF;
			if(!snappingBack){
				this.hideScrollbars();
			}else{
				var scroller = this;
				this._animationTimeouts.f.push(setTimeout(function(){
					scroller.hideScrollbars();
				}, duration));
			}
			return snappingBack;
		}

		var scroller = this.scrollers[axis],
			offset = getMatrixFromNode(scroller),
			cp = config.snapBack.timingFunc, // control points
			timingFunc = new CubicBezier(cp[0], cp[1], cp[2], cp[3]);

		if(target != null || offset[axis] < this._scrollMin[axis] || offset[axis] > 0){
			offset[axis] = target != null ? target : Math.max(Math.min(offset[axis], 0), this._scrollMin[axis]);
			this._squeezeScrollbar(axis, 0, offset[axis] < 0, duration, timingFunc);
			applyMatrixToNode(scroller, offset, duration + "ms", timingFunc);

			return Boolean(duration);
		}

		return false;
	},

	_snapBackToGrid: function snapBackToGrid(){
		var currentOffset = this._currentOffset;
		var containerSize = this.containerSize;
		["e", "f"].forEach(function(axis){
			var axisOffset = currentOffset[axis];
			var containerLength = containerSize[axis];
			var currentSegment = -Math.floor((axisOffset + 0.5 * containerLength )/containerLength);
			var maxSegment = this.maxSegments[axis];
			if(currentSegment < 0){
				currentSegment = 0;
			}else if(maxSegment < currentSegment){
				currentSegment = maxSegment;
			}
			this.currentSegment[axis] = currentSegment;
			return this._snapBack(axis, null, -currentSegment * containerLength);
		}, this);
	}
};

return TouchScroll;
}());
