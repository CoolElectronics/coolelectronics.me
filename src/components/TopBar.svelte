<script lang="ts">
  import Pfp from "./Pfp.svelte";
  import { library } from "@fortawesome/fontawesome-svg-core";
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
  import { ClientChatMessage, ClientSelf } from "../../clienttypes";
  import { io, Socket } from "socket.io-client";
  import User from "../components/User.svelte";
  import ChatMessage from "../chat/ChatMessage.svelte";
  import { noop } from "svelte/internal";
  import { init, resubscribe } from "../pushclient";

  import request from "../requests";
  import { SelfResponse, Self } from "../../routes/index/types";

  export let title;
  export let self: ClientSelf | null = null;
  export let socket: Socket = io();
  export let showtoasts = true;
  export let askForNotifs: boolean = true;

  let focused = true;

  let toasts: Toast[] = [];

  let connected = true;

  init();
  if (!self) {
    request<SelfResponse>(Self).then((user) => {
      self = user;
    });
  }
  window.onblur = () => (focused = false);
  window.onfocus = () => (focused = true);

  socket.on("index:notification", () => {});
  if (askForNotifs) {
    try {
      Notification.requestPermission();
    } catch {}
  }
  socket.on("chat:newmessage", (msg) => {
    let message: ClientChatMessage = msg.msg;
    if (showtoasts && document.visibilityState == "visible" && focused) {
      toasts = [{ kind: "chatmessage", message }, ...toasts];
      let i = toasts.length - 1;
      // setTimeout(() => {
      //   toasts.splice(i, 1);
      //   toasts = toasts;
      // }, 10000);
    } else if (document.visibilityState == "hidden" && !focused) {
      new Notification(message.sendername, {
        body: message.message,
        icon: `/pfp/${message.sendername}.png`,
      }).addEventListener("click", () => {
        window.open("/chat");
      });
    }
  });
  socket.on("account:pushworkerresubscribe", (msg) => {
    resubscribe();
  });

  function signOut() {
    document.cookie = "token=;Max-Age=-999999999";
    window.location.replace("/");
  }
  async function showNotifs() {
    // notifs = fetch()
  }

  setInterval(() => {
    if (connected != socket.connected) {
      toasts = [{ kind: "serverstatus", status: socket.connected }, ...toasts];
    }
    connected = socket.connected;
  }, 3000);

  type Toast = ChatMessageToast | ServerStatusToast;
  interface ServerStatusToast {
    kind: "serverstatus";
    status: boolean;
  }
  interface ChatMessageToast {
    kind: "chatmessage";
    message: ClientChatMessage;
  }
</script>

<div id="root" class="flex items-center justify-between darkm1 text-center">
  <div>
    <p class="text text-3xl m-4">{title}</p>
  </div>
  <div class="flex items-center">
    {#if self}
      <a href="/home" class="m-2">
        <FontAwesomeIcon size="lg" icon={faHouseUser} inverse={true} />
      </a>
      <button on:click={showNotifs} />
      <a href="/account" class="m-2">
        <Pfp size="large" name={self.username} />
      </a>
      <button on:click={signOut} class="m-2">
        <FontAwesomeIcon size="lg" icon={faRightFromBracket} inverse={true} />
      </button>
    {:else}
      <a href="/sign">
        <FontAwesomeIcon size="lg" icon={faSignIn} inverse={true} />
      </a>
    {/if}
  </div>
</div>
<div id="toasts">
  {#if self}
    {#each toasts as toast, i}
      <div
        class="darkm3 rounded-md toast m-2"
        on:click={() => {
          toasts.splice(i, 1);
          toasts = toasts;
        }}
      >
        <p class="hidden text-green-300 text-red-300" />
        {#if toast.kind == "chatmessage"}
          <ChatMessage
            {self}
            message={toast.message}
            prev={null}
            clickpfp={noop}
          />
        {:else if toast.kind == "serverstatus"}
          <p
            class={"text-md " +
              (toast.status ? "text-green-300" : "text-red-300")}
          >
            {toast.status ? "Connected to server" : "Disconnected from server"}
          </p>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  #root {
    grid-area: topbar;
    padding-bottom: 4px;
    border-bottom: 4px solid var(--darkp3);
  }
  #toasts {
    position: fixed;
    width: 100%;
    right: 0px;
    /* top:0px; */
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-top: 8px;
    pointer-events: none;
  }
  .toast {
    pointer-events: initial;
    width: 20%;
    border: 4px solid var(--darkp1);
    padding: 10px;
    z-index: 9999;
  }
  :global(.toast > *) {
    margin: 0 !important;
  }
</style>
