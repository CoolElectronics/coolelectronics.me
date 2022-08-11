<script lang="ts">
  import { ClientFriendRequest } from "../../clienttypes";

  import TopBar from "../components/TopBar.svelte";
  import TabButton from "../components/TabButton.svelte";

  let selectedtab: "friends" | "settings" | "account" = "friends";


  let inboundrequests:ClientFriendRequest[] = [];
  let outboundrequests:ClientFriendRequest[] = [];

  let friends: ClientUser[] = [];
  
  async function fetchfriends(){

  }

</script>
<main>
<TopBar title = {"Account Settings"}/>
<div id = "tabbuttons">
  <TabButton bind:selectedtab click = {fetchfriends} self = {"friends"}/>
  <TabButton bind:selectedtab self = {"settings"}/>
  <TabButton bind:selectedtab self = {"account"}/>
</div>
<div id = "tabcontainer">
  {#if selectedtab == "friends"}
  {:else if selectedtab == "settings"}
  {:else if selectedtab == "account"}
  {/if}
</div>
</main>
<style>

</style>
