let canvas_element=document.getElementById("canvas_gry");
let canvas_context=canvas_element.getContext("2d");
canvas_context.fillStyle="#FF0000";
let x=50;
let y =50;
canvas_context.fillRect(x,y,50,50);
console.log(canvas_element);
document.addEventListener("keydown", function(event) {

    if (event.key === "w" || event.key === "ArrowUp") {
        y-=1;
    }

    if (event.key === "s" || event.key === "ArrowDown") {
        y+=1;
    }

    if (event.key === "a" || event.key === "ArrowLeft") {
        x-=1;
    }

    if (event.key === "d" || event.key === "ArrowRight") {
        x+=1;
    }

    // czyszczenie canvasa
    canvas_context.clearRect(0, 0, canvas_element.width, canvas_element.height);

    // ponowne rysowanie
    canvas_context.fillStyle = "#FF0000";
    canvas_context.fillRect(x, y, 50, 50);
});