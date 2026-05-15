// canvas
const canvas_element = document.getElementById("canvas_gry");
const canvas_context = canvas_element.getContext("2d");
canvas_context.imageSmoothingEnabled = false;

const heartImg = new Image();
heartImg.src = 'heart.png';
const healImg= new Image();
healImg.src="heart.png";

// obrazki kluczy
const keyImgs = {
    1: new Image(),
    2: new Image(),
    3: new Image(),
};
keyImgs[1].src = "blue_key.png";
keyImgs[2].src = "red_key.png";
keyImgs[3].src = "green_key.png";

// rysuje labirynt
function drawMaze() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            canvas_context.fillStyle = maze[i][j] === 1 ? "black" : "white";
            canvas_context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
    }
    // cyan blok tuż przed metą — rysowany PO maze żeby nie był przykryty
    if (!riddleSolved) {
        canvas_context.fillStyle = "black";
        canvas_context.fillRect(23 * cellSize, 19 * cellSize, cellSize, cellSize);
    }
// rysuje mete
canvas_context.fillStyle = "gold";
canvas_context.fillRect(exit.col * cellSize, exit.row * cellSize, cellSize, cellSize);
// rysuje pułapki
for (const trap of traps) {
    canvas_context.fillStyle = "red";
    canvas_context.fillRect(trap.col * cellSize, trap.row * cellSize, cellSize, cellSize);
}
// rysuje drzwi
for (const door of doors) {
    if (!door.open) {
        drawPixelDoor(door.col * cellSize, door.row * cellSize, cellSize);
    }
}
}

// proste drzwi - jeden kolor i klamka
function drawPixelDoor(x, y, s) {
    // główny kolor drzwi
    canvas_context.fillStyle = "#8B4513";
    canvas_context.fillRect(x, y, s, s);

    // klamka - złote kółko
    canvas_context.fillStyle = "#FFD700";
    canvas_context.beginPath();
    canvas_context.arc(x + s - 8, y + s / 2, 3, 0, Math.PI * 2);
    canvas_context.fill();
}

// rysuje przeciwnicyy
function drawEnemies() {
    const kolory = ["orange", "purple"];
    const margin = 5;
    for (let i = 0; i < enemies.length; i++) {
        canvas_context.fillStyle = kolory[i];
        canvas_context.fillRect(
            enemies[i].col * cellSize + margin,
            enemies[i].row * cellSize + margin,
            cellSize - margin * 2,
            cellSize - margin * 2
        );
    }
}

// rysuje gracza
function drawPlayer() {
    const margin = 5;
    canvas_context.fillStyle = "blue";
    canvas_context.fillRect(
        playerCol * cellSize + margin,
        playerRow * cellSize + margin,
        cellSize - margin * 2,
        cellSize - margin * 2
    );
}
//poziom
let currentLevel=1;

// rysuje HP
function drawHP() {
    for (let i = 0; i < hp; i++) {
        canvas_context.drawImage(heartImg, 10 + i * 35, canvas_element.height - 30, 25, 25);
    }
    canvas_context.fillStyle = "black";
    canvas_context.font = "bold 20px Arial";
    canvas_context.fillText("Wynik: " + score, 150, canvas_element.height - 10);
    canvas_context.fillText("Rekord: " + highScore, 350, canvas_element.height - 10);
    canvas_context.fillText("Poziom: " + currentLevel, 690, canvas_element.height - 10);

    
}

//funkcja rysująca przedmiot 
function drawItems(){
    for(const item of items){
        if(item.collected)continue;
        if(item.type==="heal"){
            canvas_context.drawImage(healImg, item.col * cellSize, item.row * cellSize, cellSize, cellSize);
        } else if(item.type==="key"){
            canvas_context.drawImage(keyImgs[item.keyId], item.col * cellSize, item.row * cellSize, cellSize, cellSize);
        } else if(item.type==="riddle"){
            canvas_context.fillStyle="cyan";
            canvas_context.beginPath();
            canvas_context.arc(
                item.col*cellSize+cellSize/2,
                item.row*cellSize+cellSize/2,
                8,0,Math.PI*2    
            );
            canvas_context.fill();
        }
    }
    const status=riddleSolved ? "🔓 Wyjście otwarte" : "🔒 Znajdź zagadkę";
    canvas_context.fillStyle=riddleSolved ? "lime" :"red";
    canvas_context.font="bold 20px Arial";
    canvas_context.fillText(status,500,canvas_element.height -10);
}
//funkcja ekranu końcowego 
function drawGameOver(){
    canvas_context.fillStyle="rgba(0,0,0,0.7)";
    canvas_context.fillRect(0,0,canvas_element.width,canvas_element.height);

    canvas_context.fillStyle="#c0813a";
    canvas_context.font="bold 60px Arial";
    canvas_context.textAlign="center"
    canvas_context.fillText("Koniec gry💀💀💀💀", canvas_element.width / 2, canvas_element.height / 2 - 20);

    canvas_context.fillStyle="#d4c5a9";
    canvas_context.font="20px Arial";
    canvas_context.fillText("Naciśnij R aby zagrać ponownie", canvas_element.width / 2, canvas_element.height / 2 + 30);

    canvas_context.textAlign="left"//resetuje by nie psuć reszty
}

// odświeża ekran
function render() {
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);
    drawMaze();
    drawItems();//zawsze pomiedzy maze a palyer 
    drawPlayer();
    drawHP();
    drawEnemies();
    if(gameOver)drawGameOver();
}
