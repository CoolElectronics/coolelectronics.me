<script lang="ts">
  import { ClientFriendRequest, ClientUser } from "../../clienttypes";

  import TopBar from "../components/TopBar.svelte";
  import TabButton from "../components/TabButton.svelte";
  import User from "../components/User.svelte";

  import { FontAwesomeIcon } from "fontawesome-svelte";

  import jq from "jquery";
  import { faCheck, faUserPlus, faUserXmark, faXmark } from "@fortawesome/free-solid-svg-icons";
  import { onMount } from "svelte/internal";

  let selectedtab: "friends" | "settings" | "account" = "friends";

  let self: ClientUser;
  let inboundrequests: ClientFriendRequest[] = [];
  let outboundrequests: ClientFriendRequest[] = [];

  let friends: ClientUser[] = [];
  let availablefriends: ClientUser[] = [];

  onMount(async () => {
    fetchfriends();
    self = await jq.get("/api/me");
  });

  async function fetchfriends() {
    friends = await jq.get("/api/account/myfriends");
    availablefriends = await jq.get("/api/account/availablefriends");
    let reqs: ClientFriendRequest[] = await jq.get(
      "/api/account/friendrequests"
    );
    console.log(reqs);
    for (let req of reqs) {
      console.log ("helllloo");
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
    await jq.post("/api/account/requestfriend", {
      uuid: friend.uuid,
    });
    availablefriends = availablefriends.filter(f => f.uuid != friend.uuid);
    outboundrequests = [...outboundrequests,{
      uuid: "idk",
      from:self,
      to:friend,
    }];

  }
  async function removeFriend(friend: ClientUser) {
    await jq.post("/api/account/removefriend", {
      uuid: friend.uuid,
    });
    friends = friends.filter(f => f.uuid != friend.uuid);
  }
  async function requestRespond(uuid:string,response:boolean){
    inboundrequests = inboundrequests.filter(r => r.uuid != uuid);
    await jq.post("/api/account/requestrespond",{
      uuid,
      accept:response,
    })
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

    {:else if selectedtab == "account"}
      
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
