//wczytanie canvasu
const canvas_element=document.getElementById("canvas_gry");
const canvas_context=canvas_element.getContext("2d");
canvas_context.fillStyle="#FF0000";
let x=50;
let y =50;

//labirynt
        cellSize = 50;
cols = 16;
rows = 12;
const maze = [
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,1],
[1,0,1,1,0,1,0,1,1,1,1,1,0,0,1,0],
[1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0],
[1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1],
[1,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1],
[1,0,1,1,1,1,1,1,1,0,1,1,0,0,1,0],
[1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0],
[1,1,1,1,1,1,1,0,1,1,1,0,0,1,0,0],
[1,0,0,0,0,0,1,0,0,0,1,0,1,1,0,1],
[1,0,1,1,1,0,1,1,1,0,1,1,0,0,1,0],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];
//rysowanie labiryntu
function drawmaze(){
for(i=0;i<rows;i++){
    for(j=0;j<cols;j++){
        let xCell=j*cellSize;
        let yCell=i*cellSize;
         canvas_context.strokeRect(xCell,yCell,cellSize,cellSize)
         if (maze[i][j] == 1) {
        canvas_context.fillStyle="black";
        canvas_context.fillRect(xCell,yCell,cellSize,cellSize);

}

    }
}}
//rysowanie gracza
    function drawplayer(){
        canvas_context.fillStyle = "#FF0000";
    canvas_context.fillRect(x, y, 50, 50);
    }


    drawmaze();
    drawplayer();

  //wykrywanie klucza
canvas_context.fillRect(x,y,50,50);
console.log(canvas_element);

document.addEventListener("keydown", function(event) {
//ruch 
    if (event.key === "w" || event.key === "ArrowUp") {
        y-=7;
    }

    if (event.key === "s" || event.key === "ArrowDown") {
        y+=7;
    }

    if (event.key === "a" || event.key === "ArrowLeft") {
        x-=7;
    }

    if (event.key === "d" || event.key === "ArrowRight") {
        x+=7;
    }
    

    // czyszczenie canvasa
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);
    drawmaze();
    drawplayer(); //zawsze najpierw labirynt potem gracz 
        

})
      


