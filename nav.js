/* ═══════════════════════════════════════════
   NAV — vert plein au clic, crochets au scroll
   Cibles résolues depuis les href des liens (pas <section> en dur)
   Fin d'auto-scroll détectée via 'scrollend' (pas de timer arbitraire)
═══════════════════════════════════════════ */

const nav = document.querySelector("nav");
const navLinks = Array.from(document.querySelectorAll("nav a"));

const targets = navLinks
  .map(link => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("#")) return null;
    const el = document.querySelector(href);
    return el ? { id: href.slice(1), el } : null;
  })
  .filter(Boolean);

function getScrollOffset() {
  return nav.offsetHeight - 15;
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

  targets.forEach(t => observer.observe(t.el));
}

buildObserver();
window.addEventListener("resize", buildObserver);
window.addEventListener("orientationchange", buildObserver);
window.addEventListener("load", buildObserver);

let isAutoScrolling = false;

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

    isAutoScrolling = true;

    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: targetY, behavior: "smooth" });
    history.pushState(null, "", href);
  });
});

if ("onscrollend" in window) {
  window.addEventListener("scrollend", () => {
    isAutoScrolling = false;
  });
} else {
  let lastY = window.scrollY;
  let stableFrames = 0;
  (function watchStop() {
    if (window.scrollY === lastY) {
      stableFrames++;
    } else {
      stableFrames = 0;
      lastY = window.scrollY;
    }
    if (isAutoScrolling && stableFrames > 3) {
      isAutoScrolling = false;
    }
    requestAnimationFrame(watchStop);
  })();
}

window.addEventListener("scroll", () => {
  if (isAutoScrolling) return;
  clearSelected();
}, { passive: true });

function syncFromHash() {
  const id = location.hash.replace("#", "");
  if (!id) return;

  const exists = targets.some(t => t.id === id);
  if (!exists) return;

  setSelectedLink(id);
  setCurrentLink(id);

  isAutoScrolling = true;
  const target = document.getElementById(id);
  if (target) {
    const targetY = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
    window.scrollTo({ top: targetY, behavior: "smooth" });
  }
}

window.addEventListener("hashchange", syncFromHash);
window.addEventListener("load", syncFromHash);
