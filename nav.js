/* ═══════════════════════════════════════════
   NAV — vert plein au clic, crochets au scroll
   (suivi via IntersectionObserver, fiable à toute vitesse)
═══════════════════════════════════════════ */

const nav = document.querySelector("nav");
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll("nav a");

const SCROLL_EXTRA_OFFSET = 15;

function getScrollOffset() {
  return nav.offsetHeight - SCROLL_EXTRA_OFFSET;
}

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

function setCurrentLink(id) {
  navLinks.forEach(link => {
    link.classList.toggle("current", link.getAttribute("href") === `#${id}`);
  });
}

function setSelectedLink(id) {
  navLinks.forEach(link => {
    link.classList.toggle("selected", link.getAttribute("href") === `#${id}`);
  });
}

function clearSelected() {
  navLinks.forEach(link => link.classList.remove("selected"));
}

/* ─────────────────────────────────────────
   Suivi de la section visible : IntersectionObserver
   → indépendant de la vitesse/fréquence des events scroll
───────────────────────────────────────── */
let observer = null;

function buildObserver() {
  if (observer) observer.disconnect();

  const offset = getScrollOffset();
  const bandBottom = Math.max(window.innerHeight - offset - 2, 0);

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setCurrentLink(entry.target.id);
      }
    });
  }, {
    root: null,
    rootMargin: `-${offset}px 0px -${bandBottom}px 0px`,
    threshold: 0
  });

  sections.forEach(sec => observer.observe(sec));
}

buildObserver();
window.addEventListener("resize", buildObserver);
window.addEventListener("orientationchange", buildObserver);

/* ─────────────────────────────────────────
   Clic : vert plein immédiat + scroll fluide
───────────────────────────────────────── */
let suppressScrollUpdate = false;
let suppressTimer = null;

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const id = href.slice(1);
    setSelectedLink(id);
    setCurrentLink(id);
    link.blur();

    suppressScrollUpdate = true;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(() => {
      suppressScrollUpdate = false;
    }, 400);

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({ top: targetY, behavior: "smooth" });
    history.pushState(null, "", href);
  });
});

/* ─────────────────────────────────────────
   Le vert plein disparaît dès que l'utilisateur scrolle
───────────────────────────────────────── */
window.addEventListener("scroll", () => {
  if (suppressScrollUpdate) return;
  clearSelected();
}, { passive: true });

window.addEventListener("load", buildObserver);
