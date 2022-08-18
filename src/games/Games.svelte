<script lang="ts">
  import call  from "../requests"
  import TopBar from "../components/TopBar.svelte";
  import { NewCollection, NewCollectionRequest, NewCollectionResponse } from "../../routes/games/schema";
  
  // let games:
  // let game:string 
  (async ()=>{
    let a = await call<any,NewCollectionResponse>(NewCollection,{
      name: "cool collection",
      a:"d"
    });
    console.log(a);
  })();
</script>

<main class = "dark">
<TopBar title = "Games"></TopBar>
<div id = "game" class ="darkm1">
  <p class = "text-center text">game title</p>
  <iframe/>
</div>
<div id ="gamesview" class = "darkm2">
 <!-- <div for each></div>  -->
</div>
</main>

<style>

</style>
