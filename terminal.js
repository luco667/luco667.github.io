/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Flux normal — pousse le contenu, ne bouge pas la fenêtre
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

function buildText(partial) {
  let text = '';
  for (let i = 0; i < lineIdx; i++) {
    text += LINES[i] + '\n';
  }
  text += partial;
  return text;
}

function type() {
  if (lineIdx >= LINES.length) {
    const span = document.createElement('span');
    span.className = 'cursor';
    output.appendChild(span);

    // Animation terminée → on rétablit le comportement de scroll normal
    document.documentElement.style.scrollBehavior = '';
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

// Juste avant de démarrer l'animation → on désactive le smooth-scroll
setTimeout(() => {
  document.documentElement.style.scrollBehavior = 'auto';
  type();
}, 600);
