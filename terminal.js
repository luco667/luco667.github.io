/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Body figé pendant l'animation
══════════════════════════════════════════ */

const LINES = [
  '> initializing profile...',
  '> first name : Lucas',
  '> surname    : Le Gueut',
  '> status     : cybersecurity & electronics student',
  '> location   : France',
  '> interests  : design, networks, offensive security, embedded systems, reverse engineering',
  '> education  : French National Brevet · STI2D Graduate · BTS CIEL Option B Student · Cisco Student',
  '> activities : PCB design · programming · web development · networking · electronics studies · CTF player',
  '> system ready_',
];

const output = document.getElementById("terminal-output");

let lineIdx = 0;
let charIdx = 0;

// Sauvegarde de la position actuelle
const scrollY = window.scrollY;

// Fige complètement la page
document.body.style.position = "fixed";
document.body.style.top = `-${scrollY}px`;
document.body.style.left = "0";
document.body.style.right = "0";
document.body.style.width = "100%";

function buildText(partial) {
  let text = "";

  for (let i = 0; i < lineIdx; i++) {
    text += LINES[i] + "\n";
  }

  text += partial;
  return text;
}

function type() {
  if (lineIdx >= LINES.length) {

    const span = document.createElement("span");
    span.className = "cursor";
    output.appendChild(span);

    // Défige la page
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollY);

    return;
  }

  const target = LINES[lineIdx];

  if (charIdx < target.length) {

    output.textContent = buildText(target.slice(0, charIdx + 1));
    charIdx++;

    setTimeout(type, Math.random() * 35 + 18);

  } else {

    output.textContent = buildText(target);

    lineIdx++;
    charIdx = 0;

    setTimeout(type, 110);
  }
}

setTimeout(type, 600);