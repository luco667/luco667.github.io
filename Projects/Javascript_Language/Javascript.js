/* ═══════════════════════════════════════════
   MATRIX RAIN
═══════════════════════════════════════════ */

const matrix = document.getElementById("matrix");
const ctx    = matrix.getContext("2d");

const CHARS = "スシシャリノリサーモンマグロエビアボカドキュウリワサビショウユガリマキギリタテ1234567890><{}[]|/\\\\";

let cols, drops, fontSize;

function initMatrix() {
  fontSize      = 14;
  matrix.width  = window.innerWidth;
  matrix.height = window.innerHeight;
  cols          = Math.floor(matrix.width / fontSize);
  drops         = Array.from({ length: cols }, () => Math.random() * -100);
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, matrix.width, matrix.height);
  ctx.font = `${fontSize}px "Minecraft", monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const y    = drops[i] * fontSize;

    if (y > 0 && y < matrix.height) {
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

    if (y > matrix.height && Math.random() > 0.975) drops[i] = 0;
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
    name: "Snake",
    desc: "Classic Snake game in Javascript.",
    tags: ["Javascript", "Game"],
    preview: { type: "iframe", src: "https://luco667.github.io/Projects/snake/enregistrement/snake.html" },
    link: "https://luco667.github.io/Projects/snake/enregistrement/snake.html",
    date: "2023"
  },
  {
    name: "Portfolio",
    desc: "Portfolio on github",
    tags: ["HTML", "CSS", "Javascript"],
    preview: { type: "iframe", src: "https://luco667.github.io" },
    link: "https://luco667.github.io",
    date: "2026"
  }
];

const grid = document.querySelector(".projects-grid");

PROJECTS.forEach(project => {

    const card = document.createElement("div");
    card.className = "project-card";

    const previewHTML = project.preview.type === "iframe"
        ? `<iframe
               class="project-preview"
               src="${project.preview.src}"
               loading="lazy"
               title="${project.name} live preview">
           </iframe>`
        : `<canvas
               class="project-preview"
               id="${project.preview.id}">
           </canvas>`;

    card.innerHTML = `
       ${previewHTML}

       <div class="project-content">

           <div class="project-header">
               <h4>${project.name}</h4>
               <span class="project-date">${project.date}</span>
           </div>

           <p>${project.desc}</p>

           <div class="project-tags">
               ${project.tags.map(tag =>
                   `<span>${tag}</span>`
               ).join("")}
           </div>

           <a href="${project.link}">
               Open Project →
           </a>

       </div>
   `;

    grid.appendChild(card);
});

// Seules les previews "canvas" (animations JS pures) ont besoin d'une init.
// Les previews "iframe" se chargent et tournent toutes seules.
PROJECTS
    .filter(project => project.preview.type === "canvas")
    .forEach(project => initPreview(project.preview.id));