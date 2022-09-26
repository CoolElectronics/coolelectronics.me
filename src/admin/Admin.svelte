<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import TabButton from "../components/TabButton.svelte";
  import SelectButton from "../components/SelectButton.svelte";

  import * as jq from "jquery";
  import { ClientUser } from "../../clienttypes";
  import { onMount } from "svelte/internal";
  import * as Admin from "../../routes/admin/types";

  let selectedtab: "personal" | "users" | "ssh" = "personal";

  let currentcmd = "echo test";

  import request from "../requests";
  let users: any[];

  async function startcrd() {
    let res = await jq.post("/api/admin/startcrd");
    alert(res);
  }
  async function stopcrd() {
    let res = await jq.post("/api/admin/startcrd");
    alert(res);
  }
  async function powerwake() {
    let res = await jq.post("/api/admin/powerwake");
    alert(res);
  }
  async function startmc() {
    let res = await jq.post("/api/admin/startmc");
    alert(res);
  }
  async function startx() {
    let res = await jq.post("/api/admin/startx");
    alert(res);
  }
  async function startnovnc() {
    let port = prompt("port?");
    let res = await jq.post("/api/admin/novnc",{
      port
    });
    alert(res);
  }
  async function killnovnc() {
    let res = await jq.post("/api/admin/killnovnc",
    );
    alert(res);
  }



  async function startx11vnc() {
    let res = await jq.post("/api/admin/startx11vnc");
    alert(res);
  }


  async function runcmd() {
    let res = await jq.post("/api/admin/ssh", {
      command: currentcmd,
    });
    alert(res);
  }
  async function saveuser(user) {
    request<Admin.SetUserPermissionsRequest>(Admin.SetUserPermissions, {
      uuid: user.uuid,
      permissions: JSON.parse(user.stringifiedpermission),
    });
  }
  (async () => {
    users = await request<any, Admin.GetAllUsersResponse>(Admin.GetAllUsers);
    for (let user of users) {
      user.stringifiedpermission = JSON.stringify(user.permissions);
    }
  })();
</script>

<main class="dark">
  <TopBar title="Admin Panel" />
  <div id="tabswitcher" class="darkm1 flex items-center">
    <TabButton bind:selectedtab self={"personal"} />
    <TabButton bind:selectedtab self={"users"} />
    <TabButton bind:selectedtab self={"ssh"} />
  </div>
  <div id="tabcontainer">
    {#if selectedtab == "personal"}
      <SelectButton text={"Execute Powerwake"} click={powerwake} />
      <SelectButton text={"Start X Server"} click={startx} />
      <SelectButton text={"Start CRD Daemon"} click={startcrd} />

      <SelectButton text={"Start Novnc Server"} click={startnovnc} />
      <SelectButton text={"Start X11VncServer"} click={startx11vnc} />
      <SelectButton text={"Terminate Novnc Server"} click={killnovnc} />

      <SelectButton text={"Terminate CRD Daemon"} click={stopcrd} />
      <SelectButton text={"Start MC Server"} click={startmc} />

      <SelectButton text={"Launch Steam Link"} click={() => alert("later")} />
      <SelectButton text={"Restart Server"} click={() => alert("later")} />
    {:else if selectedtab == "users"}
      {#each users as user}
        <div class="darkp1">
          <p class="text text-lg">{user.username}</p>
          <textarea bind:value={user.stringifiedpermission} />
          <button on:click={() => saveuser(user)}>Save</button>
        </div>
      {/each}
    {:else if selectedtab == "ssh"}
      <input bind:value={currentcmd} />
      <button on:click={runcmd}>run</button>
    {/if}
  </div>
</main>

<style>
  main {
    /* display: grid; */
  }
  #tabswitcher {
    padding-top: 1.5em;
    padding-left: 1.5em;
    padding-right: 1.5em;
  }
</style>
