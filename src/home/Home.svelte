<script lang="ts">
  import { ClientSelf } from "../../clienttypes";
  import request from "../requests"

  import TopBar from "../components/TopBar.svelte";
  import AppButton from "./AppButton.svelte";
import { SelfResponse,Self } from "../../routes/index/types";

  let self:ClientSelf;

  request<any,SelfResponse>(Self).then(s=>self = s);

</script>

<main class = "dark">
<TopBar title = "Home"></TopBar>
<div id = "feed" class ="darkm1">
  <p class = "text-center text">no updates</p>
</div>
<div id ="apps" class = "darkm2">
  <AppButton url = "/chat" title = "Chat Rooms"/>
  <AppButton url = "/games" title = "Games Repository"/>
  <AppButton url = "/ftp" title = "File Hosting"/>
  <AppButton url = "/blogs" title = "Blogs"/>
  <AppButton url = "/account" title = "Account Settings"/>
  <AppButton url = "/admin" title = "Admin Panel"/>
  <AppButton url = "https://github.com/CoolElectronics" title = "My Github"/>
</div>
</main>

<style>
  main{
    display:grid;
    grid-template-areas: "topbar topbar" "feed apps";
    grid-template-columns: 15fr 85fr;
    grid-template-rows: min-content auto;
  }
  #apps{
    padding:15px;
    display:grid;
    grid-gap:15px;
    grid-auto-rows: min-content;
    grid-template-columns: repeat(4,30fr);
  }
  #feed{
    grid-area:feed;
    border-right: 4px solid var(--darkp3)
  }
  #apps{
    grid-area:apps;
  }
</style>
