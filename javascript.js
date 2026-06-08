function lockScroll() {
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
}

lockScroll();




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
  " ",
  "> status     : Open to opportunities",
  "> interests  : design, web security, reverse engineering, continuous learning",
  "> education  : Baccalaureate in Science and Technology of Industry and Sustainable Development, and studies in Optical Eyewear BTS and BTS CIEL Option B (Electronics and Networks).",
  "> hobbies    : nature, art, literature, cinema, music, animation, science",
  " ",
  "> system ready_",
];

const output = document.getElementById("terminal-output");
let lineIdx  = 0, charIdx = 0;

function typeLine() {
  if (lineIdx >= LINES.length) return;

  const line   = document.createElement("div");
  line.className = "line";

  const text   = document.createElement("span");
  const cursor = document.createElement("span");
  cursor.className = "cursor";

  line.appendChild(text);
  line.appendChild(cursor);
  output.appendChild(line);

  const current = LINES[lineIdx];

  function typeChar() {
    if (charIdx < current.length) {
      text.textContent += current.charAt(charIdx++);
      setTimeout(typeChar, Math.random() * 35 + 18);
    } else {
      cursor.remove();
      lineIdx++;
      charIdx = 0;
      setTimeout(typeLine, 110);
    }
  }

  typeChar();
}

setTimeout(typeLine, 600);

/* ═══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════════════════ */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => { if (scrollY >= sec.offsetTop - 140) current = sec.id; });
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
      { name: "Snake game", desc: "Web page with game in javascript", tags: ["javascript", "web", "html", "css"], link: "Projects/snake/enregistrement/snake.html", status: "done", date: "2023" },
      { name: "Notepad", desc: "Note-blocks in C.", tags: ["C", "SDL3", "MinGW"], link: "https://github.com/luco667/LANGUAGEC", status: "done", date: "2024" },
      { name: "Portfolio", desc: "This page — matrix portfolio in pur HTML/CSS/JS.", tags: ["html", "css", "js", "canvas", "static"], link: "https://luco667.github.io/", status: "wip", date: "2026" },
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
