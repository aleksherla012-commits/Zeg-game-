
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
        for(const item of items ) item.collected=false;
        render();
    }
    return;
}

    if (event.key === "w" || event.key === "ArrowUp")    newRow--;
    if (event.key === "s" || event.key === "ArrowDown")  newRow++;
    if (event.key === "a" || event.key === "ArrowLeft")  newCol--;
    if (event.key === "d" || event.key === "ArrowRight") newCol++;

    // ruch tylko jeśli nie ma ściany
    if (canMove(newRow, newCol)) {
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
                alert("Znalazłeś klucz!");
                item.collected=true;
            }
            if (item.type === "riddle") {
    // pokaż nakładkę
    const overlay = document.getElementById("riddle-overlay");
    overlay.classList.add("active");

    document.querySelectorAll(".riddle-btn").forEach(btn => {
        btn.onclick = function() {
            // ukryj nakładkę po kliknięciu
            overlay.classList.remove("active");

            // ukryj nakładkę po kliknięciu
            overlay.classList.remove("active");
 
            if (btn.dataset.color === "zloty") {
                // dobra odpowiedź
                playSound(800, 0.4);
                riddleSolved = true;
                item.collected = true;
                // // blok znika po rozwiązaniu zagadki
                //     if (!riddleSolved) {
                //         canvas_context.fillStyle = "cyan";
                //         canvas_context.fillRect(24 * cellSize, 18 * cellSize, cellSize, cellSize);
                //     }
            } else {
                // zła odpowiedź — kara i losowe przesunięcie zagadki
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
    // czy gracz dotarl do mety i blokowanie go jeżeli nie rozwiązał zagadki 
if (playerRow === exit.row && playerCol === exit.col) {
    playSound(800, 0.5);
    if (highScore === 0 || score < highScore) highScore = score;
    score = 0;
    playerRow = 1;
    playerCol = 1;
    riddleSolved = false;
}
    render();
});

render();

// kliknięcie New Game startuje grę
document.getElementById("btn-new").addEventListener("click", startGame);

//kliknięcie continue zaczyna gre od momentu opuszczenia
document.getElementById("btn-continue").addEventListener("click", function() {
    //tylko jeżeli gracz zaczynał już kiedyś gre
    if(score>0 || currentLevel>1){
         document.getElementById("start-screen").style.display = "none";
    document.getElementById("canvas_gry").style.display = "block";
    render();
    }
    //jeżeli brak
    else{
        alert("nie zapisałeś żadnej gry ")
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
