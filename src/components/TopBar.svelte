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

  var username = "";
  export let title;

  jq.get("/api/me").then((user) => {
    username = user.username;
  });

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
  <div class = "flex items-center">
    <a href="/home" class = "m-2">
      <FontAwesomeIcon size = "lg" icon={faHouseUser} inverse={true} />
    </a>
    <button on:click={showNotifs} />
    <a href="/account" class = "m-2">
      <Pfp size="large" name={username} />
    </a>
    <button on:click={signOut} class = "m-2">
      <FontAwesomeIcon size = "lg" icon={faRightFromBracket} inverse={true} />
    </button>
  </div>
</div>

<style>
  #root {
    grid-area: topbar;
    padding-bottom: 4px;
    border-bottom: 4px solid var(--darkp3);
  }
</style>
