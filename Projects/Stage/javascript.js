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
   PDF.JS
═══════════════════════════════════════════ */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function renderPDF() {

  const container = document.getElementById("pdf-container");

  const pdf = await pdfjsLib
    .getDocument("../Stage/stageDSI.pdf")
    .promise;

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 1 });

    const scale =
      container.clientWidth / viewport.width;

    const scaledViewport =
      page.getViewport({ scale });

    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");

    canvas.width =
      scaledViewport.width;

    canvas.height =
      scaledViewport.height;

    container.appendChild(canvas);

    await page.render({
      canvasContext: ctx,
      viewport: scaledViewport
    }).promise;
  }
}

renderPDF();
