// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context = canvas_element.getContext("2d");

// rozmiar komorki
const cellSize = 50;

// liczba kolumn i wierszy
const cols = 16;
const rows = 12;

// Meta
const exit = { row: 10, col: 14 };

// pozycja gracza na siatce
let playerCol = 1;
let playerRow = 1;

// labirynt: 1 = ściana, 0 = przejście
const maze = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,0,1,0],
    [1,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,0,0,1,0],
    [1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0],
    [1,0,1,1,1,1,1,0,1,1,1,0,0,0,0,0],
    [1,0,0,0,0,0,0,0,0,0,1,0,1,1,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,0,0,1,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
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
}

// rysuje gracza
function drawPlayer() {
    const margin = 5;
    canvas_context.fillStyle = "#FF0000";
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
    }
    // czy gracz dotarl do mety
    if (playerRow === exit.row && playerCol === exit.col) {
    alert("Gratulacje, udało ci się!");
    }
    render();
});

render();
