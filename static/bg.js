const bg = [285, 13, 18];
let palette = [];
var start = bg;
var end = [285, 13, 82];

for (let i = 0; i < 37; i++) {
    let col = [0, 0, 0];
    for (let j = 0; j < 3; j++) {
        col[j] = start[j] + ((end[j] - start[j]) * (i - 0)) / (36 - 0);
    }
    palette.push(col);
}
function mod(i, n) {
    return ((i % n) + n) % n;
}
let dots = [];
const numdots = 55;
function resize() {
    resizeCanvas(window.innerWidth, window.innerHeight);
    background(bg);
    dots = Array(numdots)
        .fill(null)
        .map((_) => {
            return {
                x: random(0, width),
                y: random(0, height),
                c: pal(random(0, 100)),
                dx: random(-0.25, 0.25),
                dy: random(-0.25, 0.25),
            };
        });
}
function setup() {
    colorMode(HSL);
    let canvas = createCanvas(4, 4);
    canvas.parent("canvascontainer");
    strokeWeight(0);

    resize();
    window.onresize = resize;
}
function draw() {
    background(bg);
    for (let dot of dots) {
        for (let other of dots) {
            if (other != dot) {
                let dist = Math.sqrt(
                    (dot.x - other.x) ** 2 + (dot.y - other.y) ** 2
                );
                if (dist < 128) {
                    strokeWeight(2);
                    stroke(pal(map(dist, 0, 128, 200, 0)));
                    line(dot.x, dot.y, other.x, other.y);
                }
            }
        }
        dot.x = mod(dot.x + dot.dx, width);
        dot.y = mod(dot.y + dot.dy, height);
    }
    for (let dot of dots) {
        strokeWeight(0);
        fill(64);
        circle(dot.x, dot.y, 6);
    }
}

function pal(num) {
    let col = [0, 0, 0];
    for (let j = 0; j < 3; j++) {
        col[j] = start[j] + ((end[j] - start[j]) * num) / 255;
    }
    return col;
}