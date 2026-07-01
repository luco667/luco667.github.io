/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Scroll figé pendant toute l'animation
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

// Position de scroll à conserver
const lockX = window.scrollX;
const lockY = window.scrollY;

function buildText(partial) {
  let text = '';

  for (let i = 0; i < lineIdx; i++) {
    text += LINES[i] + '\n';
  }

  text += partial;
  return text;
}

function updateOutput(text) {
  output.textContent = text;

  // Empêche Safari/iPhone de déplacer la page
  requestAnimationFrame(() => {
    window.scrollTo(lockX, lockY);
  });
}

function type() {

  if (lineIdx >= LINES.length) {
    const span = document.createElement('span');
    span.className = 'cursor';
    output.appendChild(span);
    return;
  }

  const target = LINES[lineIdx];

  if (charIdx < target.length) {

    updateOutput(
      buildText(target.slice(0, charIdx + 1))
    );

    charIdx++;

    setTimeout(type, Math.random() * 35 + 18);

  } else {

    updateOutput(
      buildText(target)
    );

    lineIdx++;
    charIdx = 0;

    setTimeout(type, 110);
  }
}

setTimeout(type, 600);
