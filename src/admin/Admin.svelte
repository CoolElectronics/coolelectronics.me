<script lang="ts">
  import TopBar from "../components/TopBar.svelte";
  import TabButton from "../components/TabButton.svelte";
  import SelectButton from "../components/SelectButton.svelte";

  import * as jq from "jquery";
  
  let selectedtab: "personal" | "users" | "ssh" = "personal";

  let currentcmd = "echo test";

  async function startcrd(){
    let res = await jq.post("/api/admin/startcrd");
    alert(res);
  }
  async function stopcrd(){
    let res = await jq.post("/api/admin/startcrd");
    alert(res);
  }
  async function powerwake(){ 
    let res = await jq.post("/api/admin/powerwake");
    alert(res);
  }
  async function startmc(){
    let res = await jq.post("/api/admin/startmc");
    alert(res);
  }

  async function runcmd(){
    let res = await jq.post("/api/admin/ssh",{
      command:currentcmd,
    });
    alert(res);
  }
</script>
<main class = "dark">
<TopBar title = "Admin Panel"/>
<div id = "tabswitcher" class = "darkm1 flex items-center">
  <TabButton bind:selectedtab self = {"personal"}/>
  <TabButton bind:selectedtab self = {"users"}/>
  <TabButton bind:selectedtab self = {"ssh"}/>
</div>
<div id = "tabcontainer">
  {#if selectedtab == "personal"}
   <SelectButton text = {"Execute Powerwake"} click = {powerwake}/> 
   <SelectButton text = {"Start CRD Daemon"} click = {startcrd}/> 
   <SelectButton text = {"Terminate CRD Daemon"} click = {stopcrd}/> 
   <SelectButton text = {"Start MC Server"} click = {startmc}/>
   <SelectButton text = {"Launch Steam Link"} click = {()=>alert("later")}/>
   <SelectButton text = {"Restart Server"} click = {()=>alert("later")}/>
  {:else if selectedtab == "users"}
  {:else if selectedtab == "ssh"}
    <input bind:value = {currentcmd}>
    <button on:click = {runcmd}>run</button>
  {/if}
</div>
</main>
<style>
main{
  /* display: grid; */
}
#tabswitcher{
  padding-top: 1.5em;
  padding-left: 1.5em;
  padding-right: 1.5em;
}
</style>
