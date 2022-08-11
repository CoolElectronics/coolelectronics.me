<script lang="ts">
  import jq from "jquery";
  import TopBar from "../components/TopBar.svelte";
  

  jq.get("/api/me").then(_user=>{
    
  });

</script>

<main class = "dark">
<TopBar title = "Home"></TopBar>
<h1 class="text">
uhh yeah this is the homepage
</h1>
</main>

<style>
</style>
