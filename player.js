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
