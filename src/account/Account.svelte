<script lang="ts">
  import { ClientFriendRequest, ClientUser,ClientSelf } from "../../clienttypes";

  import TopBar from "../components/TopBar.svelte";
  import TabButton from "../components/TabButton.svelte";
  import User from "../components/User.svelte";
  import Pfp from "../components/Pfp.svelte";
  import jq from "jquery";

  import { FontAwesomeIcon } from "fontawesome-svelte";

  import { faCheck, faUserPlus, faUserXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte/internal";
  import SelectButton from "../components/SelectButton.svelte";
  
  import request from "../requests";
  import { Self, SelfResponse } from "../../routes/index/types";
  import * as Account from "../../routes/account/types";

  let selectedtab: "friends" | "settings" | "account" = "friends";

  let self: ClientSelf;
  let inboundrequests: ClientFriendRequest[] = [];
  let outboundrequests: ClientFriendRequest[] = [];

  let friends: ClientUser[] = [];
  let availablefriends: ClientUser[] = [];

  onMount(async () => {
    fetchfriends();
    self = await request<SelfResponse>(Self);
  });

  async function fetchfriends() {
    friends = await request<any,Account.MyFriendsResponse>(Account.MyFriends);
    availablefriends = await request<any,Account.AvailableFriendsResponse>(Account.AvaliableFriends);
    let reqs: ClientFriendRequest[] = await request<any,Account.GetFriendRequestsResponse>(Account.GetFriendRequests); 
    console.log(reqs);
    for (let req of reqs) {
      if (req.from.uuid == self.uuid) {
        outboundrequests.push(req);
      } else {
        inboundrequests.push(req);
      }
    }
    outboundrequests = outboundrequests;
    inboundrequests = inboundrequests;
  }

  async function requestFriend(friend: ClientUser) {
    let res = await request<Account.RequestFriendRequest,Account.RequestFriendResponse>(Account.RequestFriend,{
      uuid: friend.uuid,
    });
    if (res?.failure != null){
      console.log("failure")
    }else{
    availablefriends = availablefriends.filter(f => f.uuid != friend.uuid);
    outboundrequests = [...outboundrequests,{
      uuid: "idk",
      from:{
        name:self.username,
        online:true,
        uuid:self.uuid,
      },
      to:friend,
    }];
    }
    
  }
  async function removeFriend(friend: ClientUser) {
    await request<any,Account.RemoveFriendRequest>(Account.RemoveFriend,{
      uuid: friend.uuid,
    });
    friends = friends.filter(f => f.uuid != friend.uuid);
  }
  async function requestRespond(uuid:string,response:boolean){
    inboundrequests = inboundrequests.filter(r => r.uuid != uuid);
    await request<Account.FriendRequestRespondRequest>(Account.FriendRequestRespond,{
      uuid,
      accept:response,
    })
  }
  async function uploadPfp(){
    let elm:HTMLFormElement = jq("<input type='file'>")[0] as HTMLFormElement;
			elm.click();
			elm.onchange = e => {
				let file = (<any> e.target).files[0];
				var formData = new FormData();
				formData.append("file", file);
				jq.ajax({
					url: "/api/account/uploadpfp",
					type: "POST",
					data: formData,
					processData: false, // tell jQuery not to process the data
					contentType: false, // tell jQuery not to set contentType
					success: function (data) {
						console.log(data);
						alert(data.message);
					}
				});
				elm.remove();
			};
  }
  async function changeUsername(){
    let username = prompt("enter username.");
  }
  async function deleteAccount(){
    alert("currently not supported")
    return;
    if (confirm("are you sure you want to delete your account?")){
      if (confirm("note: this may break things on the coolelectronics.me website")){

      }
    }
  }
</script>

<main>
  <TopBar title={"Account Settings"} />
  <div class="dark" id="tabbuttons">
    <TabButton bind:selectedtab click={fetchfriends} self={"friends"} />
    <TabButton bind:selectedtab self={"settings"} />
    <TabButton bind:selectedtab self={"account"} />
  </div>
  <div id="tabcontainer">
    {#if selectedtab == "friends"}
      <div class="darkm2 flex ">
        <div class="sendreqs">
          <div class="darkm2">
            <p class="text text-center text-xl">Your Friends</p>
            <div class="dark rounded-md m-2 p-2">
              {#if friends.length == 0}
                <p class="text text-lg">you don't have any friends :(</p>
              {/if}
              {#each friends as friend}
                <div
                  class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <User user={friend} />
                  </div>
                  <div class="flex items-center">
                    <button on:click={() => removeFriend(friend)}>
                      <FontAwesomeIcon
                        inverse={true}
                        size="lg"
                        icon={faUserXmark}
                      />
                    </button>
                  </div>
                </div>
              {/each}
            </div>
            <p class="text text-center text-xl">Find Friends</p>
            <div class="dark rounded-md p-2 m-2">
              {#if availablefriends.length == 0}
                <p class="text text-lg">
                  wow. you managed to friend every single person on this
                  website. congratulations i guess.
                </p>
              {/if}
              {#each availablefriends as friend}
                <div
                  class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <User user={friend} />
                  </div>
                  <div class="flex items-center">
                    <button on:click={() => requestFriend(friend)}>
                      <FontAwesomeIcon
                        inverse={true}
                        size="lg"
                        icon={faUserPlus}
                      />
                    </button>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
        <div class = "viewreqs">
          <div class="darkm2">
            <p class="text text-center text-xl">Incoming Requests</p>
            <div class="dark rounded-md m-2 p-2">
              {#if inboundrequests.length == 0}
                <p class="text text-lg">no incoming requests</p>
              {/if}
              {#each inboundrequests as req}
                <div
                  class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <User user={req.from} />
                  </div>
                  <div class="flex items-center">
                    <button class = "m-1" on:click={() => requestRespond(req.uuid,true)}>
                      <FontAwesomeIcon
                        inverse={true}
                        size="lg"
                        icon={faCheck}
                      />
                    </button>
                    <button class = "m-1" on:click={() => requestRespond(req.uuid,false)}>
                      <FontAwesomeIcon
                        inverse={true}
                        size="lg"
                        icon={faXmark}
                      />
                    </button>
                  </div>
                </div>
              {/each}
            </div>
            <p class="text text-center text-xl">Outgoing Requests</p>
            <div class="dark rounded-md p-2 m-2">
              {#if outboundrequests.length == 0}
                <p class="text text-lg">
                  no outgoing requests
                </p>
              {/if}
              {#each outboundrequests as req}
                <div
                  class="darkp1 rounded-md p-2 m-2 user flex items-center justify-between"
                >
                  <div class="flex items-center">
                    <User user={req.to} />
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {:else if selectedtab == "settings"}
      <div class = "darkm2">

      </div>
    {:else if selectedtab == "account"}
      <div class = "darkm2">
        <p class = "text text-center text-3xl">Your Account</p>
        <div class = "flex justify-center items-center">
          <div class = "darkm3 rounded-md">
            <p class = "text">{self.username}</p> 
            <Pfp size = {"large"} classes = "w-full" name = {self.username}/>
            <SelectButton text = "Upload PFP" click = {uploadPfp} />
          </div>
        </div>
        <SelectButton text = "Change Username" click = {changeUsername}/>
        <SelectButton text = "Delete Account" click = {deleteAccount}/>
      </div>
    {/if}
  </div>
</main>

<style>
  .sendreqs {
    border-right: 4px solid var(--darkp3);
    width: 70%;
    padding:1em;
  }
  .viewreqs{
    width:30%;
    padding:1em;
  }
  #tabcontainer {
    height: 100%;
  }
  #tabcontainer > div {
    height: 100%;
  }
</style>
