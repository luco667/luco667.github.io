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
    desc: "Classic Snake game written in C.",
    tags: ["C", "Game"],
    preview: { type: "canvas", src: "https://luco667.github.io/Projects/snake/enregistrement/snake.html" },
    link: "https://luco667.github.io/Projects/snake/enregistrement/snake.html",
    date: "2024"
  },
  {
    name: "NetGraph",
    desc: "Network visualization tool.",
    tags: ["C", "Networking"],
    preview: { type: "canvas", id: "network-preview" },
    link: "#",
    date: "2025"
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

function initPreview(canvasId) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 220;

    /* =========================
       NETWORK
    ========================= */

    if (canvasId === "network-preview") {

        const nodes = [];

        for (let i = 0; i < 15; i++) {

            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: (Math.random() - .5) * 1.5,
                dy: (Math.random() - .5) * 1.5
            });
        }

        function animate() {

            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "rgba(0,255,65,.25)";

            for (let i = 0; i < nodes.length; i++) {

                const a = nodes[i];

                a.x += a.dx;
                a.y += a.dy;

                if (a.x < 0 || a.x > canvas.width) a.dx *= -1;
                if (a.y < 0 || a.y > canvas.height) a.dy *= -1;

                for (let j = i + 1; j < nodes.length; j++) {

                    const b = nodes[j];

                    const dist = Math.hypot(
                        a.x - b.x,
                        a.y - b.y
                    );

                    if (dist < 100) {

                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }

                ctx.fillStyle = "#00ff41";
                ctx.beginPath();
                ctx.arc(a.x, a.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(animate);
        }

        animate();
    }
}
