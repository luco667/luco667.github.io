
/* ═══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
═══════════════════════════════════════════ */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - sec.offsetHeight / 3) {
      current = sec.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}, { passive: true });

/* ═══════════════════════════════════════════
   Cursor PNG
═══════════════════════════════════════════ 
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

const whiteCursor = createCursorPNG('#ffffff');
const greenCursor = createCursorPNG('#00ff41');
const greenDimCursor = createCursorPNG('#00791e');

// Body et li en blanc
document.querySelectorAll('body, li').forEach(el => {
  el.style.cursor = `url('${whiteCursor}') 16 16, auto`;
});

// A et button en vert
document.querySelectorAll('a, button').forEach(el => {
  el.style.cursor = `url('${greenCursor}') 16 16, auto`;
});

// IMPORTANT: Remplace les curseurs "grab" et "pointer" EN TEMPS RÉEL
document.addEventListener('mouseover', (e) => {
  const computedCursor = window.getComputedStyle(e.target).cursor;
  
  // Si c'est "grab" ou "pointer", remplace par la croix verte
  if (computedCursor === 'grab' || computedCursor === 'pointer') {
    e.target.style.cursor = `url('${greenDimCursor}') 16 16, auto`;
  }
}, true); // true = capture phase pour attraper tous les éléments

// Même chose pour mouseenter (au cas où)
document.addEventListener('mouseenter', (e) => {
  const computedCursor = window.getComputedStyle(e.target).cursor;
  
  if (computedCursor === 'grab' || computedCursor === 'pointer') {
    e.target.style.cursor = `url('${greenDimCursor}') 16 16, auto`;
  }
}, true);
/* ═══════════════════════════════════════════ TERMINAL TYPEWRITER (querySelector version) ═══════════════════════════════════════════ 
const output = document.getElementById("terminal-output");

function addLine(text) {
  const div = document.createElement("div");
  div.className = "line";
  div.textContent = text;
  output.appendChild(div);
}

/* Python code 
const pythonCode = `
lines = [
"> initializing profile...",
"",
"> status : Open to opportunities",
"> interests : design, web security, reverse engineering",
"> education : BTS CIEL Option B",
"",
"> system ready_"
]

"\\n".join(lines)
`;

async function runPython() {
  const pyodide = await loadPyodide();

  const result = await pyodide.runPythonAsync(pythonCode);

  const lines = result.split("\n");

  for (const line of lines) {
    addLine(line);
  }
}

runPython();
*/