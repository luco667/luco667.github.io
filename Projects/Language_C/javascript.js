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
   PROJECTS DATABASE
═══════════════════════════════════════════ */

const PROJECTS = [
{
    name: "PixelNote",
    desc: "Modern notepad written in C with SDL3.",
    tags: ["C", "SDL3", "MinGW"],
    image: "Pixelnote/index.html",
    link: "Pixelnote/index.html",
    status: "done",
    date: "2024"
},
{
    name: "Snake",
    desc: "Classic Snake game written in C.",
    tags: ["C", "Game"],
    image: "assets/snake.webp",
    link: "/Projects/snake/enregistrement/snake.html",
    status: "done",
    date: "2024"
}
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

const grid = document.createElement("div");
grid.className = "projects-grid";

PROJECTS.forEach(project => {

    const card = document.createElement("div");
    card.className = "project-card";

    card.innerHTML = `
        <img
            class="project-preview"
            src="${project.image}"
            alt="${project.name}"
            loading="lazy"
        >

        <div class="project-content">

            <div class="project-header">
                <h3>${project.name}</h3>
                <span class="project-date">${project.date}</span>
            </div>

            <p>${project.desc}</p>

            <div class="project-tags">
                ${project.tags.map(tag =>
                    `<span>${tag}</span>`
                ).join("")}
            </div>

            <a href="${project.link}" target="_blank">
                Open Project →
            </a>

        </div>
    `;

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

