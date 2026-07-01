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
const aboutSection = document.getElementById('about'); // parent réel dans le HTML
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

// ── Mesure la hauteur finale AVANT de lancer l'animation ──
function lockFinalHeight() {
  const fullText = LINES.join('\n');

  const clone = output.cloneNode(false); // garde class="card", id retiré ci-dessous
  clone.removeAttribute('id');
  clone.textContent = fullText;

  // Positionné dans le MÊME parent, pour hériter width/max-width de la section
  clone.style.visibility = 'hidden';
  clone.style.position = 'absolute';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.width = output.getBoundingClientRect().width + 'px';
  clone.style.minHeight = '0';
  clone.style.pointerEvents = 'none';

  aboutSection.style.position = aboutSection.style.position || 'relative';
  aboutSection.appendChild(clone);

  const finalHeight = clone.getBoundingClientRect().height;
  aboutSection.removeChild(clone);

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

lockFinalHeight();
setTimeout(type, 600);

// Recalcule si l'utilisateur tourne l'écran (largeur change → hauteur du texte change)
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (lineIdx < LINES.length) lockFinalHeight(); // seulement si l'anim n'est pas finie
  }, 150);
});
