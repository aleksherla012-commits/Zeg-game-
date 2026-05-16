// ruch gracza
document.addEventListener("keydown", function (event) {
    let newRow = playerRow;
    let newCol = playerCol;

    // restart po game over
    if (gameOver) {
        if (event.key === "r" || event.key === "R") {
            currentLevel = 1;
            loadLevel(1);
            riddlesSolved = 0;
            score = 0;
            initEnemies();
            render();
        }
        return;
    }

    if (event.key === "w" || event.key === "ArrowUp")    newRow--;
    if (event.key === "s" || event.key === "ArrowDown")  newRow++;
    if (event.key === "a" || event.key === "ArrowLeft")  newCol--;
    if (event.key === "d" || event.key === "ArrowRight") newCol++;

    // sprawdź drzwi
    const blockedDoor = doors.find(d => !d.open && d.row === newRow && d.col === newCol);
    if (blockedDoor) {
        const matchingKey = items.find(i => i.type === "key" && i.keyId === blockedDoor.keyId && i.collected);
        if (matchingKey) {
            blockedDoor.open = true;
            playerRow = newRow;
            playerCol = newCol;
            playSound(500, 0.3);
            score++;
        } else {
            playSound(100, 0.1);
        }
    } else if (canMove(newRow, newCol)) {
        playerRow = newRow;
        playerCol = newCol;
        playSound(200, 0.05);
        score++;
    }

    // przedmioty
    for (const item of items) {
        if (!item.collected && playerRow === item.row && playerCol === item.col) {

            if (item.type === "heal") {
                if (hp < 3) hp++;
                playSound(600, 0.3);
                item.collected = true;
            }

            if (item.type === "key") {
                playSound(500, 0.2);
                item.collected = true;
            }

            if (item.type === "riddle") {
                showRiddle(item);
            }
        }
    }

    // pułapki
    for (const trap of traps) {
        if (playerRow === trap.row && playerCol === trap.col) {
            hp--;
            playSound(100, 0.3);
            if (hp <= 0) gameOver = true;
        }
    }

    // meta
    if (playerRow === exit.row && playerCol === exit.col) {
        if (riddleSolved) {
            playSound(800, 0.5);
            if (highScore === 0 || score < highScore) highScore = score;

            // przejście do kolejnego poziomu
            if (currentLevel < 2) {
                currentLevel++;
                riddlesSolved = 0;
                loadLevel(currentLevel);
                initEnemies();
            } else {
                // ukończyłeś ostatni poziom (na razie level 2) — reset do 1
                currentLevel = 1;
                score = 0;
                riddlesSolved = 0;
                loadLevel(1);
                initEnemies();
            }
        } else {
            playSound(100, 0.2);
        }
    }

    render();
});

// ---- wyświetla zagadkę ----
function showRiddle(item) {
    const overlay = document.getElementById("riddle-overlay");
    overlay.classList.add("active");

    document.querySelectorAll(".riddle-btn").forEach(btn => {
        btn.onclick = function () {
            overlay.classList.remove("active");

            if (btn.dataset.color === "zloty") {
                playSound(800, 0.4);
                item.collected = true;
                riddlesSolved++;
                if (riddlesSolved >= riddlesRequired) riddleSolved = true;
            } else {
                hp--;
                playSound(100, 0.3);
                if (hp <= 0) { gameOver = true; render(); return; }

                // przesuń zagadkę w losowe wolne miejsce
                const freeSpaces = [
                    { row: 1,  col: 10 }, { row: 7,  col: 4  },
                    { row: 11, col: 17 }, { row: 15, col: 23 },
                ];
                const random = freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
                item.row = random.row;
                item.col = random.col;
            }
            render();
        };
    });
}

render();

// ---- przyciski menu ----
document.getElementById("btn-new").addEventListener("click", startGame);

document.getElementById("btn-continue").addEventListener("click", function () {
    if (score > 0 || currentLevel > 1) {
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("canvas_gry").style.display  = "block";
        render();
    } else {
        alert("nie zapisałeś żadnej gry");
    }
});

document.getElementById("btn-quit").addEventListener("click", function () {
    if (confirm("Czy na pewno chcesz wyjść?")) window.close();
});

function startGame() {
    currentLevel  = 1;
    score         = 0;
    riddlesSolved = 0;
    loadLevel(1);
    initEnemies();
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("canvas_gry").style.display  = "block";
    render();
}
