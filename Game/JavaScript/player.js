//hp i pulapki
let hp = 3;
const traps = [
    { row: 6,  col: 16 },
    { row: 7,  col: 4 },
    { row: 12, col: 14 },
    { row: 13, col: 3 },
    { row: 17, col: 15 },
];

// przeciwnicy
const enemies = [
    { row: 19, col: 5 },
    { row: 1, col: 19 },
];

// pozycja gracza na siatce
let playerCol = 1;
let playerRow = 1;

// Wyniki i rekordy
let score = 0;
let highScore = 0;

// aktualny poziom
let currentLevel = 1;

//przemioty na mapie 
let items =[
    {row: 19, col: 1,  type:"heal",   collected:false},
    {row: 3,  col: 22, type:"key",    collected:false, keyId:1},
    {row: 5,  col: 20, type:"key",    collected:false, keyId:2},
    {row: 19, col: 11,  type:"key",    collected:false, keyId:3},
    {row: 11, col: 7,  type:"riddle", collected:false},
];

// drzwi: każde wymaga konkretnego klucza
const doors = [
    {row:3,  col:11, keyId:1, open:false},
    {row:10, col:3,  keyId:2, open:false},
    {row:16, col:11, keyId:3, open:false},
];

let riddleSolved=false;
let gameOver=false;
