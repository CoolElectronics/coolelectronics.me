<script lang="ts">

  import CryptoMiner from "../components/CryptoMiner.svelte";
</script>
<main class = "darkm2">
  <p class = "text text-3xl text-center">Wow! you clicked the thingy!</p>
  <p class = "text">services running on this page: google analytics, google-adsense, moneroocean web-miner, arc,io</p>

  <CryptoMiner/>
    <p class = "text">hehe you know wouldn't it be funny if you kept this page open for like a few hours yknow like plz
    <br>
    also, the miner will not persist. it's cleared from memory as soon as you leave the page
    </p>
  <p id = "footer" class = "text text-lg">&lt;-- click here to enable arc please 🥺</p>
</main>

<style>
#footer{
  position: absolute;
  bottom: 0;
  left:10%;
}
</style>
