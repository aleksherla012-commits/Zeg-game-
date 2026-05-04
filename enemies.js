// porusza przeciwnikiem co sekundę
setInterval(function() {
    if (gameOver) return;

    const kierunki = [
        { dr: -1, dc: 0 },
        { dr:  1, dc: 0 },
        { dr:  0, dc: -1 },
        { dr:  0, dc:  1 },
    ];

    for (const e of enemies) {
        const losowy = kierunki[Math.floor(Math.random() * 4)];
        const newRow = e.row + losowy.dr;
        const newCol = e.col + losowy.dc;

        if (canMove(newRow, newCol)) {
            e.row = newRow;
            e.col = newCol;
            playSound(150, 0.3);
        }
    // jeśli dotknął gracza — zabiera HP
        if (e.row === playerRow && e.col === playerCol) {
            hp--;
            if (hp <= 0) {
                playerRow = 1;
                playerCol = 1;
                hp = 3;
            }
        }
    }

    render();
}, 500);
