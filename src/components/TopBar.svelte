<script lang="ts">
  import jq from "jquery";
  import Pfp from "./Pfp.svelte";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faRightFromBracket, faHouseUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon, FontAwesomeLayers, FontAwesomeLayersText } from 'fontawesome-svelte';

// library.add([faRightFromBracket,faHouseUser]);
  var username = "";
  let notifs: ClientNotification[];

  jq.get("/api/me").then((user) => {
    username = user.username;
  });

  function signOut(){
    document.cookie = "token=;Max-Age=-999999999";
    window.location.replace("/");
  }
  async function showNotifs(){
    // notifs = fetch() 
  }
</script>

<div id = "root" class="flex darkm1 text-center">
  <a href = "/home">
    <FontAwesomeIcon icon= {faHouseUser} inverse = {true}></FontAwesomeIcon>
  </a>
  <button on:click = {showNotifs}></button>
  <Pfp size = "large" name = {username}></Pfp>
  <button on:click = {signOut}>
    <FontAwesomeIcon icon = {faRightFromBracket} inverse = {true}></FontAwesomeIcon>
  </button>

</div>
<style>
#root{
  grid-area: topbar; 
}
</style>
