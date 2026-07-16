/* ═══════════════════════════════════════
   MINI LINUX SHELL - STABLE VERSION
═══════════════════════════════════════ */

const BOOT = [
    '> first name : Lucas',
    '> surname    : Le Gueut',
    '> status     : cybersecurity & electronics student',
    '> location   : France',
    '> interests  : design, networks, offensive security, embedded systems, reverse engineering',
    '> education  : Diplôme national du brevet · Diplôme du Baccalauréat technologique : Science et technologies de l’industrie et du développement durable - Option : Systèmes d’information et numérique · Brevet de technicien supérieur : Cybersécurité et Électronique - Option B : Électronique et Réseau · Cisco Student',
    '> activities : PCB design · programming · web development · networking · electronics studies · CTF player',
    '',
    '',
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
const terminalOutput = document.getElementById("terminal-output");

function createLine(text = "") {

    const line = document.createElement("div");
    line.className = "line";

    // garde les \n et force les longues lignes à descendre
    line.textContent = text;

    terminalOutput.appendChild(line);

    requestAnimationFrame(() => {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    });

    return line;
}
function restartTerminal() {

    prompt.hidden = true;

    terminalOutput.innerHTML = "";

    iLine = 0;
    iChar = 0;

    shellReady = false;

    currentLine = createLine();

    currentLine.appendChild(cursor);

    boot();

}
let scrollbarTimer;

function showScrollbar() {

    terminalOutput.classList.add("show-scrollbar");

    clearTimeout(scrollbarTimer);

    scrollbarTimer = setTimeout(() => {
        terminalOutput.classList.remove("show-scrollbar");
    },2000);
}
    [
    "wheel",
    "touchstart",
    "touchmove",
    "pointerdown",
    "scroll",
    "keydown"
    ].forEach(evt=>{
        terminalOutput.addEventListener(evt,showScrollbar,{passive:true});
    });

const prompt = document.getElementById("prompt");
const input = document.getElementById("cmd");
const cmdView = document.getElementById("cmd-view");

input.addEventListener("input", () => {

    cmdView.textContent = input.value;

    cmdView.after(cursor);

});

let cwd = ["/"];
let shellReady = false;

let history = [];
let historyIndex = -1;

/* ─────────────────────────────
   BOOT CURSOR
───────────────────────────── */

const cursor = document.createElement("span");
cursor.className = "cursor";

let iLine = 0;
let iChar = 0;

let currentLine = createLine();
currentLine.appendChild(cursor);

function boot() {

    if (iLine >= BOOT.length) {

        cursor.remove();

        prompt.hidden = false;
        
        cmdView.after(cursor);
        
        cmdView.textContent = "";
        
        shellReady = true;

        return;
    }

    const text = BOOT[iLine];

    if (iChar < text.length) {

        currentLine.insertBefore(
            document.createTextNode(text[iChar]),
            cursor
        );

        iChar++;

        terminalOutput.scrollTop = terminalOutput.scrollHeight;

        setTimeout(boot,20);

        return;
    }


    // ligne suivante du boot
    iLine++;
    iChar = 0;


    if (iLine < BOOT.length) {

        cursor.remove();

        currentLine = createLine();

        currentLine.appendChild(cursor);

    }


    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    setTimeout(boot,60);
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

        terminalOutput.innerHTML = "";

        prompt.hidden = true;

        iLine = 0;
        iChar = 0;

        shellReady = false;

        currentLine = createLine();
        currentLine.appendChild(cursor);

        boot();

        return [];
    },

    clear() {
        terminalOutput.innerHTML = "";
        return [];
    }
};

/* ─────────────────────────────
   PRINT (ANTI JUMP)
───────────────────────────── */

function print(arr) {

    arr.forEach(text => {

        const parts = String(text).split("\n");

        parts.forEach(part => {

            createLine(part);

        });

    });

    showScrollbar();

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
    cmdView.textContent = "";
    cmdView.after(cursor);
    
    if (!raw || !shellReady) return;

    history.push(raw);
    historyIndex = history.length;

    const [cmd, ...args] = raw.split(" ");

    if (!(cmd in commands)) {
        print(["> " + raw, "command not found"]);
        return;
    }

    if (cmd === "home") {
        commands.home();
        return;

    }
    const res = commands[cmd](args[0] || "");

    createLine("> " + raw);

    terminalOutput.scrollTop = terminalOutput.scrollHeight;

    res.forEach(line => {
        createLine(line);
    });
prompt.addEventListener("touchstart", () => {
    input.focus();
});

prompt.addEventListener("click", () => {
    input.focus();
});
});

function focusInput() {
    if (!shellReady) return;

    input.focus({
        preventScroll: true
    });
}

prompt.addEventListener("pointerdown", focusInput);
prompt.addEventListener("touchstart", focusInput, {
    passive: true
});