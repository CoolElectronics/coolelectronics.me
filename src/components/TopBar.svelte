<script lang="ts">
  import jq from "jquery";
  import Pfp from "./Pfp.svelte";
  import { library } from "@fortawesome/fontawesome-svg-core";
  import {
    faRightFromBracket,
    faHouseUser,
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

  export let title;
  export let self: ClientSelf | null = null;
  export let socket: Socket = io();
  export let showtoasts = true;

  let focused = true;

  let toasts: ClientChatMessage[] = [];

  // let notifs:

  if (!self) {
    jq.get("/api/me").then((user) => {
      self = user;
    });
  }
  window.onblur = () => (focused = false);
  window.onfocus = () => (focused = true);

  socket.on("index:notification", () => {});

  Notification.requestPermission();

  if (showtoasts) {
    socket.on("chat:newmessage", (msg) => {
      let message: ClientChatMessage = msg.msg;
      if (document.visibilityState == "visible" && focused) {
        toasts = [...toasts, message];
        let i = toasts.length - 1;
        // setTimeout(() => {
        //   toasts.splice(i, 1);
        //   toasts = toasts;
        // }, 10000);
      } else {
        new Notification(message.sendername,{
          body: message.message,
          icon: `/pfp/${message.sendername}.png`
        }).addEventListener("click",()=>{
          window.open("/chat");
        })
      }
    });
  }

  function signOut() {
    document.cookie = "token=;Max-Age=-999999999";
    window.location.replace("/");
  }
  async function showNotifs() {
    // notifs = fetch()
  }
</script>

<div id="root" class="flex items-center justify-between darkm1 text-center">
  <div>
    <p class="text text-3xl">{title}</p>
  </div>
  <div class="flex items-center">
    <a href="/home" class="m-2">
      <FontAwesomeIcon size="lg" icon={faHouseUser} inverse={true} />
    </a>
    <button on:click={showNotifs} />
    <a href="/account" class="m-2">
      {#if self}
        <!-- TOTALLY USELESS IF STATEMENT BECAUSE SVELTE DOES NOT KNOW WHAT A ! IS -->
        <Pfp size="large" name={self.username} />
      {/if}
    </a>
    <button on:click={signOut} class="m-2">
      <FontAwesomeIcon size="lg" icon={faRightFromBracket} inverse={true} />
    </button>
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
        <ChatMessage {self} message={toast} prev={null} clickpfp={noop} />
      </div>
    {/each}
  {/if}
</div>
{@html `
<style>
  .toast > *{
    margin: 0 !important
  }
</style>
`}

<!--hahhaha don't ask-->
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
  }
  .toast {
    width: 20%;
    border: 4px solid var(--darkp1);
    padding: 10px;
  }
</style>
