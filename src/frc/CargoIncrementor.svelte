<script lang="ts">
  import Incrementor from "./Incrementor.svelte";
  import * as Frc from "../../routes/frc/types";
  import {
    faRightFromBracket,
    faHouseUser,
    faSignOut,
    faSignIn,
  } from "@fortawesome/free-solid-svg-icons";
  import {
    FontAwesomeIcon,
    FontAwesomeLayers,
    FontAwesomeLayersText,
  } from "fontawesome-svelte";
  export let score: Frc.CargoScore;
  export let title: string;
</script>

<div class="darkm2 p-2 m-2 rounded-md">
  <p class="text text-center text-lg">{title}</p>
  <div class="justify-evenly flex flex-col">
    <div>
      <p class="text text-center text-md">Upper</p>
      <div class="flex justify-center">
        <Incrementor title="scored" bind:val={score.upper.scored} />
        <Incrementor title="missed" bind:val={score.upper.missed} />
      </div>
    </div>
    <div>
      <p class="text text-center text-md">Lower</p>
      <div class="flex justify-center">
        <Incrementor title="scored" bind:val={score.lower.scored} />
        <Incrementor title="missed" bind:val={score.lower.missed} />
      </div>
    </div>
  </div>
</div>

<style>
</style>
