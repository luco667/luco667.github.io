/* ═══════════════════════════════════════════
   NAV — vert plein au clic, crochets au scroll
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
   Crochets seuls : suivent la section visible
───────────────────────────────────────── */
function setCurrentLink(id) {
  navLinks.forEach(link => {
    link.classList.toggle("current", link.getAttribute("href") === `#${id}`);
  });
}

/* ─────────────────────────────────────────
   Vert plein : uniquement sur le lien cliqué
───────────────────────────────────────── */
function setSelectedLink(id) {
  navLinks.forEach(link => {
    link.classList.toggle("selected", link.getAttribute("href") === `#${id}`);
  });
}

function clearSelected() {
  navLinks.forEach(link => link.classList.remove("selected"));
}

/* ─────────────────────────────────────────
   Section actuellement visible
   (fiable en montant ET en descendant)
───────────────────────────────────────── */
function getCurrentSection() {
  const refLine = getScrollOffset() + 1;
  let current = sections[0]?.id ?? "";

  sections.forEach(sec => {
    if (sec.getBoundingClientRect().top <= refLine) {
      current = sec.id;
    }
  });

  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  if (atBottom) current = sections[sections.length - 1].id;

  return current;
}

/* ─────────────────────────────────────────
   Clic : vert plein immédiat + scroll fluide
   (le scroll auto du clic ne déclenche pas
   la disparition du vert)
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

    suppressScrollUpdate = true;
    clearTimeout(suppressTimer);
    suppressTimer = setTimeout(() => {
      suppressScrollUpdate = false;
    }, 700);

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });

    history.pushState(null, "", href);
  });
});

/* ─────────────────────────────────────────
   Scroll manuel : le vert plein disparaît,
   les crochets prennent le relais
───────────────────────────────────────── */
let ticking = false;

window.addEventListener("scroll", () => {
  if (suppressScrollUpdate) return;

  clearSelected();

  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    setCurrentLink(getCurrentSection());
    ticking = false;
  });
}, { passive: true });

window.addEventListener("load", () => setCurrentLink(getCurrentSection()));
