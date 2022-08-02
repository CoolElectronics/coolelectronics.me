<script lang="ts">
  import jquery from "jquery";

  let signUp = false;
  let username: string;
  let password: string = "";

  let confirmpassword: string = "";

  let error: string | null = null;

  async function submit() {
    if (signUp) {
      if (password == confirmpassword && password != "") {
        let res = await Promise.resolve(
          jquery.post("/api/sign/up", {
            username,
            password,
          })
        );
        if (!res.success) {
          error = res.reason;
        } else {
          error = null;
        }
      } else {
        error = "password and confirm password do not match";
      }
    } else {
      let res = await Promise.resolve(
        jquery.post("/api/sign/in", {
          username,
          password,
        })
      );
      if (!res.success) {
        error = res.reason;
      } else {
        error = null;
      }
    }
    if (!error) {
      window.location.replace("/home");
    }
  }
</script>

<main>
  <!-- <div class = "appcontainer"> /</div> -->
  <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col">
    <div class="mb-4">
      <label class="block text-gray-500 text-sm font-bold mb-2" for="username">
        Username
      </label>
      <input
        class="shadow appearance-none border rounded w-full py-2 px-3 text-grey-500"
        bind:value={username}
        type="text"
        placeholder="Username"
      />
    </div>
    <div class="mb-1">
      <label class="block text-gray-500 text-sm font-bold mb-2" for="password">
        Password
      </label>
      <input
        class="shadow appearance-none border {password == ''
          ? 'border-red-500'
          : ''} rounded w-full py-2 px-3 text-grey-500 mb-3"
        bind:value={password}
        type="password"
        placeholder="******************"
      />
      <!-- <p class="text-red text-xs italic">Please choose a password.</p> -->
    </div>
    {#if signUp}
      <div class="mb-1">
        <label
          class="block text-gray-500 text-sm font-bold mb-2"
          for="confirm-password"
        >
          Confirm Password
        </label>
        <input
          class="shadow appearance-none border {confirmpassword == ''
            ? 'border-red-500'
            : ''} rounded w-full py-2 px-3 text-grey-500 mb-3"
          bind:value={confirmpassword}
          type="password"
          placeholder="******************"
        />
      </div>
    {/if}
    {#if error != null}
      <div class="pb-1 mb-4 shadow border border-red-500 rounded flex justify-center text-center items-center">
        <p class="text-center flex justify-center items-center text-red-500 text-xs italic">{error}</p>
      </div>
    {/if}
    <div class="flex items-center justify-between">
      <button
        class="bg-blue-500 hover:bg-blue-dark text-white font-bold py-2 px-4 rounded"
        on:click={submit}>Sign In</button
      >
      <p
        class="text-blue-500 hover:text-blue-400 underline"
        on:click={() => (signUp = !signUp)}
      >
        {signUp ? "create account" : "use existing account"}
      </p>
    </div>
  </div>
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
