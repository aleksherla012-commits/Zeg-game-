// interwał przeciwników — startuje przez initEnemies() po załadowaniu poziomu
let enemyTimer = null;

function initEnemies() {
    if (enemyTimer) clearInterval(enemyTimer);

    enemyTimer = setInterval(function () {
        if (gameOver || gamePaused) return;

        const kierunki = [
            { dr: -1, dc: 0 },
            { dr:  1, dc: 0 },
            { dr:  0, dc: -1 },
            { dr:  0, dc:  1 },
        ];

        for (const e of enemies) {
            const losowy = kierunki[Math.floor(Math.random() * 4)];
            const newRow = e.row + losowy.dr;
            const newCol = e.col + losowy.dc;

            if (canMove(newRow, newCol)) {
                e.row = newRow;
                e.col = newCol;
            }
            // jeśli dotknął gracza — zabiera HP
            if (e.row === playerRow && e.col === playerCol) {
                hp--;
                playSound(100, 0.2);
                if (hp <= 0) {
                    gameOver = true;
                }
            }
        }
        lavaFrame = (lavaFrame + 1) % 4;
        // ---- logika kuli-pułapki (tylko level 2) ----
        updateFireballs();
        

        
    }, enemyIntervalMs);
}

// ---- kula ognia ----
function updateFireballs() {
    for (const fb of fireballs) {

        // faza: czeka na odrodzenie (cooldown po wpadnięciu do lavy)
        if (!fb.active) {
            fb.respawnTicks = (fb.respawnTicks || 0) + 1;
            if (fb.respawnTicks >= 6) {
                // wróć na pozycję startową
                const d = levelData[currentLevel].fireballs.find(
                    f => f.lavaRow === fb.lavaRow && f.lavaCol === fb.lavaCol
                );
                fb.row          = d.row;
                fb.col          = d.col;
                fb.chaseSteps   = 0;
                fb.falling      = false;
                fb.fallProgress = 0;
                fb.respawnTicks = 0;
                fb.active       = true;
            }
            continue;
        }

        // faza: spada do lavy
        if (fb.falling) {
            fb.fallProgress += 0.25;
            if (fb.fallProgress >= 1) {
                fb.active = false; // zaczyna cooldown
                fb.respawnTicks = 0;
            }
            continue;
        }

        // faza: jedzie w lewo wzdluz stalej trasy (row 19, col 22->13)
        if (fb.chaseSteps < fb.maxChase) {
            const nc = fb.col - 1; // zawsze w lewo
            const nr = fb.row;     // zawsze ten sam wiersz

            if (canMove(nr, nc)) {
                fb.col = nc;
                ballFrame = (ballFrame + 1) % 4;
            }
            fb.chaseSteps++;

            // uderza gracza?
            if (fb.row === playerRow && fb.col === playerCol) {
                hp -= 3; // orange square — zabiera 3 serca
                if (hp < 0) hp = 0;
                playSound(120, 0.4);
                if (hp <= 0) gameOver = true;
                fb.falling      = true;
                fb.fallProgress = 0;
            }
        } else {
            // dojechala do lavy — wpada
            fb.falling      = true;
            fb.fallProgress = 0;
        }
    }
}
