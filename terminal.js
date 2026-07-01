/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Zéro layout shift + zéro scroll jump iOS
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

const output = document.getElementById('terminal-output');

let lineIdx = 0;
let charIdx = 0;

// ──────────────────────────────────────────
// LOCK HEIGHT (une seule fois)
// ──────────────────────────────────────────
function lockHeight() {
  const probe = document.createElement("div");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "pre-wrap";
  probe.style.width = output.clientWidth + "px";
  probe.style.font = getComputedStyle(output).font;

  probe.textContent = LINES.join("\n");

  document.body.appendChild(probe);
  output.style.height = probe.getBoundingClientRect().height + "px";
  document.body.removeChild(probe);
}

// ──────────────────────────────────────────
// DOM LINE SYSTEM (important)
// ──────────────────────────────────────────
let currentLine = document.createElement("div");
output.appendChild(currentLine);

function type() {
  if (lineIdx >= LINES.length) {
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    output.appendChild(cursor);
    return;
  }

  const target = LINES[lineIdx];

  if (charIdx < target.length) {
    currentLine.textContent = target.slice(0, charIdx + 1);
    charIdx++;
    setTimeout(type, Math.random() * 35 + 18);
  } else {
    currentLine.textContent = target;

    lineIdx++;
    charIdx = 0;

    currentLine = document.createElement("div");
    output.appendChild(currentLine);

    setTimeout(type, 110);
  }
}

// ──────────────────────────────────────────
// START
// ──────────────────────────────────────────
lockHeight();
setTimeout(type, 600);