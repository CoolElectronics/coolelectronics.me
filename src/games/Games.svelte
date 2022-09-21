<script lang="ts">
  import request from "../requests";
  import TopBar from "../components/TopBar.svelte";
  import * as Games from "../../routes/games/types";
  import { ClientGame, ClientGameCollection } from "../../clienttypes";
  import Collection from "./Collection.svelte";
  import { FontAwesomeIcon } from "fontawesome-svelte";
  import axios from "axios";
  import { faPlus } from "@fortawesome/free-solid-svg-icons";
  import { randomUUID } from "crypto";
  import SelectButton from "../components/SelectButton.svelte";

  let collections: ClientGameCollection[] = [];
  let selectedgame: ClientGame;

  let collectionbuffer: { name: string; description: string } | null;
  let selectedcollection: string | null = null;

  let gameeditbuffer: {
    name: string;
    description: string;
    link: string;
    credits: string;
  } | null;
  let gameedit: { collection: string; game: ClientGame } | null = null;
  let gamenewcollection: string;

  axios.get("/api/games/collections").then((res) => {
    collections = res.data;
  });

  request(Games.EditCollection);
  async function makeCollection() {
    collectionbuffer = {
      name: "a collection",
      description: "",
    };
    selectedcollection = null;
  }
  async function submitcollection() {
    if (collectionbuffer) {
      selectedcollection = null;
      let col = await request<Games.NewCollectionRequest,Games.NewCollectionResponse>(Games.NewCollection, {
        name: collectionbuffer.name,
        description: collectionbuffer.description,
      });
      collections= [...collections,col];
    }
  }
  function addgame(collection: string) {
    gameeditbuffer = {
      name: "jerma adventure",
      description: "a game about jerma",
      credits: "made by my buddy eric",
      link: "https://example.com",
    };
    gameedit = null;
    gamenewcollection = collection;
  }
  async function submitgame() {
    if (gameeditbuffer) {
      await request<Games.AddGameRequest>(Games.AddGame, {
        ...gameeditbuffer,
        collection: gamenewcollection,
      });
    }
  }
  function editgame(game: ClientGame, collection: string) {
    gameeditbuffer = {
      name: game.name,
      description: game.description,
      credits: game.credits,
      link: game.link,
    };
    gameedit = {
      game,
      collection,
    };
  }
  async function savegame() {
    if (gameeditbuffer && gameedit != null) {
      Object.assign(
        gameedit.game,
        gameeditbuffer
      );
      collections = collections;
      await request<Games.EditGameRequest>(Games.EditGame, {
        ...gameeditbuffer,

        collection: gameedit.collection,
        uuid: gameedit.game.uuid,
      });
    }
  }
  async function removegame(game: string, collection: string) {}
  async function deletecollection(collection: string) {
    collections = collections.filter(c=>c.uuid != collection);
    await request<Games.CollectionRemoveRequest>(Games.CollectionRemove,{
      collection 
    });
  }
  async function editcollection(collection: ClientGameCollection) {
    collectionbuffer = {
      name: collection.name,
      description: collection.description,
    };
    selectedcollection = collection.uuid;
  }
  async function savecollection() {
    if (collectionbuffer && selectedcollection != null) {
      await request<Games.EditCollectionRequest>(Games.EditCollection, {
        ...collectionbuffer,
        uuid: selectedcollection,
      });
      selectedcollection = null;
    }
  }
</script>

{#if collectionbuffer}
  <div id="collectionedit">
    <input bind:value={collectionbuffer.name} />
    <div contenteditable bind:innerHTML={collectionbuffer.description} />
    {#if typeof selectedcollection === "string"}
      <SelectButton text="Save" click={savecollection} />
    {:else}
      <SelectButton text="Create" click={submitcollection} />
    {/if}
  </div>
{:else if gameeditbuffer}
  <div id="gameedit">
    <input bind:value={gameeditbuffer.name} />
    <div contenteditable bind:innerHTML={gameeditbuffer.description} />
    <input bind:value={gameeditbuffer.link} />
    <div contenteditable bind:innerHTML={gameeditbuffer.credits} />
    {#if gameedit != null}
      <SelectButton text="Save" click={savegame} />
    {:else}
      <SelectButton text="Create" click={submitgame} />
    {/if}
  </div>
{/if}
<main class="dark flex flex-col overflow-y-scroll">
  <TopBar title="Games" />
  {#if selectedgame}
    <div id="game" class="darkm1 flex">
      <iframe allow="fullscreen" id = "frame" class = {`flex-1 aspect-video`} src={selectedgame.link} />
      <div class = "darkm3">
        <p class="text text-center text-2xl">{selectedgame.name}</p>
        <p class="text">{@html selectedgame.description}</p>

        <p class="text">{@html selectedgame.credits}</p>
      </div>
    </div>
  {/if}
  <div id="collections" class="darkm2">
    {#each collections as collection}
      <Collection
        {collection}
        {addgame}
        {editgame}
        {deletecollection}
        {editcollection}
        {removegame}
        bind:selectedgame
      />
    {/each}
    <div
      class="hover:scale-105 cursor-pointer aspect-square darkp2 rounded-md flex justify-center items-center"
      on:click={makeCollection}
    >
      <FontAwesomeIcon size="5x" inverse={true} icon={faPlus} />
    </div>
  </div>
</main>

<style>
  #collections {
    padding: 15px;
    display: grid;
    grid-gap: 15px;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(6, 30fr);
    flex: 1;
  }
  #frame{
  /* max-width: 70%; */
  }
  .lexaloffle{
    /* transform:scale(2); */
  }
</style>
