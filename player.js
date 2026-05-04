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
const enemies = [
    { row: 9, col: 20 },
    { row: 5, col: 22 },
];

// pozycja gracza na siatce
let playerCol = 1;
let playerRow = 1;

// Wyniki i rekordy
let score = 0;
let highScore = 0;


//przemioty na mapie 
let items =[
    {row: 3,col: 5, type:"heal",collected:false},
    {row:7, col:12, type:"key", collected: false},
    {row:11, col:7, type:"riddle", collected:false},
];
let riddleSolved=false;
let gameOver=false ;
