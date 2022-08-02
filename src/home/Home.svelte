<script lang="ts">
  import jq from "jquery";
  import TopBar from "../components/TopBar.svelte";
  

  jq.get("/api/me").then(_user=>{
    
  });

</script>

<main>
<TopBar></TopBar>
<h1>
uhh yeah this is the homepage
</h1>
</main>

<style>
</style>
