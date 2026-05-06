/* ===============================
   MATRIX RAIN EFFECT
   Simulation style film Matrix
================================= */

// Récupération du canvas
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");

// Taille écran
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Caractères affichés (ici binaire)
const letters = "01";

// Taille des caractères
const fontSize = 14;

// Nombre de colonnes
const columns = canvas.width / fontSize;

// Tableau contenant la position des gouttes
const drops = [];

/* Initialisation des colonnes */
for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

/* Fonction de dessin */
function draw() {

    // Effet de traînée (fade)
    ctx.fillStyle = "rgba(0,0,0,0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Couleur du texte
    ctx.fillStyle = "#00ff9c";
    ctx.font = fontSize + "px monospace";

    // Boucle sur chaque colonne
    for (let i = 0; i < drops.length; i++) {

        // Choix aléatoire du caractère
        const text = letters[Math.floor(Math.random() * letters.length)];

        // Affichage
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset aléatoire en haut
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        // Descente de la goutte
        drops[i]++;
    }
}

/* Rafraîchissement (~30 FPS) */
setInterval(draw, 33);

/* Resize dynamique */
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
