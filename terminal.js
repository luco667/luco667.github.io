/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Scroll figé (iOS safe) + animation stable
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

// ──────────────────────────────────────────
// freeze scroll
// ──────────────────────────────────────────
const scrollY = window.scrollY;

document.documentElement.style.overflow = "hidden";
document.body.style.position = "fixed";
document.body.style.top = `-${scrollY}px`;
document.body.style.width = "100%";

function unfreezeScroll() {
  document.documentElement.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";

  window.scrollTo(0, scrollY);
}

// ──────────────────────────────────────────
// build text
// ──────────────────────────────────────────
function buildText(partial) {
  let text = "";

  for (let i = 0; i < lineIdx; i++) {
    text += LINES[i] + "\n";
  }

  text += partial;
  return text;
}

// ──────────────────────────────────────────
// update safe
// ──────────────────────────────────────────
function render(text) {
  output.textContent = text;
}

// ──────────────────────────────────────────
// typewriter
// ──────────────────────────────────────────
function type() {
  if (lineIdx >= LINES.length) {
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    output.appendChild(cursor);

    unfreezeScroll();
    return;
  }

  const target = LINES[lineIdx];

  if (charIdx < target.length) {
    render(buildText(target.slice(0, charIdx + 1)));
    charIdx++;

    setTimeout(type, Math.random() * 35 + 18);
  } else {
    render(buildText(target));

    lineIdx++;
    charIdx = 0;

    setTimeout(type, 110);
  }
}

setTimeout(type, 600);