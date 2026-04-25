// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context = canvas_element.getContext("2d");

// tworzy dźwięk(C)
const audioCtx = new AudioContext();
function playSound(frequency, duration) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

// rozmiar komorki
const cellSize = 30;

// liczba kolumn i wierszy
const cols = 26;
const rows = 20;

// Meta
const exit = { row: 18, col: 24 };

// porusza przeciwnikiem co sekundę
setInterval(function() {
    const kierunki = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
    ];
    const losowy = kierunki[Math.floor(Math.random() * 4)];
    const newRow = enemy.row + losowy.dr;
    const newCol = enemy.col + losowy.dc;
    if (canMove(newRow, newCol)) {
        enemy.row = newRow;
        enemy.col = newCol;
        playSound(150, 0.3);
    }
    // jeśli dotknął gracza — zabiera HP
    if (enemy.row === playerRow && enemy.col === playerCol) {
        hp--;
        if (hp <= 0) {
            playerCol = 1;
            playerRow = 1;
            hp = 3;
        }
    }
    const losowy2 = kierunki[Math.floor(Math.random() * 4)];
    const newRow2 = enemy2.row + losowy2.dr;
    const newCol2 = enemy2.col + losowy2.dc;
    if (canMove(newRow2, newCol2)) {
        enemy2.row = newRow2;
        enemy2.col = newCol2;
        playSound(150, 0.3);
    }
    if (enemy2.row === playerRow && enemy2.col === playerCol) {
        hp--;
        if (hp <= 0) {
            playerCol = 1;
            playerRow = 1;
            hp = 3;
        }
    }
    render();
}, 500);



//hp i pulapki
let hp = 3;
const traps = [
    { row: 1, col: 3 },
    { row: 5, col: 5 },
    { row: 9, col: 3 },
    { row: 13, col: 3 },
    { row: 17, col: 4 },
];

// przeciwnicy
let enemy = { row: 9, col: 20 };
let enemy2 = { row: 5, col: 22 };

// pozycja gracza na siatce
let playerCol = 1;
let playerRow = 1;

// Wyniki i rekordy
let score = 0;
let highScore = 0;

// labirynt: 1 = ściana, 0 = przejście
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,0,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,0,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,1,0,0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,0,1,1,1,0,1,0,1,0,1,1,0,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// czy można wejść na tę komórkę?
function canMove(row, col) {
    if (row < 0 || row >= rows || col < 0 || col >= cols) return false;
    return maze[row][col] === 0;
}

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
    canvas_context.fillStyle = "black";
    canvas_context.font = "bold 20px Arial";
    canvas_context.fillText("HP: " + hp, 10, canvas_element.height - 10);
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

// ruch gracza
document.addEventListener("keydown", function(event) {
    let newRow = playerRow;
    let newCol = playerCol;

    if (event.key === "w" || event.key === "ArrowUp")    newRow--;
    if (event.key === "s" || event.key === "ArrowDown")  newRow++;
    if (event.key === "a" || event.key === "ArrowLeft")  newCol--;
    if (event.key === "d" || event.key === "ArrowRight") newCol++;

    // ruch tylko jeśli nie ma ściany
    if (canMove(newRow, newCol)) {
        playerRow = newRow;
        playerCol = newCol;
        playSound(200, 0.05);
        score++;
    }
    // sprawdź czy gracz wszedł na pułapkę
    for (const trap of traps) {
    if (playerRow === trap.row && playerCol === trap.col) {
        hp--;
        playSound(100, 0.3);
        if (hp <= 0) {
            playerCol = 1;
            playerRow = 1;
            hp = 3;
        }
    }

    
}
    // czy gracz dotarl do mety
    if (playerRow === exit.row && playerCol === exit.col) {
    playSound(800, 0.5);
    if (highScore === 0 || score < highScore) highScore = score;
    score = 0;
    playerCol = 1;
    playerRow = 1;
}
    render();
});

render();
