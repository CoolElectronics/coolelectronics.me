<script lang="ts">
  import jq from "jquery";
  import TopBar from "../components/TopBar.svelte";
  import io from "socket.io-client";
  import { ClientChatMessage, ClientRoom, ClientSelf } from "../../clienttypes";
  import SelectButton from "./SelectButton.svelte";
  import ChatMessage from "./ChatMessage.svelte";
  import * as scrollto from "svelte-scrollto";

  let socket = io();
  let message = "";
  let selectedroom: SelectedRoom;
  let rooms: { [name: string]: ClientRoom } = {};
  let messages: { [name: string]: ClientChatMessage[] } = {};
  let publicrooms: ClientRoom[] = [];
  let self: ClientSelf;

  let newRoomTitle = "";
  let newRoomPublic:boolean = false;

  let roombodyelm: HTMLElement;

  let examplemsg = { message: "asd" } as unknown as ClientChatMessage;
  // let notifs:ClientNotification[];

  jq.get("/api/me").then((s) => (self = s));

  $: connected = socket.connected;

  socket.on("chat:newmessage", (res) => {
    messages[res.room].push(res.msg);
    messages = messages; // svelte moment
  });
  socket.on("chat:rooms", (res: ClientRoom[]) => {
    console.log("recieved rooms");
    console.log(res);
    for (let room of res) {
      if (!selectedroom) {
        selectedroom = { kind: "room", id: room.uuid };
      }
      rooms[room.uuid] = room;
      if (!messages[room.uuid]) {
        messages[room.uuid] = [];
        fetch(room.uuid);
      }
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
  async function fetch(roomid: string) {
    let resp: ClientChatMessage[] = await jq.post("/api/chat/fetch", {
      id: roomid,
    });
    messages[roomid] = resp;
  }

  async function selectFriends() {
    selectedroom = { kind: "tab", type: MenuType.Friends };
  }
  async function selectNewRoom() {
    selectedroom = { kind: "tab", type: MenuType.NewRoom };
  }

  async function selectPublic() {
    selectedroom = { kind: "tab", type: MenuType.Public };
    publicrooms = await jq.get("/api/chat/fetchpublic");
  }
  async function joinPublicRoom(uuid:string){
    await jq.post("/api/chat/joinpublic",{
      uuid
    });
  }
  async function createNewRoom() {
    let resp: ClientRoom = await jq.post("/api/chat/newroom", {
      name: newRoomTitle,
      public: newRoomPublic,
    });
    rooms[resp.uuid] = resp;
    messages[resp.uuid] = [];
    selectedroom = { kind: "room", id: resp.uuid };
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
    Friends,
    Public,
    NewRoom,
  }
</script>

<main class="dark">
  <TopBar />
  <div id="selector" class="darkm2 p-3 flex flex-col shadow-black shadow-sm">
    {#each Object.values(rooms) as room}
      <SelectButton
        text={room.name}
        click={() => (selectedroom = { kind: "room", id: room.uuid })}
      />
    {/each}
    <SelectButton text="Menu" click={selectFriends} />
  </div>
  {#if selectedroom && selectedroom.kind == "room"}
    <div class="c-contents" id="contents-room">
      <div class="darkm2" id="room-bar">
        <p class="text text-2xl m-4">room: {rooms[selectedroom.id].name}</p>
      </div>
      <div id="contents-actions" class="darkm" />
      <div id="room-body" class="darkm3">
        {#each messages[selectedroom.id] as message, i}
          <ChatMessage
            {self}
            {message}
            prev={messages[selectedroom.id][i - 1]}
          />
        {/each}
      </div>
      <div id="room-box" class="darkm2 p-4">
        <input
          bind:value={message}
          placeholder="send a message..."
          on:keyup={(e) => {
            if (e.key == "Enter") {
              sendmessage();
            }
          }}
        />
      </div>
      <div id="room-list" class="darkm2">
        {#each rooms[selectedroom.id].users as user}
          <p class="text-lg text">
            user {user.name} is {user.online ? "online" : "offline"}
          </p>
        {/each}
      </div>
    </div>
  {:else}
    <div class="c-contents" id="contents-menu">
      <div class="darkm3 p-3 flex flex-col shadow-black shadow-sm">
        <SelectButton text="Friends" click={selectFriends} />
        <SelectButton text="Explore" click={selectPublic} />
        <SelectButton
          classes="justify-self-end"
          text="Create Room"
          click={selectNewRoom}
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
              <input type="checkbox" bind:checked ={newRoomPublic} />
            </div>

            <SelectButton text="Create" click={createNewRoom} />
          </div>
        </div>
      {:else if selectedroom && selectedroom.type == MenuType.Friends}
        <div class="a">
          <div>
            <p class="text text-size-3xl text-center">
              Incoming Friend Requests
            </p>
          </div>
        </div>
      {:else if selectedroom && selectedroom.type == MenuType.Public}
        <div>
          {#each publicrooms as room}
          <div class = "darkm3">
           <p class = "text text-2xl">{room.name}</p>
           <p class = "text text-lg">users: {room.users.length}</p>
           <button on:click={()=>joinPublicRoom(room.uuid)}>Join</button>
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
  main > div {
    /* warning: very dirty hack.  */
    border-top: 4px solid var(--darkp3);
  }
  #contents-menu {
    display: grid;
    grid-template-columns: 10fr 90fr;
  }
  #contents-menu > * {
    /* border: 2px solid var(--darkp3); */
  }
  #contents-room {
    display: grid;
    grid-template-areas: "bar actions" "body list" "box list";
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
    position: relative;
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
