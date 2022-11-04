<script lang="ts">
  import * as Frc from "../../routes/frc/types";
  import {
    faRightFromBracket,
    faHouseUser,
    faSignOut,
    faSignIn,
    faPlus,
    faMinus,
  } from "@fortawesome/free-solid-svg-icons";
  import {
    FontAwesomeIcon,
    FontAwesomeLayers,
    FontAwesomeLayersText,
  } from "fontawesome-svelte";
  export let val: number;
  export let title: string;
</script>

<div class = "p-2">
  <p class="text text-center text-md">{title}</p>
  <div class="dark rounded-md items-center justify-evenly flex darkp1">
    <button class="m-2" on:click={() => (val += 1)}>
      <FontAwesomeIcon size="lg" icon={faPlus} inverse={true} />
    </button>
    <p class="text text-lg">
      {val}
    </p>
    <button class="m-2" on:click={() => (val -= 1)}>
      <FontAwesomeIcon size="lg" icon={faMinus} inverse={true} />
    </button>
  </div>
</div>

<style>
</style>
