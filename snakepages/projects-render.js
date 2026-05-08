// ── PROJECTS RENDERER ────────────────────────────────────────
// Génère les catégories et le modal automatiquement depuis projects.js

(function () {
  const STATUS_LABEL = {
    done:     { text: 'done',     color: '#00ff41' },
    wip:      { text: 'in progress', color: '#ffcc00' },
    archived: { text: 'archived', color: '#888' },
  };

  // ── Injecter le CSS du modal ──────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* ── CATEGORY GRID ── */
    .projects-grid {
      display: flex;
      gap: 14px;

      overflow-x: auto;
      overflow-y: hidden;

      padding-bottom: 8px;
      margin-top: 10px;

      scroll-behavior: smooth;
      scrollbar-width: none;
    }

    .projects-grid::-webkit-scrollbar {
      display: none;
    }

    .cat-card {
      min-width: 240px;
      max-width: 240px;

      border: 1px solid rgba(0,255,65,0.2);
      background: rgba(0,10,0,0.75);

      padding: 20px;

      cursor: pointer;

      transition: all 0.2s;

      position: relative;
      overflow: hidden;

      backdrop-filter: blur(6px);

      flex-shrink: 0;
    }

    .cat-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--cat-color, #00ff41) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .cat-card:hover::before { opacity: 0.06; }

    .cat-card:hover {
      border-color: var(--cat-color, #00ff41);
      box-shadow: 0 0 20px color-mix(in srgb, var(--cat-color, #00ff41) 20%, transparent);
      transform: translateY(-2px);
    }
    .cat-card.active {
      border-color: var(--cat-color, #00ff41);

      box-shadow:
        0 0 20px color-mix(in srgb, var(--cat-color, #00ff41) 30%, transparent),
        inset 0 0 20px rgba(255,255,255,0.02);

      background: rgba(0,255,65,0.06);
    }

    .cat-icon {
      font-size: 1.8rem;
      display: block;
      margin-bottom: 10px;
      color: var(--cat-color, #00ff41);
      text-shadow: 0 0 10px var(--cat-color, #00ff41);
    }

    .cat-name {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.9rem;
      letter-spacing: 0.15em;
      color: var(--cat-color, #00ff41);
      text-transform: lowercase;
    }

    .cat-count {
      font-size: 0.75rem;
      color: #444;
      margin-top: 6px;
      letter-spacing: 0.1em;
    }

    .cat-count.has-projects { color: #666; }

    /* ── MODAL OVERLAY ── */
    #proj-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0,0,0,0.85);
      backdrop-filter: blur(6px);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
    }

    #proj-overlay.open {
      opacity: 1;
      pointer-events: all;
    }

    #proj-modal {
      background: #020d02;
      border: 1px solid var(--modal-color, #00ff41);
      box-shadow: 0 0 40px color-mix(in srgb, var(--modal-color, #00ff41) 15%, transparent);
      width: min(700px, 92vw);
      max-height: 80vh;
      overflow-y: auto;
      padding: 0;
      transform: translateY(12px);
      transition: transform 0.25s;
    }

    #proj-overlay.open #proj-modal {
      transform: translateY(0);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 28px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      position: sticky;
      top: 0;
      background: #020d02;
      z-index: 1;
    }

    .modal-title {
      font-family: 'VT323', monospace;
      font-size: 1.6rem;
      color: var(--modal-color, #00ff41);
      text-shadow: 0 0 12px var(--modal-color, #00ff41);
      letter-spacing: 0.1em;
    }

    .modal-close {
      background: none;
      border: 1px solid rgba(255,255,255,0.15);
      color: #666;
      font-family: 'Share Tech Mono', monospace;
      font-size: 1rem;
      width: 32px;
      height: 32px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .modal-close:hover {
      border-color: var(--modal-color, #00ff41);
      color: var(--modal-color, #00ff41);
    }

    .modal-body {
      padding: 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    /* ── PROJECT CARDS IN MODAL ── */
    .proj-item {
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      padding: 18px 20px;
      transition: all 0.2s;
      position: relative;
    }

    .proj-item:hover {
      border-color: color-mix(in srgb, var(--modal-color, #00ff41) 35%, transparent);
      background: rgba(255,255,255,0.03);
    }

    .proj-top {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 8px;
    }

    .proj-name {
      font-family: 'Share Tech Mono', monospace;
      font-size: 0.95rem;
      color: var(--modal-color, #00ff41);
      letter-spacing: 0.05em;
    }

    .proj-name a {
      color: inherit;
      text-decoration: none;
    }

    .proj-name a:hover { text-decoration: underline; }

    .proj-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }

    .proj-date {
      font-size: 0.72rem;
      color: #444;
      letter-spacing: 0.1em;
    }

    .proj-status {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      padding: 2px 8px;
      border: 1px solid;
    }

    .proj-desc {
      font-size: 0.83rem;
      color: #556655;
      line-height: 1.7;
      margin-bottom: 10px;
    }

    .proj-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .proj-tag {
      font-size: 0.7rem;
      color: #445544;
      border: 1px solid #1a2e1a;
      padding: 2px 8px;
      letter-spacing: 0.08em;
    }

    /* ── EMPTY STATE ── */
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #333;
      font-size: 0.85rem;
      letter-spacing: 0.1em;
    }

    /* ── SCROLLBAR IN MODAL ── */
    #proj-modal::-webkit-scrollbar { width: 4px; }
    #proj-modal::-webkit-scrollbar-track { background: transparent; }
    #proj-modal::-webkit-scrollbar-thumb { background: #1a3a1a; }

    /* ── RESPONSIVE ── */
    @media (max-width: 500px) {
      .projects-grid { grid-template-columns: 1fr 1fr; }
      #proj-modal { max-height: 90vh; }
    }
  `;
  document.head.appendChild(style);

  // ── Construire la grille de catégories ───────────────────
  const section = document.querySelector('#projects');
  if (!section || typeof PROJECTS === 'undefined') return;

  const grid = document.createElement('div');
  grid.className = 'projects-grid';

  PROJECTS.forEach((cat, idx) => {
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

      document.querySelectorAll('.cat-card').forEach(c => {
        c.classList.remove('active');
      });

      card.classList.add('active');

      openModal(cat);

    });
    section.appendChild(grid);
    grid.appendChild(card);
  });

  section.appendChild(grid);

  // ── ACTIVE CATEGORY ON SCROLL ─────────────────────────

  const catCards = document.querySelectorAll('.cat-card');

  const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        const id = entry.target.dataset.category;

        catCards.forEach(card => {
          card.classList.remove('active');

          if (card.dataset.category === id) {
            card.classList.add('active');

            card.scrollIntoView({
              behavior: 'smooth',
              inline: 'center',
              block: 'nearest'
            });
          }
        });

      }

    });

  }, {
    threshold: 0.4
  });
  // ── Modal ─────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'proj-overlay';
  overlay.innerHTML = `
    <div id="proj-modal">
      <div class="modal-header">
        <div class="modal-title" id="modal-title"></div>
        <button class="modal-close" id="modal-close">✕</button>
      </div>
      <div class="modal-body" id="modal-body"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  const modalTitle = document.getElementById('modal-title');
  const modalBody  = document.getElementById('modal-body');
  const modal      = document.getElementById('proj-modal');

  document.getElementById('modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  function openModal(cat) {
    overlay.style.setProperty('--modal-color', cat.color);
    modalTitle.textContent = `> ${cat.icon} ${cat.category}/`;

    modalBody.innerHTML = '';

    if (cat.projects.length === 0) {
      modalBody.innerHTML = `<div class="empty-state">> no projects yet_</div>`;
    } else {
      cat.projects.forEach(p => {
        const s = p.status ? STATUS_LABEL[p.status] : null;
        const item = document.createElement('div');
        item.className = 'proj-item';

        const nameHtml = p.link
          ? `<a href="${p.link}" target="_blank" rel="noopener">${p.name}</a>`
          : p.name;

        const statusHtml = s
          ? `<span class="proj-status" style="color:${s.color};border-color:${s.color}22">${s.text}</span>`
          : '';

        const tagsHtml = p.tags
          ? p.tags.map(t => `<span class="proj-tag">#${t}</span>`).join('')
          : '';

        item.innerHTML = `
          <div class="proj-top">
            <div class="proj-name">> ${nameHtml}</div>
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
  }
})();
