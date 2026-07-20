/* ═══════════════════════════════════════════
   NAV — vert plein au clic, crochets seuls au scroll
   + synchronisation --nav-height avec le CSS
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
    }, 80);

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();

    window.scrollTo({
      top: targetY,
      behavior: "smooth"
    });

    history.pushState(null, "", href);
  });
});

let ticking = false;
let settleTimer = null;

function recalcCurrent() {
  if (suppressScrollUpdate) return;
  clearSelected();
  setCurrentLink(getCurrentSection());
}

window.addEventListener("scroll", () => {
  if (suppressScrollUpdate) return;

  clearSelected();

  if (!ticking) {
    ticking = true;
    requestAnimationFrame(() => {
      setCurrentLink(getCurrentSection());
      ticking = false;
    });
  }

  // recalcul de sécurité une fois le scroll (rapide ou non) vraiment stabilisé
  clearTimeout(settleTimer);
  settleTimer = setTimeout(recalcCurrent, 80);
}, { passive: true });

window.addEventListener("load", () => setCurrentLink(getCurrentSection()));
