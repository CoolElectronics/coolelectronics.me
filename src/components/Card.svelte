<script lang="ts">
  export let title: string;
  export let url: string | undefined = undefined;
</script>

<div class="text text-md rounded-md darkp1 pad">
  {#if url}
    <a href={url}>
      <p class="text-blue-500 text-2xl m-5 text-center">{title}</p>
    </a>
  {:else}
    <p class="text text-2xl m-5 text-center">{title}</p>
  {/if}
  <slot />
</div>

<style>
  .pad {
    margin: 2em;
    padding: 1em;
  }
</style>
