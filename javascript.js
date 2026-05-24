const track = document.querySelector('.work-track');

let x = 0;
let isDown = false;
let startX = 0;

let speed = 0.6; // vitesse auto scroll
let lastMove = Date.now();
let auto = true;

/* ───────── DRAG ───────── */

track.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.clientX - x;
  auto = false;
});

window.addEventListener('mouseup', () => {
  isDown = false;
  lastMove = Date.now();

  // reprise après 5s sans interaction
  setTimeout(() => {
    if (Date.now() - lastMove >= 5000) {
      auto = true;
    }
  }, 5000);
});

window.addEventListener('mousemove', (e) => {
  if (!isDown) return;

  x = e.clientX - startX;
  track.style.transform = `translateX(${x}px)`;

  lastMove = Date.now();
});

/* ───────── AUTO LOOP ───────── */

function animate(){
  if (auto && !isDown){
    x -= speed;

    /* reset boucle infinie */
    const width = track.scrollWidth / 2;
    if (Math.abs(x) >= width) x = 0;

    track.style.transform = `translateX(${x}px)`;
  }

  requestAnimationFrame(animate);
}

animate();

/* ══════════════════════════════════════════
   MATRIX RAIN
══════════════════════════════════════════ */
const canvas = document.getElementById('matrix');
const ctx    = canvas.getContext('2d');

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF><{}[]|/\\';

let cols, drops, fontSize;

function initMatrix() {
  fontSize      = 14;
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols          = Math.floor(canvas.width / fontSize);
  drops         = Array.from({ length: cols }, () => Math.random() * -100);
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    const y    = drops[i] * fontSize;

    if (y > 0 && y < canvas.height) {
      ctx.fillStyle   = '#ccffcc';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur  = 8;
    } else {
      ctx.fillStyle   = '#00ff41';
      ctx.shadowColor = '#00ff41';
      ctx.shadowBlur  = 4;
    }

    ctx.fillText(char, i * fontSize, y);
    ctx.shadowBlur = 0;

    if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i] += 0.5;
  }
}

initMatrix();
window.addEventListener('resize', initMatrix);
setInterval(drawMatrix, 40);


/* ══════════════════════════════════════════
   TERMINAL TYPEWRITER
   BUG CORRIGÉ : textContent écrasait le DOM
   → on utilise un tableau de lignes validées
══════════════════════════════════════════ */
const LINES = [
  '> initializing profile...',
  '> first name : Lucas',
  '> surname    : Le Gueut',
  '> status     : cybersecurity & electronics student',
  '> location   : France',
  '> interests  : design, networks, offensive security, embedded systems, reverse engineering',
  '> education  : French National Brevet · STI2D Graduate · BTS CIEL Option B Student · Cisco Student',
  '> activities : PCB design · programming · web development · networking · electronics studies · CTF player',
  '> hobbies: art · literature · cinema · music · internet · 3D · science · nature ',
  ' ',
  '> system ready_',
];

const output = document.getElementById('terminal-output');
let lineIdx = 0, charIdx = 0;

function buildText(partial) {
  let text = '';
  for (let i = 0; i < lineIdx; i++) text += LINES[i] + '\n';
  text += partial;
  return text;
}

function type() {
  if (lineIdx >= LINES.length) {
    const span = document.createElement('span');
    span.className = 'cursor';
    output.appendChild(span);
    return;
  }

  const target = LINES[lineIdx];

  if (charIdx < target.length) {
    output.textContent = buildText(target.slice(0, charIdx + 1));
    charIdx++;
    setTimeout(type, Math.random() * 35 + 18);
  } else {
    output.textContent = buildText(target);
    lineIdx++;
    charIdx = 0;
    setTimeout(type, 110);
  }
}

setTimeout(type, 600);


/* ══════════════════════════════════════════
   ACTIVE NAV ON SCROLL
══════════════════════════════════════════ */
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - 140) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}, { passive: true });


/* ══════════════════════════════════════════
   PROJECTS DATABASE
   → Pour ajouter un projet : copie un bloc {}
   → Champs : name*, desc*, tags[], link, status, date
   → status : 'done' | 'wip' | 'archived'
══════════════════════════════════════════ */
const PROJECTS = [
  {
    category: 'developpement',
    icon: '◈',
    color: '#00ff41',
    projects: [
      {
        name: 'Snake game',
        desc: 'Page web avec jeu en javascript',
        tags: ['javascript', 'web', 'html', 'css'],
        link: 'Projects/snake/enregistrement/snake.html',
        status: 'done',
        date: '2025',
      },
      {
        name: 'Notepad',
        desc: 'Bloc-notes programmé en C.',
        tags: ['C','SDL3','MinGW'],
        link: 'https://github.com/luco667/LANGUAGEC',
        status: 'done',
        date: '2025',
      },
      {
        name: 'Portfolio',
        desc: 'Ce site — portfolio matrix en HTML/CSS/JS pur.',
        tags: ['html', 'css', 'js', 'canvas'],
        link: 'https://luco667.github.io/',
        status: 'wip',
        date: '2026',
      },
      // ↓ ajoute tes projets ici
    ],
  },
  {
    category: 'electronics',
    icon: '◆',
    color: '#00ccff',
    projects: [
      {
        name: 'Arroseur PCB',
        desc: "Conception d'une carte électronique sous KiCad.",
        tags: ['KiCad', 'PCB', 'STM32'],
        status: 'wip',
        date: '2025',
      },
      {
        name: 'Etiquette PCB',
        desc: 'Conception d'une carte électronique sous KiCad.',
        tags: ['Kicad', 'CODE39'],
        link: 'https://github.com/luco667',
        status: 'done',
        date: '2026',
      },
      // ↓ ajoute tes projets ici
    ],
  },
  {
    category: 'cybersecurity',
    icon: '⬢',
    color: '#ffcc00',
    projects: [
      {
        name: 'Programme d\'attaque',
        desc: 'Ce site — portfolio matrix en HTML/CSS/JS pur.',
        tags: ['html', 'css', 'js', 'canvas'],
        link: 'https://github.com/luco667',
        status: 'done',
        date: '2026',
      },
      // ↓ ajoute tes projets ici
    ],
  },
  {
  category: 'network',
  icon: '▣',
  color: '#ff4466',

  projects: [

    {
      name: 'Proxy',
      desc: 'Routeur proxy anti-pub.',
      tags: ['OSI'],
      status: 'done',
      date: '2026',
    },

  ],
  },
  {
    category: 'miscaleneous',
    icon: '⧉',
    color: '#812bd5',
    projects: [
       {
        name: 'Watch list',
        desc: 'Ce site — portfolio matrix en HTML/CSS/JS pur.',
        tags: ['html', 'css', 'js', 'canvas'],
        link: 'https://github.com/luco667',
        status: 'done',
        date: '2026',
      },
      // ↓ ajoute tes projets ici
    ],
  },
];

/* ══════════════════════════════════════════
   PROJECTS RENDERER
   BUGS CORRIGÉS :
   - grid.appendChild dans la boucle → dupliquait les cartes
   - IntersectionObserver orphelin supprimé
   - scroll modal ne remonte plus la page
══════════════════════════════════════════ */
(function renderProjects() {
  const STATUS_LABEL = {
    done:     { text: 'done',        color: '#00ff41' },
    wip:      { text: 'in progress', color: '#ffcc00' },
    archived: { text: 'archived',    color: '#888'    },
  };

  /* ── Styles injectés ── */
  const style = document.createElement('style');
  style.textContent = `
    /* wrapper qui porte le scroll horizontal */
    .projects-scroll {
      overflow-x: auto;
      overflow-y: visible;
      scrollbar-width: none;
      /* marge négative pour que le padding interne ne décale pas visuellement */
      margin-left: -4px;
      margin-right: -4px;
    }
    .projects-scroll::-webkit-scrollbar { display: none; }

    .cat-card {
      min-width: 210px;
      max-width: 210px;
      border: 1px solid rgba(0,255,65,0.2);
      background: rgba(0,10,0,0.75);
      padding: 20px;
      cursor: pointer;
      transition: all 0.22s;
      position: relative;
      overflow: hidden;
      backdrop-filter: blur(6px);
      flex-shrink: 0;
    }
    .cat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--cat-color,#00ff41) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s;
    }
    .cat-card:hover::before { opacity: 0.07; }
    .cat-card:hover {
      border-color: var(--cat-color,#00ff41);
      box-shadow: 0 0 20px color-mix(in srgb, var(--cat-color,#00ff41) 20%, transparent);
      transform: translateY(-2px);
    }
    .cat-card.active {
      border-color: var(--cat-color,#00ff41);
      box-shadow: 0 0 24px color-mix(in srgb, var(--cat-color,#00ff41) 30%, transparent),
                  inset 0 0 20px rgba(255,255,255,0.02);
      background: rgba(0,255,65,0.05);
    }
    .cat-icon {
      font-size: 1.8rem;
      display: block;
      margin-bottom: 10px;
      color: var(--cat-color,#00ff41);
      text-shadow: 0 0 10px var(--cat-color,#00ff41);
    }
    .cat-name {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.88rem;
      letter-spacing: 0.14em;
      color: var(--cat-color,#00ff41);
    }
    .cat-count { font-size: 0.72rem; color: #444; margin-top: 6px; letter-spacing: 0.1em; }
    .cat-count.has-projects { color: #666; }

    /* ── Modal ── */
    #proj-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.88);
      backdrop-filter: blur(8px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
    }
    #proj-overlay.open { opacity: 1; pointer-events: all; }

    #proj-modal {
      background: #020d02;
      border: 1px solid var(--modal-color,#00ff41);
      box-shadow: 0 0 50px color-mix(in srgb, var(--modal-color,#00ff41) 18%, transparent);
      width: min(700px, 92vw);
      max-height: 80vh;
      overflow: hidden;        /* le scroll est sur modal-body, pas le modal entier */
      display: flex;
      flex-direction: column;
      transform: translateY(14px);
      transition: transform 0.25s;
    }
    #proj-overlay.open #proj-modal { transform: translateY(0); }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      flex-shrink: 0;          /* ne rétrécit jamais, toujours visible */
      background: #020d02;
    }
    .modal-title {
      font-family: 'VT323', monospace;
      font-size: 1.6rem;
      color: var(--modal-color,#00ff41);
      text-shadow: 0 0 12px var(--modal-color,#00ff41);
      letter-spacing: 0.1em;
    }
    .modal-close {
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: #666;
      font-family: 'Share Tech Mono', monospace;
      font-size: 1rem;
      width: 32px; height: 32px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { border-color: var(--modal-color,#00ff41); color: var(--modal-color,#00ff41); }

    .modal-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }

    .proj-item {
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      padding: 18px 20px;
      transition: all 0.2s;
    }
    .proj-item:hover {
      border-color: color-mix(in srgb, var(--modal-color,#00ff41) 35%, transparent);
      background: rgba(255,255,255,0.03);
    }
    .proj-top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
    .proj-name { font-family: 'Share Tech Mono', monospace; font-size: 0.95rem; color: var(--modal-color,#00ff41); letter-spacing: 0.05em; }
    .proj-name a { color: inherit; text-decoration: none; }
    .proj-name a:hover { text-decoration: underline; }
    .proj-meta { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
    .proj-date { font-size: 0.72rem; color: #444; letter-spacing: 0.1em; }
    .proj-status { font-size: 0.7rem; letter-spacing: 0.12em; padding: 2px 8px; border: 1px solid; }
    .proj-desc { font-size: 0.83rem; color: #556655; line-height: 1.7; margin-bottom: 10px; }
    .proj-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .proj-tag { font-size: 0.7rem; color: #445544; border: 1px solid #1a2e1a; padding: 2px 8px; letter-spacing: 0.08em; }
    .empty-state { text-align: center; padding: 40px; color: #333; font-size: 0.85rem; letter-spacing: 0.1em; }

    .modal-body::-webkit-scrollbar { width: 4px; }
    .modal-body::-webkit-scrollbar-track { background: transparent; }
    .modal-body::-webkit-scrollbar-thumb { background: #1a3a1a; }

    @media (max-width: 500px) { #proj-modal { max-height: 90vh; } }
  `;
  document.head.appendChild(style);

   /* ── Grille ── */
   const section = document.querySelector('#projects');
   if (!section) return;
   
   const grid = document.createElement('div');
   grid.className = 'projects-grid';
   
   PROJECTS.forEach(cat => {
     const card = document.createElement('div');
     card.className = 'cat-card';
     card.style.setProperty('--cat-color', cat.color);
     card.dataset.category = cat.category;
   
     const count = cat.projects.length;
   
     card.innerHTML = `
       <span class="cat-icon">${cat.icon}</span>
       <div class="cat-name">./${cat.category}/</div>
       <div class="cat-count ${count > 0 ? 'has-projects' : ''}">
         ${count > 0 ? `${count} project${count > 1 ? 's' : ''}` : 'empty'}
       </div>
     `;
   
     card.addEventListener('click', () => {
       document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
       card.classList.add('active');
       openModal(cat);
     });
   
     grid.appendChild(card);
   });
   
   section.appendChild(grid);

  /* ── Modal ── */
  const overlay = document.createElement('div');
  overlay.id = 'proj-overlay';
  overlay.innerHTML = `
    <div id="proj-modal">
      <div class="modal-header">
        <div class="modal-title" id="modal-title"></div>
        <button class="modal-close" id="modal-close" aria-label="Fermer">✕</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modalTitle = document.getElementById('modal-title');
  const modalBody  = document.getElementById('modal-body');
  const modal      = document.getElementById('proj-modal');

  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  // scroll sur modal-body, pas le modal entier
  modalBody.addEventListener('wheel', e => e.stopPropagation(), { passive: true });

  function openModal(cat) {
    overlay.style.setProperty('--modal-color', cat.color);
    modalTitle.textContent = `> ${cat.icon} ${cat.category}/`;
    modalBody.innerHTML = '';

    if (cat.projects.length === 0) {
      modalBody.innerHTML = `<div class="empty-state">> no projects yet_</div>`;
    } else {
      cat.projects.forEach(p => {
        const s    = p.status ? STATUS_LABEL[p.status] : null;
        const item = document.createElement('div');
        item.className = 'proj-item';

        const nameHtml   = p.link
          ? `<a href="${p.link}" target="_blank" rel="noopener noreferrer">${p.name}</a>`
          : p.name;
        const statusHtml = s
          ? `<span class="proj-status" style="color:${s.color};border-color:${s.color}33">${s.text}</span>`
          : '';
        const tagsHtml   = p.tags
          ? p.tags.map(t => `<span class="proj-tag">#${t}</span>`).join('')
          : '';

        item.innerHTML = `
          <div class="proj-top">
            <div class="proj-name">&gt; ${nameHtml}</div>
            <div class="proj-meta">
              ${p.date ? `<span class="proj-date">${p.date}</span>` : ''}
              ${statusHtml}
            </div>
          </div>
          <div class="proj-desc">${p.desc}</div>
          ${tagsHtml ? `<div class="proj-tags">${tagsHtml}</div>` : ''}
        `;
        modalBody.appendChild(item);
      });
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.querySelectorAll('.cat-card').forEach(c => c.classList.remove('active'));
  }
})();
