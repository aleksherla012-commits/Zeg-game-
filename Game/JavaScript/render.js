// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context  = canvas_element.getContext("2d");
canvas_context.imageSmoothingEnabled = true;

const heartImg = new Image();
heartImg.src = "Assets/heart.png";
const healImg  = new Image();
healImg.src  = "Assets/heart.png";

// obrazki kluczy
const keyImgs = { 1: new Image(), 2: new Image(), 3: new Image() };
keyImgs[1].src = "Assets/blue_key.png";
keyImgs[2].src = "Assets/red_key.png";
keyImgs[3].src = "Assets/green_key.png";

// sprite'y środowiska
const floorImg      = new Image(); floorImg.src      = "Assets/podloga_piaskowiec.png";
const floorCrackImg = new Image(); floorCrackImg.src = "Assets/zlamana_podloga.png";
const ballImg       = new Image(); ballImg.src       = "Assets/kula.png";
const lavaImg = new Image(); lavaImg.src = "Assets/lawa.png";

// klatka animacji kuli (0-3) — aktualizowana w enemies.js
let ballFrame = 0;
// klatka animacji lawy (0-3)
let lavaFrame = 0;
const BALL_FRAMES = 4;
const BALL_COLS = 2; // sprite sheet 2x2

// ---- rysuje labirynt ----
function drawMaze() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (maze[i][j] === 1) {
                canvas_context.fillStyle = "black";
                // +1px zeby nie bylo szczelin miedzy kafle
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            } else {
                // losowo mieszaj tekstury podlogi dla urozmaicenia (deterministycznie per komorka)
                const useCrack = ((i * 7 + j * 13) % 5 === 0) && floorCrackImg.complete && floorCrackImg.naturalWidth > 0;
                const img = useCrack ? floorCrackImg : floorImg;
                if (img.complete && img.naturalWidth > 0) {
                    canvas_context.drawImage(img, j * cellSize, i * cellSize, cellSize, cellSize);
                } else {
                    canvas_context.fillStyle = "#e8d090";
                    canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
            }
        }
    }

    // blok przed meta gdy zagadki nierozwiazane
    if (!riddleSolved) {
        canvas_context.fillStyle = "black";
        canvas_context.fillRect(
            (exit.col - 1) * cellSize, exit.row * cellSize, cellSize + 1, cellSize + 1
        );
    }

    // meta
    canvas_context.fillStyle = "gold";
    canvas_context.fillRect(exit.col * cellSize, exit.row * cellSize, cellSize, cellSize);

    // pulapki — czerwone (widoczne) lub ciemny odcien (ukryte na lvl 3)
    for (const trap of traps) {
        if (trap.hidden) {
            canvas_context.fillStyle = "rgba(0,0,0,0.22)";
            canvas_context.fillRect(trap.col * cellSize, trap.row * cellSize, cellSize, cellSize);
        } else {
            canvas_context.fillStyle = "red";
            canvas_context.fillRect(trap.col * cellSize, trap.row * cellSize, cellSize, cellSize);
        }
    }

    // drzwi
    for (const door of doors) {
        if (!door.open) drawPixelDoor(door.col * cellSize, door.row * cellSize, cellSize);
    }

    // zrodlo lavy
    for (const fb of fireballs) {
        drawLavaPool(fb.lavaCol * cellSize, fb.lavaRow * cellSize, cellSize);
    }
}

// drzwi — braz + zlota klamka
function drawPixelDoor(x, y, s) {
    canvas_context.fillStyle = "#8B4513";
    canvas_context.fillRect(x, y, s, s);
    canvas_context.fillStyle = "#FFD700";
    canvas_context.beginPath();
    canvas_context.arc(x + s - 8, y + s / 2, 3, 0, Math.PI * 2);
    canvas_context.fill();
}

// lawa
function drawLavaPool(x, y, s) {
    if (lavaImg.complete && lavaImg.naturalWidth > 0) {
        canvas_context.drawImage(lavaImg,
            lavaFrame * 64, 0, 64, 64,
            x, y, s, s);
    } else {
        canvas_context.fillStyle = "#8b0000";
        canvas_context.fillRect(x, y, s, s);
    }
}

// ---- rysuje kule ognia z animacja obrotu ----
function drawFireballs() {
    for (const fb of fireballs) {
        if (!fb.active) continue;

        let drawX = fb.col * cellSize;
        let drawY = fb.row * cellSize;

        if (fb.falling) {
            const targetX = fb.lavaCol * cellSize;
            const targetY = fb.lavaRow * cellSize;
            drawX = drawX + (targetX - drawX) * fb.fallProgress;
            drawY = drawY + (targetY - drawY) * fb.fallProgress;
        }

        if (ballImg.complete && ballImg.naturalWidth > 0) {
            // sprite sheet 2x2 — wybierz klatke
            const frameW = ballImg.naturalWidth / 2;
            const frameH = ballImg.naturalHeight / 2;
            const srcX = (ballFrame % 2) * frameW;
            const srcY = Math.floor(ballFrame / 2) * frameH;
            canvas_context.drawImage(ballImg,
                srcX, srcY, frameW, frameH,
                drawX, drawY, cellSize, cellSize);
        } else {
            canvas_context.fillStyle = "#ff6600";
            canvas_context.fillRect(drawX, drawY, cellSize, cellSize);
        }
    }
}

// ---- rysuje przeciwnikow ----
function drawEnemies() {
    const kolory = ["orange", "purple", "#00e5ff"];
    const margin = 5;
    for (let i = 0; i < enemies.length; i++) {
        canvas_context.fillStyle = kolory[i % kolory.length];
        canvas_context.fillRect(
            enemies[i].col * cellSize + margin,
            enemies[i].row * cellSize + margin,
            cellSize - margin * 2,
            cellSize - margin * 2
        );
    }
}

// ---- rysuje gracza ----
function drawPlayer() {
    playerPixelX += (playerTargetX - playerPixelX) * animSpeed;
    playerPixelY += (playerTargetY - playerPixelY) * animSpeed;
    const margin = 5;
    canvas_context.fillStyle = "blue";
    canvas_context.fillRect(
        playerPixelX + margin,
        playerPixelY + margin,
        cellSize - margin * 2,
        cellSize - margin * 2
    );
}


// ---- rysuje przedmioty ----
function drawItems() {
    for (const item of items) {
        if (item.collected) continue;
        if (item.type === "heal") {
            canvas_context.drawImage(healImg, item.col * cellSize, item.row * cellSize, cellSize, cellSize);
        } else if (item.type === "key") {
            canvas_context.drawImage(keyImgs[item.keyId], item.col * cellSize, item.row * cellSize, cellSize, cellSize);
        } else if (item.type === "riddle") {
            canvas_context.fillStyle = "cyan";
            canvas_context.beginPath();
            canvas_context.arc(
                item.col * cellSize + cellSize / 2,
                item.row * cellSize + cellSize / 2,
                8, 0, Math.PI * 2
            );
            canvas_context.fill();
        }
    }
}

// ---- baza komunikatów śmierci per przyczyna ----
const deathMessages = {
    trap: [
        "Egipski architekt mial poczucie humoru.",
        "Podloga byla bardziej wroga niz wrogowie.",
        "Archeolog znalazl pulapke. Osobiscie.",
        "To nie byl skrot. Sprawdzone.",
    ],
    enemy: [
        "Faraon nie lubil nieproszonych gosci.",
        "Straz grobowca byla nieprzekupna.",
        "Anubis nie czekal na zaproszenie.",
        "Nastepnym razem moze ominij straznika.",
    ],
    ball: [
        "Kula nie pyta o imie.",
        "Nie ten korytarz. Zdecydowanie nie ten.",
        "Toczace sie kamienie zbieraja ofiary.",
        "Budowniczowie piramid wiedzieli co robia.",
    ],
    lava: [
        "Nil tutaj nie plynie. Sprawdzone.",
        "Gorace jak w Dolinie Krolow. Dosłownie.",
        "Ra wyslal pozdrowienia. Bardzo gorace.",
        "Moze nastepnym razem nie stawaj w lawie.",
    ],
    riddle: [
        "Maat zazyla serce. Bylo za ciezkie.",
        "Sfinks byl bardziej milosierny.",
        "Wiedza to potega. Brak wiedzy — smierc.",
        "Zagadka wygrala. Tym razem.",
    ],
};

const deathCauseLabels = {
    trap:   "ZGINALЕС OD PULAPKI",
    enemy:  "ZGINALЕС OD STRAZNIKA GROBOWCA",
    ball:   "ZGINALЕС OD KULI",
    lava:   "WSTAPILES W LAWE",
    riddle: "ZAGADKA POCHLONELA TWOJE ZYCIE",
};

// ---- ekran koncowy ----
function drawGameOver() {
    canvas_context.fillStyle = "rgba(0,0,0,0.75)";
    canvas_context.fillRect(0, 0, canvas_element.width, canvas_element.height);

    const cx = canvas_element.width  / 2;
    const cy = canvas_element.height / 2;

    const bw = 560, bh = 180;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;

    canvas_context.fillStyle = "#1a1a2e";
    canvas_context.fillRect(bx, by, bw, bh);
    canvas_context.strokeStyle = "#c0813a";
    canvas_context.lineWidth   = 1;
    canvas_context.strokeRect(bx, by, bw, bh);

    canvas_context.textAlign = "center";

    canvas_context.fillStyle = "#c0813a";
    canvas_context.font      = "13px 'Segoe UI'";
    canvas_context.fillText("S M I E R C", cx, by + 28);

    const pool = deathMessages[deathCause] || deathMessages["trap"];
    const msg  = deathCurrentMsg || pool[0];
    canvas_context.fillStyle = "#d4c5a9";
    canvas_context.font      = "18px 'Segoe UI'";
    canvas_context.fillText(msg, cx, by + 72);

    const causeLabel = deathCauseLabels[deathCause] || "ZGINALЕС";
    canvas_context.fillStyle = "rgba(192,129,58,0.55)";
    canvas_context.font      = "11px 'Segoe UI'";
    canvas_context.fillText(causeLabel, cx, by + 100);

    canvas_context.fillStyle = "rgba(192,129,58,0.45)";
    canvas_context.font      = "12px 'Segoe UI'";
    canvas_context.fillText("[ R ]  NOWA GRA          [ M ]  MENU", cx, by + 155);

    canvas_context.textAlign = "left";
}


   
// ---- mgla wojny (level 3+) ----
function drawFog() {
    const fogRadius = 4;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const dist = Math.abs(i - playerRow) + Math.abs(j - playerCol);
            if (dist > fogRadius) {
                canvas_context.fillStyle = "rgba(0,0,0,1)";
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            } else if (dist === fogRadius) {
                canvas_context.fillStyle = "rgba(0,0,0,0.6)";
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

// ---- glowna funkcja render ----
function render() {
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);
    drawMaze();
    drawItems();
    drawFireballs();
    drawEnemies();
    drawPlayer();
    if (currentLevel == 3) drawFog(4);
    if (currentLevel == 4) drawFog(2);
    if (gameOver) drawGameOver();
    updateHUD();
}

// ---- aktualizuje HTML HUD ----
function updateHUD() {
    // Serca
    for (let i = 0; i < 3; i++) {
        const h = document.getElementById("heart-" + i);
        if (!h) continue;
        if (i < hp) h.classList.add("active");
        else        h.classList.remove("active");
    }

    // Wynik / Rekord / Poziom
    const scoreEl = document.getElementById("hud-score");
    const hsEl    = document.getElementById("hud-highscore");
    const lvlEl   = document.getElementById("hud-level");
    if (scoreEl) scoreEl.textContent = score;
    if (hsEl)    hsEl.textContent    = highScore;
    if (lvlEl)   lvlEl.textContent   = currentLevel;

    // Klucze
    const keysEl = document.getElementById("hud-keys");
    if (keysEl) {
        const keyItems = items.filter(i => i.type === "key");
        // odbuduj tylko jeśli liczba slotów się zmieniła
        if (keysEl.children.length !== keyItems.length) {
            keysEl.innerHTML = "";
            keyItems.forEach(function(item) {
                const slot = document.createElement("div");
                slot.className = "hud-key-slot";
                slot.dataset.keyId = item.keyId;
                const img = document.createElement("img");
                const srcs = { 1: "Assets/blue_key.png", 2: "Assets/red_key.png", 3: "Assets/green_key.png" };
                img.src = srcs[item.keyId] || "Assets/blue_key.png";
                slot.appendChild(img);
                keysEl.appendChild(slot);
            });
        }
        // aktualizuj zebrane
        keyItems.forEach(function(item) {
            const slot = keysEl.querySelector("[data-key-id='" + item.keyId + "']");
            if (!slot) return;
            const wasCollected = slot.classList.contains("collected");
            if (item.collected && !wasCollected) {
                slot.classList.add("collected");
            } else if (item.collected) {
                slot.classList.add("collected");
            } else {
                slot.classList.remove("collected");
            }
        });
    }

    // Zagadki
    const riddlesEl = document.getElementById("hud-riddles");
    if (riddlesEl) {
        if (riddlesEl.children.length !== riddlesRequired) {
            riddlesEl.innerHTML = "";
            for (let i = 0; i < riddlesRequired; i++) {
                const dot = document.createElement("div");
                dot.className = "hud-riddle-dot needed";
                riddlesEl.appendChild(dot);
            }
        }
        const dots = riddlesEl.querySelectorAll(".hud-riddle-dot");
        dots.forEach(function(dot, i) {
            if (i < riddlesSolved) dot.classList.add("solved");
            else                   dot.classList.remove("solved");
        });
    }
}
let isMuted = false;
let currentLang="PL";

// przyczyna smierci — ustawiana przed gameOver = true
let deathCause      = "trap";
let deathCurrentMsg = "";

function setDeath(cause) {
    deathCause = cause;
    const pool = deathMessages[cause] || deathMessages["trap"];
    deathCurrentMsg = pool[Math.floor(Math.random() * pool.length)];
    gameOver = true;
}
