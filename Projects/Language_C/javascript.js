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
    tags: ["C","SDL3","MinGW"],
    canvasId: "pixelnote-preview",
    link: "http://luco667.io/Projects/Pixelnote/index.html",
    date: "2024"
},
{
    name: "Snake",
    desc: "Classic Snake game written in C.",
    tags: ["C","Game"],
    canvasId: "snake-preview",
    link: "http://luco667.io/Projects/snake/enregistrement/snake.html",
    date: "2024"
},
{
    name: "NetGraph",
    desc: "Network visualization tool.",
    tags: ["C","Networking"],
    canvasId: "network-preview",
    link: "#",
    date: "2025"
}
];
const grid = document.querySelector(".projects-grid");

PROJECTS.forEach(project => {

    const card = document.createElement("div");

    card.className = "project-card";

      card.innerHTML = `
       <canvas
           class="project-preview"
           id="${project.canvasId}">
       </canvas>
   
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
function initPreview(canvasId) {

    const canvas = document.getElementById(canvasId);

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = 400;
    canvas.height = 220;

    /* =========================
       SNAKE
    ========================= */

    if (canvasId === "snake-preview") {

        let x = 0;

        function animate() {

            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#00ff41";
            ctx.fillRect(x, 100, 20, 20);

            x += 2;

            if (x > canvas.width)
                x = -20;

            requestAnimationFrame(animate);
        }

        animate();
    }

    /* =========================
       PIXELNOTE
    ========================= */

    if (canvasId === "pixelnote-preview") {

        let cursor = true;

        setInterval(() => {

            ctx.fillStyle = "#050505";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#00ff41";
            ctx.strokeRect(20, 20, 360, 180);

            ctx.fillStyle = "#00ff41";
            ctx.font = "16px monospace";

            ctx.fillText("PixelNote", 35, 50);
            ctx.fillText("> Notes.txt", 35, 90);

            if (cursor)
                ctx.fillRect(145, 77, 10, 18);

            cursor = !cursor;

        }, 500);
    }

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

PROJECTS.forEach(project => {
    initPreview(project.canvasId);
});
