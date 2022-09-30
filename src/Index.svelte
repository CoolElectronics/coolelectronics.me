<script lang="ts">
  import Card from "./components/Card.svelte";
  import Background from "./components/Background.svelte";

  let selected: "more" | "about" | "projects" | null = null;

 </script>
<Background/>
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
    <br><br><br>
    <div class = "flex justify-center">
  <a id = "footer" class="text text-xs text-centered" href="/money">Click here to sell your data and give me free money</a>
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
        <Card url="https://github.com/CoolElectronics/zsp" title="ZSP">
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
  #footer{
  /* position: absolute; */
  /* bottom:50%; */
  /*   left: 50%; */
  /*   transform: translateX(50%); */
  }
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
  .w-half {
    position: relative;
    width: 50%;
    left: 25%;
  }
</style>
