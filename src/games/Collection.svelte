<script lang="ts">
  import { faPencil, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
  import { ClientGame, ClientGameCollection } from "../../clienttypes";

  import { FontAwesomeIcon } from "fontawesome-svelte";
    
  export let collection: ClientGameCollection;
  export let addgame;
  export let deletecollection;
  export let removegame;
  export let editgame;
  export let editcollection;

  export let selectedgame:ClientGame;
</script>

<div class="flex flex-col aspect-square darkp2 rounded-md overflow-y-scroll overflow-x-hidden">
  <div class = "flex items-center justify-between">
    <div>
      <p class="text text-xl">{collection.name}</p>
      <p class="text">{collection.description}</p>
    </div>
    <div class = "hover:scale-125 mr-2 cursor-pointer"on:click = {()=>editcollection(collection)}>
      <FontAwesomeIcon icon = {faPencil} inverse = {true} size = "1x" />
    </div>
    <div class = "hover:scale-125 mr-2 cursor-pointer"on:click = {()=>deletecollection(collection.uuid)}>
      <FontAwesomeIcon icon = {faTrash} inverse = {true} size = "1x" />
    </div>
  </div>
  <div class="flex flex-col dark flex-1">
    {#each collection.games as game}
      <div class="darkp3 game flex justify-between items-center hover:scale-105 pl-1" on:click = {()=>selectedgame = game}>
        <p class="text">{game.name}</p>
        <div class = "mr-2">
          <div class = "hover:scale-125 cursor-pointer" on:click = {()=>editgame(game,collection.uuid)}>
            <FontAwesomeIcon icon = {faPencil} inverse = {true} />
          </div>
          <div class = "hover:scale-125 cursor-pointer" on:click = {()=>removegame(game.uuid,collection.uuid)}>
            <FontAwesomeIcon icon = {faTrash} inverse = {true} />
          </div>
        </div>
      </div>
    {/each} 
  </div>
  <div class = "p-1 flex items-center justify-between dark rounded-b-md cursor-pointer" on:click = {()=>addgame(collection.uuid)}>
    <p class = "text text-xl">Add Game</p>
    <FontAwesomeIcon icon = {faPlus} inverse = {true} size = "2x"/>
  </div>
</div>

<style>
.game{
  border-top: 5px solid var(--dark);
}
</style>
