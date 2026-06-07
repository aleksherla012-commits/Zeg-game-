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

// sprite'y środowiska
const floorImg      = new Image(); floorImg.src      = "Assets/pod.png";
const wallImg       = new Image(); wallImg.src       = "Assets/sciana.png";
const floorCrackImg = new Image(); floorCrackImg.src = "Assets/pod.png";
const ballImg       = new Image(); ballImg.src       = "Assets/kula.png";
const lavaImg       = new Image(); lavaImg.src       = "Assets/lawa.png";

// sprite gracza
const playerImg = new Image(); playerImg.src = "Assets/gracz.png";
// ikona zagadki w HUD
const zagadkaImg = new Image(); zagadkaImg.src = "Assets/zagadka.png";
// sprite mumii (przeciwnik)
const mumiaImg  = new Image(); mumiaImg.src  = "Assets/mumia.png";
const doorImg = new Image(); doorImg.src = "Assets/drzwi.png";
const metaImg = new Image(); metaImg.src = "Assets/meta.png";
let metaFrame = 3;        // startuje od zamknietej (klatka 3)
let metaOpened = false;   // czy gracz juz wszedl na mete
let metaLastTime = 0;
const META_FRAMES = 4;
const META_FRAME_MS = 160;

// sprite pułapek
const ogienBaseImg       = new Image(); ogienBaseImg.src       = "Assets/ogien_baza.png";
const ogienSheetImg      = new Image(); ogienSheetImg.src      = "Assets/ogien_spritesheet.png";
const kolceBaseImg       = new Image(); kolceBaseImg.src       = "Assets/kolce_baza.png";
const kolceSheetImg      = new Image(); kolceSheetImg.src      = "Assets/kolce_spritesheet.png";

// klatka animacji kuli (0-3) — aktualizowana w enemies.js
let ballFrame = 0;
// klatka animacji lawy (0-3)
let lavaFrame = 0;
const BALL_FRAMES = 4;
const BALL_COLS = 2; // sprite sheet 2x2

// klatka animacji pułapek (0-3) — aktualizowana w gameLoop
let trapFrame = 0;
let trapFrameTimer = 0;
const TRAP_FRAME_INTERVAL_BASE = 16;  // lvl 1-2: wolniejsza, kazda klatka lepiej widoczna
const TRAP_FRAME_INTERVAL_SLOW = 32;  // lvl 3-4: bardzo wolna, dlugo widac aktywacje

// kierunek gracza: 0=dół, 1=lewo, 2=góra, 3=prawo  (wiersze spritesheet 4x4)
let playerDir = 0;
let playerWalkFrame = 0; // 0-3 kolumna w spritesheet
let playerMoveTimer = 0;
let playerWalkTicks = 0;   // zachowane dla kompatybilnosci z app.js

// kierunek mumii: 0=dół, 1=lewo, 2=góra, 3=prawo
// pixelX/Y — interpolowana pozycja mumii do płynnego ruchu
let mumiaAnimFrames = {}; // per enemy index: { dir, frame, timer, walkTimer, pixelX, pixelY, targetX, targetY }

// ---- rysuje labirynt ----
function drawMaze() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (maze[i][j] === 1) {
                // ściana — tekstura + ciemna nakładka żeby odróżnić od podłogi
                if (wallImg.complete && wallImg.naturalWidth > 0) {
                    canvas_context.drawImage(wallImg, j * cellSize, i * cellSize, cellSize, cellSize);
                } else {
                    canvas_context.fillStyle = "#1a0e05";
                    canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
                // nakładka przyciemniająca ścianę — wyraźnie ciemniejsza niż podłoga
                canvas_context.fillStyle = "rgba(0,0,0,0.52)";
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            } else {
                // podłoga — tekstura + lekkie rozjaśnienie ciepłym tonem
                const img = floorImg;
                if (img.complete && img.naturalWidth > 0) {
                    canvas_context.drawImage(img, j * cellSize, i * cellSize, cellSize, cellSize);
                } else {
                    canvas_context.fillStyle = "#f0d898";
                    canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
                // delikatna ciepła nakładka rozjaśniająca podłogę
                canvas_context.fillStyle = "rgba(255,220,120,0.18)";
                canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            }
        }
    }

    // blok przed meta gdy zagadki nierozwiazane — tekstura sciany
    if (!riddleSolved) {
        const bx = (exit.col - 1) * cellSize;
        const by = exit.row * cellSize;
        if (wallImg.complete && wallImg.naturalWidth > 0) {
            canvas_context.drawImage(wallImg, bx, by, cellSize, cellSize);
        }
        // ciemna nakladka identyczna jak sciany
        canvas_context.fillStyle = "rgba(0,0,0,0.52)";
        canvas_context.fillRect(bx, by, cellSize, cellSize);
    }

    // meta — animowana skrzynia, wieksza (2x cellSize), otwiera sie gdy gracz wejdzie
    const now_meta = performance.now();
    // otwarcie: gdy gracz stoi na mecie — animuj od klatki 3 do 0
    if (playerRow === exit.row && playerCol === exit.col && !metaOpened) {
        metaOpened = true;
        metaFrame = 3;
        metaLastTime = now_meta;
    }
    if (metaOpened && metaFrame > 0 && now_meta - metaLastTime > META_FRAME_MS) {
        metaFrame--;
        metaLastTime = now_meta;
    }
    const mSize = Math.round(cellSize * 1.6);
    const mx = exit.col * cellSize + Math.round((cellSize - mSize) / 2) + 6;
    const my = exit.row * cellSize + Math.round((cellSize - mSize) / 2);
    if (metaImg.complete && metaImg.naturalWidth > 0) {
        const fw = metaImg.naturalWidth / META_FRAMES;
        canvas_context.drawImage(metaImg, metaFrame * fw, 0, fw, metaImg.naturalHeight,
            mx, my, mSize, mSize);
    } else {
        canvas_context.fillStyle = "gold";
        canvas_context.fillRect(exit.col * cellSize, exit.row * cellSize, cellSize, cellSize);
    }

    // pulapki — ogień lub kolce (naprzemiennie per index), ukryte = delikatna nakładka
    for (let ti = 0; ti < traps.length; ti++) {
        const trap = traps[ti];
        if (trap.hidden) {
            // nakładka 0.25 — ledwo widoczna ciemność na podłodze
            canvas_context.fillStyle = "rgba(0,0,0,0.25)";
            canvas_context.fillRect(trap.col * cellSize, trap.row * cellSize, cellSize, cellSize);
        } else {
            const onTrap = (playerRow === trap.row && playerCol === trap.col);
            // naprzemiennie: parzyste = ogień, nieparzyste = kolce
            if (ti % 2 === 0) {
                drawTrapFire(trap.col * cellSize, trap.row * cellSize, onTrap);
            } else {
                drawTrapSpikes(trap.col * cellSize, trap.row * cellSize, onTrap);
            }
        }
    }

    // drzwi
    for (const door of doors) {
        if (door.open) {
            if (door.openFrame === undefined) door.openFrame = 0;
            if (door.openTimer === undefined) door.openTimer = 0;
            if (door.openFrame < 2) {
                door.openTimer++;
                if (door.openTimer > 8) { door.openTimer = 0; door.openFrame++; }
            }
            drawPixelDoor(door.col * cellSize, door.row * cellSize, cellSize, door.openFrame);
        } else {
            door.openFrame = 0;
            door.openTimer = 0;
            drawPixelDoor(door.col * cellSize, door.row * cellSize, cellSize, 0);
        }
    }

    // zrodlo lavy
    for (const fb of fireballs) {
        drawLavaPool(fb.lavaCol * cellSize, fb.lavaRow * cellSize, cellSize);
    }
}

// ---- pułapka ogień ----
// playerOnTrap: true gdy gracz stoi na tej pułapce — wtedy animacja, inaczej tylko baza
function drawTrapFire(x, y, playerOnTrap) {
    if (ogienBaseImg.complete && ogienBaseImg.naturalWidth > 0) {
        canvas_context.drawImage(ogienBaseImg, x, y, cellSize, cellSize);
    } else {
        canvas_context.fillStyle = "rgba(255,80,0,0.4)";
        canvas_context.fillRect(x, y, cellSize, cellSize);
    }
    // animowany płomień tylko gdy gracz stoi na pułapce
    if (playerOnTrap && ogienSheetImg.complete && ogienSheetImg.naturalWidth > 0) {
        const totalFrames = 5;
        const fw = ogienSheetImg.naturalWidth / totalFrames;
        const fh = ogienSheetImg.naturalHeight;
        const frame = trapFrame % totalFrames;
        canvas_context.drawImage(ogienSheetImg,
            frame * fw, 0, fw, fh,
            x, y, cellSize, cellSize);
    }
}

// ---- pułapka kolce ----
// playerOnTrap: true gdy gracz stoi na tej pułapce — wtedy animacja, inaczej tylko baza
function drawTrapSpikes(x, y, playerOnTrap) {
    if (kolceBaseImg.complete && kolceBaseImg.naturalWidth > 0) {
        canvas_context.drawImage(kolceBaseImg, x, y, cellSize, cellSize);
    } else {
        canvas_context.fillStyle = "rgba(180,180,180,0.4)";
        canvas_context.fillRect(x, y, cellSize, cellSize);
    }
    // animowane kolce tylko gdy gracz stoi na pułapce
    if (playerOnTrap && kolceSheetImg.complete && kolceSheetImg.naturalWidth > 0) {
        const totalFrames = 5;
        const fw = kolceSheetImg.naturalWidth / totalFrames;
        const fh = kolceSheetImg.naturalHeight;
        const frame = trapFrame % totalFrames;
        canvas_context.drawImage(kolceSheetImg,
            frame * fw, 0, fw, fh,
            x, y, cellSize, cellSize);
    }
}

// drzwi — sprite drzwi.png (3 klatki: 0=zamknięte, 1=uchylone, 2=otwarte)
function drawPixelDoor(x, y, s, frame) {
    frame = frame || 0;
    if (floorImg.complete && floorImg.naturalWidth > 0) {
        canvas_context.drawImage(floorImg, x, y, s, s);
    }
    canvas_context.fillStyle = "rgba(255,220,120,0.18)";
    canvas_context.fillRect(x, y, s, s);
    if (frame >= 2) return; // w pełni otwarte — tylko podłoga widoczna
    if (doorImg.complete && doorImg.naturalWidth > 0) {
        const fw = doorImg.naturalWidth / 3;
        const dSize = Math.round(s * 1.1);
        const dx = x + Math.round((s - dSize) / 2);
        const dy = y + Math.round((s - dSize) / 2);
        canvas_context.drawImage(doorImg, frame * fw, 0, fw, doorImg.naturalHeight, dx, dy, dSize, dSize);
    } else {
        canvas_context.fillStyle = "#8B4513";
        canvas_context.fillRect(x, y, s, s);
    }
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

// ---- rysuje przeciwnikow (mumie) ----
const MUMMY_ROWS = 4;
const MUMMY_COLS = 4;
const MUMMY_FRAME_INTERVAL = 2;  // zmiana klatki nogi co 2 klatki renderu
const MUMMY_MOVE_MS = 460;       // prawie cały interwał — minimalna pauza między krokami

function drawEnemies() {
    const now = performance.now();
    for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];

        // inicjalizacja stanu animacji mumii
        if (!mumiaAnimFrames[i]) {
            mumiaAnimFrames[i] = {
                dir: 0, frame: 0, walkTimer: 0, flip: false,
                fromX: e.col * cellSize,
                fromY: e.row * cellSize,
                toX:   e.col * cellSize,
                toY:   e.row * cellSize,
                moveStart: now,
                lastCol: e.col,
                lastRow: e.row,
            };
        }
        const anim = mumiaAnimFrames[i];

        // nowy ruch siatki — zaktualizuj from/to i kierunek od razu
        if (e.col !== anim.lastCol || e.row !== anim.lastRow) {
            const moveDc = e.col - anim.lastCol;
            const moveDr = e.row - anim.lastRow;
            // ustaw kierunek TERAZ — nie czekaj na updateEnemyDir
            if      (moveDr ===  1) { anim.dir = 0; anim.flip = false; }
            else if (moveDc ===  1) { anim.dir = 1; anim.flip = true;  }
            else if (moveDr === -1) { anim.dir = 2; anim.flip = false; }
            else if (moveDc === -1) { anim.dir = 1; anim.flip = false; }

            anim.fromX    = anim.pixelX !== undefined ? anim.pixelX : anim.toX;
            anim.fromY    = anim.pixelY !== undefined ? anim.pixelY : anim.toY;
            anim.toX      = e.col * cellSize;
            anim.toY      = e.row * cellSize;
            anim.moveStart = now;
            anim.lastCol  = e.col;
            anim.lastRow  = e.row;
        }

        // liniowa interpolacja od from do to w MUMMY_MOVE_MS ms
        const t = Math.min(1, (now - anim.moveStart) / MUMMY_MOVE_MS);
        anim.pixelX = anim.fromX + (anim.toX - anim.fromX) * t;
        anim.pixelY = anim.fromY + (anim.toY - anim.fromY) * t;

        // animacja nog: chodzi podczas ruchu (t < 1), stoi na klatce 0 gdy czeka
        const isMoving = t < 1;
        if (isMoving) {
            anim.walkTimer++;
            if (anim.walkTimer >= MUMMY_FRAME_INTERVAL) {
                anim.walkTimer = 0;
                anim.frame = (anim.frame + 1) % WALK_CYCLE.length;
            }
        } else {
            anim.frame = 0;
            anim.walkTimer = 0;
        }

        if (mumiaImg.complete && mumiaImg.naturalWidth > 0) {
            const fw = mumiaImg.naturalWidth  / MUMMY_COLS;
            const fh = mumiaImg.naturalHeight / MUMMY_ROWS;
            const srcX = WALK_CYCLE[anim.frame] * fw; // klatka chodu → kolumna
            const srcY = anim.dir               * fh; // kierunek     → wiersz
            if (anim.flip) {
                canvas_context.save();
                canvas_context.translate(anim.pixelX + cellSize, anim.pixelY);
                canvas_context.scale(-1, 1);
                canvas_context.drawImage(mumiaImg, srcX, srcY, fw, fh, 0, 0, cellSize, cellSize);
                canvas_context.restore();
            } else {
                canvas_context.drawImage(mumiaImg, srcX, srcY, fw, fh, anim.pixelX, anim.pixelY, cellSize, cellSize);
            }
        } else {
            const kolory = ["orange", "purple", "#00e5ff"];
            const margin = 5;
            canvas_context.fillStyle = kolory[i % kolory.length];
            canvas_context.fillRect(
                anim.pixelX + margin,
                anim.pixelY + margin,
                cellSize - margin * 2,
                cellSize - margin * 2
            );
        }
    }
}

// ---- aktualizuje kierunek mumii (wywolaj z enemies.js przy ruchu) ----
// Kierunek mumii → kolumna w mumia.png
// col 0=dol(przod), col 1=lewo, col 2=gora(plecy), col 3=prawo
function updateEnemyDir(idx, dr, dc) {
    if (!mumiaAnimFrames[idx]) mumiaAnimFrames[idx] = {
        dir: 0, frame: 0, walkTimer: 0,
        pixelX: 0, pixelY: 0,
        fromX: 0, fromY: 0, toX: 0, toY: 0,
        lastCol: -999, lastRow: -999,
        flip: false, moveStart: 0,
    };
    const a = mumiaAnimFrames[idx];
    if      (dr ===  1) { a.dir = 0; a.flip = false; }
    else if (dc ===  1) { a.dir = 1; a.flip = true;  }
    else if (dr === -1) { a.dir = 2; a.flip = false; }
    else if (dc === -1) { a.dir = 1; a.flip = false; }
}

// ---- rysuje gracza ze spritesheetem ----
// gracz.png: 4 wiersze (dół, lewo, góra, prawo) x 4 kolumny (klatki chodu)
const PLAYER_ROWS = 4;
const PLAYER_COLS = 4;
const PLAYER_FRAME_INTERVAL = 2; // zmiana klatki nogi co 2 klatki renderu
const PLAYER_MOVE_MS = 220;      // czas trwania jednego kroku gracza w ms — dluzszy = wiecej klatek nog

let playerFromX = cellSize, playerFromY = cellSize;
let playerMoveStart = 0;

const WALK_CYCLE = [0, 1, 2, 1];
const PLAYER_WALK_CYCLE = [0, 1, 2, 1];

function drawPlayer() {
    const now = performance.now();

    // liniowa interpolacja gracza od fromX/Y do targetX/Y
    const t = playerMoveStart > 0
        ? Math.min(1, (now - playerMoveStart) / PLAYER_MOVE_MS)
        : 1;
    playerPixelX = playerFromX + (playerTargetX - playerFromX) * t;
    playerPixelY = playerFromY + (playerTargetY - playerFromY) * t;

    // animacja nog: chodzi podczas ruchu (t < 1)
    const isMoving = t < 1;
    if (isMoving) {
        playerMoveTimer++;
        if (playerMoveTimer >= PLAYER_FRAME_INTERVAL) {
            playerMoveTimer = 0;
            playerWalkFrame = (playerWalkFrame + 1) % PLAYER_WALK_CYCLE.length;
        }
    } else {
        playerWalkFrame = 0;
        playerMoveTimer = 0;
    }

    if (playerImg.complete && playerImg.naturalWidth > 0) {
        const fw = playerImg.naturalWidth  / PLAYER_COLS;
        const fh = playerImg.naturalHeight / PLAYER_ROWS;
        const srcX = playerDir                    * fw; // kierunek → kolumna
        const srcY = PLAYER_WALK_CYCLE[playerWalkFrame] * fh; // klatka → wiersz
        canvas_context.drawImage(playerImg, srcX, srcY, fw, fh,
            playerPixelX, playerPixelY, cellSize, cellSize);
    } else {
        const margin = 5;
        canvas_context.fillStyle = "blue";
        canvas_context.fillRect(
            playerPixelX + margin,
            playerPixelY + margin,
            cellSize - margin * 2,
            cellSize - margin * 2
        );
    }
}

// ---- aktualizuje kierunek gracza i startuje animację ruchu ----
// Kierunek gracza → kolumna w gracz.png
// col 0=dol(przod), col 1=lewo, col 2=gora(plecy), col 3=prawo
function updatePlayerDir(dr, dc) {
    if      (dr ===  1) playerDir = 0;
    else if (dc === -1) playerDir = 1;
    else if (dr === -1) playerDir = 2;
    else if (dc ===  1) playerDir = 3;
}

// wywolaj gdy gracz faktycznie rusza sie na nowa komorke
function startPlayerMove(newTargetX, newTargetY) {
    playerFromX    = playerPixelX;
    playerFromY    = playerPixelY;
    playerTargetX  = newTargetX;
    playerTargetY  = newTargetY;
    playerMoveStart = performance.now();
}

// ---- rysuje przedmioty ----
function drawItems() {
    for (const item of items) {
        if (item.collected) continue;
        const cx = item.col * cellSize;
        const cy = item.row * cellSize;
        if (item.type === "heal") {
            const sz = 18, off = (cellSize - sz) / 2;
            canvas_context.drawImage(healImg, cx + off, cy + off, sz, sz);
        } else if (item.type === "key") {
            // klucz mniejszy — 20x20px wysrodkowany
            const sz = 20, off = (cellSize - sz) / 2;
            canvas_context.drawImage(keyImgs[item.keyId], cx + off, cy + off, sz, sz);
        } else if (item.type === "riddle") {
            // zagadka — tylko sprite, bez tla
            const sz = 20, off = (cellSize - sz) / 2;
            if (zagadkaImg.complete && zagadkaImg.naturalWidth > 0) {
                canvas_context.drawImage(zagadkaImg, cx + off, cy + off, sz, sz);
            }
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

    // animacja pułapek — timer globalny, wolniejszy na lvl 3+ (dłużej widać aktywację)
    const trapInterval = (currentLevel >= 3) ? TRAP_FRAME_INTERVAL_SLOW : TRAP_FRAME_INTERVAL_BASE;
    trapFrameTimer++;
    if (trapFrameTimer >= trapInterval) {
        trapFrameTimer = 0;
        trapFrame = (trapFrame + 1) % 5;
    }

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

    // Zagadki — ikona zagadka.png w slotach HTML
    const riddlesEl = document.getElementById("hud-riddles");
    if (riddlesEl) {
        // Przebuduj sloty jesli zmienila sie liczba zagadek
        if (riddlesEl.dataset.built !== String(riddlesRequired)) {
            riddlesEl.innerHTML = "";
            for (let i = 0; i < riddlesRequired; i++) {
                const slot = document.createElement("div");
                slot.className = "hud-riddle-slot";
                const img = document.createElement("img");
                img.src = "Assets/zagadka.png";
                img.className = "hud-riddle-img";
                slot.appendChild(img);
                riddlesEl.appendChild(slot);
            }
            riddlesEl.dataset.built = String(riddlesRequired);
        }
        // Aktualizuj stan — rozwiazane vs nierozwiazane
        const slots = riddlesEl.querySelectorAll(".hud-riddle-slot");
        slots.forEach(function(slot, i) {
            if (i < riddlesSolved) slot.classList.add("solved");
            else                   slot.classList.remove("solved");
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
