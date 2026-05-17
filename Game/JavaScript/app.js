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
            playerTargetX = newCol * cellSize;
            playerTargetY = newRow * cellSize;
            playSound(500, 0.3);
            score++;
        } else {
            playSound(100, 0.1);
        }
    } else if (canMove(newRow, newCol)) {
        playerRow = newRow;
        playerCol = newCol;
        playerTargetX = newCol * cellSize;
        playerTargetY = newRow * cellSize;
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
            if (currentLevel < 4) {
                currentLevel++;
                riddlesSolved = 0;
                loadLevel(currentLevel);
                initEnemies();
            } else {
                // ukończyłeś ostatni poziom (na razie level 3) — reset do 1
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

    
});

// ---- baza zagadek egipskich ----
const riddleBank = [
    {
        question: "Nil podczas wylewu barwił wody na czerwono. Który kolor Egipcjanie czcili jako symbol życia i odrodzenia?",
        type: "color",
        answers: [
            { label: null, color: "#c0392b", value: "czerwony" },
            { label: null, color: "#1a6b3a", value: "zielony" },
            { label: null, color: "#1a3a6b", value: "niebieski" },
            { label: null, color: "#8B4513", value: "brazowy" },
        ],
        correct: "czerwony",
    },
    {
        question: "Strażnik bram zaświatów, pół człowiek pół szakal, bóg mumifikacji. Jak brzmi jego imię?",
        type: "text",
        answers: [
            { label: "Ozyrys",  value: "ozyrys"  },
            { label: "Anubis",  value: "anubis"  },
            { label: "Horus",   value: "horus"   },
            { label: "Thot",    value: "thot"    },
        ],
        correct: "anubis",
    },
    {
        question: "Ile kanop używano do przechowywania organów wewnętrznych podczas mumifikacji?",
        type: "text",
        answers: [
            { label: "2", value: "2" },
            { label: "4", value: "4" },
            { label: "6", value: "6" },
            { label: "8", value: "8" },
        ],
        correct: "4",
    },
    {
        question: "Serce ważono na szali naprzeciwko pióra. Pióro należało do bogini prawdy i sprawiedliwości. Jak miała na imię?",
        type: "text",
        answers: [
            { label: "Izyda",  value: "izyda"  },
            { label: "Hathor", value: "hathor" },
            { label: "Maat",   value: "maat"   },
            { label: "Nut",    value: "nut"    },
        ],
        correct: "maat",
    },
    {
        question: "Lapis lazuli był kamieniem nieba i ochrony. Który kolor nosił w sobie moc oka Horusa?",
        type: "color",
        answers: [
            { label: null, color: "gold",    value: "zloty"    },
            { label: null, color: "#2471a3", value: "niebieski" },
            { label: null, color: "#27ae60", value: "zielony"  },
            { label: null, color: "#922b21", value: "czerwony" },
        ],
        correct: "niebieski",
    },
    {
        question: "Który faraon jako pierwszy zjednoczył Górny i Dolny Egipt, zakładając pierwszą dynastię?",
        type: "text",
        answers: [
            { label: "Ramzes II",  value: "ramzes"   },
            { label: "Narmer",     value: "narmer"   },
            { label: "Tutanchamon",value: "tut"      },
            { label: "Echanton",   value: "echanton" },
        ],
        correct: "narmer",
    },
    //nowa zagadka dla poziomu 4
    {
        question: "Która bogini rozpostarła skrzydła nad sarkofagiem, chroniąc ciało faraona przed złem?",
        type: "text",
        answers: [
            { label: "Izyda",  value: "izyda"  },
            { label: "Hathor", value: "hathor" },
            { label: "Maat",   value: "maat"   },
            { label: "Nut",    value: "nut"    },
        ],
        correct: "izyda",
    },
    {
        question:"Ile lat trwała budowa Wielkiej Piramidy w Gizie, grobowca faraona Cheopsa?",
        type: "text",
        answers: [
            { label: "10", value: "10" },
            { label: "20", value: "20" },
            { label: "30", value: "30" },
            { label: "40", value: "40" },
        ],
        correct: "20",
    },
    {
        question: "kolor ochrony przed złem-kolor skarabeuszy i amuletów zycia",
        type: "color",
        answers: [
            { label: null, color: "gold",    value: "zloty"    },
            { label: null, color: "#2471a3", value: "niebieski" },
            { label: null, color: "#27ae60", value: "zielony"  },
            { label: null, color: "#922b21", value: "czerwony" },
        ],
        correct: "zielony",
          
    },
    {
        question: "Starożytni Egipcjani wierzyli, że dusza skałada sie z 5 części.Która z nich była 'siłą życiową' człowieka ",
        type: "text",
        answers: [
            { label: "Ka", value: "ka" },
            { label: "Ba", value: "ba" },
            { label: "Akh", value: "akh" },
            { label: "Ren", value: "ren" },
        ],
        correct: "ka",

        
    },
];

// przypisuje konkretną zagadkę do każdego riddleId (per poziom)
const riddleAssignments = {
    1: { 1: 0 },
    2: { 1: 1, 2: 2 },
    3: { 1: 3, 2: 4, 3: 5 },
    4: { 1: 6, 2: 7, 3: 8, 4: 9 },
};

// ---- wyświetla zagadkę ----
function showRiddle(item) {
    const overlay  = document.getElementById("riddle-overlay");
    const question = document.getElementById("riddle-question");
    const buttons  = document.getElementById("riddle-buttons");

    // wybierz zagadkę
    const idx    = (riddleAssignments[currentLevel] || {})[item.riddleId] ?? 0;
    const riddle = riddleBank[idx];

    question.textContent = riddle.question;

    // wyczyść stare przyciski
    buttons.innerHTML = "";

    riddle.answers.forEach(ans => {
        const btn = document.createElement("button");
        btn.className = "riddle-btn";

        if (riddle.type === "color") {
            btn.style.background = ans.color;
            btn.dataset.answer   = ans.value;
        } else {
            // typ tekstowy — inne tło niż GUI zagadki
            btn.classList.add("riddle-btn-text");
            btn.textContent    = ans.label;
            btn.dataset.answer = ans.value;
        }

        btn.onclick = function () {
            overlay.classList.remove("active");

            if (btn.dataset.answer === riddle.correct) {
                playSound(800, 0.4);
                item.collected = true;
                riddlesSolved++;
                if (riddlesSolved >= riddlesRequired) riddleSolved = true;
            } else {
                hp--;
                playSound(100, 0.3);
                if (hp <= 0) { gameOver = true; render(); return; }

                const freeSpacesMap = {
                    1: [{ row:1,col:10 },{ row:7,col:4 },{ row:11,col:17 },{ row:15,col:23 }],
                    2: [{ row:1,col:9  },{ row:7,col:7 },{ row:13,col:13 },{ row:17,col:4  }],
                    3: [{ row:1,col:3  },{ row:5,col:5 },{ row:11,col:11 },{ row:17,col:17 }],
                };
                const freeSpaces = freeSpacesMap[currentLevel] || freeSpacesMap[1];
                const random = freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
                item.row = random.row;
                item.col = random.col;
            }
            render();
        };

        buttons.appendChild(btn);
    });

    overlay.classList.add("active");
}


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


//otwiera settings
document.getElementById("btn-settings").addEventListener("click", function () {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("settings-screen").style.display = "flex";
});
//przycisk mute
document.getElementById("btn-mute").addEventListener("click", function () {
    isMuted = !isMuted;
    his.innerHTML = isMuted
        ? "Dźwięk: WYŁ <span>🔇</span>"
        : "Dźwięk: WŁ <span>🔊</span>";
});
//przycisk jezyk
document.getElementById("btn-lang").addEventListener("click", function () {
    currentLang = currentLang === "PL" ? "EN" : "PL";
    this.innerHTML ='Język: ${currentLang} <span>🌐</span>';
});
//powrót do menu
document.getElementById("btn-back").addEventListener("click", function () {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
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
    
}
function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}   
gameLoop();
