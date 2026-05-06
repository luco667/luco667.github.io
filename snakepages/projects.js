// ── PROJECTS DATABASE ────────────────────────────────────────
// Pour ajouter un projet : copie un bloc { } dans la bonne catégorie
// Pour ajouter une catégorie : ajoute un nouvel objet dans PROJECTS
//
// Champs disponibles :
//   name     (requis)  : nom du projet
//   desc     (requis)  : description courte
//   tags     (optionnel): tableau de strings
//   link     (optionnel): URL github ou démo
//   status   (optionnel): 'done' | 'wip' | 'archived'
//   date     (optionnel): ex. '2025'

const PROJECTS = [
  {
    category: 'cybersecurity',
    icon: '⬡',
    color: '#00ff41',
    projects: [
      {
        name: 'CTF Writeups',
        desc: 'Solutions et notes de challenges CTF (HackTheBox, Root-Me, FCSC).',
        tags: ['pwn', 'web', 'crypto', 'reverse'],
        link: 'https://github.com/luco667',
        status: 'wip',
        date: '2025',
      },
      // Ajoute tes projets ici ↓
    ],
  },
  {
    category: 'electronics',
    icon: '◈',
    color: '#00ccff',
    projects: [
      {
        name: 'PCB KiCad - [Nom projet]',
        desc: 'Conception d\'une carte électronique sous KiCad.',
        tags: ['KiCad', 'PCB', 'STM32'],
        status: 'wip',
        date: '2025',
      },
      // Ajoute tes projets ici ↓
    ],
  },
  {
    category: 'software',
    icon: '▸',
    color: '#ffcc00',
    projects: [
      {
        name: 'Portfolio',
        desc: 'Ce site — portfolio matrix en HTML/CSS/JS pur.',
        tags: ['html', 'css', 'js', 'canvas'],
        link: 'https://github.com/luco667',
        status: 'done',
        date: '2026',
      },
      // Ajoute tes projets ici ↓
    ],
  },
  {
    category: 'network',
    icon: '⬢',
    color: '#ff4466',
    projects: [
      // Ajoute tes projets ici ↓
    ],
  },
];
