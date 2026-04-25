// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context = canvas_element.getContext("2d");

// rozmiar komorki
const cellSize = 30;

// liczba kolumn i wierszy
const cols = 26;
const rows = 20;

// Meta
const exit = { row: 18, col: 24 };

//hp i pulapki
let hp = 3;
const traps = [
    { row: 3, col: 5 },
    { row: 7, col: 11 },
    { row: 12, col: 8 },
    { row: 15, col: 20 },
    { row: 10, col: 15 },
];

// pozycja gracza na siatce
let playerCol = 1;
let playerRow = 1;

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

// odświeża ekran
function render() {
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);
    drawMaze();
    drawPlayer();
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
    // sprawdź czy gracz wszedł na pułapkę
        
    for (const trap of traps) {
        if (playerRow === trap.row && playerCol === trap.col) {
            hp--;
            alert(`Pułapka! HP: ${hp}`);
            if (hp <= 0) {
                alert("Koniec gry!");
                playerCol = 1;
                playerRow = 1;
                hp = 3;
            }
        }
    }
    // czy gracz dotarl do mety
    if (playerRow === exit.row && playerCol === exit.col) {
    alert("Gratulacje, udało ci się!");
    }
    render();
});

render();
