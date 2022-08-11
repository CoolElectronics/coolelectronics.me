<script lang="ts">
  import { ClientRoom, ClientUser } from "../../clienttypes";
  import ClickOutside from "svelte-click-outside";
  import jq from "jquery";
  import SelectButton from "../components/SelectButton.svelte";
  import Pfp from "../components/Pfp.svelte";

  import { FontAwesomeIcon } from "fontawesome-svelte";
  import { faUserXmark } from "@fortawesome/free-solid-svg-icons";
  import User from "../components/User.svelte";

  export let showroomsettings: boolean;
  export let room: ClientRoom;

  let justactivated = true;

  let initialsettings: IRoomSettings;
  let roomsettings: IRoomSettings;

  interface IRoomSettings {
    name: string;
    public: boolean;
    users: ClientUser[];
  }

  $: room && updateroom();
  // something about this syntax is deeply disturbing to me
  function updateroom() {
    console.log("room changed");
    if (roomsettings != initialsettings) {
      disable();
    }

    roomsettings = {
      name: room.name,
      public: room.public,
      users: JSON.parse(JSON.stringify(room.users)),//temporary
    };
    initialsettings = { ...roomsettings };
  }

  async function disable() {
    if (justactivated) {
      justactivated = false;
      return;
    }
    showroomsettings = false;
    justactivated = true;
    if (initialsettings != roomsettings) {
      console.log("writing changes");
      await jq.post("/api/chat/changeroomsettings", {
        uuid: room.uuid,
        name: roomsettings.name,
        public: roomsettings.public,
        users: roomsettings.users.map((u) => u.uuid),
      });
    }
  }
</script>

{#if showroomsettings}
  <ClickOutside on:clickoutside={disable}>
    <div id="roomsettings">
      <input bind:value={roomsettings.name} />
      <input type="checkbox" bind:checked={roomsettings.public} />

      {#each roomsettings.users as user, i}
        <div
          class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
        >
          <div class="flex items-center">
            <User {user} />
          </div>
          <div class="flex items-center">
            <button
              on:click={() => {
                roomsettings.users.splice(i, 1);
                roomsettings = roomsettings;
              }}
            >
              <FontAwesomeIcon inverse={true} size="lg" icon={faUserXmark} />
            </button>
          </div>
        </div>
      {/each}
      <SelectButton text="Save" click={disable} />
    </div>
  </ClickOutside>
{/if}

<style>
  #roomsettings {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 55vw;
    height: 55vh;
    border-radius: 4px;
    background-color: var(--darkm2);
    border: 4px solid var(--darkm1);
    opacity: 75%;
    z-index: 10;
    overflow-y: scroll;
  }
</style>
