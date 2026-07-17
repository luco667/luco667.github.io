/* ═══════════════════════════════════════════
   MATRIX RAIN
═══════════════════════════════════════════ */

const canvas = document.getElementById("matrix");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const CHARS = "スシシャリノリサーモンマグロエビアボカドキュウリワサビショウユガリマキギリタテ1234567890><{}[]|/\\\\";

  let cols, drops, fontSize;

  function initMatrix() {
    fontSize = 14;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.floor(canvas.width / fontSize);
    drops = Array.from({ length: cols }, () => Math.random() * -100);
  }

  function drawMatrix() {
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontSize}px "Minecraft", monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const y = drops[i] * fontSize;

      if (y > 0 && y < canvas.height) {
        ctx.fillStyle = "#ccffcc";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = "#00ff41";
        ctx.shadowColor = "#00ff41";
        ctx.shadowBlur = 4;
      }

      ctx.fillText(char, i * fontSize, y);
      ctx.shadowBlur = 0;

      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i] += 0.5;
    }
  }

  initMatrix();
  window.addEventListener("resize", initMatrix);
  setInterval(drawMatrix, 40);
}

/* ═══════════════════════════════════════════
   WORK EXPERIENCE — SCROLL INFINI
═══════════════════════════════════════════ */

const track = document.querySelector(".work-track");

if (track) {
  let x = 0, isDown = false, startX = 0;
  const speed = 0.6;
  let loopWidth = track.scrollWidth / 2;

  track.addEventListener("mousedown", e => {
    isDown = true;
    startX = e.clientX - x;
    track.style.cursor = "grabbing";
  });

  window.addEventListener("mousemove", e => {
    if (!isDown) return;
    x = e.clientX - startX;
    normalizeLoop();
    track.style.transform = `translateX(${x}px)`;
  });

  window.addEventListener("mouseup", stopDrag);

  track.addEventListener("touchstart", e => {
    isDown = true;
    startX = e.touches[0].clientX - x;
  }, { passive: false });

  window.addEventListener("touchmove", e => {
    if (!isDown) return;
    e.preventDefault();
    x = e.touches[0].clientX - startX;
    normalizeLoop();
    track.style.transform = `translateX(${x}px)`;
  }, { passive: false });

  window.addEventListener("touchend", stopDrag);

  function stopDrag() {
    isDown = false;
    track.style.cursor = "grab";
  }

  function normalizeLoop() {
    if (x <= -loopWidth) {
      x += loopWidth;
    }
    if (x >= 0) {
      x -= loopWidth;
    }
  }

  function animate() {
    if (!isDown) {
      x -= speed;
      normalizeLoop();
      track.style.transform = `translateX(${x}px)`;
    }
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", () => {
    loopWidth = track.scrollWidth / 2;
  });
  animate();
}

/* ═══════════════════════════════════════════
   NAV SCROLL — offset dynamique vers les ancres
   + active nav on scroll
   + synchronisation --nav-height avec le CSS
═══════════════════════════════════════════ */

const nav = document.querySelector("nav");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");
let selectedTimer;

/* Marge supplémentaire ajoutée en plus de la hauteur de la navbar,
   pour ne pas coller le titre de la section pile sous le bandeau.
   → change juste cette valeur pour ajuster la distance globale.
   (Doit rester cohérente avec le "+ 20px" du calc() dans le CSS,
   voir --nav-height / scroll-margin-top sur `section`.) */
const SCROLL_EXTRA_OFFSET = 15;

function getScrollOffset() {
  return nav.offsetHeight - SCROLL_EXTRA_OFFSET;
}

/* ─────────────────────────────────────────
   Publie la vraie hauteur de la navbar en CSS,
   pour que `scroll-margin-top: calc(var(--nav-height) + 20px)`
   (dans le CSS des sections) reste toujours juste — y compris quand
   la navbar change de taille (retour à la ligne des liens sur mobile,
   rotation d'écran, chargement d'une font qui décale le texte, etc.)
───────────────────────────────────────── */
function syncNavHeight() {
  document.documentElement.style.setProperty("--nav-height", `${nav.offsetHeight}px`);
}

syncNavHeight();

if ("ResizeObserver" in window) {
  // Détecte tout changement de hauteur de la navbar, pas seulement
  // les redimensionnements de fenêtre (ex: police qui finit de charger)
  new ResizeObserver(syncNavHeight).observe(nav);
} else {
  // Fallback pour les navigateurs sans ResizeObserver
  window.addEventListener("resize", syncNavHeight);
  window.addEventListener("orientationchange", syncNavHeight);
}

/* ─────────────────────────────────────────
   Clic sur un lien : scroll fluide avec offset
───────────────────────────────────────── */
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });

    // Met à jour l'URL sans provoquer de saut natif du navigateur
    history.pushState(null, "", href);
 
    link.classList.add("selected");
    
    clearTimeout(selectedTimer);
    
    selectedTimer = setTimeout(() => {
      link.classList.remove("selected");
    }, 2000);
  });
});

/* ─────────────────────────────────────────
   ACTIVE NAV ON SCROLL
───────────────────────────────────────── */
window.addEventListener("scroll", () => {
  const offset = getScrollOffset();
  let current = "";

  sections.forEach(sec => {
    const top = sec.offsetTop - offset - sec.offsetHeight / 8;
    const bottom = sec.offsetTop + sec.offsetHeight - offset;

    if (scrollY >= top && scrollY < bottom) {
      current = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}, { passive: true });
