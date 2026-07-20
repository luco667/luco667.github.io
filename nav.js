/* ═══════════════════════════════════════════
   NAV SCROLL — offset dynamique vers les ancres
   + active nav (fiable montée/descente)
   + synchronisation --nav-height avec le CSS
═══════════════════════════════════════════ */

const nav = document.querySelector("nav");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

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
   Applique la classe active à un seul lien
───────────────────────────────────────── */
function setActiveLink(id) {
  navLinks.forEach(link => {
    const isCurrent = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isCurrent);
  });

  const activeLink = document.querySelector(`nav a[href="#${id}"]`);
  if (activeLink) {
    activeLink.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    });
  }
}

/* ─────────────────────────────────────────
   Détermine la section actuellement en vue
   (fiable dans les deux sens de scroll)
───────────────────────────────────────── */
function getCurrentSection() {
  const offset = getScrollOffset();
  const refLine = offset + 1; // ligne de référence juste sous la navbar

  let current = sections[0]?.id ?? "";

  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    // la section est "courante" si son haut a déjà passé la ligne de référence
    if (rect.top <= refLine) {
      current = sec.id;
    }
  });

  // cas particulier : tout en bas de page → force la dernière section
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) {
    current = sections[sections.length - 1].id;
  }

  return current;
}

let ticking = false;
function updateActiveOnScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    setActiveLink(getCurrentSection());
    ticking = false;
  });
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

    setActiveLink(href.slice(1));

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });

    history.pushState(null, "", href);
  });
});

/* ─────────────────────────────────────────
   ACTIVE NAV ON SCROLL — marche montée et descente
───────────────────────────────────────── */
window.addEventListener("scroll", updateActiveOnScroll, { passive: true });
window.addEventListener("load", updateActiveOnScroll);
updateActiveOnScroll();
