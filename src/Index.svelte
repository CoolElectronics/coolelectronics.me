<script lang="ts">
import jq from 'jquery';
// jq("h1")[0].style.display = "none";
console.log(jq);
</script>

<main>
  <h1>CoolElectronics.me</h1>
  <div class = "bg-blue-200"></div>
  <button on:click = {()=>window.location.replace('/sign')} class = "bg-blue-500 hover:bg-blue-700 text-white">
    SignIn
  </button>

</main>

<style>
main{
  background-color: purple;
}
</style>
