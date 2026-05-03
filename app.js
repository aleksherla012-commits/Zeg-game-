
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
        playSound(200, 0.05);
        score++;
    }

    //sprawdzenie czy gracz wszedł na przedmiot 
    for(const item of items ){
        if(!item.collected && playerRow===item.row && playerCol===item.col){
            item.collected=true;
            if(item.type==="heal"){
                if(hp<3) hp++;
                playSound(600,0.3);
            }
            if(item.type==="key"){
                playSound(500,0.2);
                alert("Znalazłeś klucz!");
            }
            if(item.type==="riddle"){
                const answer=prompt("Zagadka:ile nóg ma pająk?");
                if(answer==="8"){
                    playSound(800,0.4);
                    riddleSolved=true;
                    alert("Dobrze! Wyjście zostało odblokowane .");

                }
                else{
                    hp--;
                    playSound(100,0.3);
                    alert("Źle tracisz życie. ");
                }
            }
        }
    }


    // sprawdź czy gracz wszedł na pułapkę
    for (const trap of traps) {
    if (playerRow === trap.row && playerCol === trap.col) {
        hp--;
        playSound(100, 0.3);
        if (hp <= 0) {
            playerCol = 1;
            playerRow = 1;
            hp = 3;
        }
    }

    
}
    // czy gracz dotarl do mety i blokowanie go jeżeli nie rozwiązał zagadki 
if (playerRow === exit.row && playerCol === exit.col) {
    if (!riddleSolved) {
        playSound(100, 0.2);
        alert("Wyjście jest zablokowane! Znajdź zagadkę.");
        playerRow = 1;
        playerCol = 1;
    } else {
        playSound(800, 0.5);
        if (highScore === 0 || score < highScore) highScore = score;
        score = 0;
        playerRow = 1;
        playerCol = 1;
        riddleSolved = false; // reset na następny poziom
    }
}
    render();
});

render();

// kliknięcie New Game startuje grę
document.getElementById("btn-new").addEventListener("click", startGame);

// chowa menu i zaczyna grę
function startGame() {
    document.getElementById("start-screen").style.display = "none";
    document.getElementById("canvas_gry").style.display = "block";
    render();
}
