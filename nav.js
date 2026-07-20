/* ═══════════════════════════════════════════════════════════════════
   NAV — vert plein au clic, crochets au scroll (Version Optimisée)
═══════════════════════════════════════════════════════════════════ */

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
    const isSelected = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("selected", isSelected);
    
    // UX Amélioration : Centrer automatiquement le lien actif dans la barre horizontale
    if (isSelected) {
      link.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
}

function clearSelected() {
  navLinks.forEach(link => link.classList.remove("selected"));
}

let observer = null;

function buildObserver() {
  if (observer) observer.disconnect();

  const offset = getScrollOffset();
  // Utilisation d'une zone centrale plus robuste pour l'IntersectionObserver
  const topMargin = -offset;
  const bottomMargin = -(window.innerHeight - offset - 100);

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setCurrentLink(entry.target.id);
      }
    });
  }, {
    root: null,
    rootMargin: `${topMargin}px 0px ${bottomMargin}px 0px`,
    threshold: 0.1
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

// Fin d'auto-scroll propre
const endAutoScroll = () => {
  if (isAutoScrolling) {
    isAutoScrolling = false;
    // Optionnel : on peut enlever le .selected à la fin pour laisser place aux crochets (.current)
    // clearSelected(); 
  }
};

if ("onscrollend" in window) {
  window.addEventListener("scrollend", endAutoScroll);
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
    if (isAutoScrolling && stableFrames > 5) {
      endAutoScroll();
    }
    requestAnimationFrame(watchStop);
  })();
}

window.addEventListener("scroll", () => {
  if (isAutoScrolling) return;
  // Si l'utilisateur scroll manuellement, on nettoie le style plein "selected" 
  // pour laisser les crochets indiquer la section courante.
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