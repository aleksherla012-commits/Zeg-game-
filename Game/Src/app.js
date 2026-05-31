// ruch gracza
document.addEventListener("keydown", function (event) {
    let newRow = playerRow;
    let newCol = playerCol;



    if (gameOver) {
        if (event.key === "m" || event.key === "M") {
            hideCanvas();
            document.getElementById("start-screen").style.display = "flex";
            return;
        }
        if (event.key === "r" || event.key === "R") {
            loadLevel(currentLevel);
            riddlesSolved = 0;
            score = 0;
            initEnemies();
            render();
        }
        return;
    }

    if (gamePaused) return;

    if (event.key === "w" || event.key === "ArrowUp")    newRow--;
    if (event.key === "s" || event.key === "ArrowDown")  newRow++;
    if (event.key === "a" || event.key === "ArrowLeft")  newCol--;
    if (event.key === "d" || event.key === "ArrowRight") newCol++;

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

    for (const trap of traps) {
        if (playerRow === trap.row && playerCol === trap.col) {
            hp--;
            playSound(100, 0.3);
            if (hp <= 0) setDeath("trap");
        }
    }


    // kolizja gracza z kula (przy ruchu gracza)
    for (const fb of fireballs) {
        if (!fb.active || fb.falling) continue;
        if (playerRow === fb.row && playerCol === fb.col) {
            hp -= 2;
            if (hp < 0) hp = 0;
            playSound(120, 0.4);
            if (hp <= 0) { setDeath("ball"); render(); return; }
            fb.falling      = true;
            fb.fallProgress = 0;
        }
        if (playerRow === fb.lavaRow && playerCol === fb.lavaCol) {
            hp -= 3;
            if (hp < 0) hp = 0;
            playSound(80, 0.5);
            if (hp <= 0) { setDeath("lava"); render(); return; }
        }
    }

    //funkcja definiuje showlevelcomplete
    function showLevelComplete() {
        const levelNames = {
            PL:["PODZIEMIA FARAONA", "KOMORY ZAPOMNIANYCH", "KRYPTA WIECZNEGO SNU", "SANKTUARIUM BOGA RA"],
            EN:["PHARAOH'S UNDERGROUND", "CHAMBERS OF FORGOTTEN", "CRYPT OF ETERNAL SLEEP", "SANCTUARY OF RA"],
        };
        //wypelnie danych
        const nameEl = document.getElementById("lc-level-name");
        const scoreEl = document.getElementById("lc-score");
        const highscoreEl = document.getElementById("lc-highscore");
        if (nameEl) nameEl.textContent = levelNames[currentLang][currentLevel - 1] || "LEVEL " + currentLevel;
        if (scoreEl) scoreEl.textContent = score;
        if (highscoreEl) highscoreEl.textContent = highScore;
    
            //blokowanie przycisku next jesli to ostatni poziom
        const btnNext = document.getElementById("lc-btn-next");
        if (currentLevel >= 4) {
            btnNext.classList.add("disabled");
        } else {
            btnNext.classList.remove("disabled");
        }



        //funkcja ekranu końcowego gry 
        function showVictory(){
            const overlay=document.getElementById("level-complete-overlay");
            const box=document.getElementById("level-complete-box");
              box.innerHTML = `
        <div class="lc-title-small">${currentLang === "PL" ? "GRATULACJE" : "CONGRATULATIONS"}</div>
        <div class="lc-hieroglyph">𓁹</div>
        <div class="lc-level-name">${currentLang === "PL" ? "UKOŃCZYŁEŚ VEIL OF RIDDLES" : "YOU COMPLETED VEIL OF RIDDLES"}</div>
        <div class="lc-stats">
            <div class="lc-stat">
                <span class="lc-stat-label">${currentLang === "PL" ? "WYNIK" : "SCORE"}</span>
                <span class="lc-stat-value">${score}</span>
            </div>
            <div class="lc-stat-divider"></div>
            <div class="lc-stat">
                <span class="lc-stat-label">${currentLang === "PL" ? "REKORD" : "RECORD"}</span>
                <span class="lc-stat-value">${highScore}</span>
            </div>
        </div>
        <div class="lc-buttons">
            <div class="lc-btn" id="vic-btn-menu">
                <span class="lc-btn-icon">↩</span>
                <span class="lc-btn-label">${currentLang === "PL" ? "MENU\nGŁÓWNE" : "MAIN\nMENU"}</span>
            </div>
        </div>
    `;
            gamePaused=true;
            overlay.classList.add("active");
            document.getElementById("vic-btn-menu").addEventListener("click",function(){
                overlay.classList.remove("active");
                document.getElementById("game-wrapper").style.display="none";
                document.getElementById("start-screen").style.display="flex";
                gamePaused=false;
                score=0;
                riddlesSolved=0;
                unlockedLevels=1;
                loadLevels(1);
                initEnemies();
            });

        }


        if(currentLevel===4){
            showVictory();
        }else{
        //poazuje overlay
        gamePaused = true;
        document.getElementById("level-complete-overlay").classList.add("active");
        updateLevelCards();}
    }


        //obsluga przycisku next w ekranie ukończenia poziomu
        document.getElementById("lc-btn-next").addEventListener("click", function() {
            document.getElementById("level-complete-overlay").classList.remove("active");
            gamePaused = false;
            if (currentLevel < 4) {
         
                score = 0;
                riddlesSolved = 0;
                loadLevel(currentLevel);
                initEnemies();
            }
        });

        //wybór poziomu
        document.getElementById("lc-btn-levels").addEventListener("click", function() {
        document.getElementById("level-complete-overlay").classList.remove("active");
        document.getElementById("game-wrapper").style.display = "none";
        document.getElementById("n").style.display = "flex";
        gamePaused = false;
        updateLevelCards();
        
        });
        //menu główne
        document.getElementById("lc-btn-menu").addEventListener("click", function() {
            document.getElementById("level-complete-overlay").classList.remove("active");
            document.getElementById("game-wrapper").style.display = "none";
            document.getElementById("start-screen").style.display = "flex";
            gamePaused = false;
            score = 0;
        });
    


    if (playerRow === exit.row && playerCol === exit.col) {
        if (riddleSolved) {
            playSound(800, 0.5);
            if (highScore === 0 || score < highScore) highScore = score;

            showLevelComplete();
        } else {
            playSound(100, 0.2);
        }
    }

    
});

// ---- baza zagadek egipskich ----
const riddleBank = [
    {
        question: "Nil podczas wylewu barwil wody na czerwono. Ktory kolor Egipcjanie czcili jako symbol zycia i odrodzenia?",
        type: "color",
        answers: [
            { color: "#c0392b", value: "czerwony" },
            { color: "#1a6b3a", value: "zielony"  },
            { color: "#1a3a6b", value: "niebieski" },
            { color: "#8B4513", value: "brazowy"   },
        ],
        correct: "czerwony",
    },
    {
        question: "Straznik bram zaswiatow — pol czlowiek, pol szakal. Jak brzmi imie boga mumifikacji?",
        type: "text",
        answers: [
            { label: "Ozyrys", value: "ozyrys" },
            { label: "Anubis", value: "anubis" },
            { label: "Horus",  value: "horus"  },
            { label: "Thot",   value: "thot"   },
        ],
        correct: "anubis",
    },
    {
        question: "Ile kanop uzywano do przechowywania organow wewnetrznych podczas mumifikacji?",
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
        question: "Serce wazono na szali naprzeciwko piora bogini prawdy i sprawiedliwosci. Jak miala na imie?",
        type: "text",
        answers: [
            { label: "Izyda",  value: "izyda"  },
            { label: "Hathor", value: "hathor" },
            { label: "Maat",   value: "maat"   },
            { label: "Nut",    value: "nut"     },
        ],
        correct: "maat",
    },
    {
        question: "Lapis lazuli byl kamieniem nieba i ochrony. Ktory kolor nosil w sobie moc oka Horusa?",
        type: "color",
        answers: [
            { color: "gold",    value: "zloty"    },
            { color: "#2471a3", value: "niebieski" },
            { color: "#27ae60", value: "zielony"   },
            { color: "#922b21", value: "czerwony"  },
        ],
        correct: "niebieski",
    },
    {
        question: "Ktory faraon jako pierwszy zjednoczy Gorny i Dolny Egipt, zakladajac pierwsza dynastie?",
        type: "text",
        answers: [
            { label: "Ramzes II",   value: "ramzes"   },
            { label: "Narmer",      value: "narmer"   },
            { label: "Tutanchamon", value: "tut"      },
            { label: "Echanton",    value: "echanton" },
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

const riddleAssignments = {
    1: { 1: 0 },
    2: { 1: 1, 2: 2 },
    3: { 1: 3, 2: 4, 3: 5 },
    4: { 1: 6, 2: 7, 3: 8, 4: 9 },
};

function showRiddle(item) {
    const overlay  = document.getElementById("riddle-overlay");
    const question = document.getElementById("riddle-question");
    const buttons  = document.getElementById("riddle-buttons");

    const idx    = (riddleAssignments[currentLevel] || {})[item.riddleId] ?? 0;
    const riddle = riddleBank[idx];

    question.textContent = riddle.question;
    buttons.innerHTML = "";

    riddle.answers.forEach(function(ans) {
        const btn = document.createElement("button");
        btn.className = "riddle-btn";

        if (riddle.type === "color") {
            btn.style.background = ans.color;
            btn.dataset.answer   = ans.value;
        } else {
            btn.classList.add("riddle-btn-text");
            btn.textContent    = ans.label;
            btn.dataset.answer = ans.value;
        }

        btn.onclick = function () {
            overlay.classList.remove("active");
            gamePaused = false;

            if (btn.dataset.answer === riddle.correct) {
                playSound(800, 0.4);
                item.collected = true;
                riddlesSolved++;
                if (riddlesSolved >= riddlesRequired) riddleSolved = true;
            } else {
                hp--;
                playSound(100, 0.3);
                if (hp <= 0) { setDeath("riddle"); render(); return; }

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

    gamePaused = true;
    overlay.classList.add("active");
}


// ---- poziomy odblokowane (zapisane w localStorage) ----
function getUnlockedLevels() {
    try { return JSON.parse(localStorage.getItem("veilUnlocked") || "[1]"); } catch(e) { return [1]; }
}
function unlockLevel(n) {
    const ul = getUnlockedLevels();
    if (!ul.includes(n)) { ul.push(n); localStorage.setItem("veilUnlocked", JSON.stringify(ul)); }
}
function updateLevelCards() {
    const ul = getUnlockedLevels();
    document.querySelectorAll(".level-card").forEach(function(card) {
        const lvl = parseInt(card.dataset.level);
        if (ul.includes(lvl)) {
            card.classList.remove("locked");
            card.classList.add("unlocked");
            const req = card.querySelector(".level-req");
            if (req) req.remove();
            const lock = card.querySelector(".level-lock");
            if (lock) lock.remove();
        }
    });
}

function showCanvas() {
    document.getElementById("game-wrapper").style.display = "flex";
    updateHUD();
}
function hideCanvas() {
    document.getElementById("game-wrapper").style.display = "none";
}

document.getElementById("btn-new").addEventListener("click", function() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("level-select-screen").style.display = "flex";
    updateLevelCards();
});

document.querySelectorAll(".level-card").forEach(function(card) {
    card.addEventListener("click", function() {
        if (!card.classList.contains("unlocked")) return;
        const lvl = parseInt(card.dataset.level);
        currentLevel = lvl;
        score = 0;
        riddlesSolved = 0;
        loadLevel(lvl);
        initEnemies();
        document.getElementById("level-select-screen").style.display = "none";
        showCanvas();
    });
});



//ile poziomów ukończono 
let unlockedLevels=1;
//funkcja odblokowująca poziomy i aktualizująca karty poziomów
function updateLevelCards() {
    document.querySelectorAll(".level-card").forEach(function(card) {
        const lvl = parseInt(card.dataset.level);
        if (lvl <= unlockedLevels) {
            card.classList.remove("locked");
            card.classList.add("unlocked");
            const lockEl= card.querySelector(".level-lock");
            if (lockEl) lockEl.style.display = "none";
        }else {
            card.classList.remove("unlocked");
            card.classList.add("locked");
        }
    });
}



document.getElementById("btn-level-back").addEventListener("click", function() {
    document.getElementById("level-select-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
});

document.getElementById("btn-continue").addEventListener("click", function () {
    if (score > 0 || currentLevel > 1) {
        document.getElementById("start-screen").style.display = "none";
        showCanvas();
        render();
    } else {
        alert(translations[currentLang].noSave);
    }
});
//słownik tłumaczeń (na potrzeby przycisków i komunikatów)
const translations = {
    PL:{
        newGame: "Nowa Gra",
        continue: "Kontynuuj",
        settings: "Ustawienia",
        quit: "Wyjście",
        sound_on: "Dźwięk: WŁ",
        sound_off: "Dźwięk: WYŁ",
        lang: "Język: PL",
        back: "Powrót",
        noSave: "nie zapisałes zadnej gry",
        quitMSG: "Czy na pewno chcesz wyjsc?",
        levels: [
    { label: "POZIOM 1", name: "Podziemia\nFaraona", desc: "Strach zaczyna się tutaj" },
    { label: "POZIOM 2", name: "Komory\nZapomnianych", desc: "Lawa nie będzie czekać", req: "Ukończ poziom 1" },
    { label: "POZIOM 3", name: "Krypta\nWiecznego Snu", desc: "Mgła pochłania wszystko", req: "Ukończ poziom 2" },
    { label: "POZIOM 4", name: "Sanktuarium\nRa",        desc: "Ostateczny test",          req: "Ukończ poziom 3" },
],
    },
    EN:{
        newGame: "New Game",
        continue: "Continue",
        settings: "Settings",
        quit: "Quit",
        sound_on: "Sound: ON",
        sound_off: "Sound: OFF",
        lang: "Language: EN",
        back: "Back",
        noSave: "You haven't saved any game",
        quitMSG: "Are you sure you want to quit?",
        levels: [
    { label: "LEVEL 1", name: "Pharaoh's\nUndergound",  desc: "Fear starts here",          req: "Complete level 1" },
    { label: "LEVEL 2", name: "Chambers of\nForgotten", desc: "Lava won't wait",           req: "Complete level 2" },
    { label: "LEVEL 3", name: "Crypt of\nEternal Sleep", desc: "Fog consumes all",         req: "Complete level 3" },
    { label: "LEVEL 4", name: "Sanctuary\nof Ra",        desc: "The final trial",          req: "Complete level 4" },
],
               
    },
};


//funkcja do zmiany jezyka
function applyLanguage(lang) {
    const t = translations[lang];
    document.getElementById("btn-new").childNodes[0].textContent = t.newGame +"";
    document.getElementById("btn-continue").childNodes[0].textContent = t.continue +"";
    document.getElementById("btn-settings").childNodes[0].textContent = t.settings +"";
    document.getElementById("btn-quit").childNodes[0].textContent = t.quit +"";
    document.getElementById("btn-lang").childNodes[0].textContent = t.lang +"";
    document.getElementById("btn-back").childNodes[0].textContent = t.back +"";
    document.getElementById("settings-title").textContent = t.settings; 
    const muteBtn = document.getElementById("btn-mute");
    muteBtn.childNodes[0].textContent = (isMuted ? t.sound_off + " " : t.sound_on) + " ";
const hudLabels = {
    PL: ["ŻYCIA", "KLUCZE", "ZAGADKI", "WYNIK", "REKORD", "POZIOM"],
    EN: ["LIVES",  "KEYS",   "RIDDLES", "SCORE", "RECORD", "LEVEL" ],
};
const labels = hudLabels[lang];
const hudLabelEls = document.querySelectorAll(".hud-label");
hudLabelEls.forEach(function(el, i) {
    if (labels[i]) el.textContent = labels[i];
});

const levelCards = document.querySelectorAll(".level-card");
levelCards.forEach(function(card, i) {
const lvl=t.levels[i];
if (lvl) {
    const labelEl = card.querySelector(".level-label");
    const nameEl  = card.querySelector(".level-name");
    const descEl  = card.querySelector(".level-desc");
    const reqEl   = card.querySelector(".level-req");
    if (labelEl) labelEl.textContent = lvl.label;
    if (nameEl) nameEl.innerHTML = lvl.name.replace("\n", "<br>");
    if (descEl) descEl.textContent = lvl.desc;
    if (reqEl) reqEl.textContent = lvl.req;
}
});
}


//otwiera settings
document.getElementById("btn-settings").addEventListener("click", function () {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("settings-screen").style.display = "flex";
});
//przycisk mute
document.getElementById("btn-mute").addEventListener("click", function () {
    isMuted = !isMuted;
    const t = translations[currentLang];
    this.innerHTML = isMuted
        ? `${t.sound_off} <span>🔇</span>`
        : `${t.sound_on} <span>🔊</span>`;
});
//przycisk jezyk
document.getElementById("btn-lang").addEventListener("click", function () {
    currentLang = currentLang === "PL" ? "EN" : "PL";
    applyLanguage(currentLang);
});
//powrót do menu
document.getElementById("btn-back").addEventListener("click", function () {
    document.getElementById("settings-screen").style.display = "none";
    document.getElementById("start-screen").style.display = "flex";
});

document.getElementById("btn-quit").addEventListener("click", function () {
    if (confirm(translations[currentLang].quitMSG)) {
        localStorage.removeItem("veilUnlocked");
        window.close();
    }
});

function startGame(lvl) {
    lvl = lvl || 1;
    currentLevel  = lvl;
    score         = 0;
    riddlesSolved = 0;
    loadLevel(lvl);
    initEnemies();
    document.getElementById("start-screen").style.display = "none";
    showCanvas();
}
// ---- ekran ukończenia poziomu ----
const levelNames = {
    1: "PODZIEMIA FARAONA",
    2: "KOMORY ZAPOMNIANYCH",
    3: "KRYPTA WIECZNEGO SNU",
    4: "SANKTUARIUM BOGA RA",
};
const levelHieroglyphs = { 1: "𓂀", 2: "𓆏", 3: "𓋹", 4: "𓁹" };

function showLevelComplete() {
    gamePaused = true;

    // unlock następny poziom
    if (currentLevel < 4) unlockLevel(currentLevel + 1);

    const overlay = document.getElementById("level-complete-overlay");
    document.getElementById("lc-level-name").textContent = levelNames[currentLevel] || "POZIOM " + currentLevel;
    document.querySelector(".lc-hieroglyph").textContent = levelHieroglyphs[currentLevel] || "𓂀";
    document.getElementById("lc-score").textContent     = score;
    document.getElementById("lc-highscore").textContent = highScore;

    const btnNext = document.getElementById("lc-btn-next");
    if (currentLevel >= 4) {
        btnNext.classList.add("disabled");
    } else {
        btnNext.classList.remove("disabled");
    }

    overlay.classList.add("active");
}

document.getElementById("lc-btn-next").addEventListener("click", function() {
    const overlay = document.getElementById("level-complete-overlay");
    overlay.classList.remove("active");
    gamePaused = false;

    if (currentLevel < 4) {
        currentLevel++;
        score = 0;
        riddlesSolved = 0;
        loadLevel(currentLevel);
        initEnemies();
    }
});

document.getElementById("lc-btn-levels").addEventListener("click", function() {
    document.getElementById("level-complete-overlay").classList.remove("active");
    gamePaused = false;
    hideCanvas();
    document.getElementById("level-select-screen").style.display = "flex";
    updateLevelCards();
});

document.getElementById("lc-btn-menu").addEventListener("click", function() {
    document.getElementById("level-complete-overlay").classList.remove("active");
    gamePaused = false;
    hideCanvas();
    document.getElementById("start-screen").style.display = "flex";
});


function gameLoop() {
    render();
    requestAnimationFrame(gameLoop);
}
gameLoop();
