<script lang="ts">
  import { faTrash } from "@fortawesome/free-solid-svg-icons";

  import { FontAwesomeIcon } from "fontawesome-svelte";
    
  export let click;
  export let del;

  export let title:string;
</script>

<div class="flex flex-col aspect-square darkp2 rounded-md overflow-y-scroll overflow-x-hidden" on:click = {click}>
  <div class = "flex items-center justify-between">
    <div>
      <p class="text text-xl">{title}</p>
    </div>
    <div class = "hover:scale-125 mr-2 cursor-pointer" on:click ={del}>
      <FontAwesomeIcon icon = {faTrash} inverse = {true} size = "1x" />
    </div>
  </div>
</div>

