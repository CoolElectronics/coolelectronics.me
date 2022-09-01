<script lang="ts">
  import init, { start, run, reset } from "./rust/pkg/zsp_playground.js";
  import { AceEditor } from "svelte-ace";
  import "brace/theme/chrome";
  import "brace/mode/text";
  import TopBar from "../components/TopBar.svelte";

  let code: string = `put "hello world"`;
  let ace: HTMLElement;

  let out: string[] = ["***ZSP PLAYGROUND***<br>"];
  init().then(() => {
    start();
  });
  window["stdout"] = (s) => {
    out = [...out, s];
  };

  function execute() {
    try {
      run(code);
    } catch {
      out = [
        ...out,
        `<p class = "text-red-500">panic! this is a bug in the interpreter. please report the bug</p>`,
      ];
    }
  }
</script>

<main lang="text" class="dark">
  <TopBar title="ZSP playground" />
  <div class="dark">
    <button on:click={execute}>Run</button>
    <button on:click={reset}>Run</button>
  </div>
  <div class="flex-col">
    <div class="flex flex-1">
      <div class="acecontainer flex-1">
        <AceEditor bind:this={ace} bind:value={code} />
      </div>
      <div class="dark">
        <p class="text text-center">ZSP Wiki</p>
      </div>
    </div>
    <div class="darkm2">
      {#each out as o}
        {@html o}
      {/each}
    </div>
  </div>
</main>

<style>
</style>
