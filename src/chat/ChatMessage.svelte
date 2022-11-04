<script lang="ts">
  import { ClientChatMessage, ClientSelf } from "../../clienttypes";
  import Pfp from "../components/Pfp.svelte";
  import ta from "time-ago";
  import { onMount } from "svelte/internal";

  export let self: ClientSelf;
  export let message: ClientChatMessage;
  export let prev: ClientChatMessage | null;

  export let clickpfp: Function;
  export let classes = "";

  const urlregex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

  let msgelement: HTMLDivElement;
  let minimized = false;

  let formattedmsg: string;
  $: format(message.message).then((_) => (formattedmsg = _));

  async function format(message: string) {
    if (message.includes("<")) return message;
    let buf = "";
    for (let part of message.split(" ")) {
      if (urlregex.test(part)) {
        buf += await formatURL(part);
        console.log(await formatURL(part));
      } else {
        buf += part;
      }
      buf += " ";
    }
    return buf;
  }
  async function formatURL(url) {
    let imgurl = `<div style = "overflow:hidden;height:200px" >
                    <img class = "scaledown" src = "${url}"/>
                  </div>`;
    let videourl = `<div style = "overflow:hidden;height:200px" >
                    <video controls class = "scaledown">
                      <source src = "${url}">
                    </video>
                  </div>`;
    if (url.match(/\.(jpeg|jpg|gif|png)$/) != null) return imgurl;
    if (url.match(/\.(webm|mp4|ogg)$/) != null) return videourl;
    try {
      let res = await fetch(url);
      // leaks user ips
      if (res.status === 200) {
        switch (res.headers.get("Content-Type")) {
          case "image/png":
          case "image/jpg":
          case "image/jpeg":
            return imgurl;
          case "video/mp4":
          case "video/webm":
          case "video/ogg":
            return videourl;
        }
      }
    } catch {}
    return `<a style = "color:blue" href = ${url}>${url}</a>`;
  }
  onMount(() => {
    msgelement.scrollIntoView();
  });
  if (prev) {
    let minutesbetween =
      Math.floor(
        Date.parse(message.timestamp as unknown as string) -
          Date.parse(prev.timestamp as unknown as string)
      ) /
      1000 /
      60;
    let own = prev.sender == message.sender;
    minimized = minutesbetween < 5 && own;
  }
</script>

{#if !minimized}
  <div class={"message " + classes} bind:this={msgelement}>
    <button on:click={(e) => clickpfp(e, message.sender)}>
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
          {@html formattedmsg}
        </p>
      </div>
    </div>
    <div class="filler" />
  </div>
{:else}
  <div class="minimized flex" bind:this={msgelement}>
    <div class="pfp-filler" />
    <div class="ml-2.5 text text-sm msgcontainer">
      {@html formattedmsg}
    </div>
  </div>
{/if}

<style>
  :global(img) {
    height: 100%;
  }
  .msgcontainer{
    max-width:200px; 
  }
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
  .pfp-filler {
    width: 50px;
  }
  .-contents {
    grid-area: contents;
  }
</style>
