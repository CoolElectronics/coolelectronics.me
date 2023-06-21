<script lang="ts">
  import Card from "./components/Card.svelte";
  import Background from "./components/Background.svelte";

  let selected: "more" | "about" | "projects" | null = null;
</script>

<Background />
<main class="flex flex-col">
  <div class="flex flex-1">
    <div class="pt-20 flex-1">
      <p class="text text-3xl text-center">CoolElectronics.me</p>
      <div
        class="w-half flex mt-20 mb-10 items-center justify-evenly"
        id="links"
      >
        <a class="text text-xl" href="/sign">Sign In</a>
        <p class="text text-xl" on:click={() => (selected = "about")}>About</p>
        <a class="text text-xl" href="/blog">Blog</a>
        <p class="text text-xl" on:click={() => (selected = "projects")}>
          Projects
        </p>
        <p class="text text-xl" on:click={() => (selected = "more")}>More</p>
      </div>
      <br /><br /><br />
    </div>

    {#if selected}
      <div
        id="panel"
        class="dark p-2 opacity-90 overflow-y-scroll"
        style="height: 100vh;"
      >
        {#if selected == "about"}
          <div id="about">
            <Card title="CoolElectronics">
              I'm CoolElectronics, a programmer who tries to occasionally make
              games, a oneshot, ultrakill and tally hall enthusiast
            </Card>
            <Card title="This Website">
              This is coolelectronics.me, a website I put up to host a bunch of
              various miscellaneous services and is currently running on an old
              2010 macbook that I stuck debian on.<br />
              I would appreciate if you didn't DDOS it.<br /><br />

              Fun fact: this domain is blocked by default on several leading
              content filters.
            </Card>
            <Card title="Github" url="https://github.com/CoolElectronics">
              All my public projects, including this website
            </Card>
            <Card title="Contact">
              Discord: <a href="https://discord.com/users/696392247205298207" class="text-blue-500">@coolelectronics</a><br />
              Email: <a href="mailto:me@coolelectronics.me"  class="text-blue-500" >me@coolelectronics.me</a><br />
              Mastodon:
              <a
                class="text-blue-500"
                href="https://akkoma.mercurywork.shop/coolelectronics"
                >@coolelectronics@akkoma.mercurywork.shop</a
              >
              <br />
              <br />
              I have other methods of contact but I most likely won't respond anywhere
              else so
            </Card>
            <!-- <div
              id="blinkies"
              class="flex justify-center
             align-bottom p-2 m-2"
            >
              <img src="badges/ralsei.webp" />
              <img src="badges/miracle.gif" />
              <img src="badges/gay.gif" />
            </div> -->
          </div>
        {:else if selected == "projects"}
          <Card url="https://github.com/CoolElectronics/zsp" title="ZSP">
            A small interpreted programming language made in rust
          </Card>
          <Card
            url="https://github.com/CoolElectronics/sh1mmer"
            title="sh1mmer"
          >
            An enterprise jailbreak targeting chromebooks
          </Card>
          <Card
            url="https://github.com/CoolElectronics/bookmarkfs"
            title="BookmarkFS"
          >
            Store files as Chrome bookmarks that sync between devices
          </Card>
          <Card
            url="https://github.com/CoolElectronics/CoolElectronics.me"
            title="This Website"
          >
            you are on it right now!
          </Card>
        {:else if selected == "more"}
          <div class="">
            <Card url="https://mercurywork.shop" title="ZSP playground">
              an online interpreter for my programming language, ZSP
            </Card>
            <Card url="/pgp" title="PGP">
              for the nerds
            </Card>
            <!-- <Card url="/unroll" title="unroll"> -->
            <!--   a collection of scripts to help you deprovision chromeOS devices -->
            <!-- </Card> -->
            <Card url="/playground" title="ZSP playground">
              an online interpreter for my programming language, ZSP
            </Card>
            <Card url="/sparkboard" title="Sparkboard">
              a program for organizing and coming up with ideas
            </Card>
            <Card url="/games" title="Games Repository">
              list of browser games added by the community to play if you're
              bored. hope you like celeste classic
            </Card>
          </div>
        {/if}
      </div>
    {/if}

    <a
      class="text text-xs"
      id="analytics"
      href="https://support.google.com/analytics/answer/7318509?hl=en"
    >
      there are google analytics cookies living inside your walls
    </a>
  </div>

  <!-- <a id="footer" class="text text-xs text-centered" href="/money"
    >Click here to sell your data and give me like half a penny per day</a
  > -->
</main>

<style>
  #blinkies > img {
    margin: 1em;
  }
  #analytics {
    position: absolute;
    text-align: end;
    width: 100%;
  }
  * {
    user-select: none;
  }
  #footer {
    /* position: absolute; */
    /* bottom:50%; */
    /*   left: 50%; */
    /*   transform: translateX(50%); */
  }
  #panel {
    /* position: absolute; */
    /* height:m 100%; */
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
