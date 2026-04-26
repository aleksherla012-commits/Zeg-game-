// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context = canvas_element.getContext("2d");

const heartImg = new Image();
heartImg.src = 'heart.png';

// rysuje labirynt
function drawMaze() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            canvas_context.fillStyle = maze[i][j] === 1 ? "black" : "white";
            canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
// rysuje mete
canvas_context.fillStyle = "gold";
canvas_context.fillRect(exit.col * cellSize, exit.row * cellSize, cellSize, cellSize);
// rysuje pułapki
for (const trap of traps) {
    canvas_context.fillStyle = "red";
    canvas_context.fillRect(trap.col * cellSize, trap.row * cellSize, cellSize, cellSize);
}
}

// rysuje przeciwnicyy
function drawEnemy() {
    const margin = 5;
    canvas_context.fillStyle = "orange";
    canvas_context.fillRect(
        enemy.col * cellSize + margin,
        enemy.row * cellSize + margin,
        cellSize - margin * 2,
        cellSize - margin * 2
    );
}
function drawEnemy2() {
    const margin = 5;
    canvas_context.fillStyle = "purple";
    canvas_context.fillRect(
        enemy2.col * cellSize + margin,
        enemy2.row * cellSize + margin,
        cellSize - margin * 2,
        cellSize - margin * 2
    );
}

// rysuje gracza
function drawPlayer() {
    const margin = 5;
    canvas_context.fillStyle = "blue";
    canvas_context.fillRect(
        playerCol * cellSize + margin,
        playerRow * cellSize + margin,
        cellSize - margin * 2,
        cellSize - margin * 2
    );
}

// rysuje HP
function drawHP() {
    for (let i = 0; i < hp; i++) {
        canvas_context.drawImage(heartImg, 10 + i * 35, canvas_element.height - 30, 25, 25);
    }
    canvas_context.fillStyle = "black";
    canvas_context.font = "bold 20px Arial";
    canvas_context.fillText("Wynik: " + score, 150, canvas_element.height - 10);
    canvas_context.fillText("Rekord: " + highScore, 350, canvas_element.height - 10);
}

// odświeża ekran
function render() {
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);
    drawMaze();
    drawPlayer();
    drawHP();
    drawEnemy();
    drawEnemy2();
}
