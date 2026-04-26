
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
    // czy gracz dotarl do mety
    if (playerRow === exit.row && playerCol === exit.col) {
    playSound(800, 0.5);
    if (highScore === 0 || score < highScore) highScore = score;
    score = 0;
    playerCol = 1;
    playerRow = 1;
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
