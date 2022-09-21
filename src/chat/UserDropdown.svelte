<script lang="ts">
  import { ClientUser } from "../../clienttypes";
  import User from "../components/User.svelte";
  import ClickOutside from "svelte-click-outside";
  import SelectButton from "../components/SelectButton.svelte";

  import request from "../requests";
  import * as Account from "../../routes/account/types";

  export let showuserdropdown: boolean;
  export let user: ClientUser;


  let friends:ClientUser[] = [];

  let bypass = true;

  $:user&&request<any,Account.MyFriendsResponse>(Account.MyFriends).then(f=>friends = f);
  function disable(){
    if (bypass){
      bypass = false;
      return;
    }


    showuserdropdown = false;
  }
  function friend(){
  console.log(friends);
   if (isfriend){
    request<Account.RemoveFriendRequest,Account.RemoveFriendResponse>(Account.RemoveFriend,{
      uuid:user.uuid,
    });
   }else{
    request<Account.RequestFriendRequest,Account.RequestFriendResponse>(Account.RequestFriend,{
      uuid:user.uuid,
    });
   } 

   friends = friends;
  }
  $: isfriend = !friends.every(f=>f.uuid != user.uuid);
</script>

<ClickOutside on:clickoutside={disable}>
  <div id="dropdown">
    <User {user} />
    <SelectButton click = {friend} text = {isfriend ? "Unfriend" : "Friend"}/>
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
