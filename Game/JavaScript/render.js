// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context  = canvas_element.getContext("2d");
canvas_context.imageSmoothingEnabled = false;

const heartImg = new Image();
heartImg.src = "Assets/heart.png";
const healImg  = new Image();
healImg.src  = "Assets/heart.png";

// obrazki kluczy
const keyImgs = { 1: new Image(), 2: new Image(), 3: new Image() };
keyImgs[1].src = "Assets/blue_key.png";
keyImgs[2].src = "Assets/red_key.png";
keyImgs[3].src = "Assets/green_key.png";

// ---- rysuje labirynt ----
function drawMaze() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            canvas_context.fillStyle = maze[i][j] === 1 ? "black" : "white";
            canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }

    // blok przed metą gdy zagadki nierozwiązane
    if (!riddleSolved) {
        canvas_context.fillStyle = "black";
        canvas_context.fillRect(
            (exit.col - 1) * cellSize, exit.row * cellSize, cellSize, cellSize
        );
    }

    // meta
    canvas_context.fillStyle = "gold";
    canvas_context.fillRect(exit.col * cellSize, exit.row * cellSize, cellSize, cellSize);

    // pułapki — ukryte (kolor podłogi) na lvl 3, widoczne (czerwone) na pozostałych
    for (const trap of traps) {
        if (trap.hidden) {
            // kolor niemal identyczny z podłogą — ledwo widoczny odcień
            canvas_context.fillStyle = "#f0f0f0";
        } else {
            canvas_context.fillStyle = "red";
        }
        canvas_context.fillRect(trap.col * cellSize, trap.row * cellSize, cellSize, cellSize);
    }

    // drzwi
    for (const door of doors) {
        if (!door.open) drawPixelDoor(door.col * cellSize, door.row * cellSize, cellSize);
    }

    // źródło lavy (rysowane raz, stale widoczne na lvl 2)
    for (const fb of fireballs) {
        drawLavaPool(fb.lavaCol * cellSize, fb.lavaRow * cellSize, cellSize);
    }
}

// drzwi — brąz + złota klamka
function drawPixelDoor(x, y, s) {
    canvas_context.fillStyle = "#8B4513";
    canvas_context.fillRect(x, y, s, s);
    canvas_context.fillStyle = "#FFD700";
    canvas_context.beginPath();
    canvas_context.arc(x + s - 8, y + s / 2, 3, 0, Math.PI * 2);
    canvas_context.fill();
}

// ---- lawa: zwykly ciemnoczerwony kwadrat (grafike dorobi uzytkownik) ----
function drawLavaPool(x, y, s) {
    canvas_context.fillStyle = "#8b0000";
    canvas_context.fillRect(x, y, s, s);
}

// ---- rysuje kule ognia: pomaranczowy kwadrat (grafike dorobi uzytkownik) ----
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

        // pomaranczowy kwadrat — zajmuje cala komorke
        canvas_context.fillStyle = "#ff6600";
        canvas_context.fillRect(drawX, drawY, cellSize, cellSize);
    }
}

// ---- rysuje przeciwników ----
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
        playerCol * cellSize + margin,
        playerRow * cellSize + margin,
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
    const status   = done ? "🔓 Wyjście otwarte" : `🔒 Zagadki: ${solved}/${required}`;
    canvas_context.fillStyle = done ? "lime" : "red";
    canvas_context.font      = "bold 20px Arial";
    canvas_context.fillText(status, 490, canvas_element.height - 10);
}

// ---- ekran końcowy ----
function drawGameOver() {
    canvas_context.fillStyle = "rgba(0,0,0,0.7)";
    canvas_context.fillRect(0, 0, canvas_element.width, canvas_element.height);

    canvas_context.fillStyle   = "#c0813a";
    canvas_context.font        = "bold 60px Arial";
    canvas_context.textAlign   = "center";
    canvas_context.fillText("Koniec gry💀💀💀💀", canvas_element.width / 2, canvas_element.height / 2 - 20);

    canvas_context.fillStyle = "#d4c5a9";
    canvas_context.font      = "20px Arial";
    canvas_context.fillText("Naciśnij R aby zagrać ponownie", canvas_element.width / 2, canvas_element.height / 2 + 30);

    canvas_context.textAlign = "left";
}


// ---- mgła wojny (level 3+): zakrywa komórki dalej niż fogRadius od gracza ----
function drawFog(fogRadius) {
   
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const dist = Math.abs(i - playerRow) + Math.abs(j - playerCol);
            if (dist > fogRadius) {
                // całkowita ciemność — nic nie widać
                canvas_context.fillStyle = "rgba(0,0,0,1)";
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            } else if (dist === fogRadius) {
                // miękka krawędź tylko na granicy zasięgu
                canvas_context.fillStyle = "rgba(0,0,0,0.6)";
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }
}

// ---- główna funkcja render ----
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
