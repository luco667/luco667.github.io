const track = document.querySelector('.work-track');

if (track) {

  let x = 0;
  let isDown = false;
  let startX = 0;

  let speed = 0.6;
  let lastMove = Date.now();
  let auto = true;

  /* ───────── DESKTOP ───────── */

  track.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.clientX - x;
    auto = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;

    x = e.clientX - startX;
    track.style.transform = `translateX(${x}px)`;

    lastMove = Date.now();
  });

  window.addEventListener('mouseup', stopDrag);

  /* ───────── MOBILE ───────── */

  track.addEventListener('touchstart', (e) => {
    isDown = true;
    startX = e.touches[0].clientX - x;
    auto = false;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDown) return;

    x = e.touches[0].clientX - startX;
    track.style.transform = `translateX(${x}px)`;

    lastMove = Date.now();
  }, { passive: true });

  window.addEventListener('touchend', stopDrag);

  /* ───────── STOP DRAG ───────── */

  function stopDrag() {
    isDown = false;
    lastMove = Date.now();

    setTimeout(() => {
      if (Date.now() - lastMove >= 5000) {
        auto = true;
      }
    }, 5000);
  }

  /* ───────── AUTO SCROLL ───────── */

  function animate() {

    if (auto && !isDown) {

      x -= speed;

      const width = track.scrollWidth / 2;

      if (Math.abs(x) >= width) {
        x = 0;
      }

      track.style.transform = `translateX(${x}px)`;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

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
        name: 'Programme dattaque',
        desc: 'Ce site — portfolio matrix en HTML/CSS/JS pur.',
        tags: ['html', 'css', 'js', 'canvas'],
        link: '',
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
