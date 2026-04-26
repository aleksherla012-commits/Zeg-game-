// porusza przeciwnikiem co sekundę
setInterval(function() {
    const kierunki = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
    ];
    const losowy = kierunki[Math.floor(Math.random() * 4)];
    const newRow = enemy.row + losowy.dr;
    const newCol = enemy.col + losowy.dc;
    if (canMove(newRow, newCol)) {
        enemy.row = newRow;
        enemy.col = newCol;
        playSound(150, 0.3);
    }
    // jeśli dotknął gracza — zabiera HP
    if (enemy.row === playerRow && enemy.col === playerCol) {
        hp--;
        if (hp <= 0) {
            playerCol = 1;
            playerRow = 1;
            hp = 3;
        }
    }
    const losowy2 = kierunki[Math.floor(Math.random() * 4)];
    const newRow2 = enemy2.row + losowy2.dr;
    const newCol2 = enemy2.col + losowy2.dc;
    if (canMove(newRow2, newCol2)) {
        enemy2.row = newRow2;
        enemy2.col = newCol2;
        playSound(150, 0.3);
    }
    if (enemy2.row === playerRow && enemy2.col === playerCol) {
        hp--;
        if (hp <= 0) {
            playerCol = 1;
            playerRow = 1;
            hp = 3;
        }
    }
    render();
}, 500);
