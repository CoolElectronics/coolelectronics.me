<script lang="ts">
  import { ClientUser } from "../../clienttypes";
  import User from "../components/User.svelte";
  import ClickOutside from "svelte-click-outside";
  import jq from "jquery";

  export let showuserdropdown: boolean;
  export let user: ClientUser;


  let bypass = true;

  function disable(){
    if (bypass){
      bypass = false;
      return;
    }


    showuserdropdown = false;
  }
</script>

<ClickOutside on:clickoutside={disable}>
  <div id="dropdown">
    <User {user} />
  </div>
</ClickOutside>

<style>
  #dropdown {
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
