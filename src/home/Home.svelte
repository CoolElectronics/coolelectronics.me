<script lang="ts">
  import jq from "jquery";
  import TopBar from "../components/TopBar.svelte";
  

  jq.get("/api/me").then(_user=>{
    
  });

</script>

<main class = "dark">
<TopBar title = "Home"></TopBar>
<div id = "feed" class ="darkm1">
  <p class = "text-center text">no updates</p>
</div>
<div id ="apps" class = "darkm2">
  <div class = "darkp2">
    <a href = "/chat"> 
      <p class = "text text-center">Chat Room</p>
    </a>
  </div>
</div>
</main>

<style>
  main{
    display:grid;
    grid-template-areas: "topbar topbar" "feed apps";
    grid-template-columns: 15fr 85fr;
    grid-template-rows: min-content auto;
  }
  #feed{
    grid-area:feed;
    border-right: 4px solid var(--darkp3)
  }
  #apps{
    grid-area:apps;
  }
</style>
