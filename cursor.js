/* ═══════════════════════════════════════════
   CURSOR COLOR CHANGER
═══════════════════════════════════════════ */

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

// Curseurs par défaut
const whiteCursor = createCursorPNG('#ffffff');
const greenCursor = createCursorPNG('#00ff41');

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
  
  if (computedCursor === 'grab' || computedCursor === 'pointer') {
    e.target.style.cursor = `url('${greenCursor}') 16 16, auto`;
  }
}, true);

/* ═══════════════════════════════════════════
   PROJECTS COLOR CURSOR
═══════════════════════════════════════════ */

// Après que les projets sont rendus
setTimeout(() => {
  document.querySelectorAll('.cat-card').forEach(card => {
    const catColor = card.style.getPropertyValue('--cat-color').trim();
    const catCursor = createCursorPNG(catColor);

    card.addEventListener('mouseenter', () => {
      card.style.cursor = `url('${catCursor}') 16 16, auto`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.cursor = `url('${whiteCursor}') 16 16, auto`;
    });
  });
}, 100); // Petit délai pour laisser le temps aux projets de se charger