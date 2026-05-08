// ── MATRIX RAIN ──────────────────────────────────────────────
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF><{}[]|/\\';

let cols, drops, fontSize;

function initMatrix() {
  fontSize = 14;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / fontSize);
  drops = Array.from({ length: cols }, () => Math.random() * -100);
}

function drawMatrix() {
  // Fade trail
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const y = drops[i] * fontSize;

    // Head glyph — bright white-green
    if (drops[i] * fontSize > 0 && drops[i] * fontSize < canvas.height) {
      ctx.fillStyle = '#ccffcc';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = '#00ff41';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur = 4;
    }

    ctx.font = `${fontSize}px "Share Tech Mono", monospace`;
    ctx.fillText(char, i * fontSize, y);

    // Reset shadow for performance
    ctx.shadowBlur = 0;

    // Reset drop when off screen
    if (y > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i] += 0.5;
  }
}

initMatrix();
window.addEventListener('resize', initMatrix);
setInterval(drawMatrix, 40);


// ── TERMINAL TYPEWRITER ──────────────────────────────────────
const lines = [
  '> initializing profile... ',
  '> name      : Lucas Le Gueut ',
  '> status    : étudiant en cybersécurité & électronique ',
  '> location  : France ',
  '> interests : offensive security, embedded systems, networks ',
  '> current   : IUT GEII + CTF player ',
  ' ',
  '> system ready_ ',
];

const output = document.getElementById('terminal-output');
let lineIndex = 0;
let charIndex = 0;
let currentLine = '';

function type() {
  if (lineIndex >= lines.length) {
    // Blinking cursor at end
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    output.appendChild(cursor);
    return;
  }

  const target = lines[lineIndex];

  if (charIndex < target.length) {
    currentLine += target[charIndex];
    // Re-render current content
    output.textContent = getPreviousLines();
    charIndex++;
    setTimeout(type, Math.random() * 40 + 20);
  } else {
    // Line done
    lineIndex++;
    charIndex = 0;
    currentLine = '';
    output.textContent = getPreviousLines();
    setTimeout(type, 120);
  }
}

function getPreviousLines() {
  let text = ' ';
  for (let i = 0; i < lineIndex; i++) {
    text += lines[i] + '\n';
  }
  text += currentLine;
  return text;
}
/* =========================================
   ACTIVE NAV LINK ON SCROLL
========================================= */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 140;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop) {
            current = section.getAttribute("id");
        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === `#${current}`) {
            link.classList.add("active");
        }

    });

});
// Start typewriter after short delay
setTimeout(type, 600);
