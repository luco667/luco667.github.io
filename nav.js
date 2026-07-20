/* ═══════════════════════════════════════════
   NAV SCROLL — offset dynamique vers les ancres
   + active nav via IntersectionObserver
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

  // fait défiler la navbar horizontalement pour garder le lien actif visible (mobile)
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
   Clic sur un lien : scroll fluide avec offset
───────────────────────────────────────── */
let isClicking = false;

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    isClicking = true;
    setActiveLink(href.slice(1));

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });

    history.pushState(null, "", href);

    // laisse le temps au scroll fluide de finir avant de redonner
    // la main à l'observer (évite un flicker pendant l'animation)
    window.clearTimeout(isClicking._t);
    isClicking._t = setTimeout(() => { isClicking = false; }, 800);
  });
});

/* ─────────────────────────────────────────
   ACTIVE NAV via IntersectionObserver
   (fiable, ne rate jamais une section, pas de trou)
───────────────────────────────────────── */
const observer = new IntersectionObserver((entries) => {
  if (isClicking) return; // n'écrase pas le clic pendant le scroll animé

  // on prend la section la plus visible actuellement
  let mostVisible = null;

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      if (!mostVisible || entry.intersectionRatio > mostVisible.intersectionRatio) {
        mostVisible = entry;
      }
    }
  });

  if (mostVisible) {
    setActiveLink(mostVisible.target.id);
  }
}, {
  root: null,
  rootMargin: `-${getScrollOffset()}px 0px -50% 0px`,
  threshold: [0, 0.1, 0.25, 0.5, 0.75, 1]
});

sections.forEach(sec => observer.observe(sec));
