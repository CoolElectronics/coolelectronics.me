<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import User from "../components/User.svelte";
  import RoomSettings from "./RoomSettings.svelte";
  import io, { Socket } from "socket.io-client";
  import {
    ClientChatMessage,
    ClientRoom,
    ClientSelf,
    ClientUser,
    MESSAGES_PER_PAGE,
  } from "../../clienttypes";
  import SelectButton from "../components/SelectButton.svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import * as scrollto from "svelte-scrollto";

  import {
    faBars,
    faCirclePlus,
    faGear,
    faGears,
    faRightFromBracket,
    faUserPlus,
    faUsersRays,
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "fontawesome-svelte";
  import { afterUpdate, noop, onMount, tick } from "svelte/internal";
  import UserDropdown from "./UserDropdown.svelte";
  import request from "../requests";
  import * as Chat from "../../routes/chat/types";
  import call from "../requests";
  import {
    GetUser,
    GetUserRequest,
    GetUserResponse,
    Self,
  } from "../../routes/index/types";

  let socket: Socket = io();
  let message = "";
  let selectedroom: SelectedRoom;

  let rooms: {
    [name: string]: ClientRoom;
  } = {};
  let messages: { [name: string]: ClientChatMessage[] } = {};
  let roomsdata: {
    [name: string]: { unread: number; page: number; endreached: boolean };
  } = {};

  let publicrooms: ClientRoom[] = [];
  let self: ClientSelf;

  let showroomsettings = false;
  let showuserdropdown = false;
  let selecteduser: ClientUser | null;

  let newRoomTitle = "";
  let newRoomPublic: boolean = false;
  let fileinput: HTMLInputElement;
  // let uploadedImage: string | null;
  // let messageFormData: FormData | null;
  let messageContainer: HTMLElement;
  let lastmsg: HTMLElement | null;

  let prev: ChatMessage | null;

  call(Self).then((s) => (self = s));

  let loading = false;
  let scrollDetector: HTMLElement | null;
  $: {
    if (scrollDetector) {
      let observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            fetch();
          }
        },
        { threshold: 1 }
      );
      observer.observe(scrollDetector);
    }
  }

  socket.on("chat:newmessage", (res) => {
    messages[res.room].push(res.msg);
    messages = messages; // svelte moment
  });
  socket.on("chat:rooms", (res: ClientRoom[]) => {
    console.log("recieved rooms");
    rooms = {};
    for (let room of res) {
      if (!selectedroom) {
        selectedroom = { kind: "room", id: room.uuid };
      }
      rooms[room.uuid] = room;

      if (!messages[room.uuid]) {
        messages[room.uuid] = [];
        roomsdata[room.uuid] = {
          unread: 0,
          page: 0,
          endreached: false,
        };
      }
    }
    if (
      selectedroom &&
      selectedroom.kind == "room" &&
      !rooms[selectedroom.id]
    ) {
      selectedroom = {
        kind: "tab",
        type: MenuType.Public,
      };
    }
  });

  socket.emit("chat:connected");

  function sendmessage() {
    if (selectedroom.kind == "room") {
      socket.emit("chat:send", {
        id: selectedroom.id,
        message,
      });
      message = "";
    }
  }
  async function fetch() {
    if (selectedroom.kind == "room") {
      let room = rooms[selectedroom.id];
      let data = roomsdata[selectedroom.id];
      data.page += 1;

      loading = true;
      let resp: ClientChatMessage[] = await request<
        Chat.FetchRequest,
        Chat.FetchResponse
      >(Chat.Fetch, {
        id: selectedroom.id,
        page: data.page - 1,
      });
      setTimeout(() => {
        loading = false;
      }, 200);

      if (resp.length == 0) {
        data.endreached = true;
      } else {
        messages[selectedroom.id] = [...resp, ...messages[selectedroom.id]];
      }
      rooms = rooms;
      await tick();
      if (resp.length > 0) {
        let elm = messageContainer.children[MESSAGES_PER_PAGE + 1];
        if (elm) {
          elm.scrollIntoView();
        }
      }
    }
  }

  async function selectNewRoom() {
    selectedroom = { kind: "tab", type: MenuType.NewRoom };
  }

  async function selectPublic() {
    selectedroom = { kind: "tab", type: MenuType.Public };
    publicrooms = await request(Chat.FetchPublic);
  }
  async function joinPublicRoom(uuid: string) {
    await request<Chat.JoinPublicRequest, Chat.JoinPublicResponse>(
      Chat.JoinPublic,
      {
        uuid,
      }
    );
  }
  async function createNewRoom() {
    let resp = await request<Chat.NewRoomRequest, Chat.NewRoomResponse>(
      Chat.NewRoom,
      {
        name: newRoomTitle,
        public: newRoomPublic,
      }
    );
    rooms[resp.uuid] = resp;
    roomsdata[resp.uuid] = { unread: 0, page: 0, endreached: false };
    messages[resp.uuid] = [];
    selectedroom = { kind: "room", id: resp.uuid };
  }
  async function leaveRoom() {
    if (selectedroom.kind == "room") {
      let resp = await request<Chat.LeaveRoomRequest>(Chat.LeaveRoom, {
        room: selectedroom.id,
      });
      selectedroom = null as unknown as SelectedRoom; // yeah yeah whatever idc
    }
  }
  async function activateDropdown(e: MouseEvent, user: string) {
    showuserdropdown = true;
    selecteduser = await request<GetUserRequest, GetUserResponse>(GetUser, {
      uuid: user,
    });
  }
  function attachImage() {
    fileinput.click();
  }
  function addImage(this: any, e) {
    console.log(e);
    let reader = new FileReader();
    reader.addEventListener("load", () => {
      // uploadedImage = reader.result;
    });
    reader.readAsDataURL(this.files[0]);
  }

  type SelectedRoom = Room | Tab;
  interface Room {
    kind: "room";
    id: string;
  }
  interface Tab {
    kind: "tab";
    type: MenuType;
  }
  enum MenuType {
    Public,
    NewRoom,
  }
</script>

{#if selectedroom && selectedroom.kind == "room"}
  <RoomSettings bind:showroomsettings room={rooms[selectedroom.id]} />
{/if}
{#if showuserdropdown && selecteduser}
  <UserDropdown bind:showuserdropdown user={selecteduser} />
{/if}
<main class="dark">
  <input
    on:change={addImage}
    class="hidden"
    type="file"
    bind:this={fileinput}
    accept="image/jpeg, image/png, image/jpg"
  />
  <TopBar showtoasts={false} bind:socket {self} title="CoolChat" />
  <div id="selector" class="darkm1 p-3 flex flex-col shadow-black shadow-sm">
    {#each Object.values(rooms) as room}
      <SelectButton
        text={room.name}
        click={() => (selectedroom = { kind: "room", id: room.uuid })}
      />
    {/each}
    <SelectButton text="Menu" click={selectPublic} />
  </div>
  {#if selectedroom && selectedroom.kind == "room"}
    {@const room = rooms[selectedroom.id]}
    {@const roomdata = roomsdata[selectedroom.id]}
    <div class="c-contents" id="contents-room">
      <div class="darkm2 flex justify-between" id="room-bar">
        <div>
          <p class="text text-2xl m-4">{@html room.name}</p>
        </div>
        <div class="p-2 flex items-center justify-end">
          {#if room.owner == self.uuid}
            <button class="m-2" on:click={() => (showroomsettings = true)}>
              <FontAwesomeIcon size="1.5x" icon={faUserPlus} inverse={true} />
            </button>
            <button class="m-2" on:click={() => (showroomsettings = true)}>
              <FontAwesomeIcon size="1.5x" icon={faGear} inverse={true} />
            </button>
          {/if}
          <button class="m-2" on:click={leaveRoom}>
            <FontAwesomeIcon
              size="1.5x"
              icon={faRightFromBracket}
              inverse={true}
            />
          </button>
        </div>
      </div>
      <!-- <div id="contents-actions" class="darkm" /> -->
      <div id="room-body" bind:this={messageContainer} class="darkm3">
        {#if roomdata.endreached}
          <p class="text-center text text-xl">the start of {room.name}</p>
        {:else if loading}
          <p class="text-center text text-xl">Loading...</p>
        {:else}
          <div bind:this={scrollDetector} />
        {/if}
        {#each messages[selectedroom.id] as message, i}
          <ChatMessage
            clickpfp={(e) => activateDropdown(e, message.sender)}
            {self}
            {message}
            prev={messages[selectedroom.id][i - 1]}
          />
        {/each}
      </div>
      <div id="room-box" class="darkm2 p-4 flex items-center">
        <div
          spellcheck="false"
          class="h-min w-full relative outline-none whitespace-pre-wrap break-words dark text text-sm rounded-md"
          autocorrect="off"
          contenteditable="true"
          bind:innerHTML={message}
          placeholder="send a message..."
          on:keydown={(e) => {
            if (e.key == "Enter") {
              if (!e.shiftKey) {
                sendmessage();
                e.preventDefault();
                return false;
              }
            }
          }}
        />
        <button class="m-2" on:click={attachImage}>
          <FontAwesomeIcon size="1.5x" icon={faCirclePlus} inverse={true} />
        </button>
      </div>
      <div id="room-list" class="darkm2">
        {#each rooms[selectedroom.id].users as user}
          <div
            class="flex justify-between items-center dark m-3 p-1 rounded-md"
          >
            <User {user} />
            <button
              on:click={(e) => activateDropdown(e, user.uuid)}
              class="m-2"
            >
              <FontAwesomeIcon size="lg" inverse={true} icon={faBars} />
            </button>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="c-contents" id="contents-menu">
      <div class="darkm3 p-3 flex flex-col shadow-black shadow-sm">
        <SelectButton text="Explore" click={selectPublic} />
        <SelectButton
          classes="justify-self-end"
          text="Create Room"
          click={selectNewRoom}
        />
        <SelectButton
          text="Settings"
          click={() => window.location.replace("/account")}
        />
      </div>
      {#if selectedroom && selectedroom.type == MenuType.NewRoom}
        <div class="w-full h-full flex justify-center items-center">
          <div class="flex flex-col p-5 darkm3 rounded-md w-2/5 h-max">
            <p class="mb-6 text text-2xl">Create Room</p>
            <p class="text text-md">Room Name:</p>
            <p />
            <input class="mb-4" bind:value={newRoomTitle} />
            <div class="mb-6">
              <p class="text text-md inline">Make Public:</p>
              <input type="checkbox" bind:checked={newRoomPublic} />
            </div>

            <SelectButton text="Create" click={createNewRoom} />
          </div>
        </div>
      {:else if selectedroom && selectedroom.type == MenuType.Public}
        <div>
          {#each publicrooms as room}
            <div class="darkm3">
              <p class="text text-2xl">{room.name}</p>
              <p class="text text-lg">users: {room.users.length}</p>
              <button on:click={() => joinPublicRoom(room.uuid)}>Join</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</main>

<style>
  main {
    display: grid;
    grid-template-areas: "topbar topbar" "selector contents";
    grid-template-columns: 10fr 90fr;
    grid-template-rows: max-content auto;
    overflow: hidden;
  }
  /* main > div { */
  /* warning: very dirty hack.  */
  /* border-top: 4px solid var(--darkp3); */
  /* } */
  #contents-menu {
    display: grid;
    grid-template-columns: 10fr 90fr;
  }
  #contents-menu > * {
    /* border: 2px solid var(--darkp3); */
  }
  #contents-room {
    display: grid;
    grid-template-areas: "bar list" "body list" "box list";
    grid-template-columns: 85fr 15fr;
    grid-template-rows: max-content auto max-content;
    overflow-y: scroll;
  }
  #contents-actions {
    grid-area: actions;

    border-left: 4px solid var(--dark);
  }
  #contents-bar {
    grid-area: bar;
  }
  #room-body {
    grid-area: body;
    overflow-y: scroll;
    overflow-x: hidden;
    height: 100%;
    padding-bottom: 20px;
  }
  #room-list {
    grid-area: list;

    border-left: 4px solid var(--dark);
  }
  #room-box {
    /* border-top: 4px solid var(--dark); */
    grid-area: box;
  }
  #selector {
    grid-area: selector;
  }
  .c-contents {
    grid-area: contents;

    border-left: 4px solid var(--darkp3);
  }
</style>
