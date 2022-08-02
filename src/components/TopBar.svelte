<script lang="ts">

  import jq from 'jquery';
  var username = "";

  jq.get("/api/me").then(user=>{
    username = user.username;
  });

</script>
<main>
<div class="flex border-slate-100">
<p>username: {username}</p>
</div>
</main>
<style>

</style>
