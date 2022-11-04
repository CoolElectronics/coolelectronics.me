<script lang="ts">
  export let forceScript: number | null = null;
  import P5 from "p5-svelte";
  import p5i from "p5";
  import { debug } from "svelte/internal";

  let target: HTMLElement;
  const bg = [285, 13, 18];
  const palette: number[][] = [];

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
  const sketches = [
    // doom fire
    (p5: p5i) => {
      const zoom = 8;

      var width: number, height: number;

      var fire: number[] = [];

      const resize = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
        width = Math.ceil(p5.width / zoom);
        height = Math.ceil(p5.height / zoom);
        fire = Array(width * height).fill(0);
        for (let x = 0; x < width; x++) {
          fire[width * (height - 1) + x] = 36;
        }
      };

      const spreadFire = (from: number) => {
        let rand = Math.round(Math.random() * 3.0) & 3;
        let to = from - width - rand + 1;
        fire[to] = fire[from] - (rand & 1) * 3;
      };

      p5.setup = () => {
        p5.colorMode(p5.HSL);
        p5.createCanvas(4, 4);
        p5.strokeWeight(0);

        window.onresize = resize;
        resize();
      };

      p5.draw = () => {
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            spreadFire(y * width + x);
            let col = palette[fire[x + y * width]];
            col = col || palette[0];
            p5.fill(col);
            p5.rect(x * zoom, y * zoom, zoom, zoom);
          }
        }
      };
    },
    (p5: p5i) => {
      var points: {
        c: number;
        x: number;
        y: number;
        s: number;
        spdx: number;
        spdy: number;
      }[];
      const resize = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
        p5.background(bg);
        points = [];
        for (let i = 0; i < 44; i++) {
          points.push({
            c: Math.random() * 100,
            x: Math.random() * p5.width,
            y: Math.random() * p5.height,
            spdx: Math.random() > 0.5 ? -1 : 1,
            spdy: Math.random() > 0.5 ? 1 : -1,
            s: Math.random() * 15,
          });
        }
      };
      p5.setup = () => {
        p5.colorMode(p5.HSL);
        p5.createCanvas(4, 4);
        p5.strokeWeight(0);
        resize();
        window.onresize = resize;
      };
      p5.draw = () => {
        for (let p of points) {
          p5.fill(pal(p.c));
          p5.circle(p.x, p.y, p.s);

          p.x += (Math.random() * p.spdx * p.s) / 5;
          p.y += (Math.random() * p.spdy * p.s) / 5;
          if (p.x > p5.width || p.x < 0) {
            p.spdx *= -1;
          }
          if (p.y > p5.height || p.y < 0) {
            p.spdy *= -1;
          }
        }
      };
    },
    (p5: p5i) => {
      var numPoints = 288 * 2;
      var turnFraction = 20 / 100;
      var speed = 7;
      var pow = -20;

      var angleOffset = 0;
      const resize = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
        p5.background(bg);
      };
      p5.setup = () => {
        p5.colorMode(p5.HSL);
        p5.createCanvas(4, 4);
        p5.strokeWeight(0);

        resize();
        window.onresize = resize;
      };
      p5.draw = () => {
        p5.background(bg);
        let xpower = pow / 20;
        turnFraction = turnFraction + (0.0001 % 1);
        angleOffset = angleOffset + (((speed / 480) * p5.deltaTime) % 1);
        turnFraction = (1 + p5.sqrt(5)) / 2;
        p5.fill(pal(100));
        for (let i = 0; i < numPoints; i++) {
          var dst = p5.pow(i / (numPoints - 1), pow / 20) / 5;
          var angle = 2 * p5.PI * turnFraction * i;
          var x = dst * p5.cos(angle + angleOffset);
          var y = dst * p5.sin(angle + angleOffset);
          p5.ellipse(x * 200 + p5.width / 2, y * 200 + p5.height / 2, 6);
        }
      };
    },
    (p5: p5i) => {
      let zoom = 5;
      let scale = 8;

      let dir = 1;

      let fractals = [
        {
          i: (c, z) => {
            z.x = z.x * z.x - z.y * z.y + c.x;
            z.y = 2 * z.x * z.y + c.y;
          },
          points: [
            [-2, 0],
            [0.255555, 0],
          ],
        },
        {
          i: (c, z) => {
            z.x = z.x * z.x - z.y * z.y + c.x;
            z.y = 2 * Math.abs(z.x + z.y) + c.y;
          },
          points: [[1, -0.5]],
        },
        // {
        //   i: (c, z) => {
        //     z.x = c.x + c.y
        //     z.y += c.y * Math.sin(z.x);
        //   },
        //   points: [[2, 0]],
        // },
      ];

      setInterval(() => {
        p5.loadPixels();
        if (p5.pixels.every((p, i) => p === p5.pixels[2] || i % 4 != 2)) {
          console.log("failsafe");
          pickPoint();
        }
      }, 1000);
      let fractal = randFractal();
      function randFractal() {
        return fractals[Math.floor(Math.random() * fractals.length)];
      }

      let width, height;
      let ox, oy;

      function point(x, y): { x: number; y: number } {
        return {
          x,
          y,
        };
      }
      function pickPoint() {
        fractal = randFractal();
        let p =
          fractal.points[Math.floor(Math.random() * fractal.points.length)];
        ox = p[0];
        oy = p[1];
        if (Math.random() > 0.6) {
          ox = Math.random() * 3 - 2;
          oy = Math.random() * 2 - 1;
        }
        dir *= -1;
      }
      pickPoint();
      function renderfractal() {
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            let c = point(
              p5.map(x, 0, width, -2, 1) * zoom + ox,
              p5.map(y, 0, height, -1, 1) * zoom + oy
            );
            let z = { ...c };
            let inset = true;
            let i = 0;
            while (i < 80) {
              fractal.i(c, z);
              if (((z.x + c.x) ^ 2) + ((z.y + c.y) ^ 2) > 7.071) {
                inset = false;
                break;
              }
              i += 1;
            }
            if (!inset) {
              p5.fill(pal((i * 40) % 125));
            } else {
              p5.fill(pal(0));
            }

            p5.rect(x * scale, y * scale, scale, scale);
          }
        }
      }
      const resize = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
        width = window.innerWidth / scale;
        height = window.innerHeight / scale;
        p5.background(bg);
        renderfractal();
      };
      p5.setup = () => {
        p5.colorMode(p5.HSL);
        p5.createCanvas(4, 4);
        p5.strokeWeight(0);

        resize();
        window.onresize = resize;
      };
      p5.draw = () => {
        zoom *= 1 - dir * 0.035;
        if (zoom < 0.000001 || zoom > 10) {
          pickPoint();
        }
        // ox = (p5.mouseX-width/2);
        // oy = (p5.mouseY-height/2);
        renderfractal();
      };
    },
    // game of life
    (p5: p5i) => {
      let arr;
      let scale = 8;
      let width, height;

      const resize = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
        width = Math.ceil(p5.width / scale);
        height = Math.ceil(p5.height / scale);
        arr = Array(width * height)
          .fill(null)
          .map(() => Math.random() > 0.5);
        // there's a better way of doing this
      };
      p5.setup = () => {
        p5.colorMode(p5.HSL);
        p5.createCanvas(4, 4);
        p5.strokeWeight(0);

        resize();
        window.onresize = resize;
      };
      p5.draw = () => {
        let temp = [...arr];

        p5.background(bg);
        for (let x = 0; x < width; x++) {
          for (let y = 0; y < height; y++) {
            let c = arr[x + y * width] ? pal(100) : pal(0);
            p5.fill(c);
            p5.rect(x * scale, y * scale, scale, scale);

            let neighbors = 0;
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                if (i != 0 || j != 0) {
                  let ix = mod(x + i, width);
                  let jx = mod(y + j, height);
                  neighbors += arr[ix + jx * width];
                }
              }
            }
            if (arr[x + y * width]) {
              if (neighbors < 2) {
                temp[x + y * width] = false;
              }
              if (neighbors > 3) {
                temp[x + y * width] = false;
              }
            } else {
              if (neighbors == 3) {
                temp[x + y * width] = true;
              }
            }
          }
        }

        arr = [...temp];
      };
    },
    (p5: p5i) => {
      let dots: { x: number; y: number; c; dx; dy }[] = [];
      const numdots = 25;
      const resize = () => {
        p5.resizeCanvas(window.innerWidth, window.innerHeight);
        p5.background(bg);
        dots = Array(numdots)
          .fill(null)
          .map((_) => {
            return {
              x: p5.random(0, p5.width),
              y: p5.random(0, p5.height),
              c: pal(p5.random(0, 100)),
              dx: p5.random(-0.25, 0.25),
              dy: p5.random(-0.25, 0.25),
            };
          });
      };
      p5.setup = () => {
        p5.colorMode(p5.HSL);
        p5.createCanvas(4, 4);
        p5.strokeWeight(0);

        resize();
        window.onresize = resize;
      };
      p5.draw = () => {
        p5.background(bg);
        for (let dot of dots) {
          for (let other of dots) {
            if (other != dot) {
              let dist = Math.sqrt(
                (dot.x - other.x) ** 2 + (dot.y - other.y) ** 2
              );
              if (dist < 128) {
                p5.strokeWeight(2);
                p5.stroke(pal(p5.map(dist, 0, 128, 200, 0)));
                p5.line(dot.x, dot.y, other.x, other.y);
              }
            }
          }
          dot.x = mod(dot.x + dot.dx, p5.width);
          dot.y = mod(dot.y + dot.dy, p5.height);
        }
        for (let dot of dots) {
          p5.strokeWeight(0);
          p5.fill(64);
          p5.circle(dot.x, dot.y, 6);
        }
      };
    },
  ];

  let sketch =
    forceScript != null
      ? sketches[forceScript]
      : sketches[Math.floor(Math.random() * sketches.length)];
  // sketch = sketches[sketches.length - 1];
  function pal(num: number): number[] {
    let col = [0, 0, 0];
    for (let j = 0; j < 3; j++) {
      col[j] = start[j] + ((end[j] - start[j]) * num) / 255;
    }
    return col;
  }
</script>

<P5 {sketch} {target} />
<!--ignore the error-->
<div id="canvascontainer" bind:this={target} />

<style>
  #canvascontainer {
    position: absolute;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
  }
</style>
