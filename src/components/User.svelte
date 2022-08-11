<script lang="ts">
  import { ClientUser } from "../../clienttypes";
  import Pfp from "../components/Pfp.svelte";

  export let user:ClientUser; 

</script>
  <div class="message">
    <Pfp
      classes="inline-block pfp mr-5"
      size="small"
      name={user.name}
    />
    <div class="-contents ml-2.5">
      <div class="flex items-center">
        <p class="text text-lg">{@html user.name}</p>
      </div>
      <div class="flex -contents">
        <p class={`text-sm ${user.online ? "text-green-200" : "text-red-200"}`}>
          {user.online ? "online" : "offline"}
        </p>
      </div>
    </div>
    <div class="filler" />
  </div>
<style>
  .message {
    display: grid;
    grid-template-areas: "pfp contents" "filler contents";
    grid-template-rows: 40px 100fr;
    grid-template-columns: 40px 100fr;
  }
  .filler {
    grid-area: filler;
  }
  .pfp-filler{
  width: 50px;
  }
  .pfp {
    grid-area: pfp;
  }
  .-contents {
    grid-area: contents;
  }
</style>
