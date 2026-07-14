/* ═══════════════════════════════════════
   MINI LINUX SHELL - STABLE VERSION
═══════════════════════════════════════ */

const BOOT = [
    '> initializing profile...',
    '> first name : Lucas',
    '> surname    : Le Gueut',
    '> status     : cybersecurity & electronics student',
    '> location   : France',
    '> interests  : design, networks, offensive security, embedded systems, reverse engineering',
    '> education  : Diplôme national du brevet · Diplôme du Baccalauréat technologique : Science et technologies de l’industrie et du développement durable - Option : Systèmes d’information et numérique · Brevet de technicien supérieur : Cybersécurité et Électronique - Option B : Électronique et Réseau · Cisco Student',
    '> activities : PCB design · programming · web development · networking · electronics studies · CTF player',
];

/* ─────────────────────────────
   FILESYSTEM
───────────────────────────── */

const FS = {
    "/": {
        type: "dir",
        content: {
            home: {
                type: "dir",
                content: {
                    about: {
                        type: "file",
                        content:
`Lucas Le Gueut
Cybersecurity
Electronics
Embedded Systems`
                    },
                    skills: {
                        type: "file",
                        content:
`Networking
Cybersecurity
Embedded
PCB Design`
                    }
                }
            },
            projects: {
                type: "dir",
                content: {
                    "project1.txt": {
                        type: "file",
                        content: "CTF tools / PCB tools / web tools"
                    }
                }
            }
        }
    }
};

/* ─────────────────────────────
   STATE
───────────────────────────── */

const lines = [...document.querySelectorAll(".line")];
const prompt = document.getElementById("prompt");
const input = document.getElementById("cmd");

let cwd = ["/"];
let shellReady = false;

let history = [];
let historyIndex = -1;

/* ─────────────────────────────
   BOOT CURSOR
───────────────────────────── */

const cursor = document.createElement("span");
cursor.className = "cursor";
lines[0].appendChild(cursor);

let iLine = 0;
let iChar = 0;

function boot() {

    if (iLine >= BOOT.length) {
        cursor.remove();
        prompt.hidden = false;
        input.focus();
        shellReady = true;
        return;
    }

    const line = lines[iLine];
    const text = BOOT[iLine];

    if (iChar < text.length) {
        line.insertBefore(
            document.createTextNode(text[iChar]),
            cursor
        );
        iChar++;
        setTimeout(boot, 20);
        return;
    }

    iLine++;
    iChar = 0;

    if (iLine < lines.length) {
        cursor.remove();
        lines[iLine].appendChild(cursor);
    }

    setTimeout(boot, 60);
}

boot();

/* ─────────────────────────────
   FS HELPERS
───────────────────────────── */

function resolve(path) {
    let node = FS["/"];

    for (let i = 1; i < path.length; i++) {
        node = node.content?.[path[i]];
        if (!node) return null;
    }

    return node;
}

function ls() {
    const node = resolve(cwd);
    if (!node || node.type !== "dir") return ["not a directory"];
    return Object.keys(node.content);
}

function cat(arg) {
    const node = resolve([...cwd, arg]);
    if (!node) return ["file not found"];
    if (node.type !== "file") return ["not a file"];
    return node.content.split("\n");
}

function cd(arg) {
    if (!arg) return;

    if (arg === "..") {
        if (cwd.length > 1) cwd.pop();
        return;
    }

    const next = [...cwd, arg];
    const node = resolve(next);

    if (node?.type === "dir") cwd = next;
}

/* ─────────────────────────────
   COMMANDS
───────────────────────────── */

const commands = {

    help() {
        return ["ls", "cd <dir>", "cat <file>", "home", "clear"];
    },

    ls() {
        return ls();
    },

    cat(arg) {
        return cat(arg);
    },

    cd(arg) {
        cd(arg);
        return [];
    },

    home() {
        cwd = ["/"];
        return ["returned to home"];
    },

    clear() {
        lines.forEach(l => l.textContent = "");
        return [];
    }
};

/* ─────────────────────────────
   PRINT (ANTI JUMP)
───────────────────────────── */

function print(arr) {

    lines.forEach(l => l.textContent = "");

    arr.forEach((t, i) => {
        if (i >= lines.length) return;
        lines[i].textContent = t;
    });

    const out = document.getElementById("terminal-output");
    if (out) out.scrollTop = out.scrollHeight;
}

/* ─────────────────────────────
   INPUT
───────────────────────────── */

input.addEventListener("keydown", e => {

    if (e.key === "ArrowUp") {
        if (!history.length) return;
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex] || "";
        return;
    }

    if (e.key === "ArrowDown") {
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = history[historyIndex] || "";
        return;
    }

    if (e.key !== "Enter") return;

    const raw = input.value.trim();
    input.value = "";

    if (!raw || !shellReady) return;

    history.push(raw);
    historyIndex = history.length;

    const [cmd, ...args] = raw.split(" ");

    if (!(cmd in commands)) {
        print(["> " + raw, "command not found"]);
        return;
    }

    const res = commands[cmd](args[0] || "");

    print(["> " + raw, "", ...res]);
});