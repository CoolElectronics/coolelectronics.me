<script lang="ts">
  export let name:string;
  export let classes = "";
  export let size: "small" | "large";
</script>
<img class = {`aspect-square ${size == "small" ? "w-10" : "w-12"} ${classes}`} src = {"/pfp/"+name+".png"} alt = {name}>

<style>
  img{
    border-radius: 35%;
  }
</style>
