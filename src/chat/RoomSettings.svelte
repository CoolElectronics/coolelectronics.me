<script lang="ts">
  import { ClientRoom, ClientUser } from "../../clienttypes";
  import ClickOutside from "svelte-click-outside";
  import SelectButton from "../components/SelectButton.svelte";
  import Pfp from "../components/Pfp.svelte";

  import { FontAwesomeIcon } from "fontawesome-svelte";
  import { faUserPlus, faUserXmark } from "@fortawesome/free-solid-svg-icons";
  import User from "../components/User.svelte";
  import request from "../requests";
  import * as Chat from "../../routes/chat/types";

  export let showroomsettings: boolean;
  export let room: ClientRoom;

  let justactivated = true;
  // since svelte-click-outside is extremely jank, some actions randomly trigger the click outside. this is a flag saying that one of those conditions was reached  and to not close

  let initialsettings: IRoomSettings;
  let roomsettings: IRoomSettings;

  let invitablefriends: ClientUser[];

  interface IRoomSettings {
    name: string;
    public: boolean;
    users: ClientUser[];
  }

  $: room && updateroom();
  // something about this syntax is deeply disturbing to me
  async function updateroom() {
    invitablefriends = await request<
      Chat.InvitableUsersRequest,
      Chat.InvitableUsersResponse
    >(Chat.InvitableUsers, {
      room: room.uuid,
    });

    roomsettings = {
      name: room.name,
      public: room.public,
      users: JSON.parse(JSON.stringify(room.users)), //temporary
    };
    initialsettings = JSON.parse(JSON.stringify(roomsettings));
  }

  async function disable() {
    console.log("disable called");
    if (justactivated) {
      justactivated = false;
      return;
    }
    showroomsettings = false;
    justactivated = true;
    if (initialsettings != roomsettings) {
      await request<Chat.ChangeRoomSettingsRequest>(Chat.ChangeRoomSettings, {
        room: room.uuid,
        name: roomsettings.name,
        public: roomsettings.public,
      });
    }
    justactivated = true;
  }
  async function removeUser(i, user) {
    roomsettings.users.splice(i, 1);
    roomsettings = roomsettings;
    justactivated = true;

    await request<Chat.RemoveUserRequest>(Chat.RemoveUser, {
      room: room.uuid,
      user: user.uuid,
    });
    justactivated = true;
  }
  async function inviteFriend(friend) {
    roomsettings.users.push(friend);
    roomsettings = roomsettings;
    justactivated = true;

    await request<Chat.InviteUserRequest>(Chat.InviteUser, {
      room: room.uuid,
      user: friend.uuid,
    });
  }
  async function deleteRoom() {
    if (confirm("are you sure you want to delete this room")) {
      await request<Chat.DeleteRoomRequest>(Chat.DeleteRoom, {
        room: room.uuid,
      });
    }
  }
</script>

{#if showroomsettings}
  <ClickOutside on:clickoutside={disable}>
    <div id="roomsettings">
      <p class="text  text-center text-2xl">Room Settings</p>
      <div class="dark rounded-md p-2 m-2">
        <p class="text inline">room title:</p>
        <input bind:value={roomsettings.name} />
        <br />
        <p class="text inline">room will appear in public rooms:</p>
        <input type="checkbox" bind:checked={roomsettings.public} />
      </div>
      <p class="text text-center text-xl">Manage users</p>
      <div class="dark rounded-md m-2 p-2">
        {#each roomsettings.users as user, i}
          <div
            class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
          >
            <div class="flex items-center">
              <User {user} />
            </div>
            <div class="flex items-center">
              <button on:click={() => removeUser(i, user)}>
                <FontAwesomeIcon inverse={true} size="lg" icon={faUserXmark} />
              </button>
            </div>
          </div>
        {/each}
      </div>
      <p class="text text-center text-xl">Invite friends</p>
      <div class="dark rounded-md p-2 m-2">
        {#if invitablefriends.length == 0}
          <p class="text text-lg">
            either you have no friends or all your friends are in this one room.
            of course, something could have gone catastrophically wrong on the
            backend, but that's unlikely
          </p>
        {/if}
        {#each invitablefriends as friend}
          <div
            class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
          >
            <div class="flex items-center">
              <User user={friend} />
            </div>
            <div class="flex items-center">
              <button on:click={() => inviteFriend(friend)}>
                <FontAwesomeIcon inverse={true} size="lg" icon={faUserPlus} />
              </button>
            </div>
          </div>
        {/each}
      </div>
      <div class="flex items-center grow justify-center">
        <SelectButton classes="w-full" text="Save" click={disable} />
        <SelectButton classes="w-full" text="Delete Room" click={deleteRoom} />
      </div>
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
