<script lang="ts">
  export let selectedtab;
  export let self;
  export let name = self;
  export let click = ()=>{};

  function clicked(){
    selectedtab = self;
    click();
  }
</script>

<button class = {`${selectedtab == self ? "darkp1" : "darkp2"} focus:outline-none text text-size-lg hover:scale-105`} on:click = {clicked}>
  {name}
</button>

<style>

</style>
