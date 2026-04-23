let canvas_element=document.getElementById("canvas_gry");
let canvas_context=canvas_element.getContext("2d");
canvas_context.fillStyle="#FF0000";
let x=50;
let y =50;
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
    if (event.key === "w"||event.key==="ArrowUp" && event.key === "ArrowLeft"||event.key==="a") {
        y-=7;
        x-=7;
    }if (event.key === "w"||event.key==="ArrowUp" && event.key === "ArrowRight"||event.key==="d") {
        y-=7;
        x+=7;
    }
    if (event.key === "s"||event.key==="ArrowDown" && event.key === "ArrowLeft"||event.key==="a") {
        y-=7;
        x-=7;
    }if (event.key === "s"||event.key==="ArrowDown" && event.key === "ArrowRight"||event.key==="d") {
        y+=7;
        x+=7;
    }

    // czyszczenie canvasa
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);

    // ponowne rysowanie
    canvas_context.fillStyle = "#FF0000";
    canvas_context.fillRect(x, y, 50, 50);
});
cellSize = 50;
cols = 16;
rows = 12;
for(i=0;i<rows;i++){
    for(j=0;j<cols;j++){
        let x=j*cellSize;
        let y=i*cellSize;
         canvas_context.strokeRect(x,y,cellSize,cellSize)

    }
}
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