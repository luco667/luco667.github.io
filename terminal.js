/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Scroll figé pendant toute l'animation
══════════════════════════════════════════ */
/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   Hauteur réservée à l'avance → page 100% stable
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

// ── ÉTAPE CLÉ : on mesure la hauteur finale AVANT de lancer l'animation ──
function lockFinalHeight() {
  const fullText = LINES.join('\n');

  // Clone invisible pour mesurer sans affecter la mise en page
  const clone = output.cloneNode(false);
  clone.textContent = fullText;
  clone.style.visibility = 'hidden';
  clone.style.position = 'absolute';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.width = output.getBoundingClientRect().width + 'px';
  clone.style.height = 'auto';
  clone.style.pointerEvents = 'none';

  document.body.appendChild(clone);
  const finalHeight = clone.scrollHeight;
  document.body.removeChild(clone);

  // On fixe cette hauteur dès maintenant : la carte ne grandira plus jamais
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

// On verrouille la hauteur AVANT de lancer le typewriter
lockFinalHeight();
setTimeout(type, 600);

// Recalcule si l'utilisateur tourne son téléphone / redimensionne
window.addEventListener('resize', () => {
  // Optionnel : relance lockFinalHeight() si tu veux que ça reste précis après rotation
});
