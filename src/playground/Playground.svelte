<script lang="ts">
  import init, { start, run, reset } from "./rust/pkg/zsp_playground.js"
  import { AceEditor } from "svelte-ace";
  import "brace/theme/chrome";
  import "brace/mode/text";

  let code:string = `put "hello world"`;

  let out:string[] = [];
  init().then(()=>{
    start();
    run(code);
  });
  window["stdout"] = (s)=>{
    out.push(s);
  }
</script>

<main lang="text" class = "dark">
  <AceEditor value = {code} />
  {#each out as o}
    {@html o}
  {/each}
</main>

<style>
</style>
