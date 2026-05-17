// HP gracza
let hp = 3;

// pozycja gracza
let playerCol = 1;
let playerRow = 1;

// Wyniki
let score = 0;
let highScore = 0;

// aktualny poziom
let currentLevel = 1;

// flagi
let riddleSolved = false;
let gameOver     = false;

// ---- dane per-poziom ----
const levelData = {
    1: {
        traps: [
            { row: 6,  col: 16 },
            { row: 7,  col: 4  },
            { row: 12, col: 14 },
            { row: 13, col: 3  },
            { row: 17, col: 15 },
        ],
        enemies: [
            { row: 19, col: 5  },
            { row: 1,  col: 18 },
        ],
        enemyInterval: 500,
        items: [
            { row: 19, col: 1,  type: "heal",   collected: false },
            { row: 3,  col: 22, type: "key",    collected: false, keyId: 1 },
            { row: 5,  col: 20, type: "key",    collected: false, keyId: 2 },
            { row: 19, col: 11, type: "key",    collected: false, keyId: 3 },
            { row: 11, col: 7,  type: "riddle", collected: false, riddleId: 1 },
        ],
        doors: [
            { row: 3,  col: 11, keyId: 1, open: false },
            { row: 10, col: 3,  keyId: 2, open: false },
            { row: 16, col: 11, keyId: 3, open: false },
        ],
        riddlesRequired: 1,
        // kula-pułapka nieaktywna na lvl 1
        fireballs: [],
    },
    2: {
        traps: [
            { row: 2,  col: 10 },
            { row: 5,  col: 3  },
            { row: 7,  col: 19 },
            { row: 9,  col: 7  },
            { row: 11, col: 14 },
            { row: 13, col: 2  },
            { row: 15, col: 10 },
            { row: 17, col: 18 },
            { row: 19, col: 5  },
        ],
        enemies: [
            { row: 1,  col: 7  },
            { row: 7,  col: 1  },
            { row: 19, col: 13 },
        ],
        enemyInterval: 420,
        items: [
            { row: 1,  col: 23, type: "heal",   collected: false },
            { row: 5,  col: 11, type: "key",    collected: false, keyId: 1 },
            { row: 13, col: 22, type: "key",    collected: false, keyId: 2 },
            { row: 17, col: 2,  type: "riddle", collected: false, riddleId: 1 },
            { row: 9,  col: 17, type: "riddle", collected: false, riddleId: 2 },
        ],
        doors: [
            { row: 6,  col: 7,  keyId: 2, open: false },
            { row: 15, col: 17, keyId: 1, open: false },
        ],
        riddlesRequired: 2,
        // kula startuje na wolnej komorce (row:1,col:5 = 0 w mazeLevel2)
        fireballs: [
            { row: 19, col: 22, active: true, chaseSteps: 0, maxChase: 9,
              falling: false, fallProgress: 0, respawnTicks: 0,
              // zrodlo lavy — wolna komorka na mapie (row:17,col:7 = 0)
              lavaRow: 19, lavaCol: 13 }
        ],
    },


    3: {
        traps: [
            // pułapki ukryte — kolor podłogi, nie czerwony (hidden:true)
            { row: 1,  col: 3,  hidden: true },
            { row: 3,  col: 7,  hidden: true },
            { row: 5,  col: 10, hidden: true },
            { row: 7,  col: 5,  hidden: true },
            { row: 9,  col: 13, hidden: true },
            { row: 11, col: 20, hidden: true },
            { row: 13, col: 22, hidden: true },
            { row: 15, col: 8,  hidden: true },
            { row: 17, col: 15, hidden: true },
            { row: 19, col: 4,  hidden: true },
            { row: 3,  col: 21, hidden: true },
            { row: 7,  col: 18, hidden: true },
        ],
        enemies: [
            { row: 5,  col: 20 },
            { row: 9,  col: 1  },
            { row: 13, col: 5  },
            { row: 17, col: 9  },
        ],
        enemyInterval: 360,
        items: [
            { row: 1,  col: 23, type: "heal",   collected: false },
            { row: 3,  col: 1,  type: "key",    collected: false, keyId: 1 },
            { row: 7,  col: 5,  type: "key",    collected: false, keyId: 2 },
            { row: 13, col: 4,  type: "key",    collected: false, keyId: 3 },
            { row: 1,  col: 20, type: "riddle", collected: false, riddleId: 1 },
            { row: 3,  col: 19, type: "riddle", collected: false, riddleId: 2 },
            { row: 7,  col: 18, type: "riddle", collected: false, riddleId: 3 },
        ],
        doors: [
            { row: 4,  col: 3,  keyId: 1, open: false },
            { row: 10, col: 3,  keyId: 2, open: false },
            { row: 16, col: 2,  keyId: 3, open: false },
        ],
        riddlesRequired: 3,
        fireballs: [],
    },
    4: {
        traps: [
            {row:1, col:5, hidden: true},
            {row:3, col:9, hidden: true},
            {row:5, col:12, hidden: true},
            {row:7, col:3, hidden: true},
            {row:9, col:17, hidden: true},
            {row:11, col:6, hidden: true},
            {row:13, col:20, hidden: true},
            {row:15, col:4, hidden: true},
            {row:17, col:11, hidden: true},
            {row:19, col:8, hidden: true},
            {row:3, col:22, hidden: true},
            {row:7, col:15, hidden: true},
            {row:11, col:23, hidden: true},
            {row:15, col:19, hidden: true},
    ],
        enemies: [
            {row:1, col:22},
            {row:5, col:1},
            {row:9, col:11},
            {row:13, col:7},
            {row:17, col:20},
        ],
        enemyInterval: 300,
        items: [
            {row:19, col:1, type:"heal", collected:false},
            {row:3, col:3, type:"key", collected:false, keyId:1},
            {row:7, col:11, type:"key", collected:false, keyId:2},
            {row:13, col:17, type:"key", collected:false, keyId:3},
            {row:1, col:18, type:"riddle", collected:false, riddleId:1},
            {row:5, col:7, type:"riddle", collected:false, riddleId:2},
            {row:11, col:3, type:"riddle", collected:false, riddleId:3},
            {row:17, col:5, type:"riddle", collected:false, riddleId:4},
        ],
        doors: [
            {row:4, col:3, keyId:1, open:false},
            {row:10, col:7, keyId:2, open:false},
            {row:16, col:17, keyId:3, open:false},
        ],
        riddlesRequired: 4,
        fireballs: [
            { row: 19, col: 22, active: true, chaseSteps: 0, maxChase: 9,
                falling: false, fallProgress: 0, respawnTicks: 0,
                lavaRow: 19, lavaCol: 13 }
        ],
    },

};
// aktywne dane (ładowane przez loadLevel)
let traps    = [];
let enemies  = [];
let items    = [];
let doors    = [];
let fireballs = [];
let riddlesRequired = 1;
let enemyIntervalMs = 500;

// ładuje dane poziomu — resetuje stan
function loadLevel(level) {
    const d = levelData[level];

    traps    = d.traps.map(t => ({ ...t }));
    enemies  = d.enemies.map(e => ({ ...e }));
    items    = d.items.map(i => ({ ...i }));
    doors    = d.doors.map(d2 => ({ ...d2 }));
    fireballs = d.fireballs.map(f => ({ ...f }));
    riddlesRequired = d.riddlesRequired;
    enemyIntervalMs = d.enemyInterval;

    // podmień labirynt
    if (level === 1) maze = mazeLevel1.map(r => [...r]);
    if (level === 2) maze = mazeLevel2.map(r => [...r]);
    if (level === 3) maze = mazeLevel3.map(r => [...r]);
    if (level === 4) maze = mazeLevel4.map(r => [...r]);

    playerRow = 1;
    playerCol = 1;
    hp        = 3;
    riddleSolved = false;
    gameOver     = false;
}

// ile zagadek gracz już rozwiązał
let riddlesSolved = 0;

//animacja ruchu 
let playerPixelX=1*cellSize;
let playerPixelY=1*cellSize;
let playerTargetPixelX=1*cellSize;
let playerTargetPixelY=1*cellSize;
const animSpeed = 0.2; // 0.0-1.0, im wyżej tym szybszy ruch 

