/* ═══════════════════════════════════════════
   NAV SCROLL — offset dynamique vers les ancres
   + active nav on scroll
   + synchronisation --nav-height avec le CSS
═══════════════════════════════════════════ */

const nav = document.querySelector("nav");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

/* Marge supplémentaire retirée à la hauteur de la navbar.
   → change juste cette valeur pour ajuster la distance globale. */
const SCROLL_EXTRA_OFFSET = 15;

function getScrollOffset() {
  return nav.offsetHeight - SCROLL_EXTRA_OFFSET;
}

/* ─────────────────────────────────────────
   Publie la vraie hauteur de la navbar en CSS
───────────────────────────────────────── */
function syncNavHeight() {
  document.documentElement.style.setProperty("--nav-height", `${nav.offsetHeight}px`);
}

syncNavHeight();

if ("ResizeObserver" in window) {
  new ResizeObserver(syncNavHeight).observe(nav);
} else {
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

    history.pushState(null, "", href);
    link.classList.add("selected");
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

    if (window.scrollY >= top && window.scrollY < bottom) {
      current = sec.id;
    }
  });

  navLinks.forEach(link => {
    const isCurrent = link.getAttribute("href") === `#${current}`;
    link.classList.toggle("active", isCurrent);
    if (!isCurrent) link.classList.remove("selected");
  });
}, { passive: true });