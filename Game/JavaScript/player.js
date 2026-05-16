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
            { row: 1,  col: 19 },
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
            { row: 6,  col: 7,  keyId: 1, open: false },
            { row: 14, col: 17, keyId: 2, open: false },
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

    playerRow = 1;
    playerCol = 1;
    hp        = 3;
    riddleSolved = false;
    gameOver     = false;
}

// ile zagadek gracz już rozwiązał
let riddlesSolved = 0;
