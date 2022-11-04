<script lang="ts">
  export let options: any[];
  export let names = options;
  export let selected;
</script>

<div class="rounded-md darkm2 p-1">
  {#each options as option, i}
    <button
      class={"m-1 p-1 " + (selected == option ? "darkp1" : "darkm1")}
      on:click={() => (selected = option)}>{names[i]}</button
    >
  {/each}
</div>

<style>
</style>
