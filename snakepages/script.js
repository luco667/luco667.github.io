document.addEventListener("DOMContentLoaded", () => {

    console.log("JS OK");

    /* ===============================
       MATRIX EFFECT
    =============================== */

    const canvas = document.getElementById("matrix");

    if (!canvas) {
        console.error("canvas introuvable");
        return;
    }

    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    const letters = "01";
    const fontSize = 14;

    let columns = Math.floor(canvas.width / fontSize);
    let drops = Array(columns).fill(1);

    function draw() {
        ctx.fillStyle = "rgba(0,0,0,0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#00ff9c";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }

            drops[i]++;
        }
    }

    setInterval(draw, 33);

    /* ===============================
       TERMINAL EFFECT
    =============================== */

    const terminal = document.getElementById("terminal-output");

    if (!terminal) {
        console.error("terminal-output introuvable");
        return;
    }

    const lines = [
        "> about",
        "> booting profile...",
        "",
        "> étudiant cybersécurité",
        "",
        "> systèmes embarqués",
        "",
        "> accès autorisé"
    ];

    const speed = 30;
    const delay = 400;

    function typeLine(text, callback) {
        let i = 0;
        const line = document.createElement("div");
        terminal.appendChild(line);

        function type() {
            if (i < text.length) {
                line.textContent += text[i];
                i++;
                setTimeout(type, speed);
            } else {
                setTimeout(callback, delay);
            }
        }

        type();
    }

    function run() {
        let i = 0;

        function next() {
            if (i < lines.length) {
                typeLine(lines[i], () => {
                    i++;
                    next();
                });
            } else {
                const cursor = document.createElement("span");
                cursor.className = "cursor";
                terminal.appendChild(cursor);
            }
        }

        next();
    }

    run();
});
