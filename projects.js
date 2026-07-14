/* ═══════════════════════════════════════════
   CURSOR PNG HELPER
═══════════════════════════════════════════ */
function createCursorPNG(color, size = 32) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const center = size / 2;
  const offset = size / 6;

  ctx.beginPath();
  ctx.moveTo(center, offset);
  ctx.lineTo(center, size - offset);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(offset, center);
  ctx.lineTo(size - offset, center);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}

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
        name: "Curriculum Vitae",
        desc: "",
        tags: ["CV"],
        link: "Projects/Curriculum_Vitae/Cv.html",
        status: "done",
        date: "2026"
      },
      {
        name: "French BTS Internship",
        desc: "DIS SARP VEOLIA",
        tags: ["Intern"],
        link: "Projects/Stage/DSISARP.html",
        status: "done",
        date: "2024"
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

  const whiteCursor = createCursorPNG('#ffffff');

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

    // ✨ Curseur change de couleur avec la catégorie
    const catCursor = createCursorPNG(cat.color);
    document.body.style.cursor = `url('${catCursor}') 16 16, auto`;

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

    // ✨ Curseur revient à blanc en fermant
    document.body.style.cursor = `url('${whiteCursor}') 16 16, auto`;
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