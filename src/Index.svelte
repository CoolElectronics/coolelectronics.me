<script lang="ts">
  import P5 from "p5-svelte";
  import p5i from "p5";

  import Card from "./components/Card.svelte";

  let target: HTMLElement;

  let selected: "more" | "about" | "projects" | null = null;

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
  ];

  let sketch = sketches[Math.floor(Math.random() * sketches.length)];
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
<main class="flex">
  <div class="pt-20 flex-1">
    <p class="text text-3xl text-center">CoolElectronics.me</p>
    <div class="w-half flex mt-20 mb-10 items-center justify-evenly" id="links">
      <a class="text text-xl" href="/sign">Sign In</a>
      <p class="text text-xl" on:click={() => (selected = "about")}>About</p>
      <p class="text text-xl" on:click={() => (selected = "projects")}>
        Projects
      </p>
      <p class="text text-xl" on:click={() => (selected = "more")}>More</p>
    </div>
  </div>
  {#if selected}
    <div id="panel" class="dark p-2 opacity-90">
      {#if selected == "about"}
        <div id="about">
          <Card title="CoolElectronics">
            Hey, I'm CoolElectronics, a programmer who makes games sometimes.
          </Card>
          <Card title="This Website">
            This is coolelectronics.me, a website originally started to get
            around filters by my school district but now hosts a whole bunch of
            projects with varying usefullness<br /><br />

            (if you are from the school district seeing this page plz don't
            block it there's not even a proxy or anything)
          </Card>
          <Card title="Github" url="https://github.com/CoolElectronics">
            All my public projects, including this website
          </Card>
          <Card title="Contact">
            Discord: CoolElectronics#4683
            <br />
            <br />
            I have other methods of contact but I most likely won't respond anywhere
            else so
          </Card>
        </div>
      {:else if selected == "projects"}
        <Card url = "https://github.com/CoolElectronics/zsp" title = "ZSP">
          A small interpreted programming language made in rust 
        </Card>
      {:else if selected == "more"}
        <div class="">
          <Card url="/games" title="Games Repository">
            list of browser games added by the community
          </Card>
          <Card url="/playground" title="ZSP playground">
            an online interpreter for my programming language, ZSP
          </Card>
          <Card url="/sparkboard" title="Sparkboard">
            a program for organizing and coming up with ideas
          </Card>
        </div>
      {/if}
    </div>
  {/if}
</main>

<style>
  #panel {
    /* position: absolute; */
    /* height: 100%; */
    /* right:0; */
    /* top:0; */
    max-width: 30%;
    overflow-y: scroll;
  }
  #links > p {
    cursor: pointer;
  }
  #canvascontainer {
    position: absolute;
    top: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
  }
  .w-half {
    position: relative;
    width: 50%;
    left: 25%;
  }
</style>
