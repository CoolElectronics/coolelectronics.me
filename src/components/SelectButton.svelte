<script lang="ts">
  export let click;
  export let text;
  export let classes = "";
</script>

<!-- no idea how the formatting got all messed up but i can't seem to fix it now -->

<!-- update: i fixed it :) -->
<button
  class={"darkp2 w-auto relative m-1 transform shadow-sm hover:scale-105 focus:shadow-md justify-center items-center p-3 rounded-md shadow-black " +
    classes}
  on:click={click}
>
  <p class="text-center text">{text}</p>
</button>

<style>
  button {
    outline: none;
    border: none;
    margin-right: 0;
  }
  button:focus {
    outline: none;
    border: none;
    background-color: var(--darkp3) !important;
  }
</style>
