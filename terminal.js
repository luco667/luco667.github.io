/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   BUG CORRIGÉ : textContent écrasait le DOM
   → on utilise un tableau de lignes validées
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
let lineIdx = 0, charIdx = 0;

function buildText(partial) {
  let text = '';
  for (let i = 0; i < lineIdx; i++) text += LINES[i] + '\n';
  text += partial;
  return text;
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