/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Hauteur réservée à l'avance → aucun layout shift, même sur iOS
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

// Mesure la hauteur finale AVANT toute animation, et la fige immédiatement
function lockFinalHeight() {
  const fullText = LINES.join('\n');

  const clone = output.cloneNode(false);
  clone.removeAttribute('id');
  clone.textContent = fullText;
  clone.style.visibility = 'hidden';
  clone.style.position = 'absolute';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.width = output.getBoundingClientRect().width + 'px';
  clone.style.height = 'auto';
  clone.style.minHeight = '0';
  clone.style.pointerEvents = 'none';

  output.parentElement.appendChild(clone);
  const finalHeight = clone.getBoundingClientRect().height;
  output.parentElement.removeChild(clone);

  // Hauteur figée AVANT que le texte ne commence à s'afficher
  output.style.minHeight = finalHeight + 'px';
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

// On verrouille la hauteur avant même de commencer à écrire
lockFinalHeight();
setTimeout(type, 600);
