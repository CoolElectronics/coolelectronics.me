<script lang="ts">
  import { ClientChatMessage, ClientSelf } from "../../clienttypes";
  import Pfp from "../components/Pfp.svelte";
  import ta from "time-ago";
import { onMount } from "svelte/internal";

  export let self:ClientSelf;
  export let message: ClientChatMessage;
  export let prev: ClientChatMessage | null;

  export let clickpfp:Function;
  
  let msgelement:HTMLDivElement;
  let minimized = false;
  onMount(()=>{
    msgelement.scrollIntoView();
  })
  if (prev){
    let minutesbetween = Math.floor(Date.parse(message.timestamp as unknown as string) - Date.parse(prev.timestamp as unknown as string)) / 1000 / 60;
    let own = prev.sender == message.sender;
    minimized = minutesbetween < 5 && own;
  }
</script>

{#if !minimized}
  <div class="message" bind:this={msgelement}>
    <button on:click = {(e)=> clickpfp(e,message.sender)}>
    <Pfp
      classes="inline-block pfp mr-5"
      size="small"
      name={message.sendername}
    />
    </button>
    <div class="-contents ml-2.5">
      <div class="flex items-center">
        <p class="text text-lg">{@html message.sendername}</p>
        <p class="ml-1.5 text-gray-300 text-xs">{ta.ago(message.timestamp)}</p>
      </div>
      <div class="flex -contents">
        <p class="text text-sm">
          {@html message.message}
        </p>
      </div>
    </div>
    <div class="filler" />
  </div>
{:else}
  <div class = "minimized flex" bind:this={msgelement}>
    <div class = "pfp-filler"></div>
    <div class = "ml-2.5 text text-sm">
      {@html message.message}
    </div>
  </div>
{/if}

<style>
  .message {
    background-color: var(--darkm3);
    margin: 10px;
    margin-top: 20px;
    margin-bottom: 0px;
    display: grid;
    grid-template-areas: "pfp contents" "filler contents";
    grid-template-rows: 40px 100fr;
    grid-template-columns: 40px 100fr;
  }
  .filler {
    grid-area: filler;
  }
  .pfp-filler{
  width: 50px;
  }
  .-contents {
    grid-area: contents;
  }
</style>
