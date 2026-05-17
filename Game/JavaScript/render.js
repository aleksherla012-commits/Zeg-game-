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

// klatka animacji kuli (0-3) — aktualizowana w enemies.js
let ballFrame = 0;
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
    canvas_context.fillStyle = "#8b0000";
    canvas_context.fillRect(x, y, s, s);
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


// ---- rysuje HP i statystyki ----
function drawHP() {
    for (let i = 0; i < hp; i++) {
        canvas_context.drawImage(heartImg, 10 + i * 35, canvas_element.height - 30, 25, 25);
    }
    canvas_context.fillStyle = "black";
    canvas_context.font = "bold 20px Arial";
    canvas_context.fillText("Wynik: "  + score,        150, canvas_element.height - 10);
    canvas_context.fillText("Rekord: " + highScore,    350, canvas_element.height - 10);
    canvas_context.fillText("Poziom: " + currentLevel, 690, canvas_element.height - 10);
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

    // status zagadek
    const solved   = riddlesSolved;
    const required = riddlesRequired;
    const done     = solved >= required;
    const status   = done ? "Wyjscie otwarte" : "Zagadki: " + solved + "/" + required;
    canvas_context.fillStyle = done ? "lime" : "red";
    canvas_context.font      = "bold 20px Arial";
    canvas_context.fillText(status, 490, canvas_element.height - 10);
}

// ---- ekran koncowy ----
function drawGameOver() {
    canvas_context.fillStyle = "rgba(0,0,0,0.7)";
    canvas_context.fillRect(0, 0, canvas_element.width, canvas_element.height);

    canvas_context.fillStyle   = "#c0813a";
    canvas_context.font        = "bold 60px Arial";
    canvas_context.textAlign   = "center";
    canvas_context.fillText("Koniec gry", canvas_element.width / 2, canvas_element.height / 2 - 20);

    canvas_context.fillStyle = "#d4c5a9";
    canvas_context.font      = "20px Arial";
    canvas_context.fillText("Nacisnij R aby zagrac ponownie", canvas_element.width / 2, canvas_element.height / 2 + 30);

    canvas_context.textAlign = "left";
}


// ---- mgła wojny (level 3+): zakrywa komórki dalej niż fogRadius od gracza ----
function drawFog(fogRadius) {
   
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
    drawHP();
    if (gameOver) drawGameOver();
}
let isMuted = false;
let currentLang="PL";
}