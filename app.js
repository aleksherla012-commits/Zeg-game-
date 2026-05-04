// ruch gracza
document.addEventListener("keydown", function(event) {
    let newRow = playerRow;
    let newCol = playerCol;

    //po naciśnięciu r nastąpi restart
    if (gameOver){
      if  (event.key==="r"||event.key==="R")
        {
        playerRow=1;
        playerCol=1;
        hp=3;
        score=0;
        gameOver=false;
        riddleSolved=false;
        for(const item of items) item.collected=false;
        for(const door of doors) door.open=false;
        render();
    }
    return;
}

    if (event.key === "w" || event.key === "ArrowUp")    newRow--;
    if (event.key === "s" || event.key === "ArrowDown")  newRow++;
    if (event.key === "a" || event.key === "ArrowLeft")  newCol--;
    if (event.key === "d" || event.key === "ArrowRight") newCol++;

    // sprawdź czy drzwi blokują ruch
    const blockedDoor = doors.find(d => !d.open && d.row === newRow && d.col === newCol);

    if (blockedDoor) {
        // sprawdź czy gracz ma odpowiedni klucz
        const matchingKey = items.find(i => i.type === "key" && i.keyId === blockedDoor.keyId && i.collected);
        if (matchingKey) {
            blockedDoor.open = true;
            playerRow = newRow;
            playerCol = newCol;
            playSound(500, 0.3);
            score++;
        } else {
            playSound(100, 0.1); // brzęk - brak klucza
        }
    } else if (canMove(newRow, newCol)) {
        playerRow = newRow;
        playerCol = newCol;
        playSound(200, 0.05);
        score++;
    }

    //sprawdzenie czy gracz wszedł na przedmiot 
    for(const item of items ){
        if(!item.collected && playerRow===item.row && playerCol===item.col){
            
            if(item.type==="heal"){
                if(hp<3) hp++;
                playSound(600,0.3);
                item.collected=true;
            }
            if(item.type==="key"){
                playSound(500,0.2);
                item.collected=true;
            }
            if (item.type === "riddle") {
                const overlay = document.getElementById("riddle-overlay");
                overlay.classList.add("active");

                document.querySelectorAll(".riddle-btn").forEach(btn => {
                    btn.onclick = function() {
                        overlay.classList.remove("active");

                        if (btn.dataset.color === "zloty") {
                            playSound(800, 0.4);
                            riddleSolved = true;
                            item.collected = true;
                        } else {
                            hp--;
                            playSound(100, 0.3);
                            const freeSpaces = [
                                {row:1, col:10}, {row:7, col:4},
                                {row:11, col:17}, {row:15, col:23},
                            ];
                            const random = freeSpaces[Math.floor(Math.random() * freeSpaces.length)];
                            item.row = random.row;
                            item.col = random.col;
                        }
                        render();
                    };
                });
            }
        }
    }

    // sprawdź czy gracz wszedł na pułapkę
    for (const trap of traps) {
        if (playerRow === trap.row && playerCol === trap.col) {
            hp--;
            playSound(100, 0.3);
            if (hp <= 0) {
                gameOver=true;
            }
        }
    }

    // czy gracz dotarł do mety
    if (playerRow === exit.row && playerCol === exit.col) {
        if (riddleSolved) {
            playSound(800, 0.5);
            if (highScore === 0 || score < highScore) highScore = score;
            score = 0;
            playerRow = 1;
            playerCol = 1;
            riddleSolved = false;
            for(const item of items) item.collected=false;
            for(const door of doors) door.open=false;
        } else {
            playSound(100, 0.2); // zablokowane - brak zagadki
        }
    }

    render();
});

render();

// kliknięcie New Game startuje grę
document.getElementById("btn-new").addEventListener("click", startGame);

//kliknięcie continue zaczyna gre od momentu opuszczenia
document.getElementById("btn-continue").addEventListener("click", function() {
    if(score>0 || currentLevel>1){
        document.getElementById("start-screen").style.display = "none";
        document.getElementById("canvas_gry").style.display = "block";
        render();
    } else {
        alert("nie zapisałeś żadnej gry");
    }
});

//kliknięcie quit opuszcza stronę 
document.getElementById("btn-quit").addEventListener("click", function() {
    if (confirm("Czy na pewno chcesz wyjść?")) {
        window.close();
    }
});

// chowa menu i zaczyna grę
function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("canvas_gry").style.display = "block";
    render();
}
