<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import TabButton from "../components/TabButton.svelte";

  import { FontAwesomeIcon } from "fontawesome-svelte";
  import ClickOutside from "svelte-click-outside";

  import {
    faCheck,
    faPlus,
    faTrash,
    faUserPlus,
    faUserXmark,
    faXmark,
  } from "@fortawesome/free-solid-svg-icons";
  import SelectButton from "../components/SelectButton.svelte";

  import request from "../requests";
  import * as Status from "../../routes/status/types";
  import { onMount } from "svelte";
  import { stat } from "fs";

  let statusUser: Status.StatusUser;
  // let stati: string[];
  (async () => {
    statusUser = await request(Status.GetStatusUser);
    // stati = [...statusUser.stati];
  })();

  async function save() {
    await request<Status.SetSettingsRequest>(Status.SetSettings, statusUser);
  }

  // statusUser.
</script>

<main class="dark" on:click={save}>
  <TopBar title={"Status Switcher"} />
  {#if statusUser}
    <SelectButton click={save} text="Save" />
    <div class="flex text text-md">
      Discord Token:
      <span contenteditable bind:textContent={statusUser.token} />
    </div>
    <div class="flex text text-md">
      Delay Between Status Switches (In Minutes)
      <input bind:value={statusUser.delay} />
    </div>
    {#each statusUser.stati as status}
      <div class="flex text text-md">
        <span
          on:keydown={(e) => {
            if (e.key == "Enter") {
              e.preventDefault();
              return false;
            }
          }}
          contenteditable
          maxlength="128"
          bind:textContent={status}
        />
        <button
          on:click={() =>
            (statusUser.stati = statusUser.stati.filter((f) => f != status))}
        >
          <FontAwesomeIcon size="lg" icon={faTrash} inverse={true} />
        </button>
      </div>
    {/each}
    <button on:click={() => (statusUser.stati = [...statusUser.stati, ""])}>
      <FontAwesomeIcon size="lg" icon={faPlus} inverse={true} />
    </button>
  {/if}
</main>

<style>
  .sendreqs {
    border-right: 4px solid var(--darkp3);
    width: 70%;
    padding: 1em;
  }
  .viewreqs {
    width: 30%;
    padding: 1em;
  }
  #tabcontainer {
    height: 100%;
  }
  #tabcontainer > div {
    height: 100%;
  }
  span,
  input {
    display: inline-block;
    min-width: 50px;
    max-width: 200px;
    background-color: var(--darkm2);
    outline: none;
    /* text-align: center; */
    border-radius: 5px;
  }
</style>
